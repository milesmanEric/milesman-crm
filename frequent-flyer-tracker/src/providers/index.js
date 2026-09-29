const airlines = require('./airlines');
const hotels = require('./hotels');
const creditCards = require('./credit-cards');

// Pseudo-provider for any program that isn't in the built-in list, or
// whose automated login you'd rather not set up. No loginUrl means the
// scrape runner never attempts to automate it — balances are entered and
// kept up to date by hand in the dashboard.
const CUSTOM_PROVIDER = {
  id: 'custom',
  name: 'Other (manual entry)',
  category: 'custom',
  loginUrl: null,
  balanceUrl: null,
  keywords: [],
  balanceSelectors: [],
  statusSelectors: [],
};

const ALL = [...airlines, ...hotels, ...creditCards, CUSTOM_PROVIDER];

const BY_ID = Object.fromEntries(ALL.map((p) => [p.id, p]));

function list() {
  return ALL;
}

function get(id) {
  return BY_ID[id] || null;
}

module.exports = { list, get, CUSTOM_PROVIDER };
