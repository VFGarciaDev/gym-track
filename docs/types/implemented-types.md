# Tipagens implementadas

Status conferido em 28 de setembro de 2026. Este documento descreve somente tipagens encontradas no repositório; arquivos ainda não rastreados pelo Git continuam sendo trabalho local do projeto e são identificados abaixo.

## Inventário

| Tipo ou schema                 | Local atual                                 | Uso                                                     | Motivo                                                                       |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `userSchema`                   | `src/types/user-session.ts`                 | Validar os dados do usuário autenticado.                | Impedir que uma sessão com formato inesperado entre no estado global.        |
| `User`                         | `src/types/user-session.ts`                 | Representar o usuário após validação.                   | Compartilhar a mesma forma entre API, contexto e store.                      |
| `UserSession`                  | `src/types/user-session.ts`                 | Estado persistido da sessão autenticada.                | Agrupar os dados necessários depois do login.                                |
| `userSignInSchema`             | `src/api/auth/fetch-user-session/schema.ts` | Validar credenciais preenchidas no login.               | Produzir mensagens por campo e impedir envio vazio.                          |
| `UserSignInType`               | `src/api/auth/fetch-user-session/schema.ts` | Entrada da função de login e do formulário.             | Derivar o tipo diretamente do schema Zod.                                    |
| `userSessionApiResponseSchema` | `src/api/auth/fetch-user-session/schema.ts` | Validar a resposta do login.                            | Não confiar apenas na anotação genérica do Axios.                            |
| `SignInResponse`               | `src/contexts/AuthContext/index.tsx`        | Resultado tratado da tentativa de login.                | Permitir que a tela diferencie sucesso, credenciais, rede e erro inesperado. |
| `RepetitionTarget`             | `src/types/index.ts`                        | Meta fixa ou intervalo de repetições.                   | Evitar combinações inválidas de campos opcionais.                            |
| `ExerciseSource`               | `src/types/index.ts`                        | Diferenciar catálogo compartilhado e exercício privado. | Orientar exibição e permissões.                                              |
| `WorkoutSection`               | `src/types/index.ts`                        | Identificar aquecimento ou treino principal.            | Ordenar e apresentar os exercícios na seção correta.                         |
| `WorkoutSummary`               | `src/types/workout.ts`                      | Card da listagem de fichas.                             | Evitar carregar o detalhe completo na tela inicial.                          |
| `WorkoutListResponse`          | `src/types/workout.ts`                      | Resposta paginada da listagem.                          | Preparar o contrato para crescimento por cursor.                             |
| `WorkoutExercise`              | `src/types/workout.ts`                      | Exercício configurado dentro de uma ficha.              | Separar o exercício reutilizável da prescrição específica da ficha.          |
| `WorkoutDetail`                | `src/types/workout.ts`                      | Detalhe completo da ficha.                              | Alimentar visualização, edição e preparação da execução.                     |

## Autenticação

### `User`

```ts
type User = {
  name: string
  email: string
  taxId: string
}
```

O tipo é inferido de `userSchema`. Atualmente todos os campos são obrigatórios. A definição do identificador público usado no login e a necessidade futura de `taxId` ainda devem ser revisitadas quando a autenticação real for planejada.

### `UserSession`

```ts
type UserSession = {
  user: User
}
```

É consumido pelo contexto de autenticação e pela store persistida. Tokens e expiração ainda não fazem parte dessa tipagem porque o login atual é simulado.

### `SignInResponse`

```ts
type SignInResponse =
  | { status: "success" }
  | {
      status: "error"
      error: {
        code: "invalid_credentials" | "network" | "unexpected"
        message: string
      }
    }
```

Esse tipo pertence à camada de aplicação. Ele não representa diretamente a resposta HTTP: o contexto converte erros técnicos em estados que a interface consegue apresentar.

## Fichas e exercícios

### `RepetitionTarget`

```ts
type RepetitionTarget =
  { type: "fixed"; value: number } | { type: "range"; minimum: number; maximum: number }
```

O discriminador `type` permite validar e renderizar cada forma sem depender de campos opcionais. A implementação futura em Zod deve usar uma união discriminada e validar valores positivos e `minimum <= maximum`.

### `ExerciseSource`

```ts
type ExerciseSource = "catalog" | "private"
```

O valor implementado é `private`. Ele substitui o termo preliminar `personal` usado no planejamento e expressa melhor a regra: o exercício é privado do autor, independentemente de ele ser personal trainer.

### `WorkoutSection`

```ts
type WorkoutSection = "warmup" | "main"
```

O tipo é usado na ocorrência do exercício na ficha. A posição é independente em cada seção.

### `WorkoutSummary` e `WorkoutListResponse`

```ts
type WorkoutSummary = {
  id: string
  name: string
  restSeconds: number
  warmupExerciseCount: number
  mainExerciseCount: number
  lastPerformedAt: string | null
  updatedAt: string
}

type WorkoutListResponse = {
  items: WorkoutSummary[]
  nextCursor: string | null
}
```

São destinados à tela “Meus treinos”. `nextCursor` igual a `null` indica que não há outra página.

### `WorkoutExercise` e `WorkoutDetail`

```ts
type WorkoutExercise = {
  id: string
  exercise: {
    id: string
    name: string
    source: ExerciseSource
  }
  section: WorkoutSection
  position: number
  notes: string | null
  sets: number
  repetitionTarget: RepetitionTarget
}

type WorkoutDetail = {
  id: string
  name: string
  restSeconds: number
  exercises: WorkoutExercise[]
  createdAt: string
  updatedAt: string
}
```

`WorkoutExercise.id` identifica a ocorrência na ficha; `exercise.id` identifica o item reutilizável do catálogo. Essa separação é necessária para sugestões de carga, exercícios repetidos e preservação do histórico.

## Estado de migração para Zod

Os tipos de autenticação já usam schemas Zod. As tipagens de ficha em `src/types/index.ts` e `src/types/workout.ts` foram escritas manualmente e ainda não possuem schemas correspondentes. O estado desejado é:

```ts
export const workoutSummarySchema = z.object({
  // definição validável em tempo de execução
})

export type WorkoutSummary = z.infer<typeof workoutSummarySchema>
```

Essa migração ainda não foi realizada e não deve ser marcada como concluída no planejamento.
