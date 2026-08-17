# Frequent Flyer Tracker

A small local app that tracks your airline, hotel, and credit-card loyalty
balances in one dashboard, and keeps them updated in the background after
you've logged into each program **once**.

## How the "only prompt once" part works

1. **Add an account** in the dashboard (pick the program, optionally enter
   its username/password).
2. Click **Connect**. A real, visible Chromium window opens on your
   machine, pre-filled with your username/password. If the site asks for
   2FA, a CAPTCHA, or "verify it's you," you clear that step yourself —
   that's the one moment a human has to be involved.
3. Once you're logged in, the app saves that browser's session (cookies
   etc.) to `data/sessions/<account-id>/` on disk.
4. From then on, a background job wakes up every few hours, reuses the
   saved session in a **headless** (invisible) browser, and reads the
   current balance — no prompt, no visible window, no re-entering
   credentials.
5. If a saved session eventually expires (this varies a lot by program —
   some last months, some log you out weekly), that one account is
   flagged **"Needs login"** in the dashboard and you repeat step 2 for
   just that program. Everything else keeps auto-refreshing.

Your actual username/password are only ever used at step 2 (to prefill
the visible login page) and are never sent anywhere except that program's
own login page.

## Setup

Requires Node.js 18+.

```bash
cd frequent-flyer-tracker
npm install
npx playwright install chromium   # downloads the browser Playwright drives
npm start
```

Then open **http://127.0.0.1:4178**. The server only binds to localhost —
it's not reachable from other devices on your network.

The first time you click "Add Account", "Connect", or "Delete" you'll be
asked to create a **master password**. This encrypts every saved login at
rest (AES-256-GCM, key derived from your password via scrypt). There is no
recovery if you forget it — that's intentional, since the whole point is
that nothing (including this app) can read your saved credentials without
it. If you just want to *view* balances, no password is needed — the
vault only gates adding/connecting/deleting accounts.

Click the lock badge in the top-right to lock the vault again (e.g. before
stepping away from your machine). Locking doesn't stop the background
refresh job — that reuses saved browser sessions, not the vault.

## Running it continuously

`npm start` runs the dashboard **and** the background scheduler in one
process. Leave it running (e.g. in a terminal tab, `screen`/`tmux`
session, or as a background service) for balances to keep updating. If
you close it, balances simply stop refreshing until you start it again —
nothing is lost.

To run automatically at login/boot, wrap `npm start` in your OS's usual
mechanism (e.g. a `launchd` plist on macOS, a systemd user service on
Linux, or Task Scheduler on Windows) pointed at this directory.

Refresh cadence defaults to every 6 hours; override with:

```bash
REFRESH_INTERVAL_HOURS=3 npm start
```

## What's tracked out of the box

13 built-in programs across airlines, hotels, and credit cards (see
`src/providers/`), plus a "manual entry" option for anything else — add it
as a Custom account and just type the balance in yourself; it won't try to
log in anywhere.

## Important limitations — please read

- **Selectors are best-effort, not verified.** This app was built without
  live credentials to test the actual login/balance pages, and those pages
  change often. Every provider file in `src/providers/` is a reasonable
  starting guess (with several fallback selectors and a generic
  keyword-based text scan as a last resort), but don't be surprised if a
  program's automated login or balance extraction needs a tweak. See
  "Fixing a broken provider" below.
- **Bot detection can block automated login outright**, especially on
  bank/credit-card sites (Chase, Amex, Citi) which tend to run the
  strictest fraud/bot protection and often require 2FA on *every* login,
  not just the first. If a program's headless refresh keeps failing, use
  the "Edit balance" button to update it by hand instead of fighting the
  automation.
- **Automated access may be against a program's terms of service**, even
  when it's your own account and you're the one providing credentials.
  This tool is meant for your personal convenience, not for high-frequency
  polling or bulk automation — the default 6-hour cadence and one-browser-
  at-a-time design are deliberately conservative. Use your judgment for
  any given program.
- **Repeated failed automated logins can trigger account security
  alerts or lockouts** on some sites. If a "Connect" attempt looks like
  it's stuck in a loop or triggers an unexpected email/SMS from the
  provider, stop and log in manually through your normal browser instead.

## Fixing a broken provider

When a scrape fails to find a balance, a screenshot and HTML dump are
saved to `data/debug/<account-id>-...`. Open the HTML file, find the
element that actually holds the balance, and add a matching CSS selector
to that provider's `balanceSelectors` array in `src/providers/*.js`
(earlier entries in the array are tried first).

## Adding a new program

Add an entry to the relevant array in `src/providers/airlines.js`,
`hotels.js`, or `credit-cards.js`:

```js
{
  id: 'unique-id',
  name: 'Display Name',
  category: 'airline', // 'airline' | 'hotel' | 'credit-card'
  loginUrl: 'https://example.com/login',
  balanceUrl: 'https://example.com/account/balance', // page to read after login
  keywords: ['program name', 'points'], // used by the generic text-scan fallback
  balanceSelectors: ['.balance-class'], // best-guess CSS selectors, most-likely first
  statusSelectors: ['.tier-class'],     // optional, for elite/tier status text
}
```

Leave `loginUrl` unset for a manual-only entry (no automation attempted).

## Data on disk

Everything lives under `data/` (gitignored):

- `db.json` — account list and last-known balances (not secret).
- `vault.json` — encrypted credentials + a salt (useless without your
  master password).
- `sessions/<account-id>/` — each account's persistent browser profile
  (cookies/local storage) — treat this like a saved login session, since
  that's exactly what it is.
- `debug/` — screenshots/HTML saved when a scrape fails, to help diagnose
  a broken selector.
