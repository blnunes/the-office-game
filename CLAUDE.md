# Próximo Andar — instruções para o Claude

RPG corporativo 2D local, em português (Nimbus Technologies). O jogador começa como Pleno e sobe por 7 andares até CEO, com 70 NPCs, rede de confiança, recomendações, minigames e reuniões. Projeto migrado do Codex para o Claude em 20/09/2026.

Antes de qualquer trabalho, leia `RETOMADA.md` (estado atual e pendências) e, se mexer em carreiras, `outputs/proximo-andar/REVISAO-CARREIRAS.md`.

## Regras fixas

- Responder sempre em português, com diagnóstico honesto: dizer o que foi realmente verificado e o que não foi. Não declarar revisão visual concluída sem ver no navegador.
- Sem APIs remotas, fontes externas, bibliotecas ou assets externos em runtime. Tudo local (HTML/CSS/JS/Canvas).
- Não recarregar nem alterar a aba principal do utilizador (porta 8765, save `localStorage['proximo-andar-v1']`). Para QA visual usar `tests/visual.html`, que usa armazenamento em memória.
- Os saves são por navegador e endereço. Não quebrar saves antigos: mudanças no estado exigem migração (snapshot `version: 1` no engine; `navigation: 3` no scene).
- Manter os testes de quantidade/identidade dos 70 NPCs e de ausência de duplicação.
- Não publicar nada. Não apagar ficheiros sem pedir.
- Ao terminar uma alteração: rodar os testes e recriar o ZIP (ver abaixo).

## Onde está o código

Jogo em `outputs/proximo-andar/` (scripts clássicos, ordem de carga em `index.html`):

- `data.js` — pessoas, andares/plantas, agendas, visitas, balanceamento, histórias das 14 personagens centrais. Exporta `config`.
- `minigames.js` — regras das 6 famílias (bug, revisão, funcionalidade, incidente, mentoria, estratégia).
- `engine.js` — classe `Game`: estado, tempo, energia/fadiga, tarefas, promoções, influência.
- `careers.js` — 8 cargos x 4 atividades, esforço 1/2/3, recomendações por andar (2/3/4/5/6/7/7), perfis de personagens. `career-ui.js` é a interface.
- `living.js` / `living-ui.js` — rotinas, pausas, conversas entre NPCs, histórias (`!`).
- `scene.js` — mundo: movimento, colisões, rotas, desenho no Canvas. Exporta `World` e `gridPoint`.
- `spritesheet.js`, `office-art.js`, `assets/*.png` — sprites e objetos (gerados por imagem; ver `assets/SPRITES.md` e `OFFICE-ART.md`).
- `gameplay-ui.js`, `app.js`, `style.css`, `index.html` — interface e coordenação.
- `launcher.py` / `Abrir.command` — servidor local opcional em 127.0.0.1.

ATENÇÃO: os `.js` têm poucas linhas mas muito comprimento (código denso). Não leia ficheiros inteiros: use `grep -o`, `grep -n` com padrões curtos, ou `python3` para extrair/editar por leitura-modificação-escrita. Nunca reescreva um ficheiro a partir de saída truncada.

`work/` na raiz contém scripts Python antigos do Codex que geraram/remendaram os `.js` por substituição de texto. São histórico. Não voltar a executá-los (a base já contém o resultado). Editar os `.js` diretamente.

## Comandos

Node só é necessário para os testes (não para jogar). A partir de `outputs/proximo-andar/`:

```sh
node --test tests/*.cjs          # bateria completa; estado atual: 50 aprovados, 0 falhas
node --test tests/story-routines.cjs   # exemplo de teste isolado
```

Correr o jogo: `python3 launcher.py` (ou duplo clique em `Abrir.command`), abrir http://127.0.0.1:8765/. Alternativa: abrir `index.html` (o save fica separado por método de abertura).

Recriar a entrega compactada, depois de alterações:

```sh
cd outputs && zip -qr Proximo-Andar.zip proximo-andar
```

## Testes

`tests/helpers.cjs` tem `arrive/play/solve`: a campanha usa as ações normais dos minigames e posições de cenário como fixtures, sem injetar entregas nem promoções. Isso não mede fluidez visual nem substitui uma sessão jogada por humano. Não há benchmark de FPS.

## Pendências conhecidas

Ver `RETOMADA.md`. Resumo: conferir gargalos de colisão com muitos executivos, migração de saves sem `navigation: 3`, arte ainda simples (3 modelos de sprite), só 14 personagens com histórias próprias, `LEIA-ME.md` ainda descreve a revisão 0.3/0.4.
