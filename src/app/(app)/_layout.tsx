import { Redirect, Stack } from "expo-router"

import { useAuth } from "@/contexts/AuthContext"

export default function AppLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Redirect href="/sign-in" />
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  )
}
