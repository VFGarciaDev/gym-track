# Plano de implementação da consulta de detalhe da ficha

> **Para execução assistida:** SUB-SKILL OBRIGATÓRIA: usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** implementar o schema e a função mockada `getWorkoutDetails` para obter uma ficha completa com repetições e cargas específicas por série.

**Arquitetura:** o contrato específico permanece junto da query em `src/api/queries/workouts/get-workout`. Schemas compartilhados de origem, seção e repetições são reutilizados; o mock temporário passa pela mesma validação Zod da futura resposta HTTP.

**Tecnologias:** TypeScript 6, Zod 4 e Vitest 5.

**Especificação:** `docs/superpowers/specs/2026-09-30-workout-detail-query-design.md`

## Restrições gerais

- Não criar commits sem autorização específica do usuário.
- Arquivos que não são componentes usam `kebab-case`.
- Não criar action, hook ou contrato de detalhe isolado de exercício.
- Respostas bem-sucedidas retornam os dados diretamente.
- Erros são normalizados com `normalizeApiError`.
- Não registrar repetições realmente realizadas.

## Pontos de atenção na revisão

- Uma série deve aceitar meta fixa, intervalo válido ou duração e rejeitar valores inválidos.
- Carga deve aceitar zero e `null`, mas rejeitar valor negativo.
- Posições e quantidades devem ser inteiras e não negativas.
- Datas devem usar o formato ISO esperado pelos contratos existentes.
- Uma falha de validação do mock deve continuar sendo normalizada como `invalidResponse`.

---

## Tarefa 1: Schema e função `getWorkout`

**Arquivos:**

- Criar: `src/api/queries/workouts/get-workout-details/schema.ts`
- Criar: `src/api/queries/workouts/get-workout-details/index.ts`
- Criar: `src/api/queries/workouts/get-workout-details/index.test.ts`

**Interfaces:**

- Consome: `exerciseSourceSchema`, `workoutSectionSchema`, `repetitionTargetSchema` e `normalizeApiError`.
- Produz: `workoutApiResponseSchema`, `WorkoutApiResponse` e `getWorkoutDetails(workoutId: string): Promise<WorkoutApiResponse>`.

- [x] Escrever os testes do schema e da função antes da implementação.
- [x] Executar os testes e confirmar falha pela ausência da operação.
- [x] Implementar o schema mínimo aprovado e o mock validado.
- [x] Executar os testes específicos até passarem.
- [x] Executar lint e Prettier nos arquivos da operação.

## Tarefa 2: Documentação dos contratos

**Arquivos:**

- Modificar: `docs/types/implemented-types.md`
- Modificar: `docs/types/planned-contracts.md`
- Modificar: `docs/api/README.md`

**Interfaces:**

- Consome: o contrato implementado na Tarefa 1.
- Produz: referência atualizada para o detalhe da ficha e para a nova granularidade das séries.

- [x] Registrar `WorkoutApiResponse` como implementado.
- [x] Remover dos contratos planejados a estrutura antiga de repetições e carga por exercício.
- [x] Adicionar `get-workout-details` à referência da API.
- [x] Executar Prettier nos documentos alterados.
- [x] Executar os testes completos e registrar qualquer falha preexistente.

## Resultado da execução

- Testes específicos da consulta, schemas, mocks e autenticação: 49 de 49 passaram.
- Lint dos arquivos alterados: passou sem erros ou avisos.
- TypeScript completo: passou sem erros.
- Suíte completa: 79 de 79 testes passaram após a atualização dos mocks e a correção do teste do `AuthContext`.
- Commit: não criado, conforme instrução do usuário.
