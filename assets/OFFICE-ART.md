# Objetos e recepção — 13/09/2026

office-props.png: gerado pela ferramenta integrada ImageGen a partir da referência enviada pelo usuário.
Prompt: folha 2×2 transparente; topo esquerdo máquina de café com gabinete e copos; topo direito mural com notas sem texto; baixo esquerdo planta em vaso; baixo direito escrivaninha com monitor, teclado, mouse, luminária e cadeira. Arte 2D arredondada para RPG de escritório, objetos inteiros e separados.

office-art.js recorta os quatro objetos e substitui café, mural, plantas e mesas comuns. Balcão, sofá e mesas executivas ainda usam o desenho anterior.

Primeiro andar: três postos habituais (Lia, Rui, suporte em rodízio diário) e uma visita rotativa em janela horária. Compromissos explícitos/reuniões continuam tendo prioridade. Os 70 IDs permanecem no catálogo e nos saves; foi reduzida a presença simultânea, sem apagar relações. Os demais funcionários da recepção só aparecem durante seu plantão ou visita.

Rotinas com hash independente das avaliações de carreira: pausas variam por pessoa/dia; Rui e suporte têm uma janela de conversa após a visita de Rui à plataforma. Lia faz a pausa depois. Destinos correspondem aos postos; retornos ficam voltados para as mesas. Arte conferida no navegador. 47 testes existentes passaram, e dois novos validam lotação/postos por sete dias e o ciclo com relógio correndo: trabalhar, ir ao café, conversar, voltar.

## 20/09/2026 — a imagem deixa de ser a fonte principal da mobília

`office-props.png` só é usado agora para `coffee`, `board` e `plant`. Tudo o resto é desenhado em código em `scene.js` (`furniture()` e as peças partilhadas `slab`, `monitor`, `keyboard`, `mouse`, `mug`, `papers`, `officeChair`, `upholstery`, `cafeChair`, `partition`, `counterUnit`, `cabinetUnit`, `printerUnit`).

Motivo: a imagem já trazia uma cadeira desenhada, o que impedia pôr alguém sentado sem duplicar ou desalinhar; e um PNG não anima. A `desk` saiu da imagem em 20/09 e as peças novas do andar 1 (`cafetable`, `armchair`, `lowtable`, `counter`, `cabinet`, `printer`, `partition`) nunca lá estiveram.

Convenção de vista: o tampo/assento é visto de cima, o que está pousado nele é visto de frente — o atalho habitual dos RPG 2D, que se lê bem com bonecos de 52px.

`SCENE.QUIET` lista os tipos que são só cenário: não têm legenda nem abrem menu (`near()` em `app.js` usa a mesma lista, para não haver duas verdades).

Cadeiras e lugares vêm todos de `chairSpot(o, from)` / `chairSeats(o)` — as mesmas funções que desenham a cadeira e que posicionam o boneco sentado, por isso não podem desalinhar.
