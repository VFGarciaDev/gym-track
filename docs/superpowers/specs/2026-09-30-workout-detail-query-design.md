# Consulta de detalhe da ficha de treino

## Objetivo

Definir e implementar o contrato de leitura de uma ficha completa por identificador, inicialmente alimentado por um mock local enquanto o backend ainda não existe.

## Endpoint planejado

`GET /workouts/:workoutId`

A função do front será `getWorkoutDetails(workoutId: string): Promise<WorkoutApiResponse>` e ficará em `src/api/queries/workouts/get-workout-details`.

## Contrato da resposta

A resposta contém diretamente a ficha, sem envelope genérico:

```ts
type WorkoutApiResponse = {
  id: string
  name: string
  restSeconds: number
  exercises: Array<{
    id: string
    exercise: {
      id: string
      name: string
      source: ExerciseSource
    }
    section: WorkoutSection
    position: number
    notes: string | null
    sets: Array<{
      id: string
      position: number
      repetitionTarget: RepetitionTarget
      loadKg: number | null
    }>
  }>
  lastPerformedAt: string | null
  createdAt: string
  updatedAt: string
}
```

## Regras

- O descanso pertence à ficha inteira.
- Aquecimento e exercícios principais compartilham o mesmo array e são diferenciados por `section`.
- A posição do exercício é independente dentro de cada seção.
- A quantidade de séries é derivada de `sets.length`.
- Cada série tem posição, meta de repetições e carga próprias.
- Metas podem ser repetições fixas, intervalo de repetições ou duração em segundos.
- `repetitionTarget` representa a meta prescrita; não existe registro de repetições realmente realizadas.
- `loadKg` aceita zero ou `null`, inclusive para exercícios sem carga externa.
- A observação pertence ao exercício configurado dentro da ficha.
- O identificador da série permitirá alterar sua carga em uma action futura.
- As estruturas externas são validadas com Zod, reutilizando os schemas compartilhados já existentes.

## Mock temporário

Enquanto o backend não existe, `getWorkoutDetails` retorna uma Promise com um mock de `src/lib/mocks`. O mock passa pelo mesmo schema que validará a futura resposta HTTP. A substituição posterior deve preservar a assinatura pública da função.

## Fora do escopo

- actions de criação, edição, exclusão ou atualização de carga;
- hook TanStack Query;
- detalhe isolado de exercício;
- plano de execução e sessão de treino;
- backend e persistência.
