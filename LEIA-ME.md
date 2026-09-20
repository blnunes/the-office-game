# Próximo Andar — revisão 0.3

RPG corporativo 2D local, em português. HTML, CSS, JavaScript e Canvas; sem bibliotecas externas, fontes remotas, APIs ou serviços pagos. A arte é original e desenhada por código. Nada foi publicado.

## Abrir

- Enquanto o servidor desta sessão estiver ativo: http://127.0.0.1:8765/
- Para reabrir no Mac: duplo clique em `Abrir.command`. Usa o Python 3 presente neste Mac e serve apenas esta pasta em 127.0.0.1. Mantenha a janela do Terminal aberta; Ctrl+C encerra.
- Alternativa sem servidor: abra `index.html` no navegador habitual, mantendo os demais arquivos juntos.
- Saves são locais ao navegador e ao endereço. Reabra sempre pelo mesmo método. O navegador interno, Safari e abertura por arquivo possuem saves separados. Não use janela privada se quiser conservar a carreira.

## Controles

WASD/setas ou clique no chão: caminhar. E: interagir. Esc: fechar/pausar. T: sprint. V: vagas. G: agenda. R ou indicador ◎: rede. Nos diálogos, 1–4 escolhem respostas. Os minigames usam botões visuais.

Fechar um minigame abandona a tentativa: a energia e o tempo reservados não são devolvidos. Não há punição adicional nem bloqueio permanente.

## O que mudou

- Sete plantas próprias: balcão de recepção, estúdio de desenvolvimento, central de servidores/incidentes, liderança e mentoria, gabinetes de diretoria, negociação executiva e conselho com jardim de inverno.
- Lia trabalha atrás do balcão de recepção. Objetos têm nomes e interações: mesas de trabalho abrem a sprint; café e sofás oferecem pausa; murais, consoles, salas e jardim oferecem desafios locais.
- Sprites suaves com frente, costas, perfis e passos ligados à distância percorrida. Retratos compartilham pele, cabelo, roupa e acessórios com os personagens. Animação para contra obstáculos; NPCs percorrem rotas que contornam os móveis.
- Rede com retratos, indicadores e chaves de acesso. Influência pode abrir andares sem promoção: 12/24/40/60/85 para os andares 3/4/5/6/7. Cargo e convite continuam válidos. Influência não concede cargo nem dispensa requisitos da candidatura.
- HUD com símbolos e barras. A indicação de interação fica fora do mapa e não cobre a saída.
- Conversas na base da tela, com retratos e escolhas curtas; 14 centrais têm falas próprias em três estágios de confiança.
- Correções de identidade: Beatriz Freitas do ID 29 agora é Beatriz Falcão; IDs e relações foram mantidos. Otávio referencia o ID 53, inclusive ao carregar saves antigos.

## Trabalho e esforço

O fluxo diário é **diagnosticar bug → revisar → implementar**. Nos cargos maiores, a estratégia exige a implementação do dia. Incidentes e mentoria são alternativas conforme o cargo. Cada tarefa permite até duas tentativas por dia; apenas concluir avança o fluxo e dá recompensa.

Os seis minigames são:

| Atividade | Mecânica |
| --- | --- |
| Bug | Localizar falhas em rodadas de diagnóstico |
| Revisão | Encontrar pares, memorizando cartas reveladas |
| Funcionalidade | Memorizar e reconstruir um fluxo |
| Incidente | Tratar alertas por gravidade |
| Mentoria | Conduzir ouvir, perguntar, demonstrar e praticar |
| Estratégia | Escolher investimentos que equilibrem tecnologia, pessoas e sustentabilidade dentro do orçamento |

Rodadas, memória e tamanho de alguns desafios aumentam com o cargo. Não há cronômetro de reflexo. A abordagem, preparo, fadiga e erros afetam a qualidade. Tempo, energia e esforço são reservados uma vez ao começar; resolver o minigame não cobra tempo em duplicidade. Falhar/abandonar dá zero recompensa e não avança a sprint. Atividade parcialmente jogada é salva e pode continuar após recarregar.

