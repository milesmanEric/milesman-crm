// Miles Man CRM — TikTok OAuth 2.0 token exchange/refresh AND Display API
// CORS relay, merged into one file.
//
// WHY MERGED: Vercel's Hobby (free) plan caps a deployment at 12 Serverless
// Functions. After merging api/x.js and api/facebook.js, the milesman-auth
// project's api/ folder is already exactly at that 12-file cap — adding
// tiktok-token.js + tiktok-api.js as two more files would push it to 14.
// They're combined here into one function, the same technique already used
// for api/canva.js, api/x.js and api/facebook.js. Even as one merged file
// this still tips the count to 13 — see the "ANOTHER SLOT NEEDED" note
// below, one more existing pair needs merging first (wordpress-token.js +
// wordpress-stats.js are the obvious candidate, same shape as this one).
//
// WHERE THIS GOES: copy to api/tiktok.js in the milesman-auth Vercel
// project (C:\Users\ericl\milesman-auth-fix), then DELETE the old
// api/tiktok-token.js and api/tiktok-api.js if they were ever added.
// index.html's own calling code still hits the two original URLs
// (/api/tiktok-token, /api/tiktok-api) unchanged — a vercel.json rewrite
// (see below) routes both of those paths to this one file.
//
// HOW THE TWO HALVES ARE TOLD APART: same as api/x.js — token exchange is
// always POST, the Display API relay is always GET, so req.method alone
// is enough (TikTok's relay, unlike Facebook's, never needs POST).
//
// REQUIRED vercel.json rewrites (add these two entries to the existing
// "rewrites" array alongside the x/facebook ones — don't replace the
// file, just add to the array):
//   { "source": "/api/tiktok-token", "destination": "/api/tiktok" },
//   { "source": "/api/tiktok-api", "destination": "/api/tiktok" }
//
// REQUIRED VERCEL ENV VARS (Project Settings -> Environment Variables):
//   TT_CLIENT_KEY     — Client Key from the TikTok Developer Portal app
//   TT_CLIENT_SECRET  — Client Secret from the same app
//
// Also set TT_CLIENT_KEY (the same value — it isn't secret, TikTok's own
// naming just distinguishes "key" from "secret") in index.html's
// TT_CLIENT_KEY constant, which is currently blank.
//
// TIKTOK SETUP (developers.tiktok.com -> Manage apps -> your app):
//   - Add the "Login Kit" product
//   - Scopes: user.info.basic, user.info.stats (the second one is an
//     unconfirmed guess at TikTok's post-Feb-2024 scope split — if the
//     token exchange succeeds but the CRM's TikTok card shows a
//     scope_not_authorized error, check the app's actual available scope
//     names in the Developer Portal and fix TT_SCOPE in index.html)
//   - Redirect URI: https://milesmaneric.github.io/milesman-crm/
//   - Submit for App Review before this will return real data — a fresh
//     app only works for "sandbox target users" you whitelist yourself in
//     the Developer Portal, not for the actual connected account
//
// No PKCE needed here (unlike the X/Canva proxies) — TikTok only requires
// it for desktop/iOS/Android public clients; a web app with its secret
// held server-side (here) is a confidential client and doesn't need it.
//
// COST: free, no per-request billing (unlike X, §4.10 in DOCUMENTATION.md).

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const ALLOWED_PREFIXES = ['/v2/user/info/'];

// Exchanges/refreshes a TikTok OAuth authorization code for an access
// token — index.html's own calling code always POSTs here.
async function handleTokenExchange(req, res) {
  const clientKey = process.env.TT_CLIENT_KEY;
  const clientSecret = process.env.TT_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    res.status(500).json({ error: 'server_not_configured', error_description: 'TT_CLIENT_KEY / TT_CLIENT_SECRET are not set on this Vercel project.' });
    return;
  }

  const body = req.body || {};
  let form;

  if (body.grant_type === 'refresh_token') {
    if (!body.refresh_token) { res.status(400).json({ error: 'missing_refresh_token' }); return; }
    form = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: body.refresh_token
    });
  } else {
    if (!body.code || !body.redirect_uri) {
      res.status(400).json({ error: 'missing_params', error_description: 'code and redirect_uri are both required.' });
      return;
    }
    form = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: body.code,
      grant_type: 'authorization_code',
      redirect_uri: body.redirect_uri
    });
  }

  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: form.toString()
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { data = { error: 'bad_response', error_description: text.slice(0, 500) }; }
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'proxy_error', error_description: e.message });
  }
}

// Relays TikTok Display API GET calls — index.html's own calling code
// always GETs here with ?path=... and the caller's own TikTok user access
// token in the Authorization header. No secret lives in this half at all.
async function handleApiRelay(req, res) {
  const auth = req.headers.authorization;
  if (!auth) { res.status(401).json({ error: 'missing_authorization' }); return; }

  const path = req.query.path;
  if (!path) { res.status(400).json({ error: 'missing_path' }); return; }

  // Only relay the one read endpoint this app actually uses — keeps a
  // leaked or borrowed token from driving arbitrary calls (posting,
  // deleting video, etc.) through this proxy.
  if (!ALLOWED_PREFIXES.some(p => path.startsWith(p))) {
    res.status(403).json({ error: 'path_not_allowed', error_description: 'This relay only serves the TikTok read endpoint used by the CRM.' });
    return;
  }

  const params = new URLSearchParams();
  Object.keys(req.query).forEach(k => { if (k !== 'path') params.append(k, req.query[k]); });
  const qs = params.toString();
  const url = 'https://open.tiktokapis.com' + path + (qs ? '?' + qs : '');

  try {
    const r = await fetch(url, { headers: { Authorization: auth } });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { data = { error: { code: 'bad_response', message: text.slice(0, 500) } }; }
    // TikTok wraps errors in {error:{code,message,log_id}} with HTTP 200
    // in some cases and a real 4xx/5xx status in others — pass the actual
    // HTTP status through so the browser's own error handling (which
    // checks resp.error.code) sees whichever shape TikTok actually sent.
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { code: 'proxy_error', message: e.message } });
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://milesmaneric.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method === 'POST') { await handleTokenExchange(req, res); return; }
  if (req.method === 'GET') { await handleApiRelay(req, res); return; }

  res.status(405).json({ error: 'method_not_allowed' });
};
