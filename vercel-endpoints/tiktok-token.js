// Miles Man CRM — TikTok OAuth 2.0 token exchange + refresh.
//
// WHERE THIS GOES: copy to api/tiktok-token.js in the milesman-auth Vercel
// project (C:\Users\ericl\milesman-auth-fix), then `vercel --prod`. Not
// part of the milesman-crm repo's own deploy (GitHub Pages, static files
// only, no secret storage).
//
// REQUIRED VERCEL ENV VARS:
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://milesmaneric.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

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
};
