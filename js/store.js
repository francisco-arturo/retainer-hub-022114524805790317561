import { PRODUCTS, STAGES, seedState } from './data.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const isoToday = () => new Date().toISOString().slice(0, 10);

export function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(start, end) {
  if (!start || !end) return null;
  const a = new Date(`${start}T12:00:00Z`).getTime();
  const b = new Date(`${end}T12:00:00Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

export function stageInfo(n) {
  return STAGES[Math.min(Math.max(Number(n) || 1, 1), STAGES.length) - 1];
}

export function money(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function isOpen(order) {
  return Boolean(order) && order.stage < 7;
}

export function paymentIsDue(order) {
  return Boolean(order) && order.payment?.status !== 'paid';
}

export function inferCardBrand(number) {
  const digits = String(number || '').replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
}

function validateOrderPayload(payload) {
  const required = {
    productId: 'a retainer option',
    name: 'a full name',
    email: 'an email address',
    phone: 'a phone number',
    address1: 'a shipping address',
    city: 'a city',
    state: 'a state',
    zip: 'a ZIP code',
  };
  const missing = Object.entries(required)
    .filter(([key]) => !String(payload?.[key] || '').trim())
    .map(([, label]) => label);
  if (missing.length) {
    throw new Error(`Please add ${missing.join(', ')}.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!/^\d{5}(-\d{4})?$/.test(String(payload.zip))) {
    throw new Error('Please enter a valid US ZIP code.');
  }
  const product = PRODUCTS.find((item) => item.id === payload.productId);
  if (!product) throw new Error('Please choose a retainer option.');
  return product;
}

