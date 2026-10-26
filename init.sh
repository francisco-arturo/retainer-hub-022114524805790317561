#!/bin/bash
set -e

echo "=== HoldThatSmile verification ==="

echo "=== Syntax: seed data ==="
node --check js/data.js

echo "=== Syntax: store ==="
node --check js/store.js

echo "=== Syntax: application ==="
node --check js/app.js

echo "=== Syntax: local server ==="
node --check dev-server.mjs

echo "=== Order, payment, account and admin logic ==="
node scripts/verify.mjs

echo "=== Render all customer routes and admin interactions ==="
node scripts/render-smoke.mjs

echo "=== Static route smoke test ==="
node scripts/smoke.mjs

echo ""
echo "=== Verification Complete ==="
echo "Local demo: npm start  ->  http://127.0.0.1:4176"
echo "Staff demo PIN: 2468"
