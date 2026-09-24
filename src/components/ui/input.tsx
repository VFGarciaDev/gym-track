"use client"
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils"

import { UIIcon } from "@gluestack-ui/core/icon/creator"
import { createInput } from "@gluestack-ui/core/input/creator"
import { tva, withStyleContext } from "@gluestack-ui/utils/nativewind-utils"
import { styled } from "nativewind"
import React from "react"
import { Pressable, TextInput, View } from "react-native"

const SCOPE = "INPUT"

const StyledUIIcon = styled(UIIcon, { className: "style" })

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Icon: StyledUIIcon,
  Slot: Pressable,
  Input: TextInput
})

const inputStyle = tva({
  base: "min-h-9 w-full flex-row items-center gap-2 overflow-hidden rounded-md border border-border bg-transparent px-3 shadow-xs transition-[color,box-shadow] data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[focus=true]:border-ring data-[focus=true]:outline-none data-[invalid=true]:border-destructive/40 dark:bg-input/30 dark:data-[focus=true]:border-ring dark:data-[invalid=true]:border-destructive/40 data-[focus=true]:web:ring-[3px] data-[focus=true]:web:ring-ring/50 data-[invalid=true]:web:ring-destructive/20 dark:data-[invalid=true]:web:ring-destructive/40"
})

const inputIconStyle = tva({
  base: "h-4 w-4 items-center justify-center fill-none text-muted-foreground"
})

const inputSlotStyle = tva({
  base: "items-center justify-center web:disabled:cursor-not-allowed"
})

const inputFieldStyle = tva({
  base: "h-full flex-1 py-1 text-sm text-foreground placeholder:text-muted-foreground md:text-sm ios:leading-[0px] web:cursor-text web:outline-none web:data-[disabled=true]:cursor-not-allowed"
})

type IInputProps = React.ComponentProps<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string }
const Input = React.forwardRef<React.ComponentRef<typeof UIInput>, IInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <UIInput ref={ref} {...props} className={inputStyle({ class: className })} context={{}} />
    )
  }
)

type IInputIconProps = React.ComponentProps<typeof UIInput.Icon> &
  VariantProps<typeof inputIconStyle> & {
    className?: string
    height?: number
    width?: number
  }

const InputIcon = React.forwardRef<React.ComponentRef<typeof UIInput.Icon>, IInputIconProps>(
  ({ className, ...props }, ref) => {
    return <UIInput.Icon ref={ref} {...props} className={inputIconStyle({ class: className })} />
  }
)

type IInputSlotProps = React.ComponentProps<typeof UIInput.Slot> &
  VariantProps<typeof inputSlotStyle> & { className?: string }

const InputSlot = React.forwardRef<React.ComponentRef<typeof UIInput.Slot>, IInputSlotProps>(
  ({ className, ...props }, ref) => {
    return (
      <UIInput.Slot
        ref={ref}
        {...props}
        className={inputSlotStyle({
          class: className
        })}
      />
    )
  }
)

export type IInputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & { className?: string }

const InputField = React.forwardRef<React.ComponentRef<typeof UIInput.Input>, IInputFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <UIInput.Input
        ref={ref}
        {...props}
        className={inputFieldStyle({
          class: className
        })}
      />
    )
  }
)

Input.displayName = "Input"
InputIcon.displayName = "InputIcon"
InputSlot.displayName = "InputSlot"
InputField.displayName = "InputField"

export { Input, InputField, InputIcon, InputSlot }
