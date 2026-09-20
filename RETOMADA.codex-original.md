# Memória de retomada — Próximo Andar

## Atualização mais recente: carreiras e personalidades

Leia primeiro `outputs/proximo-andar/REVISAO-CARREIRAS.md`.

- Novos `careers.js` e `career-ui.js`, carregados no HTML e na fixture isolada.
- Oito ciclos de quatro atividades. CEO não executa bug. Atividades exigem andar/objeto; reuniões exigem convites e chegada física dos participantes.
- Recomendações filtradas pelos andares 2/3/4/5/6/7/7 conforme promoção.
- Esforço rápida/segura/colaborativa corresponde a dificuldade 1/2/3, tempo, energia e recompensa proporcionais.
- 14 centrais com passados e falas autorais; demais perfis gerados por templates.
- Suite completa `node --test outputs/proximo-andar/tests/*.cjs`: 38 resultados aprovados. Campanha normal dia 15; demo dia 5. Movimentação do jogador usa fixtures nos testes, não uma sessão manual integral.
- Browser QA: abriu carreira e painel de destinos na fixture `http://127.0.0.1:8766/tests/visual.html` com sucesso.
- Servidor original 8765: Python PID 20691, responde vazio. Tentativa de encerrá-lo foi bloqueada pelo ambiente (`operation not permitted`). Não afirmar que foi reiniciado.
- Servidor alternativo 8766: exec session 76032, serve `outputs/proximo-andar`. Atenção: outra porta possui armazenamento separado; o save original continua no 8765.
- Verificar que `outputs/Proximo-Andar.zip` inclui os dois scripts novos.

## Estado atual

Projeto em `/Users/brunonunes/Documents/Codex/2026-09-11/proximo-andar/`.
Servidor local usado no navegador: `http://127.0.0.1:8765/`.
Entrega compactada: `outputs/Proximo-Andar.zip`.

O jogo é um RPG de escritório em Canvas, com scripts clássicos em `outputs/proximo-andar/`.

## Última solicitação do usuário

O usuário reportou que NPCs com exclamação oscilavam andando para a esquerda e direita e que personagens atravessavam uns aos outros. A correção foi iniciada e os testes específicos de histórias, café e rotas passaram.

## Correções já feitas nesta retomada

- Aproximação de NPC com história agora usa um ponto estável a cerca de 48 px do jogador.
- Ao chegar perto do jogador, o NPC fica parado, vira-se para ele e não recalcula a rota continuamente.
- Rotas de NPCs usam reservas e uma folga maior para evitar que todos escolham o mesmo ponto.
- `move()` passou a considerar outros personagens como obstáculos temporários.
- O jogador também não atravessa NPCs.
- Quando uma rota fica bloqueada, ela é recalculada depois de uma pequena espera.
- NPCs restaurados de save são reposicionados se estiverem sobrepostos ou em local inválido.
- A navegação do snapshot foi versionada para `navigation: 3`.

## Testes executados

Passaram:

- `node --test outputs/proximo-andar/tests/story-routines.cjs`
- Esse arquivo cobre histórias persistentes, adiamento/recusa, rotas, chegada à máquina de café, conversa entre parceiros próximos e compromissos em outro andar.

Ainda é necessário executar a bateria completa depois da última alteração:

```sh
node --test outputs/proximo-andar/tests/npc-integrity.cjs outputs/proximo-andar/tests/movement-rest.cjs outputs/proximo-andar/tests/workflow-social.cjs
node outputs/proximo-andar/tests/interface.cjs
node outputs/proximo-andar/tests/campaign.cjs
```

Depois, atualizar o ZIP:

```sh
cd /Users/brunonunes/Documents/Codex/2026-09-11/proximo-andar/outputs
zip -qr Proximo-Andar.zip proximo-andar
```

## Pontos para conferir primeiro

1. A alteração de colisão usa distância entre NPCs, mas pode deixar gargalos com muitos executivos no mesmo andar. Verificar visualmente no navegador isolado e ajustar o raio se necessário.
2. O `World` chama `gridPoint()` com pessoas ocupando posições; conferir se saves antigos sem `navigation: 3` continuam migrando sem duplicação.
3. Confirmar que o jogador não fica preso perto de um NPC parado com história.
4. Fazer QA em `tests/visual.html`, que usa armazenamento isolado e não altera o save do usuário na aba principal.
5. A arte ainda é procedural e simples; não declarar que a revisão visual está concluída.

## Próximas melhorias prioritárias

- Confirmar a bateria completa de testes e corrigir qualquer regressão.
- Observar no navegador os casos: NPC com `!` aproximando-se, dois NPCs em café e grupo grande no andar executivo.
- Melhorar o feedback visual de colisão e conversa sem adicionar ícones piscantes.
- Expandir histórias autorais para mais NPCs, com estados e consequências, sem tornar diálogos repetitivos.
- Depois disso, revisar objetos e retratos com uma camada visual mais rica.
- Atualizar `LEIA-ME.md` com a revisão 0.5 e recriar `outputs/Proximo-Andar.zip`.

## Regras para continuar

- Não recarregar nem alterar a aba principal do usuário sem necessidade; usar a fixture isolada.
- Manter testes de quantidade/identidade de NPCs e ausência de duplicação.
- Não usar APIs remotas ou assets externos em runtime.
- Responder em português, com diagnóstico honesto sobre o que foi realmente verificado.
