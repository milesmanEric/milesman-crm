// Miles Man CRM — X (Twitter) OAuth 2.0 token exchange + refresh.
//
// WHERE THIS GOES: copy to api/x-token.js in the milesman-auth Vercel
// project (the one at C:\Users\ericl\milesman-auth-fix), then deploy with
// `vercel --prod` from that folder. It is NOT part of the milesman-crm
// repo's own deploy — that's GitHub Pages, which serves static files only
// and can't hold a secret.
//
// REQUIRED VERCEL ENV VARS (Project Settings -> Environment Variables):
//   X_CLIENT_ID      — OAuth 2.0 Client ID from the X Developer Portal
//   X_CLIENT_SECRET  — OAuth 2.0 Client Secret from the same app
//
// Also set X_CLIENT_ID (the same value — it isn't secret) in index.html's
// X_CLIENT_ID constant, which is currently blank.
//
// X SETUP (developer.x.com -> your Project -> your App -> User authentication settings):
//   - App permissions: Read
//   - Type of App: Web App, Automated App or Bot   <- this is what makes it a
//     confidential client and gives you a Client Secret; a "Native App" is a
//     public client with no secret and won't work with this endpoint
//   - Callback URI: https://milesmaneric.github.io/milesman-crm/
//   - Website URL: https://themilesman.com/
//
// COST: X has no usable free tier as of Feb 2026 — reads are billed
// per request (~$0.010 for a user-scoped read like /2/users/me). The CRM
// caches one snapshot per calendar day to keep this to roughly one read
// per day. Adding a payment method in the X Developer Portal is required
// before any read will succeed.

const TOKEN_URL = 'https://api.x.com/2/oauth2/token';

module.exports = async (req, res) => {
  // The CRM is served from GitHub Pages, a different origin than this
  // proxy, so the browser preflights this POST.
  res.setHeader('Access-Control-Allow-Origin', 'https://milesmaneric.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'server_not_configured', error_description: 'X_CLIENT_ID / X_CLIENT_SECRET are not set on this Vercel project.' });
    return;
  }

  const body = req.body || {};
  let form;

  if (body.grant_type === 'refresh_token') {
    if (!body.refresh_token) { res.status(400).json({ error: 'missing_refresh_token' }); return; }
    form = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: body.refresh_token,
      client_id: clientId
    });
  } else {
    if (!body.code || !body.redirect_uri || !body.code_verifier) {
      res.status(400).json({ error: 'missing_params', error_description: 'code, redirect_uri and code_verifier are all required.' });
      return;
    }
    form = new URLSearchParams({
      grant_type: 'authorization_code',
      code: body.code,
      redirect_uri: body.redirect_uri,
      code_verifier: body.code_verifier,
      client_id: clientId
    });
  }

  try {
    // X requires HTTP Basic auth on the token endpoint for confidential
    // clients (an app created as "Web App, Automated App or Bot"), even
    // though client_id is also in the form body.
    const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + basic
      },
      body: form.toString()
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { data = { error: 'bad_response', error_description: text.slice(0, 500) }; }
    // Pass X's own status through — a 401 here almost always means the
    // App type is wrong (Native App instead of Web App, so no secret) or
    // the secret was regenerated in the Developer Portal without updating
    // the X_CLIENT_SECRET env var here.
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'proxy_error', error_description: e.message });
  }
};
