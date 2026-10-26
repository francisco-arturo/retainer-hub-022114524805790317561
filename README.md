# HoldThatSmile: Retainer Hub

A working customer app and lab operations prototype for **HoldThatSmile**, a direct-to-consumer clear-retainer business. Customers can order retainers, submit delivery details, follow their impression kit and manufacturing progress, manage their account, and review their smile history. Staff can sign in to a lab console to manage orders, manufacturing stages, customers and payments.

Built as a deployable static app with no runtime dependencies.

**Live:** https://retainer-hub-022114524805790317561.vercel.app  
**Repository:** https://github.com/francisco-arturo/retainer-hub-022114524805790317561

## Run it

```powershell
npm start
# http://127.0.0.1:4176
```

Staff demo: **PIN 2468**

## Verify it

```powershell
powershell -ExecutionPolicy Bypass -File .\init.ps1
# or
npm run verify
```

The verification suite runs:

- `scripts/verify.mjs` - seed integrity, stage transitions, payment review, order creation, profile updates, admin metrics.
- `scripts/render-smoke.mjs` - renders every customer route and the admin dashboard/modal against a DOM stub, catching template and state errors without a browser dependency.
- `scripts/smoke.mjs` - serves the app on an ephemeral port and checks the entry route, CSS, JS modules and SPA fallback.

## Routes

| Route | What it does |
|---|---|
| `#/overview` | Seeded customer dashboard: active order, kit/production tracker, updates, care guidance |
| `#/orders` | Order archive with live status, delivery estimates and one-click reorder |
| `#/orders/HTS-10482` | Full order journey: impression kit, lab stages, delivery, payment and support |
| `#/order` | Three-step order flow: choose a set, delivery details, demo payment and confirmation |
| `#/account` | Profile, shipping address, lab notes, notification preferences and card on file |
| `#/admin` | Staff PIN gate, then orders, production board, customers and payment ledger |

## Architecture

```
index.html          static entry, app mount
styles.css          design system and responsive layout
js/data.js          fictional seed data and stage/product vocabulary
js/store.js         pure domain store: orders, stages, payments, profile, metrics
js/app.js           hash router, renderers, forms, admin console, localStorage persistence
dev-server.mjs      local static server (excluded from deployment)
scripts/            verification only
```

The **store is the seam**. It is pure and testable in Node, with no DOM or browser APIs. In production, each store method maps to an authenticated API call:

| Prototype method | Production shape |
|---|---|
| `createOrder` | `POST /api/orders` with a server-side price lookup and Stripe PaymentIntent |
| `advanceOrder` | `PATCH /api/admin/orders/:id/stage` behind a staff session and an audit entry |
| `collectPayment` | Stripe webhook or staff payment capture, reconciled against the order |
| `updateProfile` | `PATCH /api/me` for the signed-in customer |
| `metrics` | Server-side aggregate query with role-based access |

The seeded state is in `js/data.js`. Browser persistence uses `localStorage` for demo convenience only; a production build should use a database and HttpOnly session cookies, never client-held authorization.

## Design notes

The visual language is warm clinical: cream paper, deep green ink, eucalyptus mint and a coral action color. A serif display face carries the brand; the UI uses a system sans stack. The custom SVG retainer illustration keeps the product central without external image dependencies. Mobile layouts collapse the hero, order tracker, checkout and admin tables into usable single-column views.

## What is deliberately not production-ready

- The staff PIN and customer session are demo-only (client-side; no server enforcement).
- Payments are simulated. Card numbers are validated for shape and never stored.
- Email, SMS and carrier events are not connected.
- Tracking numbers and customer records are fictional.
- State lives in the browser and can be reset from the footer.

See `DEMO.md` for the 60-second walkthrough and `progress.md` for verification evidence.
