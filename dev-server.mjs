import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function createAppServer(base = root) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const target = path.resolve(base, `.${pathname}`);
    if (!target.startsWith(base)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.stat(target, (error, stat) => {
      if (error || !stat.isFile()) {
        const fallback = path.join(base, 'index.html');
        fs.readFile(fallback, (fallbackError, data) => {
          if (fallbackError) {
            res.writeHead(404).end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-cache' });
          res.end(data);
        });
        return;
      }
      fs.readFile(target, (readError, data) => {
        if (readError) {
          res.writeHead(500).end('Read error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        res.end(data);
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 4176);
  const server = createAppServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`HoldThatSmile demo running at http://127.0.0.1:${port}`);
  });
}
