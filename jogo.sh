#!/bin/zsh
# Controlo do Próximo Andar a partir da linha de comandos.
#
#   ./jogo.sh start | stop | restart | status | open
#   ./jogo.sh qa    | qa-stop | qa-open
#   ./jogo.sh test  | zip | cache
#
# Duas portas, de propósito: os saves são por endereço, por isso a 8765 é a
# carreira a sério e a 8799 é só para QA visual (tests/visual.html, memória).
# Nada de servidores externos: python3 http.server, ligado apenas a 127.0.0.1.
set -u
cd -- "${0:A:h}"

PORT_JOGO=8765
PORT_QA=8799
RUN=.run
mkdir -p "$RUN"

cor()  { printf '\033[%sm%s\033[0m\n' "$1" "$2" }
ok()   { cor '32' "✓ $1" }
aviso(){ cor '33' "! $1" }
erro() { cor '31' "✗ $1" >&2 }

pidfile() { echo "$RUN/$1.pid" }
logfile() { echo "$RUN/$1.log" }

# PID vivo guardado por este script, ou vazio.
pid_vivo() {
  local f=$(pidfile "$1") p
  [[ -f $f ]] || return 1
  p=$(<"$f")
  if kill -0 "$p" 2>/dev/null; then echo "$p"; return 0; fi
  rm -f "$f"; return 1
}

porta_ocupada() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1 }

subir() {                       # subir <nome> <porta> <descrição>
  local nome=$1 porta=$2 desc=$3 p
  if p=$(pid_vivo "$nome"); then
    ok "$desc já está a correr (pid $p) em http://127.0.0.1:$porta/"
    return 0
  fi
  if porta_ocupada "$porta"; then
    aviso "A porta $porta já está ocupada por outro processo (não foi este script que a abriu)."
    aviso "Se for o teu launcher.py ou outra aba, deixa estar: o save vive nesse endereço."
    lsof -nP -iTCP:"$porta" -sTCP:LISTEN
    return 1
  fi
  nohup python3 -m http.server "$porta" --bind 127.0.0.1 --directory . \
    >"$(logfile $nome)" 2>&1 &
  echo $! >"$(pidfile $nome)"
  # Esperar que responda mesmo, em vez de assumir.
  local i
  for i in {1..40}; do
    curl -sf -o /dev/null "http://127.0.0.1:$porta/" && break
    sleep .1
  done
  if p=$(pid_vivo "$nome") && porta_ocupada "$porta"; then
    ok "$desc a correr (pid $p)"
  else
    erro "$desc não arrancou. Ver $(logfile $nome)"
    return 1
  fi
}

baixar() {                      # baixar <nome> <descrição>
  local nome=$1 desc=$2 p
  if p=$(pid_vivo "$nome"); then
    kill "$p" 2>/dev/null
    local i; for i in {1..30}; do kill -0 "$p" 2>/dev/null || break; sleep .1; done
    kill -9 "$p" 2>/dev/null
    rm -f "$(pidfile $nome)"
    ok "$desc encerrado (pid $p)"
  else
    aviso "$desc não estava a correr por este script."
  fi
}

estado() {                      # estado <nome> <porta> <descrição>
  local nome=$1 porta=$2 desc=$3 p
  if p=$(pid_vivo "$nome"); then
    ok "$desc: a correr (pid $p) · http://127.0.0.1:$porta/"
  elif porta_ocupada "$porta"; then
    aviso "$desc: porta $porta ocupada por outro processo (não por este script)."
  else
    echo "· $desc: parado"
  fi
}

case "${1:-status}" in
  start)
    subir jogo $PORT_JOGO "Jogo" && echo "  → http://127.0.0.1:$PORT_JOGO/"
    ;;
  stop)    baixar jogo "Jogo" ;;
  restart) baixar jogo "Jogo"; subir jogo $PORT_JOGO "Jogo" ;;
  open)
    subir jogo $PORT_JOGO "Jogo" >/dev/null
    open "http://127.0.0.1:$PORT_JOGO/"
    ;;

  qa)
    subir qa $PORT_QA "QA visual" \
      && echo "  → http://127.0.0.1:$PORT_QA/tests/visual.html  (save em memória, descartado ao recarregar)"
    ;;
  qa-stop) baixar qa "QA visual" ;;
  qa-open)
    subir qa $PORT_QA "QA visual" >/dev/null
    open "http://127.0.0.1:$PORT_QA/tests/visual.html"
    ;;

  status)
    estado jogo $PORT_JOGO "Jogo (save real)"
    estado qa   $PORT_QA   "QA visual"
    ;;

  test) exec node --test tests/*.cjs ;;

  cache)
    # Obrigatório depois de mexer em qualquer .js: sem isto o navegador serve a cópia em cache.
    novo="v=$(date +%Y%m%d%H%M)"
    antigo=$(grep -o 'v=[0-9a-zA-Z]*' index.html | head -1)
    sed -i '' "s/v=[0-9a-zA-Z]*/$novo/g" index.html tests/visual.html
    ok "Cache: $antigo → $novo (index.html e tests/visual.html)"
    ;;

  zip)
    rm -f outputs/Proximo-Andar.zip
    mkdir -p outputs
    zip -qr outputs/Proximo-Andar.zip Abrir.command LEIA-ME.md REVISAO-CARREIRAS.md \
      app.js assets career-ui.js careers.js data.js engine.js gameplay-ui.js index.html \
      jogo.sh launcher.py living-ui.js living.js minigames.js office-art.js scene.js \
      spritesheet.js style.css tests -x '*.DS_Store' \
      && ok "outputs/Proximo-Andar.zip recriado ($(du -h outputs/Proximo-Andar.zip | cut -f1))"
    ;;

  *)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
