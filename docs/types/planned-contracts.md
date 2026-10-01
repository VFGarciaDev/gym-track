# Contratos planejados

Este documento registra contratos aprovados no planejamento que ainda não foram implementados. Tipagens compartilhadas já implementadas aparecem como dependências para manter os exemplos compreensíveis.

## Estados compartilhados

**Status:** implementado em `src/types`; utilizado pelos contratos planejados abaixo.

```ts
type ExerciseSource = "catalog" | "private"
type WorkoutSection = "warmup" | "main"
type WorkoutSessionStatus = "inProgress" | "completed" | "incomplete"

type RepetitionTarget =
  | { type: "fixed"; value: number }
  | { type: "range"; minimum: number; maximum: number }
  | { type: "duration"; seconds: number }
```

`ExerciseSource` usa `private` para representar exercícios privados do autor. `ExerciseSource`, `WorkoutSection` e `RepetitionTarget` já são derivados de schemas Zod. `WorkoutSessionStatus` continua planejado.

## Gravação de ficha

**Status:** aprovado, não implementado.

```ts
type WorkoutExerciseInput = {
  id: string | null
  exerciseId: string
  section: WorkoutSection
  position: number
  notes: string | null
  sets: Array<{
    id: string | null
    position: number
    repetitionTarget: RepetitionTarget
    loadKg: number | null
  }>
}

type SaveWorkoutInput = {
  name: string
  restSeconds: number
  exercises: WorkoutExerciseInput[]
}
```

### Onde será usado

- formulário de criação e edição;
- `POST /workouts`;
- `PUT /workouts/:workoutId`;
- validação equivalente no backend.

### Por que existe

O mesmo formato atende criação e edição. `id: null` representa uma nova ocorrência ou série; um identificador existente preserva a ligação usada pelas sugestões de carga. O usuário autenticado vem da sessão e não é enviado como proprietário.

### Regras

- Nome não pode ficar vazio.
- Descanso deve ser um número inteiro positivo em segundos.
- Deve existir pelo menos um exercício na seção principal.
- Cada exercício deve ter ao menos uma série.
- Cada série possui sua própria meta de repetições e carga.
- `loadKg` aceita número não negativo ou `null`.
- Posições começam em zero e não se repetem dentro da mesma seção.
- Posições das séries começam em zero e não se repetem dentro do mesmo exercício.
- Observação vazia é normalizada para `null`.

## Detalhe da ficha

**Status:** implementado em `src/api/queries/workouts/get-workout-details`.

`GET /workouts/:workoutId` retorna diretamente a ficha completa. Aquecimento e exercícios principais compartilham o mesmo array e são diferenciados por `section`. Cada exercício contém suas séries, e cada série possui posição, meta de repetições e carga próprias.

A quantidade de séries é derivada de `sets.length`. Metas de duração usam segundos. Não existe campo de repetições realmente realizadas.

## Catálogo de exercícios

**Status:** aprovado, não implementado.

```ts
type ExerciseListItem = {
  id: string
  name: string
  source: ExerciseSource
  canEdit: boolean
}

type ExerciseListResponse = {
  items: ExerciseListItem[]
  nextCursor: string | null
}

type CreatePrivateExerciseInput = {
  name: string
}
```

### Onde será usado

- pesquisa e seleção de exercícios;
- `GET /exercises?query=...&cursor=...`;
- `POST /exercises` para exercício privado;
- edição e arquivamento dos exercícios privados do usuário.

### Por que existe

`source` informa a origem; `canEdit` informa a permissão efetiva. O front não precisa recriar regras de autorização. A paginação por cursor prepara o catálogo para crescer sem trocar o formato.

## Plano de execução

**Status:** aprovado, não implementado.

```ts
type WorkoutExecutionPlan = {
  workoutId: string
  workoutName: string
  workoutUpdatedAt: string
  restSeconds: number
  exercises: Array<{
    workoutExerciseId: string
    exerciseId: string
    exerciseName: string
    section: WorkoutSection
    position: number
    notes: string | null
    sets: Array<{
      workoutSetId: string
      position: number
      repetitionTarget: RepetitionTarget
      suggestedLoadKg: number | null
    }>
  }>
}
```

### Onde será usado

- `GET /workouts/:workoutId/execution-plan`;
- cache das fichas disponíveis offline;
- criação local de uma sessão;
- preenchimento inicial da tela de acompanhamento.

### Por que existe

Reúne a prescrição e as sugestões necessárias para começar sem depender de outras chamadas. Na primeira execução, as sugestões são `null`. Depois, vêm da última sessão concluída da mesma ficha e ocorrência.

## Sessão de treino

**Status:** aprovado, não implementado.

```ts
type WorkoutSessionSet = {
  id: string
  workoutSetId: string
  position: number
  repetitionTarget: RepetitionTarget
  loadKg: number | null
  completedAt: string | null
}

type WorkoutSessionExercise = {
  id: string
  workoutExerciseId: string
  exerciseId: string
  exerciseName: string
  section: WorkoutSection
  position: number
  notes: string | null
  sets: WorkoutSessionSet[]
}

type WorkoutSession = {
  id: string
  workoutId: string
  revision: number
  status: WorkoutSessionStatus
  startedAt: string
  endedAt: string | null
  workoutSnapshot: {
    name: string
    restSeconds: number
  }
  exercises: WorkoutSessionExercise[]
}
```

