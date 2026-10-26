// Render every customer route against a tiny DOM stub. This catches template
// mistakes and undefined state without adding a browser dependency.
import assert from 'node:assert/strict';

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.style = {};
    this.title = '';
    this.dataset = {};
    this.classList = {
      _set: new Set(),
      add: (...names) => names.forEach((name) => this.classList._set.add(name)),
      remove: (...names) => names.forEach((name) => this.classList._set.delete(name)),
      toggle: (name, force) => {
        const on = force === undefined ? !this.classList._set.has(name) : Boolean(force);
        if (on) this.classList._set.add(name);
        else this.classList._set.delete(name);
        return on;
      },
      contains: (name) => this.classList._set.has(name),
    };
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }

  addEventListener() {}

  appendChild() {}

  remove() {}
}

const appElement = new FakeElement('app');
const handlers = {};
const documentStub = {
  title: '',
  body: new FakeElement('body'),
  activeElement: null,
  querySelector(selector) {
    if (selector === '#app') return appElement;
    return null;
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return new FakeElement();
  },
  addEventListener(type, handler) {
    handlers[`document:${type}`] = handler;
  },
};

const windowStub = {
  location: { hash: '' },
  addEventListener(type, handler) {
    handlers[`window:${type}`] = handler;
  },
  setTimeout() {
    return 0;
  },
  scrollTo() {},
  history: {
    replaceState(_state, _title, url) {
      windowStub.location.hash = String(url).replace(/^[^#]*/, '');
    },
  },
  confirm() {
    return true;
  },
};

globalThis.document = documentStub;
globalThis.window = windowStub;
globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
};
globalThis.requestAnimationFrame = (callback) => callback();

await import('../js/app.js');

function go(hash) {
  windowStub.location.hash = hash;
  handlers['window:hashchange']();
  const html = appElement.innerHTML;
  assert.ok(html.length > 2000, `${hash} should render a full page`);
  assert.ok(!html.includes('undefined'), `${hash} should not render undefined`);
  assert.ok(!html.includes('[object Object]'), `${hash} should not stringify objects`);
  return html;
}

const expectations = [
  ['#/overview', ['Your smile is in motion', 'HTS-10482', 'The Pair', 'Latest updates']],
  ['#/orders', ['My orders', 'HTS-10311', 'Buy again', 'In motion']],
  ['#/orders/HTS-10482', ['From kit to keepsake', 'Quality check', 'Impression kit', 'Payment']],
  ['#/order', ['Order your retainers', 'The Pair', 'Continue to details', 'Total today']],
  ['#/account', ['Account & care', 'Payment method', 'Save changes', '12 months, covered']],
  ['#/admin', ['Sign in to operations', 'Use PIN 2468', 'Every smile,', 'Collected']],
  ['#/not-a-page', ['That page slipped out of its case']],
];

for (const [hash, phrases] of expectations) {
  const html = go(hash);
  for (const phrase of phrases) {
    assert.ok(html.includes(phrase), `${hash} should contain "${phrase}"`);
  }
  console.log(`PASS  render ${hash} (${html.length} bytes)`);
}

assert.ok(appElement.innerHTML.includes('aria-label="Primary navigation"'), 'header is present');
assert.ok(appElement.innerHTML.includes('Demo environment'), 'demo disclosure is present');

class TestFormData {
  get(name) {
    return name === 'pin' ? '2468' : null;
  }
}

globalThis.FormData = TestFormData;
go('#/admin');
handlers['document:submit']({
  preventDefault() {},
  target: {
    id: 'admin-login-form',
    querySelector() {
      return { focus() {} };
    },
  },
});
const adminHtml = appElement.innerHTML;
for (const phrase of ['Operations · San Francisco lab', 'Open orders', 'In the lab', 'All orders']) {
  assert.ok(adminHtml.includes(phrase), `admin dashboard should contain "${phrase}"`);
}
assert.ok(adminHtml.includes('Nora'), 'admin session should show the signed-in staff member');
console.log(`PASS  admin unlock renders operations (${adminHtml.length} bytes)`);

function clickAction(action, data = {}) {
  const element = {
    dataset: { action, ...data },
    tagName: 'BUTTON',
    getAttribute() {
      return null;
    },
  };
  const target = {
    matches() {
      return false;
    },
    closest(selector) {
      return selector === '[data-action]' ? element : null;
    },
  };
  handlers['document:click']({ target, preventDefault() {} });
}

clickAction('admin-tab', { tab: 'production' });
assert.ok(appElement.innerHTML.includes('Kit prep + impressions'), 'production tab renders');
assert.ok(appElement.innerHTML.includes('Out the door'), 'production columns render');
console.log('PASS  admin production view renders');

clickAction('open-admin-order', { id: 'HTS-10482' });
assert.ok(appElement.innerHTML.includes('Manufacturing timeline'), 'order modal renders');
assert.ok(appElement.innerHTML.includes('Advance to Quality check'), 'next lab action renders');
console.log('PASS  admin order modal renders with an advance action');

console.log('\n10/10 render checks passed');
