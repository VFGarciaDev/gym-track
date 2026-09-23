import "@/styles/global.css"
import { Stack } from "expo-router"

import AppProviders from "@/contexts"

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
      </Stack>
    </AppProviders>
  )
}
