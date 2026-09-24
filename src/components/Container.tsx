import type { PropsWithChildren } from "react"
import type { ScrollViewProps } from "react-native"

import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback } from "react-native"

import { cn } from "@/lib/utils/cn"

type ContainerProps = PropsWithChildren<
  ScrollViewProps & {
    padding?: "default" | "none"
  }
>

export function Container({
  padding = "default",
  children,
  contentContainerClassName,
  ...props
}: ContainerProps) {
  const paddingSize = {
    none: "",
    default: "px-6 py-4"
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn(
            "flex-1 bg-background",
            paddingSize[padding],
            contentContainerClassName
          )}
          {...props}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}
