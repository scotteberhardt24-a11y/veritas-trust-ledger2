// services/notifications.ts
// Handles Expo push notifications registration and routing.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

// How notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

/**
 * Request permission and register the device push token.
 * Must be called after the user logs in.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications: simulator — skipping');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push permission denied');
    return null;
  }

  // Android needs a channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('veritas', {
      name:        'Veritas Alerts',
      importance:  Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  '#c9a84c',
      sound:       'default',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('No EAS projectId — push token unavailable on bare builds');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  console.log('Expo push token:', token);

  // Register with our backend
  try { await registerPushToken(token); } catch (e) { console.warn('Push token registration failed:', e); }

  return token;
}

/**
 * Parse a Veritas notification and return the target route.
 * Called when a notification is tapped.
 */
export function notificationToRoute(notification: Notifications.Notification): string {
  const data = notification.request.content.data as any;
  switch (data?.type) {
    case 'escrow_funded':
    case 'escrow_released':
    case 'escrow_disputed': return '/(tabs)/escrow';
    case 'new_message':     return '/(tabs)/messages';
    case 'dispute_update':  return '/(tabs)/disputes';
    case 'score_update':    return '/(tabs)/trust';
    default:                return '/(tabs)';
  }
}
