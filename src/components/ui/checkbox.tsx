"use client"
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils"
import type { TextProps, ViewProps } from "react-native"

import { createCheckbox } from "@gluestack-ui/core/checkbox/creator"
import { UIIcon } from "@gluestack-ui/core/icon/creator"
import { tva, withStyleContext } from "@gluestack-ui/utils/nativewind-utils"
import { styled } from "nativewind"
import React from "react"
import { Platform, Pressable, Text, View } from "react-native"

const IndicatorWrapper = React.forwardRef<React.ComponentRef<typeof View>, ViewProps>(
  ({ ...props }, ref) => {
    return <View {...props} ref={ref} />
  }
)

const LabelWrapper = React.forwardRef<React.ComponentRef<typeof Text>, TextProps>(
  ({ ...props }, ref) => {
    return <Text {...props} ref={ref} />
  }
)

const StyledUIIcon = styled(UIIcon, {
  className: "style"
})

const IconWrapper = React.forwardRef<
  React.ComponentRef<typeof UIIcon>,
  React.ComponentPropsWithoutRef<typeof UIIcon>
>(({ ...props }, ref) => {
  return <StyledUIIcon {...props} ref={ref} />
})

const SCOPE = "CHECKBOX"

const UICheckbox = createCheckbox({
  // @ts-expect-error : internal implementation for r-19/react-native-web
  Root: Platform.OS === "web" ? withStyleContext(View, SCOPE) : withStyleContext(Pressable, SCOPE),
  Group: View,
  Icon: IconWrapper,
  Label: LabelWrapper,
  Indicator: IndicatorWrapper
})

const checkboxStyle = tva({
  base: "group/checkbox flex-row items-center justify-start gap-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 web:cursor-pointer"
})

const checkboxIndicatorStyle = tva({
  base: "h-4 w-4 shrink-0 items-center justify-center rounded border border-input shadow-xs data-[checked=true]:border-primary data-[checked=true]:bg-primary data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20 dark:bg-input/30 dark:data-[checked=true]:border-primary dark:data-[checked=true]:bg-primary web:outline-none web:data-[focus-visible=true]:border-ring web:data-[focus-visible=true]:ring-[3px] web:data-[focus-visible=true]:ring-ring/50"
})

const checkboxLabelStyle = tva({
  base: "font-body text-sm font-medium text-foreground data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 web:cursor-pointer web:select-none"
})

const checkboxIconStyle = tva({
  base: "h-3.5 w-3.5 fill-none text-primary-foreground"
})

const CheckboxGroup = UICheckbox.Group

type ICheckboxProps = React.ComponentPropsWithoutRef<typeof UICheckbox> &
  VariantProps<typeof checkboxStyle>

const Checkbox = React.forwardRef<React.ComponentRef<typeof UICheckbox>, ICheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <UICheckbox
        className={checkboxStyle({ class: className })}
        {...props}
        context={{}}
        ref={ref}
      />
    )
  }
)

type ICheckboxIndicatorProps = React.ComponentPropsWithoutRef<typeof UICheckbox.Indicator> &
  VariantProps<typeof checkboxIndicatorStyle>

const CheckboxIndicator = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Indicator>,
  ICheckboxIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox.Indicator
      className={checkboxIndicatorStyle({ class: className })}
      {...props}
      ref={ref}
    />
  )
})

type ICheckboxLabelProps = React.ComponentPropsWithoutRef<typeof UICheckbox.Label> &
  VariantProps<typeof checkboxLabelStyle>
const CheckboxLabel = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Label>,
  ICheckboxLabelProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox.Label className={checkboxLabelStyle({ class: className })} {...props} ref={ref} />
  )
})

type ICheckboxIconProps = React.ComponentPropsWithoutRef<typeof UICheckbox.Icon> &
  VariantProps<typeof checkboxIconStyle>

const CheckboxIcon = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Icon>,
  ICheckboxIconProps
>(({ className, size, ...props }, ref) => {
  if (typeof size === "number") {
    return (
      <UICheckbox.Icon
        ref={ref}
        {...props}
        className={checkboxIconStyle({ class: className })}
        size={size}
      />
    )
  } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
    return (
      <UICheckbox.Icon ref={ref} {...props} className={checkboxIconStyle({ class: className })} />
    )
  }

  return (
    <UICheckbox.Icon className={checkboxIconStyle({ class: className })} {...props} ref={ref} />
  )
})

Checkbox.displayName = "Checkbox"
CheckboxIndicator.displayName = "CheckboxIndicator"
CheckboxLabel.displayName = "CheckboxLabel"
CheckboxIcon.displayName = "CheckboxIcon"

export { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel }
