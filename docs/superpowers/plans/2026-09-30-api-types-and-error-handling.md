# Plano de implementação das tipagens e do tratamento de erros da API

> **Para execução assistida:** SUB-SKILL OBRIGATÓRIA: usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [x]`) para acompanhamento.

**Objetivo:** implementar os schemas e tipos compartilhados necessários neste momento, uma fronteira reutilizável para erros da API e a consulta de referência `fetch-workouts-summary`.

**Arquitetura:** contratos compartilhados que precisam de validação em tempo de execução ficam em `src/types`. Schemas usados por apenas uma operação permanecem junto dela em `src/api`. As Promises do Axios validam respostas bem-sucedidas com Zod e convertem toda rejeição em `ApiRequestError`; hooks futuros do TanStack Query consumirão essa fronteira, mas não fazem parte deste plano.

**Tecnologias:** TypeScript 6, Zod 4, Axios 1, Vitest 5 e as convenções atuais do projeto React Native/Expo.

**Especificação:** `docs/superpowers/specs/2026-09-29-api-types-and-error-handling-design.md`

## Restrições gerais

- Não criar commits sem autorização específica do usuário para aquele commit.
- Arquivos que não são componentes, quando criados ou renomeados neste plano, usam `kebab-case`. Arquivos antigos fora do escopo ficam registrados para migração posterior.
- Schemas e tipos compartilhados ficam em `src/types`; schemas e tipos específicos ficam na pasta da operação em `src/api`.
- Criar um schema Zod apenas quando houver validação em tempo de execução; nos outros casos, usar somente um tipo TypeScript.
- Derivar tipos dos schemas com `z.infer`, sem duplicar suas estruturas.
- Operações `GET` ficam em `src/api/queries`; operações `POST`, `PUT` e `DELETE` ficam em `src/api/actions`.
- Listagens usam `fetch-`; consultas por identificador usam `get-`.
- Tipos de resposta terminam em `ApiResponse`, sem o sufixo adicional `Type`.
- Respostas bem-sucedidas contêm diretamente os dados da operação; somente erros possuem contrato comum.
- Chamadas Axios usam `.then()` e `.catch()`, sem tipo genérico de resposta no método HTTP.
- `GET /workouts` retorna todos os treinos, sem paginação.
- `exercisesCount` conta somente os exercícios principais.
- Não implementar hooks do TanStack Query neste plano.

## Pontos de atenção na revisão

- Um intervalo cujo `maximum` seja menor que `minimum` deve falhar no caminho `maximum`; a Tarefa 1 adiciona esse teste.
- Uma resposta HTTP de sucesso com datas ou campos inválidos deve rejeitar com `invalidResponse`; a Tarefa 3 adiciona esse teste.
- Uma resposta de erro do Axios com corpo fora do contrato deve resultar em `http`, e não em `api`; a Tarefa 2 adiciona esse teste.
- Uma requisição rejeitada sem resposta HTTP deve resultar em `network`; a Tarefa 2 adiciona esse teste.
- Nenhum caminho de falha pode resolver a consulta com `undefined`; a Tarefa 3 verifica a rejeição de respostas inválidas e falhas do Axios.

---

## Mapa de arquivos

### Criar

- `src/types/api.ts`: schema comum de erro do backend e tipo inferido.
- `src/types/exercise.ts`: schema compartilhado da origem do exercício e tipo inferido.
- `src/types/shared-schemas.test.ts`: testes dos schemas compartilhados de exercícios e treinos.
- `src/lib/errors/api-request-error.ts`: classe de erro normalizado e tipo das categorias.
- `src/lib/errors/normalize-api-error.ts`: conversão de falhas do Zod, Axios, cancelamento, HTTP e falhas inesperadas.
- `src/lib/errors/normalize-api-error.test.ts`: testes da normalização.
- `src/api/queries/workouts/fetch-workouts-summary/index.test.ts`: testes da consulta de referência.
- `docs/api/README.md`: convenções para operações futuras da API.

### Modificar

- `src/types/index.ts`: exportações centrais dos schemas e tipos compartilhados.
- `src/types/workout.ts`: manter somente schemas e tipos compartilhados de treino necessários agora.
- `src/api/queries/workouts/fetch-workouts-summary/schema.ts`: schema de resposta como array direto, com `exercisesCount`.
- `src/api/queries/workouts/fetch-workouts-summary/index.ts`: Promise do Axios, validação do corpo e normalização de erros.
- `docs/types/README.md`: substituir o exemplo antigo e registrar as regras de localização de schemas e tipos.
- `docs/types/implemented-types.md`: refletir os schemas e tipos de resposta realmente implementados.
- `docs/types/planned-contracts.md`: remover a paginação e as contagens separadas do contrato da listagem de treinos.

### Remover das tipagens compartilhadas

- `WorkoutSummary` e `WorkoutListResponse`: substituídos pelo schema específico da operação.
- `WorkoutExercise` e `WorkoutDetail`: estruturas futuras ainda sem uso; serão criadas junto às respectivas operações quando elas forem implementadas.

## Tarefa 1: Schemas compartilhados de exercícios e treinos

**Arquivos:**

- Criar: `src/types/exercise.ts`
- Criar: `src/types/shared-schemas.test.ts`
- Modificar: `src/types/workout.ts`
- Modificar: `src/types/index.ts`

**Interfaces:**

- Produz: `exerciseSourceSchema`, `ExerciseSource`, `workoutSectionSchema`, `WorkoutSection`, `repetitionTargetSchema` e `RepetitionTarget`.
- Consome: somente Zod 4.

- [x] **Etapa 1: escrever testes inicialmente falhos para os schemas compartilhados**

Criar testes com estes comportamentos:

- aceitar as origens `catalog` e `private`;
- aceitar as seções `warmup` e `main`;
- aceitar uma meta fixa de repetições inteira e positiva;
- aceitar um intervalo de repetições com inteiros positivos;
- rejeitar repetições iguais a zero, negativas ou decimais;
- rejeitar intervalo cujo máximo seja menor que o mínimo e conferir que o caminho do erro seja `maximum`.

- [x] **Etapa 2: executar o teste específico e confirmar a falha**

Executar: `npm test -- src/types/shared-schemas.test.ts`

Resultado esperado: falha porque as exportações dos schemas ainda não existem.

- [x] **Etapa 3: implementar o schema da origem do exercício**

Em `src/types/exercise.ts`, exportar:

```ts
export const exerciseSourceSchema = z.enum(["catalog", "private"])
export type ExerciseSource = z.infer<typeof exerciseSourceSchema>
```

Não duplicar manualmente a união de tipos.

- [x] **Etapa 4: implementar os schemas de seção e repetições**

Em `src/types/workout.ts`, exportar:

```ts
export const workoutSectionSchema = z.enum(["warmup", "main"])
export type WorkoutSection = z.infer<typeof workoutSectionSchema>
export type RepetitionTarget = z.infer<typeof repetitionTargetSchema>
```

Também exportar `repetitionTargetSchema` como união discriminada pelo campo `type`, com objetos internos para `fixed` e `range`. Aplicar validação de inteiro positivo a todas as repetições e refinar a união completa para associar intervalos invertidos ao caminho `maximum`.

- [x] **Etapa 5: substituir as exportações centrais**

Em `src/types/index.ts`, exportar schemas e tipos de `./exercise` e `./workout`. Remover as declarações internas para que cada contrato tenha uma única fonte de verdade.

Remover de `src/types/workout.ts` as declarações não utilizadas `WorkoutSummary`, `WorkoutListResponse`, `WorkoutExercise` e `WorkoutDetail`. `WorkoutSummary` será reintroduzido como schema específico na Tarefa 3.

- [x] **Etapa 6: executar o teste específico**

Executar: `npm test -- src/types/shared-schemas.test.ts`

Resultado esperado: todos os seis comportamentos passam.

- [x] **Etapa 7: executar verificações estáticas específicas**

Executar:

```powershell
npx eslint src/types/index.ts src/types/exercise.ts src/types/workout.ts src/types/shared-schemas.test.ts
npx prettier src/types/index.ts src/types/exercise.ts src/types/workout.ts src/types/shared-schemas.test.ts --check
```

Resultado esperado: os dois comandos terminam com sucesso.

- [x] **Etapa 8: ponto de revisão**

Apresentar ao usuário o diff dos schemas compartilhados e o resultado dos testes. Não criar commit.

## Tarefa 2: Fronteira comum de erros da API

**Arquivos:**

- Criar: `src/types/api.ts`
- Criar: `src/lib/errors/api-request-error.ts`
- Criar: `src/lib/errors/normalize-api-error.ts`
- Criar: `src/lib/errors/normalize-api-error.test.ts`
- Modificar: `src/types/index.ts`

**Interfaces:**

- Produz: `apiErrorResponseSchema`, `ApiErrorResponse`, `ApiRequestErrorKind`, `ApiRequestError` e `normalizeApiError(error: unknown): ApiRequestError`.
- Consome: verificadores de tipo do Axios, `ZodError` e o schema compartilhado de erro.

- [x] **Etapa 1: escrever testes inicialmente falhos para resposta e normalização de erros**

Cobrir estes casos:

- resposta válida `{ code, message }` sem `fields`;
- resposta válida com `fields: Record<string, string[]>`;
- `ApiRequestError` existente preservado sem criar outra instância;
- `ZodError` convertido em `kind: "invalidResponse"`;
- cancelamento do Axios convertido em `kind: "cancelled"`;
- rejeição do Axios sem `response` convertida em `kind: "network"`;
- resposta HTTP com corpo válido de erro convertida em `kind: "api"`, preservando `status`, `code`, `message` e `fields`;
- resposta HTTP com corpo inválido convertida em `kind: "http"`;
- `Error` comum convertido em `kind: "unexpected"`, preservando o valor original em `cause`.

- [x] **Etapa 2: executar o teste específico e confirmar a falha**

Executar: `npm test -- src/lib/errors/normalize-api-error.test.ts`

Resultado esperado: falha porque o schema, a classe e o normalizador ainda não existem.

- [x] **Etapa 3: implementar o schema comum de resposta de erro**

Em `src/types/api.ts`, exportar:

```ts
export const apiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.record(z.string(), z.array(z.string())).optional()
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
```

Adicionar as exportações públicas em `src/types/index.ts`.

- [x] **Etapa 4: implementar `ApiRequestError`**

Em `src/lib/errors/api-request-error.ts`, exportar:

```ts
export type ApiRequestErrorKind =
  | "api"
  | "network"
  | "invalidResponse"
  | "cancelled"
  | "http"
  | "unexpected"

