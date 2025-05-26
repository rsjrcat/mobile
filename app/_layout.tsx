import { Slot, Stack } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Slot />
        </Stack>
      </SafeScreen>
    </ClerkProvider>
  );
}
