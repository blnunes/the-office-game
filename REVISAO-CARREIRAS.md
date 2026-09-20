# Revisão: carreiras, encontros e personagens

## Jogar

Recarregue e escolha **Continuar**. O cargo salvo determina o novo ciclo de quatro atividades. O painel T mostra o destino; caminhe até o objeto indicado e pressione E. O painel só inicia uma atividade quando você está no local.

As reuniões são a quarta atividade de cada ciclo. Converse pessoalmente com os participantes e escolha o convite. Dez minutos após o último convite, eles se deslocam para a sala. A reunião só fica disponível quando todos chegam. O tempo fica pausado durante diálogos: feche o painel para deixá-los caminhar.

No ciclo do CTO, a proposta reúne direção, CTO em transição e CEO em sucessão. No ciclo do CEO, a reunião reúne diretoria, CTO e conselho.

## Ciclos

| Cargo | Sequência |
| --- | --- |
| Pleno | Diagnóstico → revisão → funcionalidade → demonstração |
| Sênior | Falha sistêmica → arquitetura → migração → operação |
| Tech Lead | Impedimentos → orientação → integração → produto |
| Gerente | Escuta → capacidade → prazo → retrospectiva |
| Diretor | Portfólio → riscos → investimento → comitê |
| VP | Mercados → sucessão → expansão → vice-presidências |
| CTO | Risco tecnológico → arquitetura corporativa → investimento → proposta estratégica |
| CEO | Conselho e clientes → prioridades anuais → orçamento → reunião da presidência |

As 32 atividades usam seis famílias de minigames. Não são 32 mecânicas diferentes. A representação de conversas e deslocamentos continua procedural.

## Esforço

Essencial: dificuldade 1, tempo e recompensa menores. Completa: dificuldade 2, valores intermediários. Aprofundada: dificuldade 3, mais tempo, energia e recompensa. As cartas, sequências, prioridades ou rodadas mudam conforme a família do puzzle. A estratégia exige uma, duas ou três propostas válidas, com alternativas reorganizadas entre rodadas.

Falhar ou abandonar continua consumindo o esforço reservado e não concede a recompensa.

## Recomendações

Para promoções, os andares mínimos dos recomendadores são: 2, 3, 4, 5, 6, 7 e 7. Para CEO, as quatro recomendações vêm do conselho/presidência. Apoios antigos permanecem no save e na rede, mas só contam quando atendem ao andar e à confiança exigidos.

## Personagens

Os 14 personagens centrais receberam passados e falas próprias, com humor e uma revelação mais pessoal ao ganhar confiança. Lia cuida dos gatos Planilha e Anexo; Helena restaura robôs de corda; Caio escreve monólogos para NPCs de RPG; Marcos tenta fazer pão; Nina filma terror com uma torradeira. Os demais possuem perfis gerados a partir de passados e hobbies, ainda menos detalhados.

Referência consultada: [entrevista de Angela Kinsey sobre a criação do passado de Angela](https://www.tvguide.com/news/angela-kinsey-offices-41371/). Os textos do jogo são próprios.

## Verificação

`node --test tests/*.cjs` passou com 38 resultados. Inclui campanhas normal e demonstração, chegada física dos participantes, locais de trabalho, esforço/recompensa, recomendadores por andar, persistência e integridade dos NPCs. A campanha automatizada usa posições de cenário como fixtures para os deslocamentos do jogador e simula as rotas dos NPCs; não mede fluidez visual nem representa uma sessão inteira jogada manualmente.

Arquivos novos: `careers.js` (regras e perfis), `career-ui.js` (interface de atividades e convites), `tests/careers.cjs` (regressões).
