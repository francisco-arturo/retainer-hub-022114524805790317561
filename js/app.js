import { PRODUCTS, STAGES, STAGE_WINDOWS, seedState } from './data.js';
import { createStore, isOpen, money, paymentIsDue, stageInfo } from './store.js';

const STORAGE_KEY = 'holdthatsmile:demo:v2';
const app = document.querySelector('#app');

const ICONS = {
  smile:
    '<circle cx="12" cy="12" r="9"/><path d="M8.2 14.4c1 1.4 2.3 2.1 3.8 2.1s2.8-.7 3.8-2.1"/><path d="M9.2 9.4h.01M14.8 9.4h.01"/>',
  arrow: '<path d="M4.5 12h15"/><path d="m14 6.5 5.5 5.5-5.5 5.5"/>',
  back: '<path d="M19.5 12h-15"/><path d="m10 6.5-5.5 5.5L10 17.5"/>',
  check: '<path d="m5 12.5 4.2 4.2L19.5 6.5"/>',
  package:
    '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5"/><path d="M12 12v9"/><path d="M8 5.2 16 9.8"/>',
  scan:
    '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  lab:
    '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  sparkle:
    '<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  truck:
    '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  bell:
    '<path d="M18 8.5a6 6 0 0 0-12 0c0 7-2 7-2 8.5h16c0-1.5-2-1.5-2-8.5Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 21c.7-4 3.4-6 7.5-6s6.8 2 7.5 6"/>',
  shield: '<path d="M12 3 5 6v5c0 4.4 2.9 7.9 7 10 4.1-2.1 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  logout: '<path d="M10 5H5v14h5"/><path d="M14 8.5 17.5 12 14 15.5"/><path d="M9 12h9"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9.5h18"/><path d="M7 15h3"/>',
  pin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.5 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  phone:
    '<path d="M7 3.5h3l1.2 4-2 1.4a14 14 0 0 0 5.9 5.9l1.4-2 4 1.2v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 5 5.7 2 2 0 0 1 7 3.5Z"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><path d="M12 14v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  chart: '<path d="M4 20V9M10 20V4M16 20v-7M22 20H2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-3.6 2.6-5.5 5.5-5.5s5 1.9 5.5 5.5"/><path d="M16 5.5a3 3 0 0 1 0 5.7M17 13.8c2.3.3 3.8 2 4.2 4.7"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
};

function icon(name, className = '') {
  const path = ICONS[name] || ICONS.sparkle;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function shortDate(iso) {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function longDate(iso) {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function fullDate(iso) {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.orders) || !Array.isArray(parsed.customers)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const store = createStore(loadState() || seedState);
store.subscribe(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()));
  } catch {
    // Storage can be full or blocked in private browsing; the demo still works in memory.
  }
});

let route = { name: 'overview', id: null };
let orderStep = 1;
let adminAuthed = false;
let adminTab = 'orders';
let adminFilter = 'all';
let modalOrderId = null;
let notificationsOpen = false;
let flashOrderId = null;
let modalJustOpened = false;
let lastFocused = null;

const customer = store.getCustomer();
let orderDraft = buildInitialDraft();

function buildInitialDraft() {
  const current = store.getCustomer();
  return {
    productId: 'both-arches',
    name: `${current.firstName} ${current.lastName}`,
    email: current.email,
    phone: current.phone,
    address1: current.address.address1,
    address2: current.address.address2 || '',
    city: current.address.city,
    state: current.address.state,
    zip: current.address.zip,
    impressionMethod: 'mail_kit',
    notes: '',
  };
}

function currentProduct() {
  return PRODUCTS.find((product) => product.id === orderDraft.productId) || PRODUCTS[1];
}

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw || raw === 'overview') return { name: 'overview', id: null };
  const [name, id] = raw.split('/');
  if (name === 'orders' && id) return { name: 'order-detail', id };
  return { name, id: id || null };
}

function navigate(path) {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (!target.startsWith(`#/orders/${flashOrderId}`)) flashOrderId = null;
  if (window.location.hash === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
    return;
  }
  window.location.hash = target;
}

function setPageTitle() {
  const names = {
    overview: 'Your smile',
    orders: 'My orders',
    'order-detail': 'Order tracking',
    order: 'New order',
    account: 'Account',
    admin: 'Staff operations',
  };
  document.title = `${names[route.name] || 'Not found'} · HoldThatSmile`;
}

