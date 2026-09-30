import { Container } from "@/components/Container"
import { Button, ButtonText, Text } from "@/components/ui"
import { useAuth } from "@/contexts/AuthContext"

export function AccountContent() {
  const { signOut } = useAuth()

  return (
    <Container>
      <Text>Account Page</Text>

      <Button onPress={signOut}>
        <ButtonText>Sair</ButtonText>
      </Button>
    </Container>
  )
}