export type ApiRequestErrorOptions = {
  kind: ApiRequestErrorKind
  message: string
  status?: number
  code?: string
  fields?: Record<string, string[]>
  cause?: unknown
}

export class ApiRequestError extends Error
```

O construtor copia todas as opções para propriedades somente leitura e define `name = "ApiRequestError"`.

- [x] **Etapa 5: implementar `normalizeApiError`**

Em `src/lib/errors/normalize-api-error.ts`, implementar:

```ts
export function normalizeApiError(error: unknown): ApiRequestError
```

Usar a ordem definida na especificação. Executar `apiErrorResponseSchema.safeParse(error.response.data)` somente para erros Axios que possuam resposta HTTP. Preservar a mensagem do servidor apenas quando essa validação passar.

Usar estas mensagens de fallback:

- `invalidResponse`: `O servidor retornou dados em um formato inválido.`
- `cancelled`: `A requisição foi cancelada.`
- `network`: `Não foi possível conectar ao servidor.`
- `http`: `O servidor não conseguiu concluir a requisição.`
- `unexpected`: `Ocorreu um erro inesperado.`

- [x] **Etapa 6: executar o teste específico**

Executar: `npm test -- src/lib/errors/normalize-api-error.test.ts`

Resultado esperado: todas as categorias de erro passam.

- [x] **Etapa 7: executar verificações estáticas específicas**

Executar:

```powershell
npx eslint src/types/api.ts src/types/index.ts src/lib/errors/api-request-error.ts src/lib/errors/normalize-api-error.ts src/lib/errors/normalize-api-error.test.ts
npx prettier src/types/api.ts src/types/index.ts src/lib/errors/api-request-error.ts src/lib/errors/normalize-api-error.ts src/lib/errors/normalize-api-error.test.ts --check
```

Resultado esperado: os dois comandos terminam com sucesso.

- [x] **Etapa 8: ponto de revisão**

Apresentar ao usuário o modelo de erro, o diff do normalizador e o resultado dos testes. Não criar commit.

## Tarefa 3: Consulta de referência da listagem de treinos

**Arquivos:**

- Modificar: `src/api/queries/workouts/fetch-workouts-summary/schema.ts`
- Modificar: `src/api/queries/workouts/fetch-workouts-summary/index.ts`
- Criar: `src/api/queries/workouts/fetch-workouts-summary/index.test.ts`

**Interfaces:**

- Consome: `normalizeApiError(error: unknown): ApiRequestError`, criado na Tarefa 2, e a instância configurada `api` do Axios.
- Produz: `workoutSummarySchema`, `workoutsSummaryApiResponseSchema`, `WorkoutsSummaryApiResponse` e `fetchWorkoutsSummary(): Promise<WorkoutsSummaryApiResponse>`.

- [x] **Etapa 1: escrever testes inicialmente falhos para o schema da resposta**

Verificar que o schema:

- aceita um array com `{ id, name, restSeconds, exercisesCount, lastPerformedAt, updatedAt }`;
- aceita `lastPerformedAt: null`;
- rejeita o formato antigo com `warmupExerciseCount` e `mainExerciseCount` quando `exercisesCount` não existe;
- rejeita contagens negativas ou decimais e datas ISO inválidas;
- retorna diretamente o array, sem objeto contendo `status`, `message` ou `data`.

- [x] **Etapa 2: escrever testes inicialmente falhos para a função da consulta**

Simular `@/lib/services/api` e verificar:

- `api.get` é chamado uma vez com `"/workouts"`;
- `response.data` válido resolve com o array validado;
- `response.data` inválido rejeita com `ApiRequestError` de `kind: "invalidResponse"`;
- falha de rede do Axios rejeita com `ApiRequestError` de `kind: "network"`;
- resposta válida de erro do backend preserva `code`, `message` e o status HTTP;
- nenhum caso de falha resolve com `undefined`.

- [x] **Etapa 3: executar o teste específico e confirmar a falha**

Executar: `npm test -- src/api/queries/workouts/fetch-workouts-summary/index.test.ts`

Resultado esperado: falha porque o schema atual ainda espera um envelope e contagens separadas, e a função atual absorve os erros.

- [x] **Etapa 4: implementar o schema específico da resposta**

Em `schema.ts`, exportar:

```ts
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