Fadiga-base por tarefa: bug 12, revisão 5, funcionalidade 20, incidente 24, mentoria 7, estratégia 18. Extras acrescentam 8. Há desgaste leve pelo tempo acordado, muito menor que o esforço de trabalho. Uma pausa de 20 minutos recupera 16 de energia e reduz aproximadamente 12 de fadiga, até três vezes por dia.

Dormir oito horas reduz 64 de fadiga e recupera até 96 de energia. Sono curto acumula fadiga. Quando o descanso termina antes da abertura, o tempo pessoal avança até 8h; essa espera não concede sono adicional. Exaustão provoca descanso protegido. Novas entregas são bloqueadas antes de 8h e a partir de 20h, com motivo explícito. O jogo oferece descanso ou salto até a abertura quando o escritório está fechado.

## Circulação e conflitos

Há 70 NPCs: 14/16/12/10/8/6/4 por andar. Só o andar ativo é desenhado. Horários determinam presença e visitas; posições, direção, passos e rotas do andar ativo são salvos.

Exemplos de agendas cruzadas: operações leva demandas à plataforma das 10h às 11h; Helena visita a liderança das 14h às 15h; executivos passam na recepção entre 12h e 13h30. Caio e Breno se encontram na plataforma entre 15h e 15h45; Otávio visita executivos às 15h. Alguns personagens conversam entre si e mostram pequenas falas no cenário.

A articulação contra seu crédito tem regras limitadas: em dias múltiplos de três, após existir histórico de entregas, pode custar dois pontos de prestígio às 16h. Um apoio com confiança suficiente pode defender você. Ouvir a conversa de Caio e Breno na plataforma permite guardar evidência e responder. São eventos e agendas escritos, não IA social autônoma.

## Demonstração

Escolha Demonstração no menu: recompensas de entrega/prestígio ×3, relação ×2, sem espera mínima de dois dias por cargo. O relógio mantém um segundo real ativo por minuto de jogo. A meta de 10–15 minutos ainda não foi cronometrada com jogador humano, especialmente após a inclusão dos minigames.

1. Conheça Lia e outros colegas; ouça, ajude e peça orientação.
2. No caderno, resolva bug, revisão e funcionalidade. Observe o avanço visual da sprint.
3. Peça apoio quando a relação e as entregas forem suficientes. A rede mostra confiança e acesso aos andares.
4. Candidate-se e use as tarefas dos novos cargos, alternando esforço pesado, mentoria/revisão e pausas.
5. Explore móveis interativos dos andares: os desafios locais dão preparo, prestígio e proximidade com a liderança local, uma vez por andar/dia.
6. Para CEO, conclua estratégia com qualidade e obtenha apoio do conselho, além dos demais requisitos visíveis em Vagas.

## Testes executados

Node só é necessário para executar os testes, não para jogar:

```
node --test tests/npc-integrity.cjs tests/movement-rest.cjs tests/workflow-social.cjs
node tests/interface.cjs
node tests/campaign.cjs
```

- 22 verificações passaram: nomes/IDs/população, 30 dias de persistência, agendas, direções e passos, velocidade diagonal, colisões e trajetos, sete plantas e posições utilizáveis, sono, restauração de cenário, seis minigames, fracasso, abandono, sequência da sprint, pausa, influência e evidências.
- Teste de interface com DOM simulado passou: movimento, elevador, pausa, diálogo, minigame, save/restore e aba oculta.
- Dez grupos da campanha passaram. A cadeia usa ações normais dos minigames; o solucionador da revisão memoriza apenas cartas reveladas. Não injeta entregas ou promoções. Normal: CEO dia 15, 88,94 entregas e 92,91 prestígio. Demo: CEO dia 4, 98,93 entregas e 102,13 prestígio.
- Inspeção no navegador: recepção/balcão, arte suave, saída legível, fluxo de tarefas bloqueado por pré-requisitos, conclusão de diagnóstico e rede com retratos. Console da aba de teste sem erros/avisos. A revisão anterior também verificou caminhada por clique e diálogo por E/tecla 3.
- `tests/visual.html` é uma cópia da interface com armazenamento em memória, útil para testar sem tocar no save principal. Seu estado é descartado ao recarregar.