export function createStore(initialState = seedState) {
  let state = clone(initialState);
  const listeners = new Set();

  const notify = () => listeners.forEach((listener) => listener(state));

  const api = {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getCustomer(customerId = state.currentCustomerId) {
      return state.customers.find((customer) => customer.id === customerId) || null;
    },

    getOrder(orderId) {
      return state.orders.find((order) => order.id === orderId) || null;
    },

    ordersForCustomer(customerId = state.currentCustomerId) {
      return state.orders
        .filter((order) => order.customerId === customerId)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },

    notificationsForCustomer(customerId = state.currentCustomerId) {
      return state.notifications
        .filter((notification) => notification.customerId === customerId)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    },

    unreadCount(customerId = state.currentCustomerId) {
      return api.notificationsForCustomer(customerId).filter((notification) => !notification.read).length;
    },

    createOrder(payload) {
      const product = validateOrderPayload(payload);
      const createdAt = isoToday();
      const numericIds = state.orders
        .map((order) => Number(String(order.id).replace(/\D/g, '')))
        .filter(Number.isFinite);
      const nextId = `HTS-${Math.max(10490, ...numericIds) + 1}`;
      const digits = String(payload.cardNumber || '').replace(/\D/g, '');
      const order = {
        id: nextId,
        customerId: state.currentCustomerId,
        productId: product.id,
        productName: product.name,
        arches: product.arches,
        total: product.price,
        createdAt,
        stage: 1,
        payment: {
          status: 'paid',
          brand: inferCardBrand(payload.cardNumber),
          last4: digits.slice(-4) || '4242',
          amount: product.price,
          paidAt: createdAt,
        },
        impression: {
          method: payload.impressionMethod === 'digital_scan' ? 'digital_scan' : 'mail_kit',
          status: 'preparing',
          carrier: payload.impressionMethod === 'digital_scan' ? 'Digital scan' : 'USPS',
          tracking: null,
          deliveredAt: null,
        },
        shipping: {
          name: String(payload.name).trim(),
          address1: String(payload.address1).trim(),
          address2: String(payload.address2 || '').trim(),
          city: String(payload.city).trim(),
          state: String(payload.state).trim().toUpperCase(),
          zip: String(payload.zip).trim(),
          carrier: 'UPS',
          tracking: null,
          eta: addDays(createdAt, 10),
          deliveredAt: null,
        },
        labNote: String(payload.notes || '').trim(),
        events: [
          {
            stage: 1,
            date: createdAt,
            title: 'Order confirmed',
            detail: `${product.name} ordered. Your impression kit is being prepared.`,
          },
        ],
      };

      state.orders.push(order);
      const customer = api.getCustomer();
      if (customer) {
        customer.address = {
          address1: order.shipping.address1,
          address2: order.shipping.address2,
          city: order.shipping.city,
          state: order.shipping.state,
          zip: order.shipping.zip,
        };
      }
      state.notifications.unshift({
        id: `ntf_${Date.now()}`,
        customerId: state.currentCustomerId,
        orderId: order.id,
        title: 'Order confirmed',
        body: `We are preparing your impression kit for ${order.id}.`,
        date: createdAt,
        read: false,
        kind: 'order',
      });
      notify();
      return clone(order);
    },

    advanceOrder(orderId) {
      const order = api.getOrder(orderId);
      if (!order) throw new Error('Order not found.');
      if (order.stage >= STAGES.length) throw new Error('This order is already delivered.');
      if (paymentIsDue(order) && order.stage === 1) {
        throw new Error('Collect payment before releasing the impression kit.');
      }

      const today = isoToday();
      const nextStage = order.stage + 1;
      const stage = stageInfo(nextStage);
      order.stage = nextStage;

      if (nextStage === 2) {
        order.impression.status = order.impression.method === 'digital_scan' ? 'received' : 'shipped';
        order.impression.tracking =
          order.impression.tracking ||
          `9400 1112 8899 0000 0000 ${String(Number(order.id.replace(/\D/g, '')) % 100).padStart(2, '0')}`;
      }
      if (nextStage === 3) {
        order.impression.status = 'received';
        order.impression.deliveredAt = order.impression.deliveredAt || today;
      }
      if (nextStage === 4 && !order.impression.deliveredAt) {
        order.impression.deliveredAt = today;
      }
      if (nextStage === 6) {
        order.shipping.tracking =
          order.shipping.tracking ||
          `1Z999AA10${String(Number(order.id.replace(/\D/g, '')) % 1_000_000_000).padStart(9, '0')}`;
      }
      if (nextStage === 7) {
        order.shipping.deliveredAt = today;
        order.shipping.eta = order.shipping.eta || today;
      }

      order.events.push({
        stage: nextStage,
        date: today,
        title: stage.label,
        detail: stage.detail,
      });
      state.notifications.unshift({
        id: `ntf_${Date.now()}`,
        customerId: order.customerId,
        orderId: order.id,
        title: stage.customerTitle,
        body: `${stage.detail} Order ${order.id}.`,
        date: today,
        read: false,
        kind: stage.key,
      });
      notify();
      return clone(order);
    },

    collectPayment(orderId) {
      const order = api.getOrder(orderId);
      if (!order) throw new Error('Order not found.');
      if (order.payment.status === 'paid') return clone(order);
      order.payment.status = 'paid';
      order.payment.paidAt = isoToday();
      order.events.push({
        stage: order.stage,
        date: isoToday(),
        title: 'Payment collected',
        detail: `${order.payment.brand} ending ${order.payment.last4} charged ${money(order.payment.amount)}.`,
      });
      notify();
      return clone(order);
    },

    updateProfile(patch) {
      const customer = api.getCustomer();
      if (!customer) throw new Error('Customer not found.');
      const first = String(patch.firstName || '').trim();
      const last = String(patch.lastName || '').trim();
      const email = String(patch.email || '').trim();
      if (!first || !last) throw new Error('First and last name are required.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
      customer.firstName = first;
      customer.lastName = last;
      customer.email = email;
      customer.phone = String(patch.phone || '').trim();
      customer.careNote = String(patch.careNote || '').trim();
      customer.preferences = {
        orderUpdates: Boolean(patch.orderUpdates),
        labNotes: Boolean(patch.labNotes),
        productNews: Boolean(patch.productNews),
      };
      if (patch.address1 || patch.city || patch.zip) {
        customer.address = {
          address1: String(patch.address1 || '').trim(),
          address2: String(patch.address2 || '').trim(),
          city: String(patch.city || '').trim(),
          state: String(patch.state || '').trim().toUpperCase(),
          zip: String(patch.zip || '').trim(),
        };
      }
      notify();
      return clone(customer);
    },

    markNotificationsRead(customerId = state.currentCustomerId) {
      state.notifications.forEach((notification) => {
        if (notification.customerId === customerId) notification.read = true;
      });
      notify();
    },

    authenticateStaff(pin) {
      return String(pin || '').trim() === String(state.staff.pin);
    },

    metrics() {
      const paidOrders = state.orders.filter((order) => order.payment.status === 'paid');
      const delivered = state.orders.filter((order) => order.stage === 7 && order.shipping.deliveredAt);
      const turnarounds = delivered
        .map((order) => daysBetween(order.createdAt, order.shipping.deliveredAt))
        .filter((days) => Number.isFinite(days));
      return {
        openOrders: state.orders.filter(isOpen).length,
        inLab: state.orders.filter((order) => order.stage === 4 || order.stage === 5).length,
        awaitingKit: state.orders.filter((order) => order.stage <= 3).length,
        revenue: paidOrders.reduce((sum, order) => sum + Number(order.payment.amount || 0), 0),
        pendingPayments: state.orders.filter(paymentIsDue).length,
        customers: state.customers.length,
        delivered: delivered.length,
        avgTurnaround: turnarounds.length
          ? Math.round((turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length) * 10) / 10
          : null,
      };
    },
  };

  return api;
}
