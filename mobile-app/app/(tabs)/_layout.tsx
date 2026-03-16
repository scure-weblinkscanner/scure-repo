import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style="light" backgroundColor="#0E0E95" translucent={false} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#fff',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0E0E95',
            borderTopWidth: 0,
            elevation: 0,
            borderTopColor: 'transparent',
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowOffset: { height: 0, width: 0 },
            shadowRadius: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }
        }}>
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}