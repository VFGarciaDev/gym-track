import type { LucideIcon } from "lucide-react-native"
import type { PropsWithChildren } from "react"

import { View } from "react-native"

import { Button, ButtonIcon, ButtonText } from "../ui"

type TabBarContainerProps = PropsWithChildren

export function TabBarContainer({ children }: TabBarContainerProps) {
  return <View className="flex-row justify-evenly border-t border-border bg-card">{children}</View>
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
