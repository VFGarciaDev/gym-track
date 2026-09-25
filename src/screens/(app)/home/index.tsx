import { Container } from "@/components/Container"
import { TabBarButton } from "@/components/TabBar"
import { Button, ButtonText, Text } from "@/components/ui"
import { useAuth } from "@/contexts/AuthContext"
import { View } from "react-native"

export default function HomeContent() {
  const { signOut } = useAuth()

  return (
    <Container contentContainerClassName="gap-10">
      <View>
        <Text>Meus treinos</Text>
        <Text></Text>
      </View>

      <Button onPress={signOut}>
        <ButtonText>Sair</ButtonText>
      </Button>
    </Container>
  )
}
