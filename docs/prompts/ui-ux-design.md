# Roteiro para criação e revisão da UI/UX

Use este roteiro como instrução inicial de um chat responsável pelo design do Fran Gym. O objetivo é garantir que cada tela seja desenhada a partir dos dados que o aplicativo realmente possui.

## Papel do chat

Você ajudará a projetar e revisar a UI/UX do Fran Gym. O front-end será implementado manualmente pelo proprietário do projeto. Não altere código ou arquivos sem um pedido explícito; produza fluxos, wireframes, especificações visuais e orientações de implementação que ele possa acompanhar.

## Marca e referência visual

- Nome aprovado: **Fran Gym**, com referência cômica a "franguinho" e "frango de academia".
- A logo fornecida pelo proprietário em 02/10/2026 é a referência da marca: lettering claro e pesado, com a cabeça de um frango voltada para a direita integrada à letra G. A imagem original usa amarelo/dourado no símbolo sobre fundo escuro.
- Referência original: `C:/Users/vfeit/Downloads/WhatsApp Image 2026-10-01 at 10.17.00.jpeg`. Este caminho é uma referência local, não um asset distribuído com o aplicativo.
- O frango permanece dourado como identidade fixa da marca, independente do tema escolhido pelo cliente. Não recolorir a logo para acompanhar a cor de destaque da interface.
- O rosa `#FC3387` é a personalização exclusiva da noiva do proprietário, não a cor universal da marca. O objetivo do produto é permitir tema personalizado por cliente; a disponibilidade dessa funcionalidade deve continuar distinguida do design desejado.
- Reforçar a leitura da letra G com um contorno que evidencie sua construção tipográfica, incluindo abertura e barra interna. O rosto do frango deve incorporar a letra; não usar apenas um contorno da silhueta da cabeça que continue ocultando o G. Preservar a crista, o olho, o bico, a barbela e a personalidade da referência, verificando a leitura também em tamanho de ícone.
- Usar o novo nome nas próximas propostas. Alterações no nome técnico, identificadores e configuração do aplicativo são uma tarefa separada da definição visual.
- O contorno do G deve ser fino e discreto, apenas suficiente para destacar a letra. Evitar borda branca espessa ou efeito de adesivo; preferir um tom claro quente próximo ao dourado, preservando a leitura da abertura e da barra interna.

## Manutenção dos padrões aprovados

Sempre que o proprietário solicitar uma mudança de padrão visual ou de interação, atualizar este documento na mesma tarefa e aplicar o padrão às próximas propostas. Essa solicitação autoriza a atualização deste roteiro; não autoriza automaticamente alterações no front-end, nos contratos de API ou commits.

## Identidade visual obrigatória

- Nas propostas do tema da noiva, usar `#FC3387` como destaque, sobre fundo escuro `#09090B`, com cards `#18181B` e superfícies secundárias `#27272A`. Para outros clientes, a cor de destaque deve ser personalizável, sem alterar o dourado da marca.
- Separar cores fixas da marca de tokens personalizáveis da interface. Não definir a paleta universal dos demais clientes sem uma decisão específica. Se os tokens do código divergirem, informar a diferença sem alterar o código automaticamente.
- Usar componentes mais arredondados: referência de 24 px para cards, 18 px para inputs e botões e formato de cápsula para chips e controles compactos. Manter consistência entre telas.
- Criar uma experiência mais dinâmica e visualmente atrativa com hierarquia clara, ícones consistentes, destaques rosa, indicadores de estado e feedback de interação. Evitar excesso de efeitos ou informações.
- Na implementação futura, usar transições discretas ao selecionar e concluir itens, respeitando a preferência por movimento reduzido.
- Preservar contraste acessível em cada tema, texto escuro sobre botões rosa quando necessário e alvos de toque de pelo menos 44 pontos. Não comunicar conclusão apenas pela cor.

## Leitura obrigatória antes de cada fluxo ou tela

Antes de propor uma tela nova ou revisar uma existente:

1. Liste e leia os schemas em `src/api/queries/**/schema.ts` relacionados à tela.
2. Leia as funções das queries correspondentes em `src/api/queries` para entender parâmetros e formato real do retorno.
3. Leia os dados de exemplo em `src/lib/mocks` e use-os nos exemplos, wireframes e estados preenchidos.
4. Consulte `docs/api/README.md` e `docs/types/implemented-types.md` para entender as convenções vigentes.
5. Consulte `docs/types/planned-contracts.md` apenas para antecipar funcionalidades futuras. Identifique claramente tudo que ainda está planejado.
6. Inspecione os componentes, tokens visuais e telas existentes antes de sugerir novos padrões.

Repita essa leitura sempre que começar outra tela ou quando os contratos mudarem. Não confie apenas no histórico da conversa.

## Prioridade das fontes

Quando houver divergência, use esta ordem:

1. schemas implementados em `src/api`;
2. funções implementadas das queries;
3. mocks em `src/lib/mocks`;
4. documentação de tipos implementados;
5. contratos planejados;
6. mensagens anteriores da conversa.

Informe qualquer divergência encontrada antes de continuar o design. Não invente campos, estados ou ações para preencher uma lacuna silenciosamente.

## Mapeamento obrigatório de cada tela

Antes do desenho visual, apresente uma tabela contendo:

