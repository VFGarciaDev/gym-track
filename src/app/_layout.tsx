import "@/styles/global.css"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </GluestackUIProvider>
  )
}
