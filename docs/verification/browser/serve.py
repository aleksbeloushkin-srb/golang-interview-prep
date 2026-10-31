"""Static server for browser checks. With --no-backend, js/config.js is served
empty, so the site runs in its old local-only mode (every edit allowed)."""
import argparse, functools, http.server
p = argparse.ArgumentParser()
p.add_argument("port", type=int)
p.add_argument("--root", default=".")
p.add_argument("--no-backend", action="store_true")
args = p.parse_args()
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if args.no_backend and self.path.split("?")[0] == "/js/config.js":
            body = b"// no backend in this check\n"
            self.send_response(200)
            self.send_header("content-type", "text/javascript")
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()
    def log_message(self, *a):
        pass
http.server.ThreadingHTTPServer(("127.0.0.1", args.port), functools.partial(H, directory=args.root)).serve_forever()
