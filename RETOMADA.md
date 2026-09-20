# Memória de retomada — Próximo Andar

Última atualização: 20/09/2026, na migração do Codex para o Claude. Instruções permanentes estão em `CLAUDE.md`. A versão anterior deste ficheiro (escrita pelo Codex) foi guardada em `RETOMADA.codex-original.md`.

## Estado verificado em 20/09/2026

- `node --test tests/*.cjs`: 50 testes aprovados, 0 falhas. (Os documentos antigos falavam em 38.)
- `outputs/Proximo-Andar.zip` (13/09) contém `careers.js`, `career-ui.js`, `living.js` e `living-ui.js`. Não foi comparado ficheiro a ficheiro com a pasta atual; recriar o ZIP depois da próxima alteração.
- Não verificado nesta sessão: jogo no navegador, servidor local, FPS, partida humana completa.
- Estrutura achatada: o jogo estava em `outputs/proximo-andar/` (convenção do Codex); agora vive na raiz do repositório (`git mv`, histórico preservado). `outputs/` só guarda o `.zip` da entrega.
- **Pasta mudou (20/09/2026):** de `~/Documents/Codex/2026-09-11/proximo-andar` para **`~/workspace/the-office-game`** (`mv` da pasta inteira, `.git` incluído — histórico intacto). Nenhum ficheiro tinha caminhos absolutos: `launcher.py`, `Abrir.command` e `jogo.sh` resolvem tudo a partir da localização do próprio ficheiro. **A chave do save continua `localStorage['proximo-andar-v1']` e o endereço continua `127.0.0.1:8765` — não mexer em nenhum dos dois, ou a carreira guardada perde-se.** O título do jogo continua "Próximo Andar"; só o nome da pasta mudou. `RETOMADA.codex-original.md` guarda caminhos antigos de propósito: é arquivo histórico, não se reescreve.

## O que o jogo tem hoje

- Sete plantas, 70 NPCs (14/16/12/10/8/6/4 por andar), 17 personagens centrais com histórias e falas próprias (piso 1 tem 5; os outros seis pisos têm 2 cada).
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
- Cache do navegador: `index.html`/`tests/visual.html` carregam os `.js` com `?v=<versão fixa>`. Depois de qualquer alteração a um `.js`, subir essa versão nos dois ficheiros (feito agora: `v=20260920`), senão o navegador serve a cópia antiga em cache mesmo com ficheiros novos no disco.

## Tema e elenco (20/09, sessão Claude Code)

Pedido do utilizador: piso 1 (receção) como zona administrativa de baixo escalão — inspirado em séries como The Office (o jogo é uma espécie de "o emprego que o protagonista do Stardew Valley deixou para trás") — com um elenco pequeno mas com vida própria, em vez de gente sem nome. Mobília deixa de mostrar o nome da pessoa (só a função).

- **Regra crítica encontrada:** há um aviso no código (`data.js`, antes da criação dos NPCs) — "Identidades estáveis: nunca renumerar os IDs usados pelos saves." O `id` de cada NPC é a posição no array e é usado como índice no array `relations` do save; mudar quantos NPCs um andar tem desloca o `id` de toda a gente a seguir e corrompe saves existentes (incluindo o que o utilizador estava a jogar nesta sessão, na porta 8765). **Não renumerar em iterações futuras** sem escrever uma migração (`Game` já tem `version` no estado; seguir o padrão de `navigation: 3` do `World`).
- Solução usada, sem tocar em nenhum ID: `data.js` ganhou `centralCounts=[5,2,2,2,2,2,2]` (antes, fixo em 2 por andar) — o piso 1 continua com 14 NPCs no array (`counts` intocado), mas agora os primeiros 5 (ids 0–4) são "centrais" com história, não só os primeiros 2. `living.js` (`receptionRoster`) passou a escolher a vaga rotativa de apoio/visitante só entre NPCs centrais do piso — os outros 9 continuam a existir nos dados (não quebra saves nem os testes de "70 NPCs"), mas nunca aparecem.
- Elenco novo do piso 1: Lia Costa (receção, já tinha história), Rui Melo (operações, já central), **Marta Ribeiro** (Compras — negocia papel e material de escritório), **Renato Cardoso** (Financeiro — concilia notas fiscais) e **Wagner Souza** (Segurança predial — ronda o prédio). Os três novos têm falas de aproximação (`centralStories`) e biografia + 3 falas pessoais (`personal` em `careers.js`), no mesmo padrão dos outros 14 personagens centrais.
- Cuidado ao escolher nomes: o gerador de figurantes usa fórmulas (`names`/`surnames` por índice) — dois nomes candidatos ("Tiago Pires", "Joana Azevedo") colidiam com figurantes que continuam a ser gerados nos slots seguintes do piso 1; por isso os novos personagens usam nomes fora dessas listas (Renato Cardoso, Wagner Souza), para não haver duplicados. O teste de nomes duplicados (`npc-integrity.cjs`) cobre isto.
- Ainda por fazer, alinhado com "repensar a empresa toda" (pedido do utilizador, mas fora do alcance desta iteração): o resto da Nimbus continua com cargos e minijogos 100% de tecnologia (`roles` em `data.js`: Pleno→Sénior→Tech Lead→...→CEO; minijogos: bug/revisão/funcionalidade/incidente/mentoria/estratégia). Reescrever isso para refletir uma empresa administrativa/de papel é um trabalho maior, andar a andar, com o mesmo cuidado de não mexer em `id`.
- Testes atualizados: `npc-integrity.cjs` e `campaign.cjs` esperavam 14 centrais, agora 17. 50 testes continuam a passar.

## Polimento do andar 1 (20/09, sessão Claude Code)

Pedido do utilizador: os bonecos ficavam de pé encostados às secretárias em vez de parecer sentados a trabalhar, a mesa da receção não convencia, a sala de espera era "um quadrado sem significado" e a planta da receção disparava uma ação sem sentido.

- **Balcão de receção redesenhado:** `furniture()` deixou de tratar `reception` como uma secretária normal com autocolante — agora tem fachada alta virada para quem chega, letreiro "NIMBUS · RECEPÇÃO", cadeira e tampo mais baixo do lado da Lia, e uma planta ao lado.
- **Sala de espera com divisória:** `background()` desenha agora duas paredes baixas (estilo divisória de escritório, cor diferente da parede principal) a fechar o sofá "Espera de visitantes" num recanto, com uma planta no canto interior — deixa de ser um retângulo solto no meio do chão.
- **Planta da receção corrigida:** `furniture()` não tinha um caso para `type==='plant'` — caía no desenho genérico de "mesa redonda". Agora usa o helper `plant()` (já existia, nunca tinha sido ligado a este tipo). Além disso, `near()` em `app.js` deixou de contar objetos `plant`/`garden` como interativos — deixaram de abrir a tarefa genérica "Organizar a recepção" (essa ação ficou só no quadro/mural, que faz mais sentido).
- **Pose sentada — primeira versão tinha um erro de lógica que o utilizador apanhou:** eu desenhava uma cadeira própria por baixo do boneco sentado, sem saber que `type==='desk'` usa a imagem `office-props.png` (via `OFFICE_ART.draw`, primeira verificação em `furniture()`) que **já tem uma cadeira desenhada nela**. Resultado: cadeiras a duplicar/desalinhar. Também marcava `seated` para qualquer pessoa parada, mesmo sem secretária por perto (fazia cadeiras aparecerem do nada na sala de espera, por exemplo). Corrigido:
  - `spriteSeated()` já não desenha cadeira nenhuma — só o corpo (pernas curtas, tronco mais baixo). A cadeira é sempre responsabilidade da mobília (imagem ou `furniture()`), nunca do boneco.
  - `seated` em `app.js` (`draw()`) só é verdadeiro quando a pessoa está parada, chegou, não está em pausa/conversa **e** as coordenadas caem dentro da área de um objeto `desk`/`executive`/`console`/`reception` (`deskFurniture.some(...)`). Sem secretária por perto, fica de pé, como antes.
  - Quando sentado, a posição de desenho sobe ~16px (`drawY=p.y-16`) para aproximar do banco/cadeira já desenhados na mobília, já que a coordenada de `seats[]` foi pensada para alguém de pé à frente da secretária, não sentado dentro da cadeira.
  - Efeito ainda é global (todos os 7 andares), não só o andar 1 — por conferir com mais calma nas mesas em fila do andar 2 e nas mesas executivas dos andares 4-5.
- Lembrete: subir a versão do `?v=` em `index.html`/`tests/visual.html` sempre que se altera `.js` (feito: `v=20260920d`), senão o navegador mostra a versão em cache.

## Animação de ambiente (20/09, sessão Claude Code)

