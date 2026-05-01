// app/_layout.tsx
import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { notificationToRoute } from '../services/notifications';

SplashScreen.preventAutoHideAsync();

// ─── Auth guard ───────────────────────────────────────────────────────────────
function AuthGuard() {
  const { user, loading } = useAuth();
  const router    = useRouter();
  const segments  = useSegments();

  useEffect(() => {
    if (loading) return;
    SplashScreen.hideAsync();

    const inAuth = segments[0] === '(auth)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  return null;
}

// ─── Notification tap handler ─────────────────────────────────────────────────
function NotificationHandler() {
  const router     = useRouter();
  const responseRef = useRef<Notifications.Subscription>();

  useEffect(() => {
    responseRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      const route = notificationToRoute(response.notification);
      router.push(route as any);
    });
    return () => responseRef.current?.remove();
  }, []);

  return null;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
      <NotificationHandler />
      <StatusBar style="light" backgroundColor="#020f2e" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
