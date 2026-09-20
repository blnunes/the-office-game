# Passagem para o Claude Code — Próximo Andar

Criado em 20/09/2026 no Claude (Cowork), para continuar o trabalho no Claude Code sem perder contexto.

## Como abrir

```sh
cd /Users/brunonunes/Documents/Codex/2026-09-11/proximo-andar
claude
```

O Claude Code lê `CLAUDE.md` da pasta automaticamente. Ele traz as regras fixas, o mapa dos ficheiros e os comandos de teste. `RETOMADA.md` traz o estado e as pendências.

## Primeiro prompt (copiar e colar)

```
Lê CLAUDE.md, RETOMADA.md e PASSAGEM-CLAUDE-CODE.md. Estamos a continuar uma migração do Codex para o Claude neste projeto (jogo RPG corporativo "Próximo Andar"). Corre `node --test tests/*.cjs` a partir da raiz do repositório para confirmar o estado (esperado: 50 aprovados) e depois diz-me em poucas linhas o que entendeste, o que está pendente e por onde recomendas começar. Responde em português e não alteres nada antes de eu confirmar.
```

## O que já foi feito

- Projeto localizado e lido: `2026-09-11/proximo-andar` (jogo agora na raiz do repo — ver estrutura abaixo).
- Testes corridos: 50 aprovados, 0 falhas (confirmado de novo depois de mover ficheiros).
- Criados `CLAUDE.md`, `RETOMADA.md` (atualizado) e `RETOMADA.codex-original.md` (cópia da versão do Codex).
- `git init` (branch `main`) com um commit inicial de 63 ficheiros. `.gitignore`: `.DS_Store`, `node_modules/`, `outputs/Proximo-Andar.zip`.
- `PASSAGEM-CLAUDE-CODE.md` commitado (`5b4461d`). `.git/` limpo dos ficheiros temporários da sessão anterior (`fsck` sem erros).
- Estrutura achatada (20/09, sessão Claude Code): jogo movido de `outputs/proximo-andar/` para a raiz do repo com `git mv` (histórico preservado). `outputs/` agora só guarda `Proximo-Andar.zip`. `CLAUDE.md` e `RETOMADA.md` atualizados com os novos caminhos e o novo comando de zip.
- Repositório remoto criado e ligado: `github.com/blnunes/the-office-game` (público), `git remote add origin` feito. Falta só o primeiro `git push -u origin main`, que o utilizador faz no Terminal do Mac (credenciais dele).
- Canal Slack `#the-office-game` criado (público) para receber o resumo de fim de sessão.
- `work/` (16 scripts Python antigos do Codex que remendavam os `.js` por substituição de texto, já todos aplicados e com caminhos desatualizados após o achatamento) apagado a pedido do utilizador.

## Pendências e decisões em aberto

1. Primeiro `git push -u origin main` — por fazer pelo utilizador no Terminal do Mac. Não pedir nem guardar tokens.
2. Slack: postar resumo de fim de sessão em `#the-office-game` (canal já existe, ID `C0C2Q8GAX2B`). Ainda não automatizado — por agora é manual por sessão.
3. Plano de testes: a skill `engineering:testing-strategy` foi chamada mas ainda não produziu nada. O projeto-alvo é o Próximo Andar (testes em `tests/*.cjs`; ver a secção Testes do `CLAUDE.md`). Boa primeira tarefa depois do diagnóstico.
4. `LEIA-ME.md` ainda descreve a revisão 0.3/0.4; recriar `outputs/Proximo-Andar.zip` depois de alterações (novo comando no `CLAUDE.md`).
5. Pendências do jogo: ver `RETOMADA.md` (colisão/gargalos, migração de saves, arte, histórias para mais NPCs).
6. `outputs/Proximo-Andar.zip` (desatualizado, de 13/09) ainda não foi revisto. `work/` (scripts Python antigos do Codex) foi removido nesta sessão — já não é usado desde a otimização/migração para o Claude.

## Configuração no Claude Code (uma vez)

- Plugin Engineering (o mesmo do Cowork): no Claude Code, `/plugin marketplace add anthropics/knowledge-work-plugins` e depois `/plugin install engineering@knowledge-work-plugins`. Skills úteis: `/engineering:code-review`, `/engineering:testing-strategy`, `/engineering:tech-debt`, `/engineering:documentation`, `/engineering:standup`.
- Conectores (Slack, Gmail, Calendar): com a mesma conta claude.ai costumam aparecer no Claude Code; confirmar com `/mcp`.
- Perfil de escrita: se o utilizador criar o perfil de voz aqui no Cowork, é um recurso da conta claude.ai; confirmar no Claude Code com `/skills`.

## Regras do utilizador a manter

Responder em português. Diagnóstico honesto sobre o que foi realmente verificado. Não alterar o save da aba principal do jogo; usar `tests/visual.html`. Não usar serviços ou assets externos no jogo.
