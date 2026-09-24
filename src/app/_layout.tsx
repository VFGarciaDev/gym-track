import "@/styles/global.css"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Toast from "react-native-toast-message"

import { OTAUpdateScreen } from "@/components/OTAUpdateScreen"
import AppProviders from "@/contexts"
import { useAuth } from "@/contexts/AuthContext"
import { useOTAUpdate } from "@/hooks/use-ota-update"

export default function RootLayout() {
  const {
    continueWithInstalledVersion,
    hideNativeSplash,
    phase,
    progress,
    retry,
    secondsUntilContinue
  } = useOTAUpdate()

  return (
    <GestureHandlerRootView onLayout={hideNativeSplash} style={{ flex: 1 }}>
      <AppProviders>
        {phase === "ready" ? (
          <>
            <InitialLayout />
            <Toast topOffset={100} swipeable={false} />
          </>
        ) : (
          <OTAUpdateScreen
            phase={phase}
            onRetry={retry}
            progress={progress}
            onContinue={continueWithInstalledVersion}
            secondsUntilContinue={secondsUntilContinue}
          />
        )}
      </AppProviders>
    </GestureHandlerRootView>
  )
}

function InitialLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === undefined) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/sign-in" />
      </Stack.Protected>
    </Stack>
  )
}
