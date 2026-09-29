// Hotel loyalty program definitions. See _shared.js for the "these
// selectors are unverified guesses" disclaimer — it applies to every
// entry below.

module.exports = [
  {
    id: 'marriott-bonvoy',
    name: 'Marriott Bonvoy',
    category: 'hotel',
    loginUrl: 'https://www.marriott.com/loyalty/login/default.mi',
    balanceUrl: 'https://www.marriott.com/loyalty/myAccount/default.mi',
    keywords: ['bonvoy', 'points'],
    balanceSelectors: ['[class*="points-balance" i]', '.member-points'],
    statusSelectors: ['[class*="elite-tier" i]', '[class*="member-tier" i]'],
  },
  {
    id: 'hilton-honors',
    name: 'Hilton Honors',
    category: 'hotel',
    loginUrl: 'https://www.hilton.com/en/hilton-honors/sign-in/',
    balanceUrl: 'https://www.hilton.com/en/hilton-honors/guest/my-account/',
    keywords: ['honors', 'points'],
    balanceSelectors: ['[class*="points-balance" i]', '[data-testid*="points" i]'],
    statusSelectors: ['[class*="tier-status" i]'],
  },
  {
    id: 'hyatt-worldofhyatt',
    name: 'World of Hyatt',
    category: 'hotel',
    loginUrl: 'https://world.hyatt.com/content/gp/en/login.html',
    balanceUrl: 'https://world.hyatt.com/content/gp/en/member/dashboard.html',
    keywords: ['world of hyatt', 'points'],
    balanceSelectors: ['[class*="points-balance" i]'],
    statusSelectors: ['[class*="tier-name" i]'],
  },
  {
    id: 'ihg-onerewards',
    name: 'IHG One Rewards',
    category: 'hotel',
    loginUrl: 'https://www.ihg.com/onerewards/content/us/en/sign-in',
    balanceUrl: 'https://www.ihg.com/onerewards/content/us/en/member/dashboard',
    keywords: ['one rewards', 'points'],
    balanceSelectors: ['[class*="points-balance" i]'],
    statusSelectors: ['[class*="elite-status" i]'],
  },
];
