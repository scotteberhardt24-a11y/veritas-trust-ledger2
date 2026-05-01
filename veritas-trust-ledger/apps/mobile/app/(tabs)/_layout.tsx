import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

// ── Custom tab bar icon ───────────────────────────────────────────────────────
function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
      <Text style={{
        fontSize: 10,
        marginTop: 2,
        fontWeight: focused ? '700' : '400',
        color: focused ? Colors.gold.text : Colors.text.faint,
        letterSpacing: focused ? 0.5 : 0,
      }}>
        {label}
      </Text>
      {focused && (
        <View style={{
          position: 'absolute',
          bottom: -8,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: Colors.gold.main,
        }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.navy.deep,
          borderTopColor: Colors.navy.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowColor: Colors.gold.main,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💼" label="Jobs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="escrow"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: focused ? Colors.gold.main : Colors.navy.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2,
                borderColor: focused ? Colors.gold.bright : Colors.navy.border,
                marginTop: -16,
                shadowColor: Colors.gold.main,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: focused ? 0.5 : 0,
                shadowRadius: 8,
                elevation: focused ? 6 : 0,
              }}>
                <Text style={{ fontSize: 20 }}>🔐</Text>
              </View>
              <Text style={{
                fontSize: 10, marginTop: 2,
                fontWeight: focused ? '700' : '400',
                color: focused ? Colors.gold.text : Colors.text.faint,
              }}>Escrow</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" label="Messages" focused={focused} />,
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: Colors.gold.main,
            color: Colors.navy.deepest,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
