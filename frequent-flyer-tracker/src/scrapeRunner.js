// Playwright-driven login + balance scrape, per account.
//
// Two entry points:
//   - loginInteractive(): opens a REAL, visible browser window against a
//     persistent profile for this one account. Username/password are
//     autofilled from the vault when possible, but the human at the
//     keyboard is the one who clears any CAPTCHA/2FA/"verify it's you"
//     challenge — that's the one-time step this whole app exists to avoid
//     repeating. Once the resulting page no longer looks like a login
//     page, the browser profile (cookies, local storage, etc.) is left on
//     disk under data/sessions/<accountId> for reuse.
//   - refreshHeadless(): reuses that saved profile with no visible window
//     and no prompts. If the saved session turns out to be expired (the
//     balance page redirects back to a login form), it reports
//     'needs-login' instead of trying to guess credentials on its own.
//
// Every provider's selectors are best-effort guesses (see providers/
// _shared.js) — extraction falls back through a list of candidate
// selectors and finally a generic keyword-based text scan.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const config = require('./config');
const { USERNAME_SELECTORS, PASSWORD_SELECTORS, SUBMIT_SELECTORS, genericBalanceRegexes } = require('./providers/_shared');

const running = new Set();

function sessionDir(accountId) {
  return path.join(config.sessionsDir, accountId);
}

async function fillFirst(page, selectors, value) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.count()) {
        await el.fill(value, { timeout: 3000 });
        return true;
      }
    } catch {
      // try next candidate
    }
  }
  return false;
}

async function clickFirst(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.count()) {
        await el.click({ timeout: 3000 });
        return true;
      }
    } catch {
      // try next candidate
    }
  }
  return false;
}

async function looksLikeLoginPage(page) {
  try {
    return (await page.locator(PASSWORD_SELECTORS.join(',')).count()) > 0;
  } catch {
    return false;
  }
}

function parseNumber(text) {
  const m = text.replace(/ /g, ' ').match(/[0-9][0-9,]{1,9}/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

async function extractBalance(page, provider) {
  for (const sel of provider.balanceSelectors || []) {
    try {
      const el = page.locator(sel).first();
      if (await el.count()) {
        const text = (await el.innerText({ timeout: 3000 })).trim();
        const n = parseNumber(text);
        if (n !== null) return n;
      }
    } catch {
      // try next candidate
    }
  }
  // Generic fallback: scan the whole page's visible text for a number
  // sitting near one of this provider's loyalty keywords.
  try {
    const bodyText = await page.locator('body').innerText({ timeout: 5000 });
    for (const re of genericBalanceRegexes(provider.keywords)) {
      const m = bodyText.match(re);
      if (m) {
        const n = Number(m[1].replace(/,/g, ''));
        if (Number.isFinite(n)) return n;
      }
    }
  } catch {
    // give up
  }
  return null;
}

async function extractStatusTier(page, provider) {
  for (const sel of provider.statusSelectors || []) {
    try {
      const el = page.locator(sel).first();
      if (await el.count()) {
        const text = (await el.innerText({ timeout: 3000 })).trim();
        if (text) return text;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function saveDebugArtifacts(accountId, page, tag) {
  try {
    const dir = path.join(config.dataDir, 'debug');
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const base = path.join(dir, `${accountId}-${tag}-${stamp}`);
    await page.screenshot({ path: base + '.png', fullPage: true }).catch(() => {});
    const html = await page.content().catch(() => null);
    if (html) fs.writeFileSync(base + '.html', html);
  } catch {
    // debugging aid only, never let this crash the real run
  }
}

async function withPersistentContext(accountId, headless, fn) {
  if (running.has(accountId)) {
    throw new Error('A browser session is already running for this account.');
  }
  running.add(accountId);
  fs.mkdirSync(sessionDir(accountId), { recursive: true });
  const context = await chromium.launchPersistentContext(sessionDir(accountId), {
    headless,
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  try {
    return await fn(context);
  } finally {
    await context.close().catch(() => {});
    running.delete(accountId);
  }
}

// Opens a visible browser for this account so a human can complete login
// (including any 2FA/CAPTCHA), then leaves the session saved for reuse.
async function loginInteractive(accountId, provider, credentials) {
  if (!provider.loginUrl) {
    throw new Error(`${provider.name} has no automated login (manual-entry program).`);
  }
  return withPersistentContext(accountId, false, async (context) => {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(provider.loginUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});

    if (credentials) {
      await fillFirst(page, USERNAME_SELECTORS, credentials.username);
      await fillFirst(page, PASSWORD_SELECTORS, credentials.password);
      await clickFirst(page, SUBMIT_SELECTORS);
    }

    // Give the human up to 5 minutes to clear 2FA/CAPTCHA/"verify it's
    // you" prompts, or to log in from scratch if autofill missed a field.
    const deadline = Date.now() + 5 * 60 * 1000;
    let loggedIn = false;
    while (Date.now() < deadline) {
      await page.waitForTimeout(2000);
      if (page.isClosed()) break;
      loggedIn = !(await looksLikeLoginPage(page));
      if (loggedIn) break;
    }

    if (!loggedIn) {
      await saveDebugArtifacts(accountId, page, 'login-timeout');
      return { success: false, message: 'Timed out waiting for login to complete in the browser window.' };
    }

    if (provider.balanceUrl) {
      await page.goto(provider.balanceUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    const balance = await extractBalance(page, provider);
    const statusTier = await extractStatusTier(page, provider);
    if (balance === null) {
      await saveDebugArtifacts(accountId, page, 'balance-not-found');
      return {
        success: true,
        balance: null,
        statusTier,
        message:
          'Logged in and saved the session, but could not find a balance on the page — this provider\'s selectors likely need updating (see data/debug/ for a screenshot).',
      };
    }
    return { success: true, balance, statusTier, message: null };
  });
}

// Headless reuse of a previously saved session. Never prompts for
// anything; reports 'needs-login' if the saved session has expired.
async function refreshHeadless(accountId, provider) {
  if (!fs.existsSync(sessionDir(accountId))) {
    return { status: 'needs-login', message: 'No saved session yet — connect this account first.' };
  }
  return withPersistentContext(accountId, true, async (context) => {
    const page = context.pages()[0] || (await context.newPage());
    const targetUrl = provider.balanceUrl || provider.loginUrl;
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    if (await looksLikeLoginPage(page)) {
      return { status: 'needs-login', message: 'Saved session expired — reconnect this account.' };
    }

    const balance = await extractBalance(page, provider);
    const statusTier = await extractStatusTier(page, provider);
    if (balance === null) {
      await saveDebugArtifacts(accountId, page, 'balance-not-found');
      return { status: 'error', message: 'Logged in, but could not find a balance on the page (selectors may need updating).' };
    }
    return { status: 'ok', balance, statusTier, message: null };
  });
}

module.exports = { loginInteractive, refreshHeadless };