Não exportar um alias chamado `WorkoutsSummaryApiResponseType`.

- [x] **Etapa 5: implementar a cadeia de Promises do Axios**

Em `index.ts`, implementar:

```ts
export function fetchWorkoutsSummary(): Promise<WorkoutsSummaryApiResponse>
```

Chamar `api.get("/workouts")` sem genérico de resposta e sem um `AxiosRequestConfig` vazio. Confirmar isso por revisão estática, pois genéricos TypeScript não existem em tempo de execução. No `.then()`, validar `response.data`. No `.catch()`, lançar `normalizeApiError(error)`.

- [x] **Etapa 6: executar o teste específico**

Executar: `npm test -- src/api/queries/workouts/fetch-workouts-summary/index.test.ts`

Resultado esperado: os testes de schema, resolução e rejeição passam.

- [x] **Etapa 7: executar verificações estáticas específicas**

Executar:

```powershell
npx eslint src/api/queries/workouts/fetch-workouts-summary src/lib/errors src/types
npx prettier src/api/queries/workouts/fetch-workouts-summary src/lib/errors src/types --check
```

Resultado esperado: os dois comandos terminam com sucesso.

- [x] **Etapa 8: ponto de revisão**

Apresentar ao usuário o diff da API de referência e o resultado dos testes. Não criar commit.

