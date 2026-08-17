// Shared fallback selectors/heuristics used by every provider definition.
//
// IMPORTANT: none of the per-provider selectors in this directory have been
// verified against the live sites (this app was built without live
// credentials to test against, and airline/hotel/bank sites change their
// markup often). Treat every selector here as a *starting guess*, not a
// known-good value. scrapeRunner.js tries each candidate in order and
// falls back to a generic "find a number near a loyalty keyword" scan of
// the page text if every selector guess misses, but that generic fallback
// is itself a heuristic and can grab the wrong number on an unfamiliar
// page layout. When a provider stops working, open data/debug/<accountId>
// (screenshot + HTML dump saved automatically on failure) and update that
// provider's file — see README.md "Fixing a broken provider".

const USERNAME_SELECTORS = [
  'input[autocomplete="username"]',
  'input[type="email"]',
  'input[name*="user" i]',
  'input[id*="user" i]',
  'input[id*="email" i]',
  'input[name*="email" i]',
  'input[id*="login" i]',
];

const PASSWORD_SELECTORS = [
  'input[autocomplete="current-password"]',
  'input[type="password"]',
];

const SUBMIT_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button:has-text("Sign In")',
  'button:has-text("Sign in")',
  'button:has-text("Log In")',
  'button:has-text("Log in")',
  'button:has-text("Login")',
];

// Generic "number near a loyalty keyword" text-scan fallback, used only if
// every provider-specific balanceSelectors guess fails to find anything.
function genericBalanceRegexes(keywords) {
  const kw = keywords.join('|');
  return [
    new RegExp(`(?:${kw})[^0-9]{0,25}([0-9][0-9,]{2,9})`, 'i'),
    new RegExp(`([0-9][0-9,]{2,9})\\s*(?:${kw})`, 'i'),
  ];
}

module.exports = { USERNAME_SELECTORS, PASSWORD_SELECTORS, SUBMIT_SELECTORS, genericBalanceRegexes };
