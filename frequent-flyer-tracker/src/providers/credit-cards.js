// Bank/credit-card points program definitions. See _shared.js for the
// "these selectors are unverified guesses" disclaimer — it applies to
// every entry below. Bank sites in particular tend to run strong bot
// protection and multi-factor auth on every login, not just the first
// one — automated headless refresh is the least likely to keep working
// reliably for these three; manual balance entry is a reasonable
// fallback if the automated login stops going through.

module.exports = [
  {
    id: 'chase-ultimaterewards',
    name: 'Chase Ultimate Rewards',
    category: 'credit-card',
    loginUrl: 'https://secure.chase.com/web/auth/dashboard#/dashboard/index',
    balanceUrl: 'https://secure.chase.com/web/auth/dashboard#/dashboard/rewards/index',
    keywords: ['ultimate rewards', 'points'],
    balanceSelectors: ['[class*="rewards-balance" i]', '[data-testid*="points-balance" i]'],
    statusSelectors: [],
  },
  {
    id: 'amex-membershiprewards',
    name: 'American Express Membership Rewards',
    category: 'credit-card',
    loginUrl: 'https://www.americanexpress.com/en-us/account/login',
    balanceUrl: 'https://global.americanexpress.com/rewards/summary',
    keywords: ['membership rewards', 'points'],
    balanceSelectors: ['[class*="points-balance" i]', '[data-testid*="rewards-balance" i]'],
    statusSelectors: [],
  },
  {
    id: 'citi-thankyou',
    name: 'Citi ThankYou Points',
    category: 'credit-card',
    loginUrl: 'https://online.citi.com/US/login.do',
    balanceUrl: 'https://online.citi.com/US/ag/thankyourewards/dashboard',
    keywords: ['thankyou', 'points'],
    balanceSelectors: ['[class*="points-balance" i]'],
    statusSelectors: [],
  },
];
