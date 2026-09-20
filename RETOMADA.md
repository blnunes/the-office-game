# Memória de retomada — Próximo Andar

Última atualização: 20/09/2026, na migração do Codex para o Claude. Instruções permanentes estão em `CLAUDE.md`. A versão anterior deste ficheiro (escrita pelo Codex) foi guardada em `RETOMADA.codex-original.md`.

## Estado verificado em 20/09/2026

- `node --test tests/*.cjs`: 50 testes aprovados, 0 falhas. (Os documentos antigos falavam em 38.)
- `outputs/Proximo-Andar.zip` (13/09) contém `careers.js`, `career-ui.js`, `living.js` e `living-ui.js`. Não foi comparado ficheiro a ficheiro com a pasta atual; recriar o ZIP depois da próxima alteração.
- Não verificado nesta sessão: jogo no navegador, servidor local, FPS, partida humana completa.
- Estrutura achatada: o jogo estava em `outputs/proximo-andar/` (convenção do Codex); agora vive na raiz do repositório (`git mv`, histórico preservado). `outputs/` só guarda o `.zip` da entrega.

## O que o jogo tem hoje

- Sete plantas, 70 NPCs (14/16/12/10/8/6/4 por andar), 14 personagens centrais com histórias e falas próprias.
- 8 cargos x 4 atividades, esforço rápida/segura/colaborativa (dificuldade 1/2/3), reuniões que exigem convites e chegada física dos participantes.
- Rotinas por horário, pausas escalonadas, marcador `!` para conversa pendente, colisão entre NPCs e jogador, navegação versionada (`navigation: 3`).
- Sprites e objetos gerados por imagem (3 modelos de sprite, 4 objetos de escritório), retratos procedurais.

## Pontos para conferir primeiro

1. Colisão por distância entre NPCs pode gerar gargalos com muitos executivos no mesmo andar. Verificar em `tests/visual.html`.
2. Saves antigos sem `navigation: 3` devem migrar sem duplicar NPCs. Há testes de integridade, mas conferir com um save real.
3. Confirmar que o jogador não fica preso perto de um NPC parado com história.
4. A arte continua simples. Não declarar a revisão visual concluída.
5. O servidor original na porta 8765 (Python) respondia vazio e não pôde ser encerrado pelo Codex. Reabrir com `Abrir.command` se necessário; outra porta usa outro save.

## Próximas melhorias (prioridade do Codex, ainda abertas)

- Observar no navegador: NPC com `!` a aproximar-se, dois NPCs no café, grupo grande no andar executivo.
- Melhorar o feedback visual de colisão e conversa sem ícones piscantes.
- Expandir histórias autorais para mais NPCs (hoje só 14 de 70), com estados e consequências, sem diálogos repetitivos.
- Camada visual mais rica em objetos e retratos; mais folhas de sprite (penteados/corpos distintos).
- Atualizar `LEIA-ME.md` (ainda na revisão 0.3/0.4) com as revisões 0.5 em diante e recriar o ZIP.