| Elemento da tela | Query ou estado de origem | Campo utilizado | Situação atual |
| ---------------- | ------------------------- | --------------- | -------------- |
| Exemplo          | `GET /workouts`           | `name`          | Implementado   |

Classifique cada dado como:

- **implementado:** existe em schema e query;
- **mockado:** existe no contrato e atualmente vem de `src/lib/mocks`;
- **planejado:** documentado, mas ainda indisponível;
- **local:** controlado apenas pela interface ou pelo dispositivo;
- **ausente:** necessário para a proposta, mas sem contrato definido.

Se um elemento depender de dado ausente, apresente a necessidade ao proprietário antes de incorporá-lo ao fluxo principal.

## Entrega esperada para cada tela

Apresente, nesta ordem:

1. objetivo da tela e tarefa principal do usuário;
2. dados disponíveis e origem de cada um;
3. hierarquia das informações;
4. estados de carregamento, vazio, erro e sucesso;
5. ações e navegação;
6. comportamento de conteúdo longo, teclado e diferentes tamanhos de tela;
7. acessibilidade, incluindo contraste, tamanho de toque e textos para tecnologias assistivas;
8. dependências ainda não implementadas;
9. wireframe ou proposta visual;
10. pontos que precisam de aprovação antes da implementação manual.

## Regras do produto que devem permanecer visíveis no design

- A V1 é voltada ao uso pessoal.
- A funcionalidade de personal trainer e alunos pertence à V2 e tem alta prioridade.
- O descanso é definido no nível da ficha inteira.
- Aquecimento e exercícios principais são seções diferentes da mesma ficha.
- Cada série possui sua própria meta e carga.
- Metas podem ser repetições fixas, intervalo de repetições ou duração em segundos.
- Não existe registro de repetições realmente realizadas.
- A carga pode começar vazia e ser alterada durante a execução.
- Exercícios podem vir do catálogo compartilhado ou ser privados.
- Fotos, GIFs, progresso e personalização de tema pertencem à V2.

## Padrão aprovado para detalhes e acompanhamento do treino

A tela deve permitir acompanhar o treino, retomando a direção interativa da proposta anterior. Não reduzir o design a uma ficha somente de leitura por causa de funcionalidades ainda planejadas. Mostrar as interações aprovadas na proposta e explicitar seu status fora da interface do produto.

- Exibir um cronômetro de descanso utilizável, com iniciar, pausar, continuar, reiniciar e adicionar 30 segundos. A duração inicial vem de `restSeconds` da ficha inteira; não criar descanso por exercício. Adicionar tempo altera apenas a contagem atual.
- Permitir marcar e desmarcar cada série como concluída, com check, destaque e rótulo acessível. A conclusão não registra repetições realmente realizadas.
- Permitir concluir todas as séries pendentes de um exercício com uma única ação explícita, "Concluir exercício", sem exigir seleção individual. Derivar o estado de exercício concluído das suas séries e permitir desfazer a ação. Desfazer a ação em lote deve preservar as séries que já estavam concluídas antes dela.
- Manter a ação de concluir exercício separada do toque de editar carga, evitando conclusões acidentais.
- Permitir editar a carga de cada série durante o acompanhamento, com unidade kg, teclado decimal, confirmação e cancelamento. Aceitar zero, decimais não negativos e valor vazio; vazio continua `null`, sem ser convertido em zero.
- Editar a carga durante a execução altera a sessão em andamento; não sobrescrever silenciosamente a prescrição da ficha. Persistência depende dos contratos planejados de sessão.
- Manter Aquecimento e Exercícios como seções distintas com o mesmo componente de card. Cada série mostra sua própria meta (fixa, intervalo ou duração) e carga.
- Manter o cronômetro acessível durante a rolagem sem encobrir cards, teclado ou TabBar. Não reiniciar uma contagem ativa silenciosamente ao concluir séries.
- Nas imagens com valores editados, checks ou cronômetro ativo, identificar na explicação que são estados ilustrativos da interação, não valores presentes nos mocks.

### Origem e situação dessas interações

| Elemento | Origem | Situação |
| --- | --- | --- |
| Prescrição, seções, metas, cargas iniciais e descanso | `getWorkoutDetails`, `repetitionTarget`, `loadKg`, `restSeconds` | Mockado, com schema e query implementados |
| Cronômetro interativo | `RestTimerState` | Estado local planejado; não implementado |
| Conclusão por série | `WorkoutSessionSet.completedAt` | Planejado; não implementado |
| Conclusão do exercício inteiro | Ação em lote sobre as séries da sessão | Design aprovado; estado derivado, sem novo campo na API |
| Edição e persistência da carga durante execução | `WorkoutSessionSet.loadKg` | Planejado; não implementado |

## Limites de implementação

- Não tratar contratos planejados como dados disponíveis na V1.
- Não adicionar conteúdo técnico à interface sem benefício direto para o usuário.
- Não alterar contratos de API para acomodar uma decisão visual sem apresentar o impacto antes.
- Não implementar o front-end até receber um pedido explícito.
- Não criar commits sem aprovação específica.

## Primeira resposta do chat

Depois das leituras, a primeira resposta deve informar:

- quais contratos e mocks atendem à tela solicitada;
- quais dados estão disponíveis;
- quais lacunas existem;
- qual fluxo de design será explorado;
- uma pergunta por vez quando alguma decisão de produto for necessária.
