"""Servidor de desenvolvimento do frontend (sem Docker).

Serve frontend/public e repassa /api/* para uma API do Golpe Zero, por padrão a
de produção. Útil para mexer no visual sem subir a stack inteira.

Uso:  python scripts/dev_frontend.py            -> http://localhost:5173
      GZ_API=http://localhost:8000 python scripts/dev_frontend.py
"""

import http.server
import os
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / "frontend" / "public"
API = os.getenv("GZ_API", "https://golpezero.northcentralus.cloudapp.azure.com").rstrip("/")
PORTA = int(os.getenv("PORT", "5173"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(RAIZ), **kw)

    def _proxy(self):
        tamanho = int(self.headers.get("Content-Length") or 0)
        corpo = self.rfile.read(tamanho) if tamanho else None
        req = urllib.request.Request(API + self.path, data=corpo, method=self.command)
        if self.headers.get("Content-Type"):
            req.add_header("Content-Type", self.headers["Content-Type"])
        try:
            with urllib.request.urlopen(req, timeout=180) as r:  # nosemgrep  # nosec - só desenvolvimento local, URL vem da variável GZ_API
                dados, status, tipo = r.read(), r.status, r.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as e:
            dados, status, tipo = e.read(), e.code, e.headers.get("Content-Type", "application/json")
        self.send_response(status)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy()
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self._proxy()
        self.send_error(405)


if __name__ == "__main__":
    print(f"Golpe Zero (dev): http://localhost:{PORTA}  ->  API {API}")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORTA), Handler).serve_forever()