Pedido do utilizador: o jogo parecia "completamente estático" — pediu para reformular sprites da mobília e trazer referências reais de jogos do género (pesquisei via WebSearch: marketplaces itch.io/Etsy de pixel art de escritório e tutoriais de animação idle estilo Stardew Valley — sem tutorial com specs exatas, mas confirmou convenções já conhecidas: balcão elevado, sineta/nameplate no tampo, atendente atrás).

**Descoberta importante, antes de animar mais nada:** `furniture()` verifica logo à cabeça `root.OFFICE_ART?.draw(c,type,x,y,w,h)` — se a imagem `assets/office-props.png` carregou (sempre, num navegador a sério), esse tipo usa a imagem e o resto da função nem corre. Isto cobre `desk`, `coffee`, `board` e `plant`. Ou seja: a maioria das secretárias do jogo (todas as `Estação de desenvolvimento` do andar 2, por exemplo) é uma imagem estática — animar código meu aí seria código morto, invisível no navegador. Só `reception`, `sofa`, `rack`, `garden`, `executive`, `console` e a mesa redonda genérica usam o meu desenho e podem ser animadas.

- **Pose sentada com movimento:** `spriteSeated()` já não é uma pose congelada — respiração lenta (`bob`) e um pequeno gesto de digitação nos braços (`armL`/`armR`, fases opostas), com semente de fase por posição (`seed=(x*7+y*3)%10`) para pessoas diferentes não animarem em sincronia. Usa `now()` (novo helper, `performance.now()`, não o relógio do jogo) para ser suave a qualquer velocidade de jogo.
- **Relógio de parede funcional:** `background()` desenha um relógio (ponteiros de hora/minuto) na parede de todos os andares, movido pela hora real do jogo (`time`) — não decorativo, mostra a hora a sério.
- **Luzes dos servidores (andar 3):** cada unidade do `rack` pisca com fase própria (`Math.sin(now()*2.4+i*1.9+x*.02)`), em vez de pontos verdes estáticos.
- **Balcão de receção:** ganhou uma sineta de atendimento com um brilho lento, e o monitor da Lia tem um leve pulsar de cor (sugere ecrã ligado, não uma imagem morta).
- **Por fazer, se quiseres ir mais longe:** a única forma de animar as secretárias/café/quadro/plantas "a sério" é ou (a) parar de usar `office-props.png` para esses tipos e redesenhar tudo em procedural (como fiz para a receção — mais trabalho, mas dá controlo total), ou (b) aceitar que esses ficam estáticos e só o boneco + ambiente à volta se mexem. Vale a pena perguntares ao utilizador qual prefere antes de avançar mais nesta frente.

## Secretárias deixam de ser imagem estática (20/09, sessão Claude Code)

Pedido do utilizador, direto: "preciso de um boneco sentado na cadeira caso esteja a performar a ação de trabalhar, uma estação estática não serve de nada." Ou seja: preferem alinhamento correto e funcional a manter a imagem bonita mas fixa do `office-props.png`.

- `furniture()`: `type==='desk'` deixou de usar `OFFICE_ART.draw` — passou a ser sempre desenhado por mim (mesma família visual que `executive`/`console`: tampo, monitor, teclado, porta-retrato). `coffee`/`board`/`plant` continuam na imagem (não têm o problema de "alguém sentado").
- Nova função `chairSpot(o)` (em `scene.js`, exportada em `SCENE`): dado um objeto de mobília (`desk`/`executive`/`console`/`reception`), devolve o ponto exato onde a cadeira fica. **A mesma função é usada para desenhar a cadeira em `furniture()` e para posicionar o boneco sentado em `app.js`** — os dois nunca podem voltar a desalinhar, porque vêm da mesma fonte de verdade, em vez de a posição do boneco depender da coordenada solta em `seats[]`.
- `app.js` (`draw()`): quando alguém está a trabalhar numa secretária, a posição de desenho passa a ser `SCENE.chairSpot(objeto)`, não a coordenada de `seats[]` (que era só uma aproximação, nunca pensada para bater certo com a cadeira desenhada).
- 50 testes continuam a passar; confirmado no navegador que o boneco fica mesmo dentro da cadeira, não a pairar ao lado.

## Andar 1 reconstruído: mobília, zonas e computadores (20/09, sessão Claude Code)