## Tarefa 4: Documentação de referência e validação completa

**Arquivos:**

- Criar: `docs/api/README.md`
- Modificar: `docs/types/README.md`
- Modificar: `docs/types/implemented-types.md`
- Modificar: `docs/types/planned-contracts.md`

**Interfaces:**

- Consome: a organização final e os contratos públicos das Tarefas 1 a 3.
- Produz: referência mantida para queries, actions, schemas, tipos, erros e hooks futuros.

- [x] **Etapa 1: escrever a referência da estrutura da API**

Documentar em `docs/api/README.md`:

- separação entre `queries` e `actions`;
- regras dos prefixos `fetch-` e `get-`;
- arquivos não componentes em `kebab-case`;
- localização de estruturas compartilhadas e específicas;
- quando criar schema Zod e quando criar somente um tipo;
- corpos diretos para respostas bem-sucedidas;
- corpo comum para respostas de erro;
- fluxo de validação no `.then()` e normalização no `.catch()`;
- árvore e fluxo da consulta de referência `fetch-workouts-summary`;
- como um hook futuro do TanStack Query consumirá a função sem mover a validação para o hook.

- [x] **Etapa 2: sincronizar o catálogo de tipagens**

Atualizar os três documentos em `docs/types` para:

- marcar corretamente os schemas e tipos implementados;
- declarar que a listagem de treinos é um array direto sem paginação;
- usar somente `exercisesCount` para exercícios principais;
- remover paginação e contagens separadas do contrato da listagem de treinos;
- identificar contratos futuros ainda não implementados como planejados.

