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
Lê CLAUDE.md, RETOMADA.md e PASSAGEM-CLAUDE-CODE.md. Estamos a continuar uma migração do Codex para o Claude neste projeto (jogo RPG corporativo "Próximo Andar"). Corre `cd outputs/proximo-andar && node --test tests/*.cjs` para confirmar o estado (esperado: 50 aprovados) e depois diz-me em poucas linhas o que entendeste, o que está pendente e por onde recomendas começar. Responde em português e não alteres nada antes de eu confirmar.
```

## O que já foi feito

- Projeto localizado e lido: `2026-09-11/proximo-andar` (jogo em `outputs/proximo-andar/`).
- Testes corridos: 50 aprovados, 0 falhas.
- Criados `CLAUDE.md`, `RETOMADA.md` (atualizado) e `RETOMADA.codex-original.md` (cópia da versão do Codex).
- `git init` (branch `main`) com um commit inicial de 63 ficheiros. `.gitignore`: `.DS_Store`, `node_modules/`, `outputs/Proximo-Andar.zip`.
- Este ficheiro (`PASSAGEM-CLAUDE-CODE.md`) ainda NÃO está commitado.

## Pendências e decisões em aberto

1. Repositório remoto: o utilizador tem um repositório existente. Falta o URL. Plano: `git remote add origin <URL>`; se o remoto já tiver conteúdo, `git fetch` e comparar antes de qualquer push, para evitar históricos divergentes. O primeiro `git push` é feito pelo próprio utilizador no Terminal do Mac (credenciais dele). Não pedir nem guardar tokens.
2. `.git/` tem ficheiros temporários (`tmp_obj_*`, `HEAD.lock` vazio, `t3jvNez`) deixados pela sessão anterior, que não podia apagar ficheiros. Inofensivos. No Claude Code no Mac podem ser removidos com `find .git -name 'tmp_obj_*' -delete` e `rm -f .git/HEAD.lock .git/objects/maintenance.lock .git/t3jvNez`, depois `git fsck` para confirmar.
3. Slack: o conector está ligado na conta claude.ai. Falta o utilizador dizer para que quer usá-lo (por exemplo, postar um resumo no fim de cada sessão num canal a definir).
4. Plano de testes: a skill `engineering:testing-strategy` foi chamada mas ainda não produziu nada. O projeto-alvo é o Próximo Andar (testes em `tests/*.cjs`; ver a secção Testes do `CLAUDE.md`). Boa primeira tarefa depois do diagnóstico.
5. `LEIA-ME.md` ainda descreve a revisão 0.3/0.4; recriar `outputs/Proximo-Andar.zip` depois de alterações.
6. Pendências do jogo: ver `RETOMADA.md` (colisão/gargalos, migração de saves, arte, histórias para mais NPCs).

## Configuração no Claude Code (uma vez)

- Plugin Engineering (o mesmo do Cowork): no Claude Code, `/plugin marketplace add anthropics/knowledge-work-plugins` e depois `/plugin install engineering@knowledge-work-plugins`. Skills úteis: `/engineering:code-review`, `/engineering:testing-strategy`, `/engineering:tech-debt`, `/engineering:documentation`, `/engineering:standup`.
- Conectores (Slack, Gmail, Calendar): com a mesma conta claude.ai costumam aparecer no Claude Code; confirmar com `/mcp`.
- Perfil de escrita: se o utilizador criar o perfil de voz aqui no Cowork, é um recurso da conta claude.ai; confirmar no Claude Code com `/skills`.

## Regras do utilizador a manter

Responder em português. Diagnóstico honesto sobre o que foi realmente verificado. Não alterar o save da aba principal do jogo; usar `tests/visual.html`. Não usar serviços ou assets externos no jogo.
