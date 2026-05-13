import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </I18nextProvider>
  );
}
