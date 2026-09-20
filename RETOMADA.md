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

## Revisão visual (20/09, sessão Claude Code)

Avaliação pedida pelo utilizador: a arte atual não é pixel art nem lembra um RPG 2D de mercado (tipo Stardew Valley). Confirmado no navegador (`tests/visual.html`), não só por teste automatizado — testes cobrem lógica/proporção, não estética.

- Antes: chão era um retângulo de cor sólida; móveis/objetos vetoriais lisos (gradientes, cantos arredondados) em `office-art.js`/`assets/office-props.png`; personagens em `assets/worker-*.png`, estilo "emoji" flat, sem relação com pixel art.
- Limitação importante: o Codex tinha uma ferramenta de geração de imagem integrada (ver `assets/SPRITES.md`/`OFFICE-ART.md`) que gerou os PNGs atuais. O Claude Code, nesta sessão, não tem essa ferramenta disponível — não dá para gerar novos PNGs a partir de prompt. A alternativa viável é pixel art procedural (desenhada em código, canvas, cores lisas e bordas duras, sem gradiente/blur), que também respeita a regra de "sem assets externos".
- Feito nesta sessão: chão reescrito em `scene.js` (`floor()`) como grelha de tiles 40×40 em xadrez com juntas e pontos de desgaste, mais rodapé na base da parede — primeira peça, maior alavanca visual por esforço. Sem mudança de jogabilidade (colisão/`blocked()` intocados). 50 testes continuam a passar.
- Por fazer, ainda no estilo "vetor liso": mobília (`office-art.js`, `furniture()` em `scene.js`) e personagens (`spritesheet.js`, `assets/worker-*.png`, retratos em `portrait()`). É o maior esforço — 70 NPCs, sistema de troca de paleta por pessoa já existente, mas desenho-base precisa de refazer em pixel art. Convém tratar em iteração própria, com revisão visual intermédia (screenshots) antes de aplicar a todos os NPCs.

## Próximas melhorias (prioridade do Codex, ainda abertas)

- Observar no navegador: NPC com `!` a aproximar-se, dois NPCs no café, grupo grande no andar executivo.
- Melhorar o feedback visual de colisão e conversa sem ícones piscantes.
- Expandir histórias autorais para mais NPCs (hoje só 14 de 70), com estados e consequências, sem diálogos repetitivos.
- Camada visual mais rica em objetos e retratos; mais folhas de sprite (penteados/corpos distintos).
- Atualizar `LEIA-ME.md` (ainda na revisão 0.3/0.4) com as revisões 0.5 em diante e recriar o ZIP.
