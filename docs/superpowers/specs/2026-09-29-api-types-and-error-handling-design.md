# Estrutura de tipagens e chamadas da API

## Objetivo

Definir a organização inicial dos schemas e tipos compartilhados do aplicativo, padronizar chamadas Axios e estabelecer um tratamento comum de erros antes da escolha e implementação do backend.

Esta primeira entrega implementará somente os tipos e schemas genéricos necessários agora e a consulta de listagem de treinos usada como referência. Hooks TanStack Query não fazem parte desta etapa.

## Decisões

- Schemas e tipos compartilhados por mais de um módulo ficam em `src/types`.
- Schemas e tipos exclusivos de uma operação ficam dentro da pasta dessa operação em `src/api`.
- Schemas Zod são criados quando há validação em tempo de execução. Estruturas internas que não precisam de `parse` usam somente tipos TypeScript.
- Tipos derivados de schemas usam `z.infer` para evitar duplicação.
- Arquivos que não são componentes usam `kebab-case`.
- Consultas `GET` ficam em `src/api/queries`.
- Operações `POST`, `PUT` e `DELETE` ficam em `src/api/actions`.
- Listagens usam o prefixo `fetch-`; buscas por identificador usam `get-`.
- Tipos de resposta usam o sufixo `ApiResponse`, sem o sufixo adicional `Type`.
- Respostas bem-sucedidas retornam diretamente os dados da operação, sem envelope genérico com `status`, `message` e `data`.
- Respostas de erro seguem um contrato comum.
- Chamadas Axios usam `.then()` e `.catch()`.
- O método Axios não recebe um tipo genérico para a resposta. O dado retornado é validado com Zod antes de sair da função da API.

## Organização de arquivos

```text
src/
├── api/
│   ├── actions/
│   └── queries/
│       └── workouts/
│           └── fetch-workouts-summary/
│               ├── index.ts
│               ├── schema.ts
│               └── index.test.ts
├── lib/
│   └── errors/
│       ├── api-request-error.ts
│       └── normalize-api-error.ts
└── types/
    ├── api.ts
    ├── exercise.ts
    ├── workout.ts
    └── index.ts
```

`src/types/index.ts` funciona como ponto de exportação das estruturas compartilhadas. Cada arquivo de domínio mantém próximos o schema, quando necessário, e o tipo inferido.

## Tipos e schemas compartilhados

### API

`src/types/api.ts` define o contrato de erro recebido do backend:

```ts
import * as z from "zod"

export const apiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.record(z.string(), z.array(z.string())).optional()
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
```

Não será criado um schema genérico de paginação nesta etapa. A listagem de treinos sempre retorna todas as fichas do usuário, e nenhum outro contrato implementado precisa de paginação agora.

### Exercícios

`src/types/exercise.ts` define `exerciseSourceSchema` e o tipo inferido `ExerciseSource`. Os valores permitidos são `catalog` e `private`.

O schema existe porque a origem do exercício participa de contratos externos que serão validados com Zod.

### Fichas

`src/types/workout.ts` define:

- `workoutSectionSchema` e `WorkoutSection`, com os valores `warmup` e `main`;
- `repetitionTargetSchema` e `RepetitionTarget`, como união discriminada entre valor fixo e intervalo.

O schema de repetições garante:

- valor fixo inteiro e positivo;
- mínimo e máximo inteiros e positivos;
- máximo maior ou igual ao mínimo.

Estados exclusivamente locais, como `RestTimerState`, continuam somente como tipos até surgir uma necessidade concreta de validar dados externos ou persistidos.

## Consulta de listagem de treinos

### Contrato

`GET /workouts` retorna diretamente um array com todas as fichas do usuário:

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

`exercisesCount` conta somente os exercícios da seção principal. Exercícios de aquecimento continuam disponíveis no detalhe da ficha e não participam do resumo.

A resposta não contém cursor, total de páginas, contagem de aquecimentos ou contagens separadas por seção.

### Schema específico

`src/api/queries/workouts/fetch-workouts-summary/schema.ts` define:

