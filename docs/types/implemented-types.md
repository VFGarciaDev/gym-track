# Tipagens implementadas

Status conferido em 30 de setembro de 2026. Este documento descreve tipagens e schemas existentes no repositório após a criação da estrutura de referência da API.

## Inventário

| Tipo ou schema                     | Local atual                                                 | Uso                                            | Motivo                                                                       |
| ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `userSchema`                       | `src/types/user-session.ts`                                 | Validar os dados do usuário autenticado.       | Impedir que uma sessão inesperada entre no estado global.                    |
| `User`                             | `src/types/user-session.ts`                                 | Representar o usuário após validação.          | Compartilhar a mesma estrutura entre API, contexto e store.                  |
| `UserSession`                      | `src/types/user-session.ts`                                 | Estado persistido da sessão autenticada.       | Agrupar os dados necessários depois do login.                                |
| `userSignInSchema`                 | `src/api/auth/fetch-user-session/schema.ts`                 | Validar as credenciais preenchidas.            | Produzir mensagens por campo e impedir envio vazio.                          |
| `UserSignInType`                   | `src/api/auth/fetch-user-session/schema.ts`                 | Entrada da função de login e do formulário.    | Derivar o tipo diretamente do schema Zod.                                    |
| `userSessionApiResponseSchema`     | `src/api/auth/fetch-user-session/schema.ts`                 | Validar a resposta do login.                   | Não confiar apenas na tipagem estática da chamada.                           |
| `exerciseSourceSchema`             | `src/types/exercise.ts`                                     | Validar a origem de um exercício.              | Compartilhar os valores `catalog` e `private` entre contratos.               |
| `ExerciseSource`                   | `src/types/exercise.ts`                                     | Representar a origem após validação.           | Orientar exibição e permissões sem duplicar a união.                         |
| `workoutSectionSchema`             | `src/types/workout.ts`                                      | Validar a seção da ocorrência de um exercício. | Limitar o contrato a `warmup` e `main`.                                      |
| `WorkoutSection`                   | `src/types/workout.ts`                                      | Representar uma seção após validação.          | Compartilhar a estrutura entre futuros contratos.                            |
| `repetitionTargetSchema`           | `src/types/workout.ts`                                      | Validar meta fixa ou intervalo de repetições.  | Impedir valores não positivos, decimais e intervalos invertidos.             |
| `RepetitionTarget`                 | `src/types/workout.ts`                                      | Representar a meta após validação.             | Evitar combinações inválidas e duplicação do schema.                         |
| `apiErrorResponseSchema`           | `src/types/api.ts`                                          | Validar um erro devolvido pelo backend.        | Manter `code`, `message` e erros por campo em um contrato comum.             |
| `ApiErrorResponse`                 | `src/types/api.ts`                                          | Representar o corpo validado do erro.          | Derivar a tipagem usada pelo normalizador.                                   |
| `ApiRequestError`                  | `src/lib/errors/api-request-error.ts`                       | Erro interno consumido pela aplicação.         | Separar rede, HTTP, contrato inválido, cancelamento e erro do backend.       |
| `workoutSummarySchema`             | `src/api/queries/workouts/fetch-workouts-summary/schema.ts` | Validar cada item da listagem de treinos.      | Manter o contrato específico ao lado da única operação que o utiliza.        |
| `workoutsSummaryApiResponseSchema` | `src/api/queries/workouts/fetch-workouts-summary/schema.ts` | Validar o array retornado por `GET /workouts`. | Garantir o formato antes que os dados entrem no aplicativo.                  |
| `WorkoutsSummaryApiResponse`       | `src/api/queries/workouts/fetch-workouts-summary/schema.ts` | Tipo retornado por `fetchWorkoutsSummary`.     | Oferecer inferência a consumidores futuros, incluindo TanStack Query.        |
| `SignInResponse`                   | `src/contexts/AuthContext/index.tsx`                        | Resultado tratado da tentativa de login.       | Permitir que a tela diferencie sucesso, credenciais, rede e erro inesperado. |

## Schemas compartilhados

### `ExerciseSource`

```ts
const exerciseSourceSchema = z.enum(["catalog", "private"])
type ExerciseSource = z.infer<typeof exerciseSourceSchema>
```

`private` identifica um exercício pertencente ao autor, independentemente de ele atuar como personal trainer.

### `WorkoutSection`

```ts
const workoutSectionSchema = z.enum(["warmup", "main"])
type WorkoutSection = z.infer<typeof workoutSectionSchema>
```

A seção pertence à ocorrência do exercício na ficha. A posição será independente dentro de cada seção.

### `RepetitionTarget`

```ts
type RepetitionTarget =
  { type: "fixed"; value: number } | { type: "range"; minimum: number; maximum: number }
```

O tipo é inferido de uma união discriminada. O schema exige números inteiros positivos e associa ao campo `maximum` o erro de um intervalo em que o máximo seja menor que o mínimo.

## Erros da API

### `ApiErrorResponse`

```ts
type ApiErrorResponse = {
  code: string
  message: string
  fields?: Record<string, string[]>
}
```

Esse é o único envelope comum da API. Respostas bem-sucedidas retornam diretamente os dados da operação.

### `ApiRequestError`

`normalizeApiError` converte falhas técnicas em uma classe interna com as categorias:

```ts
type ApiRequestErrorKind =
  "api" | "network" | "invalidResponse" | "cancelled" | "http" | "unexpected"
```

Quando o backend responde com o contrato esperado, o erro preserva `status`, `code`, `message` e `fields`. Falhas de schema, rede, cancelamento e respostas HTTP fora do contrato recebem categorias próprias.

## Listagem de treinos

```ts
type WorkoutsSummaryApiResponse = Array<{
  id: string
  name: string
  restSeconds: number
  exercisesCount: number
  lastPerformedAt: string | null
  updatedAt: string
}>
```

O retorno é um array direto, sem paginação. `exercisesCount` contém somente a quantidade de exercícios principais. A contagem de aquecimentos não faz parte dessa resposta.

`WorkoutSummary` não fica em `src/types`, pois atualmente pertence apenas a `fetch-workouts-summary`. Ele será movido para uma tipagem compartilhada somente quando outro módulo realmente reutilizar o mesmo contrato.

## Autenticação existente

Os contratos de autenticação anteriores permanecem implementados. `User`, `UserSession` e `UserSignInType` já são derivados de schemas. A autenticação ainda é simulada e será revisitada junto ao backend real.

`SignInResponse` pertence à camada de aplicação e não representa diretamente uma resposta HTTP. O contexto converte falhas técnicas em estados que a interface consegue apresentar.
