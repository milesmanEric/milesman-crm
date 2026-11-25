# Miles Man CRM — desktop app

An Electron wrapper around the hosted CRM (https://milesmaneric.github.io/milesman-crm/).
It loads the hosted site on purpose: OAuth redirects (Google, Microsoft, WordPress, Facebook, X),
the Vercel endpoints and the CRM's local data are all tied to that origin, and you always get the latest version.

## Run / build
    cd desktop
    npm install
    npm start            # run it
    npm run dist         # build an installer for this OS (output in desktop/dist)

Or run the **Build desktop app** GitHub Action (Actions tab) to get Windows, macOS and Linux installers as downloadable artifacts.

Notes: installers are unsigned, so Windows SmartScreen / macOS Gatekeeper will warn on first open
(macOS: right-click → Open). Needs internet; offline shows a retry page.
