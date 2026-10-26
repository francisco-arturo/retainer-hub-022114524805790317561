import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createAppServer } from '../dev-server.mjs';

const server = createAppServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const checks = [
  ['/', 200, /HoldThatSmile/, 'text/html'],
  ['/styles.css', 200, /--teal:/, 'text/css'],
  ['/js/app.js', 200, /renderOverview/, 'text/javascript'],
  ['/js/store.js', 200, /createStore/, 'text/javascript'],
  ['/js/data.js', 200, /HTS-10482/, 'text/javascript'],
  ['/orders/HTS-10482', 200, /id="app"/, 'text/html'],
];

try {
  for (const [path, status, pattern, contentType] of checks) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, status, `${path} should return ${status}`);
    assert.match(response.headers.get('content-type') || '', new RegExp(contentType), `${path} content type`);
    const body = await response.text();
    assert.match(body, pattern, `${path} should contain expected content`);
    assert.ok(body.length > 80, `${path} should not be empty`);
    console.log(`PASS  ${path} -> ${status} (${body.length} bytes)`);
  }

  const missing = await fetch(`${base}/does-not-exist.png`);
  assert.equal(missing.status, 200, 'SPA fallback should serve the shell');
  assert.match(await missing.text(), /id="app"/);
  console.log('PASS  SPA fallback serves the app shell');
} finally {
  server.close();
}
