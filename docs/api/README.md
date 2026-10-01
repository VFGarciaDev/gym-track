# Estrutura das chamadas da API

Esta pasta documenta como criar contratos e chamadas HTTP no Gym Track. O objetivo é manter validação, nomes e tratamento de erros consistentes quando novas funcionalidades forem adicionadas.

## Organização

```text
src/api/
├── queries/
│   └── workouts/
│       ├── fetch-workouts-summary/
│       │   ├── index.ts
│       │   ├── index.test.ts
│       │   └── schema.ts
│       └── get-workout-details/
└── actions/
    └── workouts/
        ├── create-workout/
        ├── update-workout/
        └── delete-workout/
```

- `queries`: operações `GET` que consultam dados.
- `actions`: operações `POST`, `PUT` e `DELETE` que alteram dados.
- `fetch-`: lista uma coleção, como `fetch-workouts-summary`.
- `get-`: consulta um registro por identificador, como `get-workout-details`.
- Arquivos que não são componentes usam `kebab-case`.

## Localização dos contratos

Um schema ou tipo usado por mais de um módulo fica em `src/types`, separado por domínio. Um contrato usado por apenas uma operação fica no `schema.ts` dessa operação.

Criar schema Zod quando os dados precisam de validação em tempo de execução, por exemplo:

- corpo recebido da API;
- corpo de erro recebido do backend;
- dados externos ou persistidos que podem estar incompatíveis com a versão atual.

Usar somente um tipo TypeScript quando a estrutura é interna, confiável e não passa por `parse` ou `safeParse`.

Quando houver um schema, o tipo correspondente deve ser inferido:

```ts
export const exampleSchema = z.object({ id: z.string() })
export type Example = z.infer<typeof exampleSchema>
```

## Respostas bem-sucedidas

Respostas de sucesso contêm diretamente os dados da operação. Não usar um envelope genérico com `status`, `message` e `data`.

A listagem de treinos, por exemplo, devolve diretamente um array:

```json
[
  {
    "id": "workout-1",
    "name": "Treino de Costas",
    "restSeconds": 90,
    "exercisesCount": 5,
    "lastPerformedAt": null,
    "updatedAt": "2026-09-29T12:00:00.000Z"
  }
]
```

`exercisesCount` conta somente exercícios principais. Essa consulta não possui paginação.

## Respostas de erro

Erros do backend seguem o contrato compartilhado de `src/types/api.ts`:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Alguns dados são inválidos.",
  "fields": {
    "name": ["O nome é obrigatório."]
  }
}
```

`fields` é opcional. A função `normalizeApiError` converte erros do backend, rede, validação, cancelamento e respostas HTTP inválidas em `ApiRequestError`.

## Detalhe da ficha

`getWorkoutDetails(workoutId)` representa `GET /workouts/:workoutId`. Seu retorno contém a ficha completa, com exercícios de aquecimento e principais no mesmo array. Cada série possui sua própria posição, meta de repetições e carga. Uma meta pode ser fixa, um intervalo ou uma duração em segundos.

Enquanto o backend não existe, a função retorna um mock local. O mock passa por `workoutApiResponseSchema.parse`, preservando a validação e a assinatura que serão usadas quando a chamada Axios substituir o mock.

## Fluxo de uma query

Uma função de API usa a instância centralizada do Axios, valida `response.data` no `.then()` e relança o erro normalizado no `.catch()`:

```ts
export function fetchWorkoutsSummary(): Promise<WorkoutsSummaryApiResponse> {
  return api
    .get("/workouts")
    .then((response) => workoutsSummaryApiResponseSchema.parse(response.data))
    .catch((error) => {
      throw normalizeApiError(error)
    })
}
```

Não adicionar um genérico de resposta em `api.get()`. O schema específico é responsável pela validação e fornece o tipo do retorno.

## Nomes dos contratos

- Schema específico: `[nome]ApiResponseSchema`.
- Tipo inferido: `[Nome]ApiResponse`.
- Não adicionar o sufixo `Type`.
- Schemas de itens internos podem usar o nome do item, como `workoutSummarySchema`.

## TanStack Query

O hook será criado em uma etapa posterior. Ele consumirá a função de API já validada e não repetirá schemas ou tratamento Axios.

Quando uma configuração precisar ser reutilizada por hook, prefetch e acesso ao cache, usar `queryOptions` para preservar a inferência da função:

```ts
function workoutsSummaryOptions() {
  return queryOptions({
    queryKey: ["workouts", "summary"],
    queryFn: fetchWorkoutsSummary
  })
}
```

Essa referência não autoriza a implementação do hook antes da etapa correspondente do planejamento.

## Checklist para uma nova operação

1. Escolher `queries` ou `actions` de acordo com o método HTTP.
2. Nomear a pasta com `fetch-`, `get-`, `create-`, `update-` ou `delete-`.
3. Manter o schema específico dentro da operação.
4. Mover para `src/types` somente contratos realmente compartilhados.
5. Validar `response.data` antes de devolver o resultado.
6. Relançar `normalizeApiError(error)` no `.catch()`.
7. Escrever testes para sucesso, resposta inválida e erros relevantes.
8. Atualizar `docs/types` quando um contrato compartilhado mudar.