Não foram realizados: benchmark de FPS no M1, partida humana integral da nova revisão ou inspeção visual manual de todos os andares e retratos. Os testes de 30/60/120 FPS verificam passos da simulação, não desempenho medido do navegador.

## Limites e organização

A arte continua estilizada e simples, com corpos pequenos e retratos procedurais. As rotinas e conversas entre NPCs são autorais e determinísticas. Não há simulação social emergente nem mapas externos. O áudio opcional é um toque sintetizado. Há um slot local; não há sincronização ou exportação de save.

`data.js`: pessoas, ambientes, agendas e balanceamento. `engine.js`: estado e regras. `scene.js`: movimento, trajetos e arte. `minigames.js`: regras dos desafios. `gameplay-ui.js`: interface de minigames, rede e objetos. `app.js`: entrada e coordenação da interface. `index.html`/`style.css`: apresentação. `launcher.py`/`Abrir.command`: abertura opcional. `tests/`: verificações reproduzíveis.


## Revisão 0.4 — rotinas e primeiros episódios

Pausas escalonadas, destinos reservados e navegação em pontos livres corrigem a concentração no sofá. O marcador ! indica uma conversa pendente e não depende de andar ou parar. Os símbolos genéricos de rotina foram removidos.

Três episódios conectam Lia, Helena e Caio a diagnóstico, revisão e implementação. Personagens se aproximam, decisões ficam salvas, falhas não concluem pedidos e agradecimentos não dão recompensas repetidas. O objetivo aparece no painel. As demais conversas ainda usam o sistema anterior; não são 70 histórias individuais. A arte continua procedural e ainda precisa de uma revisão visual dedicada.

Teste adicional: `node --test tests/story-routines.cjs`.

## Revisão 0.5 — andar 1 com estrutura de escritório

O primeiro andar deixou de ser um chão xadrez com sete objetos soltos e passou a ter quatro zonas desenhadas:

- **Recepção:** balcão com fachada, letreiro, posto de trabalho, sineta e terminal de crachás; mural ao lado.
- **Sala de espera:** recanto fechado por divisórias de vidro fosco, com tapete, sofá, poltrona, mesa de revistas e planta — já não é um retângulo no meio do nada.
- **Copa e café:** bancada com lava-loiça e micro-ondas, máquina de café e duas mesinhas com cadeiras. Colegas em pausa sentam-se mesmo à mesa e conversam ali.
- **Zona de trabalho:** duas escrivaninhas com computador desenhado ao detalhe (monitor com base e ecrã aceso, teclado com teclas, rato com fio, caneca, papéis, gaveteiro), cadeira de rodízios, impressora e arquivo.

As janelas passaram a ter caixilho, peitoril e vista — céu de dia, cidade acesa à noite. Quem trabalha aparece sentado na cadeira, a digitar; quem está em pausa aparece sentado à mesa do café, com a caneca na mão.

As legendas dos objetos ganharam uma chapa por trás e saem de cima dos bonecos. Plantas, divisórias, arquivo, bancada e impressora são cenário: não abrem menus nem têm legenda.

Corrigido: com mais mobília, o aviso no ecrã e a ação de `E` podiam divergir (dizia "Suporte de plantão" e abria "Mesa do café"). Agora ambos usam o objeto mais próximo.

A mobília dos outros andares herdou as peças partilhadas (secretárias, sofás, mesas executivas). As mesas de reunião e a mesa do conselho continuam no desenho antigo.