### Onde será usado

- estado persistido da sessão em andamento;
- `PUT /workout-sessions/:sessionId`;
- retomada após fechar o aplicativo;
- detalhe do histórico.

### Por que existe

O celular cria os identificadores antes da sincronização. O snapshot preserva o que foi executado mesmo depois de a ficha mudar. `completedAt` identifica uma série concluída; não existe campo de repetições efetivamente realizadas.

### Regras

- Apenas uma sessão pode ficar `inProgress` por usuário.
- Começar outro treino direciona para a sessão existente, que deve ser retomada ou encerrada como incompleta.
- Sessão `completed` representa todas as séries planejadas concluídas.
- Encerramento antecipado usa `incomplete` e preserva as cargas das séries concluídas.
- Sessão incompleta não alimenta sugestões futuras.
- Cada série preserva sua própria meta de repetições e carga no snapshot da sessão.
- `loadKg` aceita número não negativo ou `null`; `null` também atende exercícios sem carga externa.
- Sessões encerradas possuem `endedAt`; sessão em andamento possui `endedAt: null`.

## Histórico

**Status:** aprovado, não implementado.

```ts
type WorkoutSessionSummary = {
  id: string
  workoutId: string
  workoutName: string
  status: "completed" | "incomplete"
  startedAt: string
  endedAt: string
  completedSetCount: number
  plannedSetCount: number
}

type WorkoutSessionListResponse = {
  items: WorkoutSessionSummary[]
  nextCursor: string | null
}
```

### Onde será usado

- `GET /workout-sessions?cursor=...`;
- listagem do histórico;
- diferenciação visual entre treinos completos e incompletos.

O detalhe usa `WorkoutSession`, já que a sessão contém o snapshot necessário para reconstruir o treino realizado.

## Sincronização local

**Status:** aprovado, não implementado.

```ts
type SessionSyncStatus = "pending" | "syncing" | "synced" | "failed"

type LocalWorkoutSession = {
  session: WorkoutSession
  syncStatus: SessionSyncStatus
  lastSyncError: string | null
}
```

### Onde será usado

- armazenamento local;
- fila de sincronização;
- indicação de pendência ou falha na interface.

### Por que existe

O estado de sincronização é uma preocupação do dispositivo e não deve fazer parte da entidade armazenada pelo backend. A sessão é salva localmente antes de qualquer tentativa de rede.

### Estratégia aprovada

- `id` é criado no celular e torna o `PUT` idempotente.
- `revision` aumenta a cada alteração persistida.
- A fila envia revisões em ordem.
- O backend ignora uma revisão mais antiga.
- Mesma revisão com conteúdo diferente retorna conflito.
- Repetir a mesma revisão e o mesmo conteúdo confirma o estado sem duplicar a sessão.

## Cronômetro local de descanso

**Status:** aprovado, não implementado.

```ts
type RestTimerState =
  | { status: "idle" }
  | { status: "running"; endsAt: string }
  | { status: "paused"; remainingSeconds: number }
```

### Onde será usado

- tela de execução;
- persistência local para recuperação ao reabrir o app;
- agendamento e cancelamento da notificação local.

### Por que existe

O horário absoluto `endsAt` permite recalcular o tempo restante quando o aplicativo volta do segundo plano. O cronômetro não precisa ser enviado ao backend nem aparecer no histórico.

## Limites entre API e estado local

| Estrutura              | API          | Persistência local       | Estado da interface    |
| ---------------------- | ------------ | ------------------------ | ---------------------- |
| `WorkoutExecutionPlan` | Recebida     | Mantida para offline     | Consumida para iniciar |
| `WorkoutSession`       | Sincronizada | Fonte imediata da sessão | Editada pela execução  |
| `SessionSyncStatus`    | Não          | Sim                      | Exibida ao usuário     |
| `RestTimerState`       | Não          | Sim enquanto necessário  | Controla o cronômetro  |

## Endpoints relacionados

| Operação                            | Endpoint                                  |
| ----------------------------------- | ----------------------------------------- |
| Obter plano e sugestões             | `GET /workouts/:workoutId/execution-plan` |
| Criar ou atualizar sessão           | `PUT /workout-sessions/:sessionId`        |
| Recuperar sessão ativa sincronizada | `GET /workout-sessions/active`            |
| Listar histórico                    | `GET /workout-sessions?cursor=...`        |
| Consultar sessão                    | `GET /workout-sessions/:sessionId`        |

## Pendências que podem alterar contratos futuros

- Forma final da autenticação real e dos tokens.
- Armazenamento local escolhido para sessões e fila.
- Regras e contratos do módulo personal da V2.
- Cadastro público e recuperação de acesso.
- Fotos, GIFs, progresso e tema da V2.
