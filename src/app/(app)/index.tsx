import { Container } from "@/components/Container"
import { Button, ButtonText, Text } from "@/components/ui"
import { useAuth } from "@/contexts/AuthContext"

export default function HomeScreen() {
  const { signOut } = useAuth()

  return (
    <Container>
      <Text>Home</Text>

      <Button onPress={signOut}>
        <ButtonText>Sair</ButtonText>
      </Button>
    </Container>
  )
}