function toast(message, tone = 'default') {
  let root = document.querySelector('#toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  const node = document.createElement('div');
  node.className = `toast toast-${tone}`;
  node.innerHTML = `<span class="toast-mark">${tone === 'error' ? icon('close') : icon('check')}</span><span>${escapeHtml(message)}</span>`;
  root.appendChild(node);
  requestAnimationFrame(() => node.classList.add('is-visible'));
  window.setTimeout(() => {
    node.classList.remove('is-visible');
    window.setTimeout(() => node.remove(), 240);
  }, 3800);
}

function stageChip(order) {
  if (paymentIsDue(order)) return '<span class="pill pill-warn"><span class="pill-dot"></span>Payment review</span>';
  if (order.stage === 7) return '<span class="pill pill-done"><span class="pill-dot"></span>Delivered</span>';
  return `<span class="pill pill-live"><span class="pill-dot"></span>${escapeHtml(stageInfo(order.stage).short)}</span>`;
}

function paymentChip(order) {
  return paymentIsDue(order)
    ? '<span class="pay-chip pay-chip-due">Needs attention</span>'
    : `<span class="pay-chip pay-chip-paid">${icon('check')} Paid</span>`;
}

function orderEta(order) {
  if (order.stage === 7 && order.shipping.deliveredAt) return `Delivered ${shortDate(order.shipping.deliveredAt)}`;
  if (order.shipping.eta) return `${order.stage >= 6 ? 'Arriving' : 'Estimated'} ${longDate(order.shipping.eta)}`;
  return 'Estimate pending';
}

function nextStage(order) {
  return STAGES[order.stage] || null;
}

function progressPercent(order) {
  return Math.min(100, Math.max(8, (order.stage / STAGES.length) * 100));
}

function orderTitle(order) {
  return `${order.productName} · ${order.arches.toLowerCase()}`;
}

function render() {
  setPageTitle();
  const page = routeView();
  app.innerHTML = `
    ${renderHeader()}
    <main id="main" class="main">${page}</main>
    ${renderFooter()}
    ${modalOrderId ? renderAdminModal() : ''}
  `;
  document.body.classList.toggle('modal-open', Boolean(modalOrderId));
  if (modalJustOpened) {
    modalJustOpened = false;
    window.setTimeout(() => document.querySelector('.modal-close')?.focus(), 20);
  }
}

function renderHeader() {
  const unread = store.unreadCount();
  const nav = [
    { label: 'Overview', href: '#/overview', key: 'overview' },
    { label: 'My orders', href: '#/orders', key: 'orders' },
    { label: 'Account', href: '#/account', key: 'account' },
  ];
  const activeKey = route.name === 'order-detail' ? 'orders' : route.name;
  return `
    <header class="site-head">
      <div class="shell head-inner">
        <a class="brand" href="#/overview" aria-label="HoldThatSmile home">
          <span class="brand-mark">${icon('smile')}</span>
          <span class="brand-word">HoldThat<span>Smile</span></span>
        </a>
        <nav class="main-nav" aria-label="Primary navigation">
          ${nav
            .map(
              (item) => `
              <a class="nav-link ${activeKey === item.key ? 'is-active' : ''}" href="${item.href}">${item.label}</a>
            `,
            )
            .join('')}
          <a class="nav-link nav-staff ${activeKey === 'admin' ? 'is-active' : ''}" href="#/admin">
            ${icon('shield')} Staff
          </a>
        </nav>
        <div class="head-actions">
          <a class="head-order" href="#/order">Order retainers</a>
          <button class="icon-button bell-button" type="button" data-action="toggle-notifications" aria-label="Open updates" aria-expanded="${notificationsOpen}">
            ${icon('bell')}
            ${unread ? `<span class="notif-count">${unread}</span>` : ''}
          </button>
          <a class="avatar" href="#/account" aria-label="Open account">${escapeHtml(customer.firstName[0])}${escapeHtml(customer.lastName[0])}</a>
        </div>
      </div>
      ${notificationsOpen ? renderNotificationsPanel() : ''}
    </header>
  `;
}

function renderNotificationsPanel() {
  const notifications = store.notificationsForCustomer().slice(0, 5);
  const unread = store.unreadCount();
  return `
    <div class="notif-panel" role="region" aria-label="Order updates">
      <div class="notif-head">
        <div><span class="eyebrow">Your updates</span><h2>All caught up?</h2></div>
        <button class="icon-button small" type="button" data-action="close-notifications" aria-label="Close updates">${icon('close')}</button>
      </div>
      <div class="notif-list">
        ${
          notifications.length
            ? notifications
                .map(
                  (item) => `
                  <a class="notif-item ${item.read ? '' : 'is-unread'}" href="#/orders/${item.orderId}" data-action="close-notifications">
                    <span class="notif-icon">${icon(item.kind === 'kit' ? 'package' : item.kind === 'delivered' ? 'smile' : item.kind === 'impressions' ? 'scan' : 'lab')}</span>
                    <span class="notif-copy">
                      <strong>${escapeHtml(item.title)}</strong>
                      <span>${escapeHtml(item.body)}</span>
                      <small>${shortDate(item.date)}</small>
                    </span>
                    ${item.read ? '' : '<span class="unread-dot" aria-label="Unread"></span>'}
                  </a>
                `,
                )
                .join('')
            : '<p class="notif-empty">No updates yet. Your next lab update will land here.</p>'
        }
      </div>
      ${
        unread
          ? `<button class="notif-action" type="button" data-action="mark-read">Mark all as read</button>`
          : '<div class="notif-foot">You are all caught up.</div>'
      }
    </div>
  `;
}

function renderFooter() {
  return `
    <footer class="site-foot">
      <div class="shell foot-grid">
        <div class="foot-brand">
          <span class="brand-mark small">${icon('smile')}</span>
          <div>
            <strong>HoldThatSmile</strong>
            <p>Custom clear retainers, made in San Francisco.</p>
          </div>
        </div>
        <div class="foot-links">
          <span class="eyebrow">Care team</span>
          <a href="mailto:care@holdthatsmile.com">care@holdthatsmile.com</a>
          <a href="tel:+14155550141">(415) 555-0141</a>
        </div>
        <div class="foot-links">
          <span class="eyebrow">Demo</span>
          <a href="#/admin">Staff portal</a>
          <button class="text-button" type="button" data-action="reset-demo">Reset demo data</button>
        </div>
      </div>
      <div class="shell foot-bottom">
        <span>© 2026 HoldThatSmile</span>
        <span class="demo-tag"><span class="demo-dot"></span>Demo environment · fictional customer data</span>
      </div>
    </footer>
  `;
}

function routeView() {
  switch (route.name) {
    case 'overview':
      return renderOverview();
    case 'orders':
      return renderOrders();
    case 'order-detail':
      return renderOrderDetail();
    case 'order':
      return renderOrderWizard();
    case 'account':
      return renderAccount();
    case 'admin':
      return adminAuthed ? renderAdmin() : renderAdminLogin();
    default:
      return renderNotFound();
  }
}

function renderOverview() {
  const orders = store.ordersForCustomer();
  const active = orders.find((order) => isOpen(order)) || orders[0];
  const deliveredCount = orders.filter((order) => order.stage === 7).length;
  const eta = active ? orderEta(active) : '';
  return `
    <section class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow eyebrow-live"><span class="eyebrow-dot"></span>${active ? `Order ${active.id} · ${stageInfo(active.stage).short}` : 'Your smile, on schedule'}</p>
        <h1>${greeting()}, ${escapeHtml(customer.firstName)}.<br /><em>Your smile is in motion.</em></h1>
        <p class="hero-lede">
          ${
            active
              ? `${orderTitle(active)} is ${active.stage === 7 ? 'home with you' : `at step ${active.stage} of 7`}. ${eta}. We will let you know the moment it moves.`
              : 'Your next custom retainer is a few clicks away. We will mail the kit, handle the lab and keep you posted.'
          }
        </p>
        <div class="hero-actions">
          ${
            active
              ? `<a class="button button-primary" href="#/orders/${active.id}">Track my order ${icon('arrow')}</a>
                 <a class="button button-quiet" href="#/order">Order another</a>`
              : `<a class="button button-primary" href="#/order">Order my retainers ${icon('arrow')}</a>`
          }
        </div>
        <div class="trust-row">
          <span>${icon('package')} Free impression kit</span>
          <span>${icon('clock')} 5-7 day lab</span>
          <span>${icon('shield')} 12-month fit guarantee</span>
        </div>
      </div>
      <div class="hero-art-wrap">
        ${heroArt(active)}
      </div>
    </section>

    <section class="shell dashboard-grid">
      ${active ? trackingCard(active) : emptyTrackingCard()}
      ${activityCard()}
    </section>

    <section class="shell habit-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">The HoldThatSmile routine</p>
          <h2>Small habits. <em>A longer smile.</em></h2>
        </div>
        <p class="section-aside">Clear retainers do their best work when they get a little care in return. Three minutes a day is plenty.</p>
      </div>
      <div class="habit-grid">
        <article class="habit-card">
          <span class="habit-number">01</span>
          <span class="habit-icon">${icon('smile')}</span>
          <h3>Rinse, don't scrub.</h3>
          <p>Cool water and a soft brush keep the plastic clear. Hot water is the one thing your retainer cannot handle.</p>
        </article>
        <article class="habit-card habit-card-deep">
          <span class="habit-number">02</span>
          <span class="habit-icon">${icon('sparkle')}</span>
          <h3>Give it a nightly soak.</h3>
          <p>Use a retainer-safe cleanser while you brush. Skip the mint toothpaste, which can dull the surface.</p>
        </article>
        <article class="habit-card">
          <span class="habit-number">03</span>
          <span class="habit-icon">${icon('shield')}</span>
          <h3>Keep the case close.</h3>
          <p>The safest place for a retainer is its case. Napkins and back pockets are where smiles go missing.</p>
          <a class="text-link" href="#/account">Your care notes ${icon('arrow')}</a>
        </article>
      </div>
    </section>

    <section class="shell refresh-banner">
      <div class="refresh-copy">
        <p class="eyebrow">A spare is self-care</p>
        <h2>One retainer is good.<br /><em>A backup is better.</em></h2>
        <p>${deliveredCount ? 'You already have a set in rotation. A second pair means never choosing between clean and ready.' : 'Keep one at home and one in your bag. Your future self will thank you.'}</p>
        <a class="button button-light" href="#/order">See retainer options ${icon('arrow')}</a>
      </div>
      <div class="refresh-stat">
        <span class="refresh-big">$95</span>
        <span>single arch, kit included</span>
        <div class="refresh-rule"></div>
        <span class="refresh-small">${icon('package')} Free delivery both ways</span>
        <span class="refresh-small">${icon('clock')} Most kits ship in 1 business day</span>
      </div>
    </section>
  `;
}

function heroArt(order) {
  const stage = order ? stageInfo(order.stage) : stageInfo(4);
  return `
    <div class="hero-art">
      <div class="art-orbit orbit-one"></div>
      <div class="art-orbit orbit-two"></div>
      ${retainerArt()}
      <div class="floating-card floating-status">
        <span class="float-icon">${icon(stage.icon)}</span>
        <span class="float-copy">
          <small>${order ? escapeHtml(order.id) : 'YOUR NEXT SET'}</small>
          <strong>${order ? escapeHtml(stage.short) : 'Made for you'}</strong>
        </span>
        <span class="live-dot"></span>
      </div>
      <div class="floating-card floating-price">
        <span>
          <small>Complete set from</small>
          <strong>$95</strong>
        </span>
        <span class="float-note">Free kit<br />+ shipping</span>
      </div>
      <div class="art-caption">
        <span class="mini-star">${icon('spark')}</span>
        <span>Clear, comfortable,<br />made in California</span>
      </div>
    </div>
  `;
}

function retainerArt() {
  return `
    <svg class="retainer-art" viewBox="0 0 460 430" role="img" aria-label="A clear dental retainer resting on a soft green pedestal">
      <defs>
        <linearGradient id="halo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e7f3ec" />
          <stop offset="0.55" stop-color="#c4e1d6" />
          <stop offset="1" stop-color="#a8d3c5" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="0.45" stop-color="#f3fffb" stop-opacity="0.56" />
          <stop offset="1" stop-color="#b5ded3" stop-opacity="0.68" />
        </linearGradient>
        <linearGradient id="pedestal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f8f4ea" />
          <stop offset="1" stop-color="#e6ddcf" />
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <circle cx="246" cy="190" r="156" fill="url(#halo)" />
      <circle cx="246" cy="190" r="156" fill="none" stroke="#ffffff" stroke-opacity="0.52" stroke-dasharray="1 8" stroke-width="2" />
      <path d="M102 357c28-20 70-30 138-30s118 10 142 30" fill="none" stroke="#d8cfbf" stroke-width="2" />
      <ellipse cx="242" cy="349" rx="122" ry="22" fill="#b9cfc4" opacity="0.33" filter="url(#shadow)" />
      <path d="M126 340h226l-19 30c-4 7-12 11-20 11H165c-8 0-16-4-20-11l-19-30Z" fill="url(#pedestal)" />
      <path d="M126 340h226" stroke="#ffffff" stroke-width="2" opacity="0.8" />
      <g transform="rotate(-7 236 210)">
        <path d="M118 202c-4-88 226-92 224 0-2 64-40 112-78 117-17 2-25-18-28-38-4 20-12 40-29 38-39-5-86-53-89-117Z" fill="url(#glass)" stroke="#ffffff" stroke-width="3.5" />
        <path d="M140 201c3-64 186-68 182 0" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.8" />
        <path d="M158 249c25 24 117 27 146 0" fill="none" stroke="#ffffff" stroke-opacity="0.65" stroke-width="2" />
        <path d="M154 191c11-30 38-45 74-47" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.65" filter="url(#soft)" />
        <g fill="#ffffff" opacity="0.62">
          <circle cx="205" cy="160" r="2.4" />
          <circle cx="216" cy="151" r="1.4" />
          <circle cx="301" cy="224" r="1.8" />
          <circle cx="312" cy="237" r="2.2" />
          <circle cx="174" cy="233" r="1.5" />
        </g>
        <path d="M164 278c14 11 31 17 54 18" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.5" />
      </g>
      <g transform="translate(355 98) rotate(8)">
        <rect width="46" height="28" rx="9" fill="#fffdf8" opacity="0.9" />
        <path d="M11 15h24" stroke="#2f6f68" stroke-width="2" stroke-linecap="round" opacity="0.55" />
        <path d="M16 20h14" stroke="#2f6f68" stroke-width="1.4" stroke-linecap="round" opacity="0.35" />
      </g>
      <g fill="#e87b62">
        <path d="m119 99 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" opacity="0.9" />
        <path d="m388 250 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" opacity="0.7" />
      </g>
      <g stroke="#2f6f68" stroke-width="2" stroke-linecap="round" opacity="0.5">
        <path d="M95 176v18M86 185h18" />
        <path d="M372 315v12M366 321h12" />
      </g>
    </svg>
  `;
}

function trackingCard(order) {
  return `
    <article class="tracking-card panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Your current order</p>
          <h2>${escapeHtml(order.productName)} <span>· ${escapeHtml(order.arches.toLowerCase())}</span></h2>
        </div>
        ${stageChip(order)}
      </div>
      <div class="tracking-meta">
        <span>${escapeHtml(order.id)}</span>
        <span class="meta-divider"></span>
        <span>Placed ${shortDate(order.createdAt)}</span>
        <span class="meta-divider"></span>
        <span>${escapeHtml(orderEta(order))}</span>
      </div>
      <div class="mini-track-wrap">
        <div class="progress-track" aria-label="Order progress: ${order.stage} of 7">
          <span class="progress-fill" style="width: ${progressPercent(order)}%"></span>
        </div>
        <div class="mini-steps">
          ${STAGES.map((stage) => {
            const state = stage.n < order.stage ? 'done' : stage.n === order.stage ? 'current' : 'future';
            return `
              <div class="mini-step ${state}">
                <span class="mini-node">${state === 'done' ? icon('check') : stage.n}</span>
                <span class="mini-label">${escapeHtml(stage.short)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="tracking-foot">
        <div class="tracking-note">
          <span class="note-icon">${icon(stageInfo(order.stage).icon)}</span>
          <p><strong>${escapeHtml(stageInfo(order.stage).customerTitle)}.</strong> ${escapeHtml(stageInfo(order.stage).detail)}</p>
        </div>
        <a class="button button-dark button-small" href="#/orders/${order.id}">View order ${icon('arrow')}</a>
      </div>
    </article>
  `;
}

function emptyTrackingCard() {
  return `
    <article class="tracking-card panel empty-panel">
      <div class="empty-mark">${icon('package')}</div>
      <p class="eyebrow">No order in motion</p>
      <h2>Your next retainer starts here.</h2>
      <p>Choose an option and we will send a free impression kit with a prepaid return label.</p>
      <a class="button button-primary" href="#/order">Start an order ${icon('arrow')}</a>
    </article>
  `;
}

function activityCard() {
  const updates = store.notificationsForCustomer().slice(0, 3);
  return `
    <aside class="activity-card panel">
      <div class="panel-head compact">
        <div>
          <p class="eyebrow">Latest updates</p>
          <h2>From the lab</h2>
        </div>
        <button class="icon-button small" type="button" data-action="toggle-notifications" aria-label="Open all updates">${icon('bell')}</button>
      </div>
      <div class="activity-list">
        ${
          updates.length
            ? updates
                .map(
                  (item) => `
                  <a class="activity-item" href="#/orders/${item.orderId}">
                    <span class="activity-date">${shortDate(item.date)}</span>
                    <span class="activity-line"><span class="activity-dot ${item.read ? '' : 'unread'}"></span></span>
                    <span class="activity-copy">
                      <strong>${escapeHtml(item.title)}</strong>
                      <span>${escapeHtml(item.body)}</span>
                    </span>
                  </a>
                `,
                )
                .join('')
            : '<p class="empty-copy">No updates yet. Your lab notes will show up here.</p>'
        }
      </div>
      <div class="care-contact">
        <span class="care-avatar">${icon('user')}</span>
        <div>
          <small>Questions about fit?</small>
          <strong>Your care team is here.</strong>
          <a href="mailto:care@holdthatsmile.com">care@holdthatsmile.com</a>
        </div>
      </div>
    </aside>
  `;
}

function renderOrders() {
  const orders = store.ordersForCustomer();
  const active = orders.filter(isOpen);
  const delivered = orders.filter((order) => order.stage === 7);
  return `
    <section class="shell page-head">
      <div>
        <p class="eyebrow">Your smile archive</p>
        <h1>My orders</h1>
        <p class="page-lede">Every kit, lab update and delivery in one place. Reorder a favourite in a couple of clicks.</p>
      </div>
      <a class="button button-primary" href="#/order">New order ${icon('plus')}</a>
    </section>
    <section class="shell order-summary-row">
      <div class="summary-stat"><span class="summary-icon">${icon('lab')}</span><div><strong>${active.length}</strong><span>In motion</span></div></div>
      <div class="summary-stat"><span class="summary-icon">${icon('smile')}</span><div><strong>${delivered.length}</strong><span>Delivered</span></div></div>
      <div class="summary-stat"><span class="summary-icon">${icon('shield')}</span><div><strong>12 mo</strong><span>Fit guarantee</span></div></div>
    </section>
    <section class="shell orders-list">
      ${
        orders.length
          ? orders.map((order) => orderListCard(order)).join('')
          : `<div class="empty-state panel">${icon('package')}<h2>No orders yet</h2><p>Your first retainer is waiting to be made.</p><a class="button button-primary" href="#/order">Start an order</a></div>`
      }
    </section>
  `;
}

function orderListCard(order) {
  const timeline = STAGES.map((stage) => {
    const state = stage.n < order.stage ? 'done' : stage.n === order.stage ? 'current' : 'future';
    return `<span class="order-track-seg ${state}" title="${escapeHtml(stage.short)}"></span>`;
  }).join('');
  return `
    <article class="order-list-card panel">
      <div class="order-card-top">
        <div class="order-identity">
          <span class="order-thumb">${icon(stageInfo(order.stage).icon)}</span>
          <div>
            <span class="order-number">${escapeHtml(order.id)}</span>
            <h2>${escapeHtml(order.productName)}</h2>
            <p>${escapeHtml(order.arches)} · placed ${shortDate(order.createdAt)}</p>
          </div>
        </div>
        ${stageChip(order)}
      </div>
      <div class="order-card-middle">
        <div class="order-progress-copy">
          <span>${escapeHtml(orderEta(order))}</span>
          <span>${order.stage === 7 ? 'Complete' : `Step ${order.stage} of ${STAGES.length}`}</span>
        </div>
        <div class="segmented-track">${timeline}</div>
      </div>
      <div class="order-card-bottom">
        <div class="order-price"><strong>${money(order.total)}</strong><span>${paymentIsDue(order) ? 'Payment review' : 'Paid in full'}</span></div>
        <div class="order-actions">
          <a class="button button-quiet button-small" href="#/orders/${order.id}">View order</a>
          ${
            order.stage === 7
              ? `<button class="button button-dark button-small" type="button" data-action="reorder" data-product="${order.productId}">Buy again ${icon('arrow')}</button>`
              : `<a class="button button-dark button-small" href="#/orders/${order.id}">Track ${icon('arrow')}</a>`
          }
        </div>
      </div>
    </article>
  `;
}

function renderOrderDetail() {
  const order = store.getOrder(route.id);
  if (!order || order.customerId !== customer.id) return renderNotFound();
  const next = nextStage(order);
  const flash = flashOrderId === order.id;
  return `
    <section class="shell detail-head">
      <a class="back-link" href="#/orders">${icon('back')} All orders</a>
      <div class="detail-title-row">
        <div>
          <p class="eyebrow">${escapeHtml(order.id)} · placed ${fullDate(order.createdAt)}</p>
          <h1>${escapeHtml(order.productName)}, <em>${order.stage === 7 ? 'delivered.' : 'on its way to you.'}</em></h1>
          <p class="page-lede">${escapeHtml(stageInfo(order.stage).customerTitle)}. ${escapeHtml(stageInfo(order.stage).detail)}</p>
        </div>
        ${stageChip(order)}
      </div>
      ${
        flash
          ? `<div class="flash-banner">${icon('check')}<div><strong>Order placed.</strong> We are preparing your impression kit. You can follow every step right here.</div><button class="icon-button small" type="button" data-action="dismiss-flash" aria-label="Dismiss">${icon('close')}</button></div>`
          : ''
      }
    </section>

    <section class="shell order-detail-grid">
      <div class="detail-main">
        <article class="panel timeline-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">The journey</p>
              <h2>From kit to keepsake</h2>
            </div>
            <span class="progress-badge">${order.stage} / ${STAGES.length} complete</span>
          </div>
          <div class="progress-track large" aria-hidden="true"><span class="progress-fill" style="width: ${progressPercent(order)}%"></span></div>
          <ol class="order-timeline">
            ${STAGES.map((stage) => {
              const event = order.events.find((item) => item.stage === stage.n);
              const state = stage.n < order.stage ? 'done' : stage.n === order.stage ? 'current' : 'future';
              return `
                <li class="timeline-item ${state}">
                  <span class="timeline-marker">${state === 'done' ? icon('check') : stage.n}</span>
                  <div class="timeline-content">
                    <div class="timeline-title-row">
                      <h3>${escapeHtml(stage.label)}</h3>
                      <span class="timeline-date">${event ? longDate(event.date) : state === 'current' ? 'Happening now' : STAGE_WINDOWS[stage.n]}</span>
                    </div>
                    <p>${event ? escapeHtml(event.detail) : escapeHtml(stage.detail)}</p>
                  </div>
                </li>
              `;
            }).join('')}
          </ol>
          ${
            next
              ? `<div class="next-step-note"><span class="next-icon">${icon(next.icon)}</span><div><small>What happens next</small><strong>${escapeHtml(next.label)}</strong><p>${escapeHtml(next.detail)}</p></div></div>`
              : `<div class="next-step-note complete"><span class="next-icon">${icon('smile')}</span><div><small>All done</small><strong>Your retainers are home.</strong><p>Questions about fit? Your 12-month guarantee has you covered.</p></div></div>`
          }
        </article>

        <article class="panel help-panel">
          <div>
            <p class="eyebrow">Need a hand?</p>
            <h2>Talk to a real person.</h2>
            <p>Our care team knows retainers, not scripts. Send a note and we will reply within one business day.</p>
          </div>
          <div class="help-actions">
            <a class="button button-quiet" href="mailto:care@holdthatsmile.com?subject=Order%20${encodeURIComponent(order.id)}">${icon('mail')} Email care</a>
            <a class="button button-quiet" href="tel:+14155550141">${icon('phone')} Call the lab</a>
          </div>
        </article>
      </div>

      <aside class="detail-side">
        <article class="eta-card">
          <span class="eta-icon">${icon(order.stage === 7 ? 'smile' : 'truck')}</span>
          <p class="eyebrow">${order.stage === 7 ? 'Delivered' : 'Estimated arrival'}</p>
          <h2>${escapeHtml(order.shipping.eta ? longDate(order.shipping.eta) : 'To be confirmed')}</h2>
          <p>${order.stage === 7 ? `Left with you on ${fullDate(order.shipping.deliveredAt)}.` : 'We will email you the moment your retainers leave the lab.'}</p>
          <div class="eta-rule"></div>
          <div class="eta-line"><span>Order total</span><strong>${money(order.total)}</strong></div>
          <div class="eta-line"><span>Shipping</span><strong>Free</strong></div>
        </article>

        <article class="panel info-card">
          <div class="info-card-head"><span class="info-icon">${icon('package')}</span><h2>Impression kit</h2></div>
          ${impressionDetails(order)}
        </article>

        <article class="panel info-card">
          <div class="info-card-head"><span class="info-icon">${icon('truck')}</span><h2>Delivery</h2></div>
          <p class="muted-copy">${order.stage >= 6 ? 'Your finished retainers are on the move.' : 'Packed with care after your final quality check.'}</p>
          ${
            order.shipping.tracking
              ? `<div class="tracking-code"><span>${escapeHtml(order.shipping.carrier)}</span><strong>${escapeHtml(order.shipping.tracking)}</strong><button class="icon-button small" type="button" data-action="copy-tracking" data-code="${escapeHtml(order.shipping.tracking)}" aria-label="Copy delivery tracking">${icon('copy')}</button></div>`
              : '<p class="muted-copy small">Tracking appears here after your order ships.</p>'
          }
          <address>
            ${escapeHtml(order.shipping.name)}<br />
            ${escapeHtml(order.shipping.address1)}${order.shipping.address2 ? `<br />${escapeHtml(order.shipping.address2)}` : ''}<br />
            ${escapeHtml(order.shipping.city)}, ${escapeHtml(order.shipping.state)} ${escapeHtml(order.shipping.zip)}
          </address>
        </article>

        <article class="panel info-card">
          <div class="info-card-head"><span class="info-icon">${icon('card')}</span><h2>Payment</h2></div>
          <div class="payment-line">
            <span>${escapeHtml(order.payment.brand)} ending ${escapeHtml(order.payment.last4)}</span>
            ${paymentChip(order)}
          </div>
          <div class="payment-line"><span>Charged</span><strong>${money(order.payment.amount)}</strong></div>
          <p class="muted-copy small">${paymentIsDue(order) ? 'Our team is reviewing this authorization. We will not release the kit until it clears.' : `Paid ${fullDate(order.payment.paidAt)}. Need a receipt? Email care.`}</p>
        </article>

        <button class="button button-primary button-block" type="button" data-action="reorder" data-product="${order.productId}">Order this again ${icon('arrow')}</button>
      </aside>
    </section>
  `;
}

function impressionDetails(order) {
  const impression = order.impression;
  let status = 'Preparing your kit';
  let detail = 'We are packing your putty, trays and prepaid return label.';
  if (impression.method === 'digital_scan') {
    status = 'Digital scan on file';
    detail = 'We will use the scan already shared with our lab. No kit needed.';
  } else if (impression.status === 'shipped') {
    status = 'Kit on its way';
    detail = `Sent via ${impression.carrier}. Use the prepaid label to send it back.`;
  } else if (impression.status === 'received') {
    status = 'Impressions received';
    detail = 'Your impressions passed our digital scan review.';
  }
  return `
    <p class="info-status">${escapeHtml(status)}</p>
    <p class="muted-copy">${escapeHtml(detail)}</p>
    ${
      impression.tracking
        ? `<div class="tracking-code"><span>${escapeHtml(impression.carrier)}</span><strong>${escapeHtml(impression.tracking)}</strong><button class="icon-button small" type="button" data-action="copy-tracking" data-code="${escapeHtml(impression.tracking)}" aria-label="Copy kit tracking">${icon('copy')}</button></div>`
        : ''
    }
    ${impression.deliveredAt ? `<p class="info-footnote">Delivered ${fullDate(impression.deliveredAt)}</p>` : ''}
  `;
}

function renderOrderWizard() {
  const product = currentProduct();
  return `
    <section class="shell checkout-shell">
      <div class="checkout-head">
        <a class="back-link" href="#/overview">${icon('back')} Back to your smile</a>
        <p class="eyebrow">A fresh set, made for you</p>
        <h1>Order your retainers</h1>
        <p class="page-lede">Free impression kit. Free shipping both ways. A real human checks every fit.</p>
      </div>

      <div class="checkout-steps" aria-label="Checkout progress">
        ${[
          ['Choose your set', 1],
          ['Your details', 2],
          ['Payment', 3],
        ]
          .map(([label, step]) => `
            <div class="checkout-step ${orderStep === step ? 'is-active' : ''} ${orderStep > step ? 'is-done' : ''}">
              <span class="step-number">${orderStep > step ? icon('check') : step}</span>
              <span class="step-label">${label}</span>
            </div>
          `)
          .join('')}
      </div>

      <div class="checkout-grid">
        <div class="checkout-main">
          ${orderStep === 1 ? renderProductStep() : orderStep === 2 ? renderDetailsStep() : renderPaymentStep(product)}
        </div>
        <aside class="checkout-side">
          ${renderOrderSummary(product)}
        </aside>
      </div>
    </section>
  `;
}

function renderProductStep() {
  return `
    <article class="panel checkout-panel">
      <div class="panel-head">
        <div><p class="eyebrow">Step one</p><h2>How much smile are we protecting?</h2></div>
        <span class="soft-badge">Most people choose The Pair</span>
      </div>
      <div class="product-options">
        ${PRODUCTS.map(
          (product) => `
          <label class="product-option ${orderDraft.productId === product.id ? 'is-selected' : ''}">
            <input type="radio" name="product" value="${product.id}" ${orderDraft.productId === product.id ? 'checked' : ''} />
            <span class="product-radio"></span>
            <span class="product-option-copy">
              <span class="product-kicker">${escapeHtml(product.kicker)} ${product.popular ? '<span class="popular-badge">Most popular</span>' : ''}</span>
              <span class="product-option-title">${escapeHtml(product.name)} <strong>${money(product.price)}</strong></span>
              <span class="product-desc">${escapeHtml(product.description)}</span>
              <span class="product-includes">${product.includes.map((item) => `<span>${icon('check')} ${escapeHtml(item)}</span>`).join('')}</span>
            </span>
          </label>
        `,
        ).join('')}
      </div>
      <div class="checkout-foot">
        <span class="checkout-note">${icon('shield')} Every order includes our 12-month fit guarantee.</span>
        <button class="button button-primary" type="button" data-action="order-next">Continue to details ${icon('arrow')}</button>
      </div>
    </article>
  `;
}

function renderDetailsStep() {
  return `
    <article class="panel checkout-panel">
      <div class="panel-head">
        <div><p class="eyebrow">Step two</p><h2>Where should we send the kit?</h2></div>
      </div>
      <form id="order-details-form" class="form-stack" novalidate>
        <div class="field-grid two">
          <label class="field"><span>Full name</span><input name="name" type="text" autocomplete="name" value="${escapeHtml(orderDraft.name)}" required /></label>
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" value="${escapeHtml(orderDraft.email)}" required /></label>
        </div>
        <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" value="${escapeHtml(orderDraft.phone)}" required /></label>
        <label class="field"><span>Street address</span><input name="address1" type="text" autocomplete="address-line1" value="${escapeHtml(orderDraft.address1)}" required /></label>
        <label class="field"><span>Apartment, suite, etc. <em>optional</em></span><input name="address2" type="text" autocomplete="address-line2" value="${escapeHtml(orderDraft.address2)}" /></label>
        <div class="field-grid three">
          <label class="field"><span>City</span><input name="city" type="text" autocomplete="address-level2" value="${escapeHtml(orderDraft.city)}" required /></label>
          <label class="field"><span>State</span><input name="state" type="text" maxlength="2" autocomplete="address-level1" value="${escapeHtml(orderDraft.state)}" required /></label>
          <label class="field"><span>ZIP</span><input name="zip" type="text" inputmode="numeric" maxlength="10" autocomplete="postal-code" value="${escapeHtml(orderDraft.zip)}" required /></label>
        </div>
        <fieldset class="fieldset">
          <legend>Your impression kit</legend>
          <div class="kit-inline">
            <span class="choice-icon">${icon('package')}</span>
            <span class="kit-inline-copy"><strong>Free mail-in impression kit</strong><small>Putty, trays and a prepaid return label. We will send tracking the day it leaves the lab.</small></span>
            <span class="kit-tag">Included</span>
          </div>
        </fieldset>
        <label class="field"><span>Anything our lab should know? <em>optional</em></span><textarea name="notes" rows="3" placeholder="Fit notes, sensitivity, or the last set that felt off.">${escapeHtml(orderDraft.notes)}</textarea></label>
        <div class="checkout-foot form-foot">
          <button class="button button-quiet" type="button" data-action="order-back">${icon('back')} Back</button>
          <button class="button button-primary" type="submit">Continue to payment ${icon('arrow')}</button>
        </div>
      </form>
    </article>
  `;
}

function renderPaymentStep(product) {
  return `
    <article class="panel checkout-panel">
      <div class="panel-head">
        <div><p class="eyebrow">Step three</p><h2>Last step. Then we get to work.</h2></div>
        <span class="secure-badge">${icon('lock')} Secure demo checkout</span>
      </div>
      <div class="review-card">
        <span class="review-icon">${icon('package')}</span>
        <div>
          <span class="eyebrow">Delivering to</span>
          <strong>${escapeHtml(orderDraft.name)}</strong>
          <p>${escapeHtml(orderDraft.address1)}${orderDraft.address2 ? `, ${escapeHtml(orderDraft.address2)}` : ''}<br />${escapeHtml(orderDraft.city)}, ${escapeHtml(orderDraft.state)} ${escapeHtml(orderDraft.zip)}</p>
        </div>
        <button class="text-button" type="button" data-action="order-back">Edit</button>
      </div>
      <form id="payment-form" class="form-stack" novalidate>
        <label class="field"><span>Name on card</span><input name="cardName" type="text" autocomplete="cc-name" value="${escapeHtml(orderDraft.name)}" required /></label>
        <label class="field"><span>Card number</span><input name="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="19" required /></label>
        <div class="field-grid two">
          <label class="field"><span>Expiry</span><input name="expiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5" required /></label>
          <label class="field"><span>Security code</span><input name="cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" maxlength="4" required /></label>
        </div>
        <div class="demo-checkout-note">${icon('lock')} Demo checkout: no card is charged, and no payment details are stored. Use any test number, for example 4242 4242 4242 4242.</div>
        <div class="checkout-foot form-foot">
          <button class="button button-quiet" type="button" data-action="order-back">${icon('back')} Back</button>
          <button class="button button-primary" type="submit">Pay ${money(product.price)} & place order ${icon('arrow')}</button>
        </div>
      </form>
    </article>
  `;
}

function renderOrderSummary(product) {
  return `
    <article class="summary-card panel">
      <p class="eyebrow">Your order</p>
      <div class="summary-product">
        <span class="summary-thumb">${icon('smile')}</span>
        <div><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.arches)}</span></div>
        <strong>${money(product.price)}</strong>
      </div>
      <div class="summary-list">
        <div><span>Impression kit</span><strong>Free</strong></div>
        <div><span>Delivery both ways</span><strong>Free</strong></div>
        <div><span>12-month fit guarantee</span><strong>Included</strong></div>
        <div class="summary-total"><span>Total today</span><strong>${money(product.price)}</strong></div>
      </div>
      <div class="summary-promise">
        <span>${icon('shield')}</span>
        <p><strong>Made for your smile.</strong> If the fit is not right, we will remake it at no charge.</p>
      </div>
      <div class="summary-help">
        <span class="eyebrow">Questions?</span>
        <a href="tel:+14155550141">${icon('phone')} (415) 555-0141</a>
        <a href="mailto:care@holdthatsmile.com">${icon('mail')} care@holdthatsmile.com</a>
      </div>
    </article>
  `;
}

function renderAccount() {
  return `
    <section class="shell page-head account-head">
      <div>
        <p class="eyebrow">Your corner of HoldThatSmile</p>
        <h1>Account & care</h1>
        <p class="page-lede">Keep your details current so every kit and retainer lands where it should.</p>
      </div>
      <div class="member-chip">
        <span class="member-avatar">${escapeHtml(customer.firstName[0])}${escapeHtml(customer.lastName[0])}</span>
        <div><strong>${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</strong><span>Member since ${shortDate(customer.joined)}</span></div>
      </div>
    </section>
    <section class="shell account-grid">
      <form id="profile-form" class="account-main" novalidate>
        <article class="panel account-card">
          <div class="panel-head"><div><p class="eyebrow">Personal details</p><h2>How we reach you</h2></div><span class="soft-badge">${icon('shield')} Private</span></div>
          <div class="field-grid two">
            <label class="field"><span>First name</span><input name="firstName" type="text" value="${escapeHtml(customer.firstName)}" required /></label>
            <label class="field"><span>Last name</span><input name="lastName" type="text" value="${escapeHtml(customer.lastName)}" required /></label>
          </div>
          <div class="field-grid two">
            <label class="field"><span>Email</span><input name="email" type="email" value="${escapeHtml(customer.email)}" required /></label>
            <label class="field"><span>Phone</span><input name="phone" type="tel" value="${escapeHtml(customer.phone)}" /></label>
          </div>
        </article>
        <article class="panel account-card">
          <div class="panel-head"><div><p class="eyebrow">Shipping address</p><h2>Where kits land</h2></div></div>
          <label class="field"><span>Street address</span><input name="address1" type="text" value="${escapeHtml(customer.address.address1)}" /></label>
          <label class="field"><span>Apartment, suite, etc.</span><input name="address2" type="text" value="${escapeHtml(customer.address.address2 || '')}" /></label>
          <div class="field-grid three">
            <label class="field"><span>City</span><input name="city" type="text" value="${escapeHtml(customer.address.city)}" /></label>
            <label class="field"><span>State</span><input name="state" type="text" maxlength="2" value="${escapeHtml(customer.address.state)}" /></label>
            <label class="field"><span>ZIP</span><input name="zip" type="text" maxlength="10" value="${escapeHtml(customer.address.zip)}" /></label>
          </div>
        </article>
        <article class="panel account-card">
          <div class="panel-head"><div><p class="eyebrow">Lab notes</p><h2>A fit that remembers</h2></div></div>
          <label class="field"><span>Anything our lab should know?</span><textarea name="careNote" rows="3" placeholder="Fit quirks, grinding, sensitivity, or notes from your last set.">${escapeHtml(customer.careNote)}</textarea></label>
        </article>
        <article class="panel account-card">
          <div class="panel-head"><div><p class="eyebrow">Notifications</p><h2>Just the useful stuff</h2></div></div>
          <div class="toggle-list">
            <label class="toggle-row"><span><strong>Order and delivery updates</strong><small>Kit tracking, lab milestones and delivery day.</small></span><input type="checkbox" name="orderUpdates" ${customer.preferences.orderUpdates ? 'checked' : ''} /><span class="toggle-ui"></span></label>
            <label class="toggle-row"><span><strong>Lab notes and fit reminders</strong><small>Occasional care notes from our lab team.</small></span><input type="checkbox" name="labNotes" ${customer.preferences.labNotes ? 'checked' : ''} /><span class="toggle-ui"></span></label>
            <label class="toggle-row"><span><strong>New products and offers</strong><small>Maybe twice a season. Never a flood.</small></span><input type="checkbox" name="productNews" ${customer.preferences.productNews ? 'checked' : ''} /><span class="toggle-ui"></span></label>
          </div>
        </article>
        <div class="account-save">
          <span class="muted-copy small">Changes apply to future orders and kits.</span>
          <button class="button button-primary" type="submit">Save changes ${icon('check')}</button>
        </div>
      </form>
      <aside class="account-side">
        <article class="panel side-card">
          <div class="panel-head compact"><div><p class="eyebrow">Payment method</p><h2>On file</h2></div>${icon('card')}</div>
          <div class="mini-card">
            <span class="mini-card-brand">${escapeHtml(customer.payment.brand)}</span>
            <span class="mini-card-chip"></span>
            <strong>•••• •••• •••• ${escapeHtml(customer.payment.last4)}</strong>
            <span class="mini-card-name">${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</span>
            <span class="mini-card-exp">${escapeHtml(customer.payment.expiry)}</span>
          </div>
          <button class="button button-quiet button-block" type="button" data-action="demo-card">Update card ${icon('arrow')}</button>
          <p class="muted-copy small">Demo card on file. Real payments are processed by the payment provider.</p>
        </article>
        <article class="panel side-card">
          <div class="panel-head compact"><div><p class="eyebrow">Fit guarantee</p><h2>12 months, covered</h2></div>${icon('shield')}</div>
          <p class="muted-copy">If your retainer stops fitting within a year, we will remake it. One less thing to think about.</p>
          <a class="text-link" href="mailto:care@holdthatsmile.com?subject=Fit%20guarantee">Ask about your guarantee ${icon('arrow')}</a>
        </article>
        <article class="panel side-card side-card-tint">
          <span class="side-tint-icon">${icon('smile')}</span>
          <h2>Your smile, in numbers</h2>
          <div class="smile-stats">
            <div><strong>${store.ordersForCustomer().length}</strong><span>Orders</span></div>
            <div><strong>${store.ordersForCustomer().filter((order) => order.stage === 7).length}</strong><span>Delivered</span></div>
            <div><strong>${store.notificationsForCustomer().length}</strong><span>Updates</span></div>
          </div>
        </article>
      </aside>
    </section>
  `;
}

function renderAdminLogin() {
  return `
    <section class="shell admin-login">
      <div class="admin-login-copy">
        <a class="back-link" href="#/overview">${icon('back')} Back to customer view</a>
        <p class="eyebrow eyebrow-light">HoldThatSmile operations</p>
        <h1>Every smile,<br /><em>accounted for.</em></h1>
        <p class="admin-lede">Orders, impressions, lab progress and payments in one calm workspace. Built for the team behind the smile.</p>
        <div class="admin-proof-grid">
          <div><strong>${store.metrics().openOrders}</strong><span>Open orders</span></div>
          <div><strong>${store.metrics().inLab}</strong><span>In the lab</span></div>
          <div><strong>${money(store.metrics().revenue)}</strong><span>Collected</span></div>
        </div>
        <p class="admin-footnote">${icon('shield')} Staff access is role-gated in production. This demo uses a shared PIN.</p>
      </div>
      <div class="login-card">
        <span class="login-lock">${icon('lock')}</span>
        <p class="eyebrow">Staff portal</p>
        <h2>Sign in to operations</h2>
        <p class="login-sub">Use your four-digit lab PIN to continue.</p>
        <form id="admin-login-form" class="form-stack" novalidate>
          <label class="field"><span>Staff PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="one-time-code" placeholder="••••" required /></label>
          <button class="button button-primary button-block" type="submit">Open operations ${icon('arrow')}</button>
        </form>
        <div class="demo-hint">
          <span>Demo access</span>
          <button class="text-button" type="button" data-action="fill-pin">Use PIN 2468</button>
        </div>
        <div class="login-divider"></div>
        <div class="login-meta"><span>${icon('user')} Nora Patel</span><span>Lab operations</span></div>
      </div>
    </section>
  `;
}

function renderAdmin() {
  const metrics = store.metrics();
  const tabs = [
    ['orders', 'Orders', store.getState().orders.length],
    ['production', 'Production', metrics.openOrders],
    ['customers', 'Customers', metrics.customers],
    ['payments', 'Payments', metrics.pendingPayments ? `${metrics.pendingPayments} due` : 'Clear'],
  ];
  return `
    <section class="shell admin-head">
      <div class="admin-title">
        <p class="eyebrow">Operations · San Francisco lab</p>
        <h1>${greeting()}, Nora.</h1>
        <p class="page-lede">Here is the room today: ${metrics.openOrders} open orders, ${metrics.inLab} in the lab, ${metrics.pendingPayments} payment${metrics.pendingPayments === 1 ? '' : 's'} to review.</p>
      </div>
      <div class="admin-session">
        <div class="staff-chip"><span class="staff-avatar">NP</span><div><strong>${escapeHtml(store.getState().staff.name)}</strong><span>${escapeHtml(store.getState().staff.role)}</span></div></div>
        <button class="button button-quiet button-small" type="button" data-action="admin-signout">${icon('logout')} Sign out</button>
      </div>
    </section>
    <section class="shell admin-stat-grid">
      <div class="admin-stat"><span class="stat-icon">${icon('package')}</span><div><small>Open orders</small><strong>${metrics.openOrders}</strong><span>Across all customers</span></div></div>
      <div class="admin-stat"><span class="stat-icon mint">${icon('lab')}</span><div><small>In the lab</small><strong>${metrics.inLab}</strong><span>Forming + quality</span></div></div>
      <div class="admin-stat"><span class="stat-icon coral">${icon('card')}</span><div><small>Collected</small><strong>${money(metrics.revenue)}</strong><span>${metrics.pendingPayments} payment review${metrics.pendingPayments === 1 ? '' : 's'}</span></div></div>
      <div class="admin-stat"><span class="stat-icon sand">${icon('clock')}</span><div><small>Avg. turnaround</small><strong>${metrics.avgTurnaround ?? '—'} <em>days</em></strong><span>Order to delivery</span></div></div>
    </section>
    <section class="shell admin-workspace">
      <div class="admin-tabs" role="tablist" aria-label="Operations sections">
        ${tabs.map(([key, label, count]) => `<button class="admin-tab ${adminTab === key ? 'is-active' : ''}" type="button" role="tab" aria-selected="${adminTab === key}" data-action="admin-tab" data-tab="${key}">${label} <span>${count}</span></button>`).join('')}
      </div>
      ${
        adminTab === 'orders'
          ? renderAdminOrders()
          : adminTab === 'production'
            ? renderAdminProduction()
            : adminTab === 'customers'
              ? renderAdminCustomers()
              : renderAdminPayments()
      }
    </section>
  `;
}

function renderAdminOrders() {
  const filters = [
    ['all', 'All orders'],
    ['intake', 'Intake'],
    ['lab', 'In the lab'],
    ['quality', 'Quality'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered'],
  ];
  const orders = filteredAdminOrders();
  return `
    <div class="admin-panel panel">
      <div class="admin-toolbar">
        <div class="filter-row">
          ${filters.map(([key, label]) => `<button class="filter-chip ${adminFilter === key ? 'is-active' : ''}" type="button" data-action="admin-filter" data-filter="${key}">${label}</button>`).join('')}
        </div>
        <div class="admin-tools">
          <label class="search-field">${icon('search')}<input id="admin-search" type="search" placeholder="Search orders or customers" aria-label="Search orders or customers" /></label>
          <button class="button button-quiet button-small" type="button" data-action="export">${icon('download')} Export</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Customer</th><th>Order</th><th>Item</th><th>Stage</th><th>ETA</th><th>Payment</th><th><span class="sr-only">Action</span></th></tr></thead>
          <tbody id="admin-order-body">
            ${
              orders.length
                ? orders.map((order) => {
                    const person = store.getState().customers.find((item) => item.id === order.customerId);
                    const search = `${person?.firstName} ${person?.lastName} ${order.id} ${order.productName} ${person?.email}`.toLowerCase();
                    return `
                      <tr class="admin-order-row" data-searchable="${escapeHtml(search)}">
                        <td><div class="table-person"><span class="table-avatar">${escapeHtml(person?.firstName?.[0] || '?')}${escapeHtml(person?.lastName?.[0] || '')}</span><div><strong>${escapeHtml(person?.firstName || '')} ${escapeHtml(person?.lastName || '')}</strong><span>${escapeHtml(person?.email || '')}</span></div></div></td>
                        <td><strong class="mono">${escapeHtml(order.id)}</strong></td>
                        <td><span>${escapeHtml(order.productName)}</span><small>${escapeHtml(order.arches)}</small></td>
                        <td>${stageChip(order)}</td>
                        <td><span>${shortDate(order.shipping.eta)}</span></td>
                        <td>${paymentChip(order)}</td>
                        <td><button class="table-open" type="button" data-action="open-admin-order" data-id="${order.id}">Open ${icon('chevron')}</button></td>
                      </tr>
                    `;
                  }).join('')
                : `<tr><td colspan="7"><div class="table-empty">No orders in this view.</div></td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div class="table-foot"><span id="admin-search-count">${orders.length} order${orders.length === 1 ? '' : 's'}</span><span>${icon('shield')} Admin actions are recorded in the demo audit log.</span></div>
    </div>
  `;
}

function filteredAdminOrders() {
  const all = store
    .getState()
    .orders.slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const byFilter = {
    all: () => true,
    intake: (order) => order.stage <= 3,
    lab: (order) => order.stage === 4 || order.stage === 5,
    quality: (order) => order.stage === 5,
    shipped: (order) => order.stage === 6,
    delivered: (order) => order.stage === 7,
  };
  return all.filter(byFilter[adminFilter] || byFilter.all);
}

function renderAdminProduction() {
  const columns = [
    ['Intake', 'Kit prep + impressions', [1, 2, 3]],
    ['Forming', 'In the lab', [4]],
    ['Quality', 'Final check', [5]],
    ['Out the door', 'Shipped + delivered', [6, 7]],
  ];
  return `
    <div class="production-board">
      ${columns
        .map(([label, sub, stages]) => {
          const orders = store.getState().orders.filter((order) => stages.includes(order.stage));
          return `
            <section class="production-column">
              <div class="production-col-head"><div><h2>${label}</h2><span>${sub}</span></div><strong>${orders.length}</strong></div>
              <div class="production-cards">
                ${
                  orders.length
                    ? orders.map((order) => {
                        const person = store.getState().customers.find((item) => item.id === order.customerId);
                        return `
                          <button class="production-card" type="button" data-action="open-admin-order" data-id="${order.id}">
                            <span class="production-top"><strong>${escapeHtml(order.id)}</strong>${paymentIsDue(order) ? '<span class="tiny-alert">Payment due</span>' : ''}</span>
                            <span class="production-name">${escapeHtml(person?.firstName || '')} ${escapeHtml(person?.lastName || '')}</span>
                            <span class="production-item">${escapeHtml(order.productName)} · ${escapeHtml(order.arches)}</span>
                            <span class="production-bottom"><span>${escapeHtml(stageInfo(order.stage).short)}</span><span>${shortDate(order.shipping.eta)}</span></span>
                          </button>
                        `;
                      }).join('')
                    : '<div class="production-empty">Nothing here right now.</div>'
                }
              </div>
            </section>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderAdminCustomers() {
  const customers = store.getState().customers;
  return `
    <div class="admin-panel panel">
      <div class="admin-toolbar">
        <div><p class="eyebrow">Customer book</p><h2>Every smile on file</h2></div>
        <label class="search-field">${icon('search')}<input id="admin-search" type="search" placeholder="Search customers" aria-label="Search customers" /></label>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Lifetime value</th><th>Member since</th><th>Last order</th></tr></thead>
          <tbody>
            ${customers.map((person) => {
              const orders = store.getState().orders.filter((order) => order.customerId === person.id);
              const paid = orders.filter((order) => order.payment.status === 'paid').reduce((sum, order) => sum + order.payment.amount, 0);
              const latest = orders.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
              const search = `${person.firstName} ${person.lastName} ${person.email}`.toLowerCase();
              return `
                <tr data-searchable="${escapeHtml(search)}">
                  <td><div class="table-person"><span class="table-avatar">${escapeHtml(person.firstName[0])}${escapeHtml(person.lastName[0])}</span><div><strong>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)}</strong><span>${escapeHtml(person.address.city)}, ${escapeHtml(person.address.state)}</span></div></div></td>
                  <td><span>${escapeHtml(person.email)}</span><small>${escapeHtml(person.phone)}</small></td>
                  <td><strong>${orders.length}</strong></td>
                  <td><strong>${money(paid)}</strong></td>
                  <td><span>${shortDate(person.joined)}</span></td>
                  <td><span>${latest ? escapeHtml(latest.id) : '—'}</span><small>${latest ? shortDate(latest.createdAt) : ''}</small></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-foot"><span id="admin-search-count">${customers.length} customers</span><span>${icon('shield')} Contact details are visible to staff only.</span></div>
    </div>
  `;
}

function renderAdminPayments() {
  const orders = store.getState().orders.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const collected = orders.filter((order) => order.payment.status === 'paid').reduce((sum, order) => sum + order.payment.amount, 0);
  const pending = orders.filter(paymentIsDue).reduce((sum, order) => sum + order.payment.amount, 0);
  return `
    <div class="payments-summary">
      <div class="payment-total"><span class="stat-icon coral">${icon('card')}</span><div><small>Collected</small><strong>${money(collected)}</strong><span>${orders.filter((order) => order.payment.status === 'paid').length} paid orders</span></div></div>
      <div class="payment-total"><span class="stat-icon sand">${icon('clock')}</span><div><small>Awaiting review</small><strong>${money(pending)}</strong><span>${orders.filter(paymentIsDue).length} order${orders.filter(paymentIsDue).length === 1 ? '' : 's'} to clear</span></div></div>
    </div>
    <div class="admin-panel panel">
      <div class="admin-toolbar">
        <div><p class="eyebrow">Payment ledger</p><h2>Every dollar, matched to an order</h2></div>
        <button class="button button-quiet button-small" type="button" data-action="export">${icon('download')} Export CSV</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th><span class="sr-only">Action</span></th></tr></thead>
          <tbody>
            ${orders.map((order) => {
              const person = store.getState().customers.find((item) => item.id === order.customerId);
              return `
                <tr>
                  <td><span>${shortDate(order.payment.paidAt || order.createdAt)}</span></td>
                  <td><strong class="mono">${escapeHtml(order.id)}</strong></td>
                  <td><span>${escapeHtml(person?.firstName || '')} ${escapeHtml(person?.lastName || '')}</span></td>
                  <td><span>${escapeHtml(order.payment.brand)} ···· ${escapeHtml(order.payment.last4)}</span></td>
                  <td><strong>${money(order.payment.amount)}</strong></td>
                  <td>${paymentIsDue(order) ? '<span class="pay-chip pay-chip-due">Review</span>' : '<span class="pay-chip pay-chip-paid">Paid</span>'}</td>
                  <td><button class="table-open" type="button" data-action="open-admin-order" data-id="${order.id}">Open ${icon('chevron')}</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-foot"><span>${orders.length} payment records</span><span>${icon('shield')} Demo ledger — no real charges.</span></div>
    </div>
  `;
}

function renderAdminModal() {
  const order = store.getOrder(modalOrderId);
  if (!order) {
    modalOrderId = null;
    return '';
  }
  const person = store.getState().customers.find((item) => item.id === order.customerId);
  const next = nextStage(order);
  return `
    <div class="modal-backdrop" data-modal-backdrop>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-head">
          <div>
            <p class="eyebrow">${escapeHtml(order.id)} · ${escapeHtml(person?.firstName || '')} ${escapeHtml(person?.lastName || '')}</p>
            <h2 id="modal-title">${escapeHtml(order.productName)} <span>${escapeHtml(order.arches)}</span></h2>
          </div>
          <button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="Close order details">${icon('close')}</button>
        </header>
        <div class="modal-body">
          <div class="modal-stage">
            <span class="modal-stage-icon">${icon(stageInfo(order.stage).icon)}</span>
            <div><small>Current stage · ${order.stage} of ${STAGES.length}</small><strong>${escapeHtml(stageInfo(order.stage).label)}</strong></div>
            ${stageChip(order)}
          </div>
          <div class="modal-grid">
            <div><small>Placed</small><strong>${fullDate(order.createdAt)}</strong></div>
            <div><small>Estimated arrival</small><strong>${order.shipping.eta ? longDate(order.shipping.eta) : '—'}</strong></div>
            <div><small>Order total</small><strong>${money(order.total)}</strong></div>
            <div><small>Payment</small><strong>${escapeHtml(order.payment.brand)} ···· ${escapeHtml(order.payment.last4)}</strong></div>
          </div>
          <div class="modal-section">
            <h3>Manufacturing timeline</h3>
            <div class="modal-timeline">
              ${order.events
                .slice()
                .sort((a, b) => a.stage - b.stage)
                .map((event) => `<div class="modal-event"><span class="modal-dot"></span><div><strong>${escapeHtml(event.title)}</strong><small>${fullDate(event.date)}</small><p>${escapeHtml(event.detail)}</p></div></div>`)
                .join('')}
            </div>
          </div>
          <div class="modal-grid">
            <div><small>Ship to</small><strong>${escapeHtml(order.shipping.name)}</strong><span>${escapeHtml(order.shipping.address1)}${order.shipping.address2 ? `, ${escapeHtml(order.shipping.address2)}` : ''}<br />${escapeHtml(order.shipping.city)}, ${escapeHtml(order.shipping.state)} ${escapeHtml(order.shipping.zip)}</span></div>
            <div><small>Contact</small><strong>${escapeHtml(person?.email || '')}</strong><span>${escapeHtml(person?.phone || '')}</span></div>
          </div>
          ${order.labNote ? `<div class="lab-note">${icon('lab')}<div><small>Lab note</small><p>${escapeHtml(order.labNote)}</p></div></div>` : ''}
          <div class="modal-actions">
            <span class="modal-audit">${icon('shield')} Action will be saved to this order</span>
            <div>
              ${paymentIsDue(order) ? `<button class="button button-quiet" type="button" data-action="collect-payment" data-id="${order.id}">${icon('card')} Mark payment received</button>` : ''}
              ${next ? `<button class="button button-primary" type="button" data-action="advance-order" data-id="${order.id}">Advance to ${escapeHtml(next.label)} ${icon('arrow')}</button>` : '<span class="delivered-note">Delivered · no further action</span>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNotFound() {
  return `
    <section class="shell not-found">
      <p class="eyebrow">404 · page not found</p>
      <h1>That page slipped out of its case.</h1>
      <p>Let's get you back to something that fits.</p>
      <a class="button button-primary" href="#/overview">Back to your smile ${icon('arrow')}</a>
    </section>
  `;
}

function captureDetails(form) {
  const data = new FormData(form);
  const nextDraft = {
    ...orderDraft,
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    address1: String(data.get('address1') || '').trim(),
    address2: String(data.get('address2') || '').trim(),
    city: String(data.get('city') || '').trim(),
    state: String(data.get('state') || '').trim().toUpperCase(),
    zip: String(data.get('zip') || '').trim(),
    impressionMethod: String(data.get('impressionMethod') || 'mail_kit'),
    notes: String(data.get('notes') || '').trim(),
  };
  if (!nextDraft.name || !nextDraft.email || !nextDraft.phone || !nextDraft.address1 || !nextDraft.city || !nextDraft.zip) {
    toast('Please complete the required delivery details.', 'error');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextDraft.email)) {
    toast('Please enter a valid email address.', 'error');
    return false;
  }
  if (!/^\d{5}(-\d{4})?$/.test(nextDraft.zip)) {
    toast('Please enter a valid US ZIP code.', 'error');
    return false;
  }
  if (nextDraft.state.length !== 2) {
    toast('Please use the two-letter state code.', 'error');
    return false;
  }
  orderDraft = nextDraft;
  return true;
}

function validateCard(form) {
  const data = new FormData(form);
  const cardNumber = String(data.get('cardNumber') || '').replace(/\D/g, '');
  const expiry = String(data.get('expiry') || '').trim();
  const cvc = String(data.get('cvc') || '').replace(/\D/g, '');
  if (cardNumber.length < 12) {
    toast('Enter a test card number to continue.', 'error');
    return false;
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    toast('Use MM/YY for the expiry date.', 'error');
    return false;
  }
  if (cvc.length < 3) {
    toast('Enter the security code from the card.', 'error');
    return false;
  }
  return true;
}

function filterAdminRows(value) {
  const query = String(value || '').trim().toLowerCase();
  const rows = [...document.querySelectorAll('[data-searchable]')];
  let visible = 0;
  rows.forEach((row) => {
    const match = !query || row.dataset.searchable.includes(query);
    row.hidden = !match;
    if (match) visible += 1;
  });
  const count = document.querySelector('#admin-search-count');
  if (count) count.textContent = `${visible} result${visible === 1 ? '' : 's'}`;
}

function openAdminOrder(orderId) {
  lastFocused = document.activeElement;
  modalOrderId = orderId;
  modalJustOpened = true;
  notificationsOpen = false;
  render();
}

function closeModal() {
  modalOrderId = null;
  render();
  if (lastFocused && typeof lastFocused.focus === 'function') {
    window.setTimeout(() => lastFocused.focus(), 20);
  }
}

document.addEventListener('click', (event) => {
  if (event.target.matches('[data-modal-backdrop]')) {
    closeModal();
    return;
  }

  const routeLink = event.target.closest('a[href^="#/"]');
  const actionEl = event.target.closest('[data-action]');

  if (actionEl) {
    const action = actionEl.dataset.action;
    if (!['close-notifications', 'toggle-notifications', 'mark-read'].includes(action)) {
      notificationsOpen = false;
    }
    switch (action) {
      case 'toggle-notifications':
        notificationsOpen = !notificationsOpen;
        render();
        return;
      case 'close-notifications': {
        notificationsOpen = false;
        const href = actionEl.getAttribute('href');
        if (actionEl.tagName === 'A' && href) navigate(href);
        else render();
        return;
      }
      case 'mark-read':
        store.markNotificationsRead();
        render();
        toast('Updates marked as read.');
        return;
      case 'dismiss-flash':
        flashOrderId = null;
        render();
        return;
      case 'order-next':
        if (orderStep === 1) {
          orderStep = 2;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      case 'order-back':
        if (orderStep > 1) {
          if (orderStep === 2) {
            const form = document.querySelector('#order-details-form');
            if (form) captureDetails(form);
          }
          orderStep -= 1;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      case 'reorder':
        orderDraft.productId = actionEl.dataset.product || orderDraft.productId;
        orderStep = 1;
        navigate('/order');
        toast('That set is selected. Review the details when you are ready.');
        return;
      case 'admin-tab':
        adminTab = actionEl.dataset.tab;
        adminFilter = 'all';
        render();
        return;
      case 'admin-filter':
        adminFilter = actionEl.dataset.filter;
        render();
        return;
      case 'open-admin-order':
        openAdminOrder(actionEl.dataset.id);
        return;
      case 'close-modal':
        closeModal();
        return;
      case 'advance-order': {
        const id = actionEl.dataset.id;
        try {
          const updated = store.advanceOrder(id);
          render();
          toast(`${id} moved to ${stageInfo(updated.stage).label}.`);
        } catch (error) {
          toast(error.message, 'error');
        }
        return;
      }
      case 'collect-payment': {
        const id = actionEl.dataset.id;
        try {
          store.collectPayment(id);
          render();
          toast(`Payment received for ${id}.`);
        } catch (error) {
          toast(error.message, 'error');
        }
        return;
      }
      case 'admin-signout':
        adminAuthed = false;
        adminTab = 'orders';
        render();
        toast('Signed out of operations.');
        return;
      case 'fill-pin': {
        const input = document.querySelector('#admin-login-form input[name="pin"]');
        if (input) {
          input.value = '2468';
          input.focus();
        }
        return;
      }
      case 'copy-tracking':
        navigator.clipboard
          ?.writeText(actionEl.dataset.code || '')
          .then(() => toast('Tracking number copied.'))
          .catch(() => toast('Could not copy. Select the number manually.', 'error'));
        return;
      case 'demo-card':
        toast('Demo only: card updates are disabled so no real payment details are collected.');
        return;
      case 'export':
        toast('Demo export: the production build connects this to the reporting API.');
        return;
      case 'reset-demo':
        if (window.confirm('Reset all demo orders, profile changes and notifications?')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.hash = '#/overview';
          window.location.reload();
        }
        return;
      default:
        break;
    }
  }

  if (routeLink) {
    event.preventDefault();
    navigate(routeLink.getAttribute('href'));
    return;
  }

  if (notificationsOpen && !event.target.closest('.notif-panel')) {
    notificationsOpen = false;
    render();
  }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.id === 'order-details-form') {
    if (!captureDetails(form)) return;
    orderStep = 3;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (form.id === 'payment-form') {
    if (!validateCard(form)) return;
    const data = new FormData(form);
    try {
      const order = store.createOrder({
        ...orderDraft,
        cardNumber: String(data.get('cardNumber') || ''),
      });
      flashOrderId = order.id;
      orderStep = 1;
      orderDraft = buildInitialDraft();
      navigate(`/orders/${order.id}`);
      toast('Order placed. Your impression kit is being prepared.');
    } catch (error) {
      toast(error.message, 'error');
    }
    return;
  }

  if (form.id === 'profile-form') {
    const data = new FormData(form);
    try {
      store.updateProfile({
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        phone: data.get('phone'),
        address1: data.get('address1'),
        address2: data.get('address2'),
        city: data.get('city'),
        state: data.get('state'),
        zip: data.get('zip'),
        careNote: data.get('careNote'),
        orderUpdates: data.get('orderUpdates') === 'on',
        labNotes: data.get('labNotes') === 'on',
        productNews: data.get('productNews') === 'on',
      });
      render();
      toast('Your details are saved.');
    } catch (error) {
      toast(error.message, 'error');
    }
    return;
  }

  if (form.id === 'admin-login-form') {
    const data = new FormData(form);
    if (store.authenticateStaff(data.get('pin'))) {
      adminAuthed = true;
      adminTab = 'orders';
      adminFilter = 'all';
      render();
      toast(`Welcome back, ${store.getState().staff.name.split(' ')[0]}.`);
    } else {
      toast('That PIN did not match. Try 2468 for the demo.', 'error');
      form.querySelector('input[name="pin"]')?.focus();
    }
  }
});

document.addEventListener('change', (event) => {
  if (event.target.name === 'product') {
    orderDraft.productId = event.target.value;
    render();
    return;
  }

});

document.addEventListener('input', (event) => {
  if (event.target.id === 'admin-search') {
    filterAdminRows(event.target.value);
  }
  if (event.target.name === 'cardNumber') {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
    event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  if (event.target.name === 'expiry') {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalOrderId) closeModal();
    else if (notificationsOpen) {
      notificationsOpen = false;
      render();
    }
  }
});

window.addEventListener('hashchange', () => {
  route = parseRoute();
  notificationsOpen = false;
  if (modalOrderId) {
    modalOrderId = null;
    document.body.classList.remove('modal-open');
  }
  if (route.name !== 'order-detail') flashOrderId = null;
  adminFilter = 'all';
  window.scrollTo({ top: 0, behavior: 'auto' });
  render();
});

route = parseRoute();
if (!window.location.hash) {
  window.history.replaceState(null, '', '#/overview');
  route = parseRoute();
}
render();
