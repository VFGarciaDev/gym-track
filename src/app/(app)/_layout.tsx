import { Redirect } from "expo-router"
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui"

import { useAuth } from "@/contexts/AuthContext"
import { TabBarButton, TabBarContainer } from "@/components/TabBar"
import { ChartNoAxesColumn, Dumbbell, UserRound } from "lucide-react-native"

export default function AppLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Redirect href="/sign-in" />

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <TabBarContainer>
          <TabTrigger name="index" href="/(app)" asChild>
            <TabBarButton icon={Dumbbell} label="Treinos" />
          </TabTrigger>
          <TabTrigger name="progress" href="/(app)/progress" asChild>
            <TabBarButton icon={ChartNoAxesColumn} label="Progresso" />
          </TabTrigger>
          <TabTrigger name="account" href="/(app)/account" asChild>
            <TabBarButton icon={UserRound} label="Conta" />
          </TabTrigger>
        </TabBarContainer>
      </TabList>
    </Tabs>
  )
}
