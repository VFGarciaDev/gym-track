import { Redirect } from "expo-router"
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui"

import { useAuth } from "@/contexts/AuthContext"
import { Text } from "@/components/ui"

export default function AppLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Redirect href="/sign-in" />

  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="index" href="/(app)">
          <Text></Text>
        </TabTrigger>
        <TabTrigger name="account" href="/(app)/account">
          <Text></Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
