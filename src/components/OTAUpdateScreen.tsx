import type { OTAUpdatePhase } from "@/hooks/use-ota-update/ota-update-state"

import { AlertTriangle } from "lucide-react-native"
import { ActivityIndicator, View } from "react-native"

import { Button, ButtonText, Icon, Progress, ProgressFilledTrack, Text } from "@/components/ui"

type OTAUpdateScreenProps = {
  onContinue: () => void
  onRetry: () => void
  phase: Exclude<OTAUpdatePhase, "ready">
  progress: number
  secondsUntilContinue: number
}

const updateCopy = {
  checking: {
    description: "Buscando a versão mais recente para você.",
    title: "Verificando atualizações"
  },
  downloading: {
    description: "Baixando uma atualização para deixar sua experiência ainda melhor.",
    title: "Estamos preparando tudo"
  },
  failed: {
    description: "Você ainda pode acessar o app usando a versão instalada.",
    title: "Não foi possível atualizar agora"
  },
  restarting: {
    description: "Finalizando a instalação. O aplicativo será reiniciado.",
    title: "Aplicando atualização"
  }
} as const

export function OTAUpdateScreen({
  onContinue,
  onRetry,
  phase,
  progress,
  secondsUntilContinue
}: OTAUpdateScreenProps) {
  const copy = updateCopy[phase]
  const isDownloading = phase === "downloading"
  const isFailed = phase === "failed"

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="mx-auto w-full max-w-md flex-1 justify-center">
        <View className="mb-8 h-20 w-48 self-center">
          <Text>Logo</Text>
        </View>

        <View className="items-center">
          <Text
            accessibilityLiveRegion="polite"
            className="text-center text-2xl font-bold text-foreground"
          >
            {copy.title}
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
            {copy.description}
          </Text>
        </View>

        {isDownloading ? (
          <View className="mt-8">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Baixando atualização</Text>
              <Text className="text-sm font-bold text-primary">{progress}%</Text>
            </View>
            <Progress
              accessibilityLabel={`Download da atualização: ${progress}%`}
              className="h-2.5"
              max={100}
              min={0}
              value={progress}
            >
              <ProgressFilledTrack />
            </Progress>
            <Text className="mt-3 text-center text-xs text-muted-foreground">
              Isso deve levar apenas alguns instantes.
            </Text>
          </View>
        ) : null}

        {!isDownloading && !isFailed ? (
          <View className="mt-8 items-center">
            <ActivityIndicator accessibilityLabel={copy.title} color="#c6005c" size="large" />
          </View>
        ) : null}

        {isFailed ? (
          <View
            accessible
            accessibilityRole="alert"
            className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
          >
            <View className="flex-row items-center gap-2">
              <Icon as={AlertTriangle} className="h-5 w-5 text-destructive" />
              <Text className="flex-1 text-sm font-bold text-foreground">
                Falha ao baixar a atualização
              </Text>
            </View>
            <Text
              accessibilityLiveRegion="polite"
              className="mt-2 text-sm leading-5 text-muted-foreground"
            >
              Você continuará com a versão instalada em {secondsUntilContinue}{" "}
              {secondsUntilContinue === 1 ? "segundo" : "segundos"}.
            </Text>

            <View className="mt-4 flex-row gap-2">
              <Button className="flex-1 rounded-xl" onPress={onContinue} variant="outline">
                <ButtonText>Continuar</ButtonText>
              </Button>
              <Button className="flex-1 rounded-xl" onPress={onRetry}>
                <ButtonText>Tentar novamente</ButtonText>
              </Button>
            </View>
          </View>
        ) : null}
      </View>

      <Text className="text-center text-xs text-muted-foreground">
        Mantenha o aplicativo aberto durante a atualização.
      </Text>
    </View>
  )
}
