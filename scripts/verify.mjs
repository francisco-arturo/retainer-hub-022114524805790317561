import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCTS, STAGES, seedState } from '../js/data.js';
import { createStore, isOpen, money, stageInfo } from '../js/store.js';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const validPayload = {
  productId: 'both-arches',
  name: 'Maya Chen',
  email: 'maya.chen@example.com',
  phone: '(415) 555-0134',
  address1: '1428 Valencia Street',
  address2: 'Apt 3',
  city: 'San Francisco',
  state: 'CA',
  zip: '94110',
  impressionMethod: 'mail_kit',
  notes: 'Test fit note.',
  cardNumber: '4242 4242 4242 4242',
};

test('seed is internally consistent', () => {
  const ids = new Set(seedState.customers.map((customer) => customer.id));
  assert.equal(seedState.customers.length, 8);
  assert.equal(seedState.orders.length, 9);
  assert.equal(new Set(seedState.orders.map((order) => order.id)).size, seedState.orders.length);
  for (const order of seedState.orders) {
    assert.ok(ids.has(order.customerId), `missing customer ${order.customerId}`);
    assert.ok(PRODUCTS.some((product) => product.id === order.productId), `missing product ${order.productId}`);
    assert.ok(order.stage >= 1 && order.stage <= STAGES.length);
    assert.ok(order.events.length >= 1);
    assert.equal(order.events.at(-1).stage, order.stage, `${order.id} latest event should match stage`);
    assert.ok(order.total > 0, `${order.id} should have a positive total`);
    assert.ok(order.shipping.address1 && order.shipping.zip);
  }
});

test('stage metadata covers every order stage', () => {
  assert.equal(STAGES.length, 7);
  assert.equal(stageInfo(1).key, 'confirmed');
  assert.equal(stageInfo(7).key, 'delivered');
  assert.equal(stageInfo(99).key, 'delivered');
  assert.equal(isOpen({ stage: 6 }), true);
  assert.equal(isOpen({ stage: 7 }), false);
  assert.equal(money(165), '$165');
});

test('customer dashboard is seeded with an active order and updates', () => {
  const store = createStore(seedState);
  const orders = store.ordersForCustomer('cus_maya');
  assert.equal(orders.length, 2);
  assert.equal(orders.filter(isOpen).length, 1);
  assert.equal(store.unreadCount('cus_maya'), 1);
  const active = orders.find(isOpen);
  assert.equal(active.id, 'HTS-10482');
  assert.equal(active.stage, 4);
  assert.equal(active.payment.status, 'paid');
});

test('advancing an order writes an event and a customer update', () => {
  const store = createStore(seedState);
  const before = store.unreadCount('cus_maya');
  const updated = store.advanceOrder('HTS-10482');
  assert.equal(updated.stage, 5);
  assert.equal(store.getOrder('HTS-10482').events.at(-1).title, 'Quality check');
  assert.equal(store.unreadCount('cus_maya'), before + 1);
  assert.equal(store.advanceOrder('HTS-10482').stage, 6);
  const shipped = store.advanceOrder('HTS-10482');
  assert.equal(shipped.stage, 7);
  assert.ok(shipped.shipping.tracking, 'shipping tracking should exist after shipment');
  assert.ok(shipped.shipping.deliveredAt, 'deliveredAt should be set');
  assert.throws(() => store.advanceOrder('HTS-10482'), /already delivered/);
});

test('a payment review blocks kit release until payment is collected', () => {
  const store = createStore(seedState);
  assert.equal(store.getOrder('HTS-10490').payment.status, 'pending');
  assert.throws(() => store.advanceOrder('HTS-10490'), /Collect payment/);
  const paid = store.collectPayment('HTS-10490');
  assert.equal(paid.payment.status, 'paid');
  const released = store.advanceOrder('HTS-10490');
  assert.equal(released.stage, 2);
  assert.equal(released.impression.status, 'shipped');
});

test('creating an order returns an order, charges the right amount and notifies the customer', () => {
  const store = createStore(seedState);
  const beforeOrders = store.getState().orders.length;
  const beforeUnread = store.unreadCount('cus_maya');
  const order = store.createOrder(validPayload);
  assert.equal(store.getState().orders.length, beforeOrders + 1);
  assert.equal(order.stage, 1);
  assert.equal(order.total, 165);
  assert.equal(order.payment.status, 'paid');
  assert.equal(order.payment.last4, '4242');
  assert.equal(order.payment.brand, 'Visa');
  assert.equal(order.impression.method, 'mail_kit');
  assert.equal(order.impression.status, 'preparing');
  assert.match(order.id, /^HTS-\d{5}$/);
  assert.ok(order.shipping.eta > order.createdAt);
  assert.equal(store.unreadCount('cus_maya'), beforeUnread + 1);
  assert.equal(store.ordersForCustomer('cus_maya').length, 3);
});

test('invalid order details are rejected', () => {
  const store = createStore(seedState);
  assert.throws(() => store.createOrder({ ...validPayload, email: 'not-an-email' }), /valid email/);
  assert.throws(() => store.createOrder({ ...validPayload, zip: 'abc' }), /valid US ZIP/);
  assert.throws(() => store.createOrder({ ...validPayload, name: '' }), /full name/);
  assert.throws(() => store.createOrder({ ...validPayload, productId: 'nope' }), /retainer option/);
});

test('profile changes persist in the store and validate', () => {
  const store = createStore(seedState);
  const customer = store.updateProfile({
    firstName: 'Maya',
    lastName: 'Chen',
    email: 'maya.updated@example.com',
    phone: '(415) 555-0199',
    address1: '10 New Street',
    address2: '',
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
    careNote: 'Fresh note.',
    orderUpdates: true,
    labNotes: false,
    productNews: true,
  });
  assert.equal(customer.email, 'maya.updated@example.com');
  assert.equal(customer.address.address1, '10 New Street');
  assert.equal(customer.preferences.labNotes, false);
  assert.throws(() => store.updateProfile({ ...customer, email: 'bad' }), /valid email/);
});

test('admin metrics add up', () => {
  const store = createStore(seedState);
  const metrics = store.metrics();
  assert.equal(metrics.openOrders, 7);
  assert.equal(metrics.inLab, 3);
  assert.equal(metrics.customers, 8);
  assert.equal(metrics.pendingPayments, 1);
  assert.equal(metrics.delivered, 2);
  assert.equal(metrics.revenue, 1134);
  assert.equal(metrics.avgTurnaround, 10.5);
  assert.equal(store.authenticateStaff('2468'), true);
  assert.equal(store.authenticateStaff('0000'), false);
});

test('all customer and admin routes are present in the app shell', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  for (const route of ['overview', 'orders', 'order-detail', 'order', 'account', 'admin']) {
    assert.ok(app.includes(`case '${route}'`) || app.includes(`'${route}'`), `missing route ${route}`);
  }
  for (const label of ['Track my order', 'Order your retainers', 'Staff portal', 'Production', 'Payment ledger']) {
    assert.ok(app.includes(label), `missing product copy: ${label}`);
  }
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('id="app"'));
  assert.ok(html.includes('js/app.js'));
});

let passed = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}
console.log(`\n${passed}/${tests.length} checks passed`);
if (passed !== tests.length) process.exitCode = 1;
