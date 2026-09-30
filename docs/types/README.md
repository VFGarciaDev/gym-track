# Catálogo de tipagens do Gym Track

Esta pasta registra as tipagens compartilhadas do domínio, dos contratos da API e da persistência local. O objetivo é explicar **onde** cada tipo vive, **como** ele é usado e **por que** existe.

Ela não substitui o código. Quando um schema Zod estiver implementado, o schema será a fonte de verdade e o tipo TypeScript será derivado com `z.infer`. A documentação deve acompanhar o código e registrar as decisões que não ficam evidentes apenas pela definição do tipo.

## Escopo

Entram neste catálogo:

- tipos compartilhados entre telas ou módulos;
- entradas e respostas da API;
- entidades do domínio de fichas, exercícios e sessões;
- estruturas persistidas localmente para execução offline e sincronização.

Não entram propriedades locais de componentes visuais, estados temporários de uma única tela ou tipos internos óbvios de uma função.

## Status utilizados

| Status                     | Significado                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| Implementado               | Existe no código atual e foi conferido diretamente no repositório.      |
| Aprovado, não implementado | O formato foi aprovado no planejamento, mas ainda não existe no código. |
| Pendente                   | Ainda depende de uma decisão de produto ou arquitetura.                 |

## Documentos

- [Tipagens implementadas](./implemented-types.md): inventário do que existe atualmente em `src/types` e nos contratos de autenticação.
- [Contratos planejados](./planned-contracts.md): formatos aprovados para catálogo, gravação de fichas, execução, histórico e sincronização.

## Convenções

- Campos e propriedades usam `camelCase`.
- Identificadores trafegam como `string`; o formato definitivo será decidido junto ao banco.
- Datas trafegam como texto ISO 8601 e são validadas antes de entrar no aplicativo.
- Ausência intencional de valor usa `null`; propriedade opcional é reservada para campos que podem não existir no contrato.
- Valores de enumeração usam nomes legíveis e estáveis, como `warmup`, `main` e `inProgress`.
- Posições de exercícios começam em zero dentro de cada seção; números de série começam em um para corresponder ao que o usuário vê.
- Cargas são expressas em quilogramas e podem ser `null` para primeira execução ou exercício sem carga externa.
- Respostas recebidas pelo Axios só entram na aplicação depois de serem validadas por um schema Zod.
- Arquivos que não são componentes usam `kebab-case`.

## Organização recomendada no código

Cada recurso mantém próximos o schema específico, o tipo inferido e a função que valida a resposta. Queries e actions ficam separadas:

```text
src/api/
├── queries/
│   └── workouts/
│       ├── fetch-workouts-summary/
│       └── get-workout/
└── actions/
    └── workouts/
        ├── create-workout/
        ├── update-workout/
        └── delete-workout/
```

Listagens usam `fetch-`; consultas por identificador usam `get-`. Schemas e tipos utilizados por mais de um módulo ficam em `src/types`; contratos exclusivos permanecem na pasta da operação. A referência completa está em [`docs/api/README.md`](../api/README.md).

## Como manter este catálogo

Ao criar ou alterar uma tipagem compartilhada:

1. Atualizar primeiro o schema Zod e seus testes quando ele já existir.
2. Derivar o tipo com `z.infer`, evitando repetir manualmente a mesma estrutura.
3. Atualizar o documento correspondente nesta pasta.
4. Registrar onde o tipo é consumido e qual regra de produto ele representa.
5. Marcar como implementado somente depois de conferir o arquivo real no repositório.
6. Se a mudança alterar o contrato da API, atualizar também os mocks e os exemplos usados no front.

## Decisões relacionadas

- A V1 atende apenas o uso pessoal.
- O módulo personal entra na V2 com alta prioridade.
- A modelagem da V1 mantém propriedade explícita dos dados para permitir a expansão posterior.
- Uma pessoa pode usar o aplicativo pessoalmente e também acompanhar alunos; permissões futuras serão derivadas dos vínculos.
- Apenas uma sessão pode permanecer em andamento por usuário.