```ts
import * as z from "zod"

export const workoutSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  restSeconds: z.number().int().nonnegative(),
  exercisesCount: z.number().int().nonnegative(),
  lastPerformedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime()
})

export const workoutsSummaryApiResponseSchema = z.array(workoutSummarySchema)

export type WorkoutsSummaryApiResponse = z.infer<typeof workoutsSummaryApiResponseSchema>
```

`WorkoutSummary` permanece específico dessa operação enquanto não houver uso comprovado em outros módulos. Se outro contrato passar a reutilizá-lo, o schema será movido para `src/types/workout.ts`.

### Função Axios

`src/api/queries/workouts/fetch-workouts-summary/index.ts` segue este fluxo:

```ts
export function fetchWorkoutsSummary() {
  return api
    .get("/workouts")
    .then((response) => workoutsSummaryApiResponseSchema.parse(response.data))
    .catch((error) => {
      throw normalizeApiError(error)
    })
}
```

O retorno é inferido como `Promise<WorkoutsSummaryApiResponse>`. Uma resposta inválida lança um erro do Zod, que é convertido pelo normalizador e continua rejeitando a Promise. A função nunca converte falhas em `undefined`.

## Tratamento de erros

### Erro interno

`src/lib/errors/api-request-error.ts` define `ApiRequestError`, uma classe interna usada pelas funções de API e futuramente pelos hooks e telas.

Ela expõe:

- `kind`: categoria estável para decisões da aplicação;
- `message`: texto adequado ao contexto técnico ou à interface;
- `status`: status HTTP quando existe;
- `code`: código devolvido pelo backend quando o corpo é válido;
- `fields`: erros associados a campos de formulário;
- `cause`: erro original para diagnóstico.

As categorias são:

```ts
type ApiRequestErrorKind =
  "api" | "network" | "invalidResponse" | "cancelled" | "http" | "unexpected"
```

### Normalização

`src/lib/errors/normalize-api-error.ts` recebe o valor rejeitado e aplica esta ordem:

1. Preserva um `ApiRequestError` já normalizado.
2. Converte `ZodError` em `invalidResponse`.
3. Identifica cancelamento do Axios.
4. Converte erro Axios sem resposta em `network`.
5. Valida o corpo de erro HTTP com `apiErrorResponseSchema` e cria um erro `api`.
6. Converte uma resposta HTTP fora do contrato em `http`.
7. Converte os demais valores em `unexpected`.

O parâmetro do normalizador usa `unknown` porque uma Promise JavaScript pode ser rejeitada com qualquer valor. Esse `unknown` fica restrito à fronteira de erros e é refinado imediatamente com verificações de tipo. As chamadas `api.get()` permanecem sem genérico, conforme a convenção aprovada.

## TanStack Query

Hooks não serão implementados nesta etapa. A função Axios validada e o erro normalizado formam a interface que os hooks consumirão depois.

Quando forem criados, os hooks poderão usar `queryOptions` para compartilhar chave, função e configurações mantendo a inferência do retorno. A função da API continuará independente do React e do cache.

## Validação

Os testes desta etapa verificam:

- repetição fixa válida;
- intervalo válido;
- rejeição de valores não inteiros, não positivos e intervalos invertidos;
- resposta válida da listagem;
- `lastPerformedAt` igual a `null`;
- rejeição de uma resposta de sucesso malformada;
- conversão de erro padronizado do backend;
- conversão de erro de rede;
- conversão de resposta HTTP fora do contrato;
- manutenção da rejeição da Promise em todos os casos de falha.

## Documentação após a implementação

Depois que os testes e a implementação estiverem concluídos:

- atualizar `docs/types/implemented-types.md`;
- atualizar `docs/types/planned-contracts.md` para remover paginação da listagem de treinos;
- atualizar o exemplo de organização em `docs/types/README.md`;
- criar `docs/api/README.md` com as convenções de queries, actions, nomes, validação, erros e preparação dos hooks.

## Fora do escopo

- hooks TanStack Query;
- implementação do backend;
- paginação genérica;
- consultas de detalhe de ficha;
- actions de criação, edição ou exclusão;
- autenticação real;
- persistência offline.