- [x] **Etapa 3: executar todos os testes automatizados**

Executar: `npm test`

Resultado esperado: todos os testes existentes e novos passam.

- [x] **Etapa 4: executar o compilador TypeScript**

Executar: `npx tsc --noEmit`

Resultado esperado: código de saída 0, sem erros de tipos.

- [x] **Etapa 5: executar lint e verificação de formatação**

Executar:

```powershell
npm run lint
npm run format:check
```

Resultado esperado: os dois comandos terminam com sucesso. Se alterações preexistentes e fora do escopo causarem falhas, registrar os arquivos exatos e repetir o mesmo verificador em todos os arquivos alterados por este plano.

- [x] **Etapa 6: verificar escopo e consistência da documentação**

Executar buscas que comprovem:

- `WorkoutsSummaryApiResponseType`, `warmupExerciseCount`, `mainExerciseCount` e `WorkoutListResponse` não permanecem no código implementado nem na documentação atual do contrato de listagem;
- nenhuma paginação está associada a `fetch-workouts-summary`;
- nenhum hook TanStack Query foi adicionado;
- todo novo arquivo que não seja componente usa `kebab-case`.

- [x] **Etapa 7: ponto de revisão final**

Apresentar ao usuário a lista de arquivos alterados, resultados das verificações específicas e completas, limitações restantes e links da documentação. Não criar commit sem autorização específica após a revisão da implementação.

## Resultado da execução

- Testes desta entrega: 31 de 31 passaram.
- Lint dos arquivos alterados: passou sem erros ou avisos.
- Formatação dos arquivos alterados: passou.
- Suíte completa: 60 de 61 testes passaram; permanece uma falha preexistente em `src/contexts/AuthContext/index.test.ts`, relacionada à hidratação antes do login.
- TypeScript completo: permanece com erros preexistentes em `src/components/ui/badge.tsx` e `src/components/ui/checkbox.tsx`; nenhum erro foi apontado nos arquivos desta entrega.
- Lint completo: permanece com erros e avisos preexistentes fora dos arquivos desta entrega.
- Formatação completa: permanece com arquivos preexistentes fora desta entrega que ainda não seguem o Prettier.
- Commit: não criado, conforme instrução do usuário.