Pedido do utilizador: a arte e a interação pareciam "um RPG dos anos 90"; queria o andar 1 com estrutura mais robusta — área de café com mesinhas onde os funcionários se sentam a conversar, sala de espera desenhada em vez de um quadrado, e computadores nas escrivaninhas mais detalhados.

### Planta nova (`data.js`, andar 1)

De 7 para 16 objetos, em quatro zonas legíveis: recepção (balcão + mural), sala de espera (sofá, poltrona, mesa de revistas, planta, duas divisórias), copa/café (bancada, máquina, duas mesinhas) e zona de trabalho (duas escrivaninhas, impressora, arquivo). `seats` do andar 1 reescrito para os novos postos. Os 14 slots continuam lá — **nenhum `id` de NPC foi tocado** (regra do `data.js`), por isso os saves antigos continuam válidos.

Tipos novos: `partition`, `armchair`, `lowtable`, `counter`, `cafetable`, `printer`, `cabinet`. Nenhum entra em `propSizes`, por isso `prop-scale.cjs` continua a cobrir só `desk`/`board`/`coffee`/`plant`.

### Armadilha encontrada: arestas em cima da grelha de navegação

`blocked()` usa margens de ±12 em x e ±10 em y, e a rota anda numa grelha de 20px (x a partir de 40, y a partir de 120). Quando `o.y-10` (ou `o.x-12`, ou as bordas opostas) cai exatamente num múltiplo de 20, o pathfinding considera esse ponto livre (a comparação é `>`, estrita) mas `move()` trava lá por arredondamento de vírgula flutuante — a Lia ficou presa a meio do átrio com 30 pontos de rota por andar. A impressora, as duas mesinhas e as duas escrivaninhas foram deslocadas 2–3px para que nenhuma aresta caia na grelha.

**Os outros andares têm o mesmo problema latente** (racks do 3, sofás do 4 e 6, mesa do conselho do 7, `meeting` do 5, `garden` do 7). Não estoura hoje porque nenhuma rota precisa de passar exatamente ali. Verificação rápida:

```sh
node -e "const D=require('./data.js');D.layouts.forEach((l,f)=>l.objects.forEach(o=>{const b=[];if((o.x-12)%20===0)b.push('x-');if((o.x+o.w+12)%20===0)b.push('x+');if((o.y-10)%20===0)b.push('y-');if((o.y+o.h+10)%20===0)b.push('y+');if(b.length)console.log(f+1,o.type,o.label,b.join(','))}))"
```

Vale a pena correr também a verificação de ilhas (grelha livre toda alcançável a partir de um ponto) depois de mexer em qualquer planta.

### Desenho (`scene.js`)

- `furniture()` reescrito à volta de peças partilhadas: `slab()` (tampo com espessura e veio), `monitor()` (base, haste, moldura, ecrã com linhas de "código" e cursor a piscar), `keyboard()` (teclas a sério), `mouse()` com fio, `mug()` com vapor, `papers()`, `officeChair()` (base de cinco raios com rodízios), `upholstery()` (sofá/poltrona com braços e almofadas separadas), `cafeChair()`, `partition()` (vidro fosco entre montantes), `counterUnit()`, `cabinetUnit()`, `printerUnit()`.
- `receptionZones()`: tapete da espera, passadeira da entrada, piso próprio da copa e carpete da zona de trabalho. Antes o chão era xadrez uniforme e cada móvel parecia largado.
- Parede: janelas com caixilho, peitoril e vista (céu de dia, cidade acesa à noite, reflexo); no andar 1, placa da marca e um quadro. **A placa estava a tapar o relógio de parede (x 340–374) — foi por isso que mudou para o vão entre o elevador e a janela.**
- Legendas: chapa translúcida por trás (lêem-se por cima da mobília), sobem quando cairiam noutro móvel, e descem para baixo da cadeira nas secretárias (caíam em cima da cabeça de quem está sentado). Tipos só de cenário (`SCENE.QUIET`) não têm legenda nem interação.

### Pessoas sentadas

- `chairSpot(o, from)` passou a aceitar quem se vai sentar: mesinhas de café e sofás têm vários lugares e escolhe-se o mais perto. `chairSeats(o)` dá os três lugares de uma mesinha e é a mesma fonte usada para desenhar as cadeiras — não podem desalinhar.
- `app.js` separa `workSeats` (secretária/balcão) de `restSeats` (mesinha/sofá/poltrona): em pausa ou a conversar senta-se no café, a trabalhar senta-se à secretária. `spriteSeated()` ganhou dois modos — a trabalhar digita, em pausa pousa as mãos e segura uma caneca — mais gola e crachá.
- `destination()`: havendo mesinha a menos de 90px da máquina, a pausa é feita sentado à mesa. O limite de 90px é deliberado — `story-routines.cjs` exige que quem tem compromisso marcado fique a menos de 100px de `coffeePoint()`.

