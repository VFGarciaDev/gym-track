import type { IInputFieldProps } from "@/components/ui"
import type { LucideIcon } from "lucide-react-native"

import { AlertCircle } from "lucide-react-native"

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  InputIcon,
  InputSlot
} from "@/components/ui"

type FormControlProps = IInputFieldProps & {
  isError: boolean
  label: string
  icon: LucideIcon
  errorMsg?: string
}

export function SignInFormControl({ icon, isError, label, errorMsg, ...props }: FormControlProps) {
  return (
    <FormControl isInvalid={isError}>
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>

      <Input>
        <InputSlot>
          <InputIcon as={icon} />
        </InputSlot>

        <InputField {...props} />
      </Input>

      {isError && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} className="text-destructive" />
          <FormControlErrorText className="text-destructive">{errorMsg}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  )
}
