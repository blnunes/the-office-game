"""Servidor opcional, somente loopback e somente arquivos desta pasta."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
from urllib.request import urlopen
import webbrowser
PORT = 8765
URL = f'http://127.0.0.1:{PORT}/'
folder = str(Path(__file__).resolve().parent)
try:
    server = ThreadingHTTPServer(('127.0.0.1', PORT), partial(SimpleHTTPRequestHandler, directory=folder))
except OSError:
    try:
        with urlopen(URL, timeout=2) as response:
            existing = response.read().decode('utf-8')
        if 'Próximo Andar — Nimbus Technologies' in existing:
            webbrowser.open(URL)
            print('Próximo Andar já está aberto. Pode fechar esta janela.')
        else:
            raise RuntimeError('Porta em uso por outro aplicativo.')
    except Exception:
        print('Não foi possível iniciar. Abra index.html diretamente no navegador.')
else:
    webbrowser.open(URL)
    print('Próximo Andar aberto. Mantenha esta janela aberta enquanto joga. Ctrl+C encerra.')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