### Bug corrigido de caminho (não era só arte)

`career-ui.js` (`interact`) refazia a procura do objeto com `find()` e um raio de ±65, ficando com o **primeiro da lista** em vez do mais próximo. Com mais mobília no andar 1 isso divergia do aviso no ecrã: dizia "E · Suporte de plantão" e abria "Mesa do café" com a tarefa genérica "Organizar a recepção". Passou a usar o objeto que `near()` já resolveu. `near()` também passou a ordenar por distância ao retângulo, em vez de aceitar o primeiro que apanha.

### Verificado

- `node --test tests/*.cjs`: 50 aprovados, 0 falhas.
- No navegador (`tests/visual.html`, porta 8799, sem tocar no save da 8765): andar 1 de manhã, colegas sentados às secretárias, dois colegas sentados a conversar numa mesinha do café, e os andares 2, 4 e 7 sem regressões (usam `desk`/`sofa`/`executive`, que são partilhados).
- Avisos vs. ação conferidos ponto a ponto: secretárias abrem a estação, sofá/poltrona/mesinha abrem a pausa, balcão abre o menu próprio, mural abre a tarefa local.
- **Não verificado:** partida humana completa, FPS, e o efeito das peças partilhadas nos andares 3, 5 e 6.

### Por fazer nesta frente

- `meeting` e `boardtable` (andares 4, 5, 6, 7) continuam elipses lisas do desenho antigo — destoam da mobília nova.
- O andar 2 é uma grelha de oito secretárias iguais; ganha em variedade o mesmo tratamento de zonas do andar 1.
- Sprites de caminhada continuam as três folhas PNG (`worker-*.png`). Sem ferramenta de geração de imagem nesta sessão, só a pose sentada e os acessórios são desenháveis em código.

## `jogo.sh` (20/09, sessão Claude Code)

Pedido do utilizador: um start/stop mais fácil de executar a partir daqui. `launcher.py` prende a janela do Terminal (`serve_forever`) e abre o navegador — bom para jogar, mau para uma sessão de trabalho.

`jogo.sh` sobe os servidores em segundo plano (`python3 -m http.server`, só `127.0.0.1`), guarda PID e log em `.run/` (no `.gitignore`), e espera que a porta responda mesmo antes de dizer que arrancou.

- `start`/`qa` são idempotentes e **nunca** mexem numa porta que não tenham sido eles a abrir: se a 8765 já estiver ocupada (o `launcher.py` do utilizador, por exemplo), avisa e mostra o `lsof`, em vez de matar a sessão dele. `stop` só encerra PIDs do próprio ficheiro.
- Duas portas de propósito: 8765 é a carreira a sério, 8799 é QA (`tests/visual.html`, armazenamento em memória). Os saves são por endereço.
- `./jogo.sh cache` automatiza o passo que a `RETOMADA` repete há várias sessões: subir o `?v=` nos dois HTML depois de mexer em qualquer `.js`. Usa um carimbo `v=AAAAMMDDHHMM` (único), em vez da letra incremental à mão.
- `jogo.sh` foi acrescentado à lista do ZIP em `CLAUDE.md`.

Testado: start/stop/restart/status, idempotência, `qa`, guarda de porta ocupada (com um `http.server` externo na 8765), `cache`, `test` (50 aprovados) e `zip` (46 ficheiros).

## Próximas melhorias (prioridade do Codex, ainda abertas)

- Observar no navegador: NPC com `!` a aproximar-se, dois NPCs no café, grupo grande no andar executivo.
- Melhorar o feedback visual de colisão e conversa sem ícones piscantes.
- Expandir histórias autorais para mais NPCs (hoje só 14 de 70), com estados e consequências, sem diálogos repetitivos.
- Camada visual mais rica em objetos e retratos; mais folhas de sprite (penteados/corpos distintos).
- Atualizar `LEIA-ME.md` (ainda na revisão 0.3/0.4) com as revisões 0.5 em diante e recriar o ZIP.
