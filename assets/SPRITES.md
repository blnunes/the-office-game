# Sprites de caminhada — 13/09/2026

Arte gerada com a ferramenta integrada ImageGen, usando a referência fornecida pelo usuário.
Prompt: folha transparente com 3 colunas e 4 linhas (baixo, esquerda, direita, cima); cabeça grande, corpo compacto, camisa coral, calça azul e sapatos ocre; poses contato esquerdo, neutra, contato direito; sem grade, texto ou sombra.

worker-walk.png é a fonte. spritesheet.js seleciona quadros por distância (0,1,2,1), usa a pose central quando parado e mantém cores de pele, cabelo e roupa por personagem. Recortes explícitos compensam o espaçamento da arte. As silhuetas ainda compartilham um único desenho base; penteados, acessórios e corpos distintos precisam de novas folhas.

Prévia: tests/sprites-preview.html. Integração conferida em tests/visual.html, sem usar o save real. Testes: movimento/interface e seleção de quadros passaram.

## Variantes de identidade

Adicionadas worker-bob.png (cabelo na altura dos ombros, rosto feminino) e worker-curly.png (cacheado com barba). Seleção estável por appearance.gender/style/beard; cores individuais preservadas. São três modelos, ainda não um penteado exclusivo para cada NPC. Retratos continuam no renderizador próprio.

Ferramenta: ImageGen integrada. Prompts: editar a base mantendo as 12 posições, dimensões e poses; variante feminina adulta com cabelo castanho na altura dos ombros, blusa coral e calça azul; variante masculina adulta com cabelo curto cacheado e barba. Uma tentativa de extração de fundo não foi usada. O renderizador remove a trama neutra das variantes antes de recolorir.

Validado em prévia no navegador nas quatro direções; 11 testes de seleção, movimento e interface passaram. Relações românticas não implementadas nesta alteração.
