import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { ScanProvider } from '../context/ScanContext';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: 'login',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { token, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inLoginScreen = segments[0] === 'login';
    const inLanding = (segments[0] as string) === 'index';

    if (!token && inTabsGroup) {
      router.replace('/' as any);
    } else if (token && (inLoginScreen || inLanding)) {
      router.replace('/(tabs)/scan' as any);
    }
  }, [token, loading, segments]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/scanURLResult' as any);
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scanURL" options={{ headerShown: false }} />
        <Stack.Screen name="scanURLResult" options={{ title: 'Scan Result', headerStyle: { backgroundColor: '#0a0a0a' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '600' } }} />
        <Stack.Screen name="scanHistoryResult" options={{ headerShown: false }} />
        <Stack.Screen name="publicScans" options={{ headerShown: false }} />
        <Stack.Screen name="publicScanResult" options={{ headerShown: false }} />
        <Stack.Screen name="scanQR" options={{ headerShown: false }} />
        <Stack.Screen name="submitTicket" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="submittedTickets" options={{ headerShown: false }} />
        <Stack.Screen name="accountDetails" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="securitySettings" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ScanProvider>
        <RootLayoutNav />
      </ScanProvider>
    </AuthProvider>
  );
}