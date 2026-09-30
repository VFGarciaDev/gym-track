import { Button, Icon, Text } from "@/components/ui"
import { ChevronRight, LucideIcon } from "lucide-react-native"
import { View } from "react-native"

type WorkoutCardProps = {
  id: string
  icon: LucideIcon
  label: string
  quantity: number
}

export function WorkoutCard({ id, icon, label, quantity }: WorkoutCardProps) {
  return (
    <Button>
      <Icon as={icon} />
      <View>
        <Text>{label}</Text>
        <Text>{quantity} exercícios</Text>
      </View>
      <Icon as={ChevronRight} />
    </Button>
  )
}
