import type { PropsWithChildren } from "react"

import { ScrollView } from "react-native"

type ContainerProps = PropsWithChildren<{
  padding?: "default" | "none"
}>

export function Container({ padding = "default", children }: ContainerProps) {
  const paddingSize = {
    none: "",
    default: "px-6"
  }

  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      contentContainerClassName={paddingSize[padding]}
    >
      {children}
    </ScrollView>
  )
}
