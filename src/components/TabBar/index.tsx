import type { PropsWithChildren } from "react"
import { View } from "react-native"
import { Button, ButtonIcon, ButtonText } from "../ui"
import { LucideIcon } from "lucide-react-native"

type TabBarContainerProps = PropsWithChildren

export function TabBarContainer({ children }: TabBarContainerProps) {
  return <View className="flex-row justify-evenly bg-card border-t border-border">{children}</View>
}

type TabBarButtonProps = {
  icon: LucideIcon
  label: string
}

export function TabBarButton({ icon, label }: TabBarButtonProps) {
  return (
    <Button variant="link" className="flex-col">
      <ButtonIcon as={icon} className="h-8 w-8" />
      <ButtonText className="text-lg font-semibold tracking-tight">{label}</ButtonText>
    </Button>
  )
}
