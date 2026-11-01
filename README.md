# milesman-crm

Client CRM for The Miles Man.

Outlook email sync via Microsoft Graph; Google Drive JSON backup (plus an optional server-verified Secure Sync path).

Password-gated per device (client-side only — a casual deterrent, not real security; see DOCUMENTATION.md §1).

Static single-page app, deployed via GitHub Pages.

Sync is incremental after the first run.

Book a Trip form submissions import via CSV, or automatically from the connected Outlook inbox every 5 minutes.

See [USER_GUIDE.md](USER_GUIDE.md) for how to actually use the CRM day to day, or [DOCUMENTATION.md](DOCUMENTATION.md) for the full architecture, data model, feature list, and integration details.

Legal compliance tracker: open [compliance-tracker.html](compliance-tracker.html) — federal + 50-state (and DC) requirements register with deadlines, owners, evidence links, a state map, CSV/JSON/.ics export. Stored locally in the browser; starter items are a checklist, not legal advice.
