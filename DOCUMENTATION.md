# Miles Man CRM — Documentation

A single-file CRM for a travel agency built around points/miles-based bookings, plus a public lead-intake form embedded on the agency's WordPress site.

- **CRM**: [index.html](index.html)
- **Public intake form**: [intake-form.html](intake-form.html) — embedded on `themilesman.com/book-a-trip-form/` via an `<iframe>`

---

## 1. Architecture

- **Static, client-side only.** No backend server, no database. Both pages are self-contained HTML/CSS/JS files.
- **Hosting**: GitHub Pages, served from the `main` branch at `https://milesmaneric.github.io/milesman-crm/`.
- **Persistence**: the CRM's entire dataset lives in the browser's `localStorage` under the key `milesman_crm_v2`, as one JSON blob (`db = {clients, trips, vendors, planner}`). There is no server-side copy — the only durable backup is the Google Drive JSON export (see [§4.1](#41-google-drive-backup)).
- **Deploy process**: edit the file, commit, push to `main`. GitHub Pages auto-deploys. No build step.
  - Line endings must be `LF`, not `CRLF` (Windows editors default to CRLF — normalize before committing, e.g. `sed -i 's/\r$//' index.html`).
- **Third-party services used**: Google Drive API (backup), Microsoft Graph API (Outlook email sync + auto-import), Mailchimp API (campaign activity sync), submit-form.com (public form submission backend). API keys/secrets for Drive and Mailchimp are held server-side by a small proxy (`milesman-auth.vercel.app`, referenced in code as `DRIVE_AUTH_SERVER`) since those APIs don't support CORS from a browser. Outlook uses OAuth PKCE directly from the browser (no proxy needed — Microsoft's token endpoint supports CORS for SPAs).
  - The proxy's source lives locally at `C:\Users\ericl\milesman-auth-fix` (not a git repo — deployed straight to Vercel via `vercel --prod` from that folder, project name `milesman-auth`). It has three endpoints: `api/token.js` (Microsoft), `api/drive-token.js` (Google Drive token exchange/refresh, holds `GOOGLE_CLIENT_SECRET`), `api/mailchimp.js` (holds `MAILCHIMP_API_KEY`) — plus `api/secure-sync.js`, see §4.1a.
- **Password gate**: the app is wrapped in `bootApp()`, which only runs after a client-side password screen is passed (or immediately, if `localStorage['mm_authed']==='1'` from a prior unlock on that device). The password itself is never hardcoded — first use on a device prompts to set one, and only a per-device salted SHA-256 hash (`mm_auth_hash`/`mm_auth_salt`) is stored, never transmitted anywhere. **This is explicitly not real security** — the repo is public, so both the check's logic and the `localStorage` data it's guarding are readable by anyone who looks at the source or opens dev tools; it only stops a casual visitor who stumbles on the GitHub Pages URL from seeing client data at a glance. See §4.1a (Secure Sync) for the one path that does have real server-side verification. Sidebar controls: **Lock** (clears `mm_authed`, re-prompts), **Change Password** (requires the current password), and a **Forgot password?** link on the login screen (resets just the gate, never touches CRM data, after a confirm).

---

## 2. Data Model

`db` has four top-level arrays, each with a human-readable ID prefix (`newId('C', db.clients)` etc.):

### `db.clients` (`C001`, `C002`, ...)
Core identity: `name` (stored "Last, First"), `email`, `phone`, `streetAddress`, `city`, `state`, `zip`, `birthdate`, `countryOfCitizenship`, `countryOfBirth`.

Lead source: `referredBy`, `referredByDetail`.

Preferences: `preferredAirline`, `preferredHotel`, `preferredCruiseLine`.

Loyalty balances: `mileageBalances` (airlines), `hotelBalances`, `cruiseBalances`, `carRentalBalances` are each an object keyed by brand name → `{balance, status}`; `creditCardBalances` is keyed by card name → a plain number (credit cards have no status tier).

Flags: `isPayingClient`, `isSubscriber` (both toggleable inline from the Clients table).

Other: `notesLog` (array of `{ts, text, noteType, source?, msgId?, mcKey?}` — the activity timeline), `attachments`, `joined`, `totalTrips`.

`referralCredits` — array of `{referredName, date, amount, used, certNumber}`, shown/edited in a "Referral Credits" section on the client form (name, date, $ amount, a "Used" checkbox, delete button, "+ Add Referral Credit" for a manual row). `certNumber` is shown as a small read-only `#000123` badge — it's system-assigned (see §3 Email's certificate mechanics) and only present on rows created by actually sending the certificate email; a manually-added row has no certificate and no number. Sending the "Referral Credit Earned" email template (§3 Email) auto-appends one row per referred person to each selected referrer's record — see §3 Email for the multi-referrer/referred mechanics.

### `db.trips` (`T001`, `T002`, ...)
`clientId`/`clientName` = primary/billing contact. `clientIds` = array of additional linked client IDs (companions on a shared trip — a trip shows up on every linked client's record, not just the primary contact's).

`origin`, `destination`, `departDate`, `returnDate`, `status` (Planning / Confirmed / Completed / Cancelled), `type` (Leisure/Business/Honeymoon/Family/Adventure), `airline`, `flightClass`, `hotel`, `hotelNights`, `cruiseLine`, `shipName`, `pointsUsed`, `cashPaid`, `totalValue`, `bookingRef`, `invoiceDate`, `product`, `supplierId`/`supplierName`, `notes` (freeform — most intake-form fields that don't have a dedicated column end up compiled here as `Label: value` lines).

`invoiceDate` is a separate concept from `departDate` — `departDate` prioritizes the *travel* date (Ship Date on a revenue import) when one exists, while `invoiceDate` is the actual transaction/booking date from the source file's own "Date" column. The two can legitimately differ (booked one month, travel happens the next), which is why the "By Invoice #" report (§3) lets you choose which one to filter by. Only the revenue importer populates it automatically; it's also editable by hand on the Add/Edit Trip form for any trip.

`invoiceDate` didn't exist before this field was added, so trips imported before then have no value for it at all — re-running the exact same revenue import backfills it onto the matching existing trip (`finalizeImport()`'s duplicate-detection branch), the same way it already backfilled a supplier that was added to the Suppliers list after a trip's first import. Re-importing never creates a duplicate trip; it only fills in whatever the existing trip is still missing (supplier link and/or `invoiceDate`).

These top-level fields are the at-a-glance summary used by the Trips list, Calendar, Dashboard, and CSV exports — they stay populated exactly as before and nothing else had to change when `booked` (below) was added.

`booked` — the **Booked Trip Details** section (Add/Edit Trip modal), a confirmed-booking recap organized into the same categories as the intake form's "Type of Travel Needed" checkboxes, each with its own confirmation number and its own `price` (a plain dollar amount, separate from the trip's top-level `totalValue`/`cashPaid` — lets a trip's cost be broken down by category, e.g. $2,000 for the flight vs. $500 for the tour):
- `booked.airline` — `confirmationNumber`, `nonStop` (Yes/No), `price`, `pts` (see below), and `segments`: an **array** of flight-leg entries (a connecting or round-trip itinerary is more than one leg), each `{airline, flightNumber, origin, destination, departDate, departTime, arrivalTime, classOfService}`. Confirmation Number, the points redemption blocks, and Price stay at the section level (one PNR/one price covers the whole booking) rather than varying per segment. An old trip's single-flight shape (which used to hold `airline`/`classOfService`/`origin`/`destination`/`departDate` directly, plus a `returnDate`) still loads fine — it gets wrapped into a 1-2 entry `segments` list (the return leg becomes a second entry with origin/destination swapped) rather than losing that data.
- `booked.hotel` — an **array** of hotel-stay entries (a trip can have multiple hotels), each `{hotelBrand, confirmationNumber, checkInDate, nights, price, program, amount}` — already had its own per-entry `price` before this round of categories got one.
- `booked.cruise` — `confirmationNumber`, `cruiseLine`, `shipName`, `sailingDate`, `nights`, `departurePort`, `loyaltyNumber`, `price`, and `cabins`: an **array** of cabin entries (a booking can cover more than one cabin on the same sailing), each `{cabinType, peopleInCabin}` — same dynamic add/remove pattern as `booked.hotel`/`booked.tours`; an old trip's single `cabinType`/`peopleInCabin` shape still loads fine as a one-entry list. Cabin Type options come from `getQuoteConfig(cruiseLine).cabinTypes` (the same config Email Quote uses), so every cabin row is rebuilt whenever Cruise Line changes.
- `booked.carRental` — `confirmationNumber`, `company`, `carSize`, `pickupLocation`, `dropoffLocation`, `pickupDate`, `dropoffDate`, `pickupTime`, `dropoffTime`, `price`
- `booked.tours` — an **array** of tour entries (a trip can book more than one tour/activity), each `{confirmationNumber, vendor, description, price}` — same dynamic add/remove pattern as `booked.hotel`, an old single-object shape gets wrapped into a one-entry list. `vendor` is a dropdown (`TOUR_VENDORS` = every `CRUISE_LINES` entry plus Tauck/Viator/Get Your Guide — a booked tour is often a cruise-line shore excursion), not free text.
- `booked.themePark` — `confirmationNumber`, `park`, `ticketType`, `price`
- `booked.train` — `confirmationNumber`, `departureCity`, `arrivalCity`, `departureDate`, `returnDate`, `classOfService`, `price`
- `booked.bus` — same shape as `booked.train`: `confirmationNumber`, `departureCity`, `arrivalCity`, `departureDate`, `returnDate`, `classOfService`, `price`

`pts` (on `booked.airline` only — `booked.hotel` entries have their own single `program`/`amount`/`price` instead, one per hotel stay) is an array of up to 3 miles/points redemption blocks, each `{program, amount, cost}` — `program` is picked from a combined list of all airlines, hotels, and credit cards (a booking often mixes airline miles with a transferred credit-card-points balance), `amount` is points/miles used, `cost` is the cash paid alongside them (e.g. taxes/fees). Empty blocks/rows are filtered out on save, not stored as blanks.

A trip saved before `booked` existed has no such key at all — every reader treats it as `{}`/`[]`, so old trips open and re-save cleanly without migration.

### `db.vendors` (`V001`, ...) — "Suppliers" in the nav
`name`, `type` (Supplier / Referral Partner / DMC), `category` (Airline/Hotel/Cruise Line/Car Rental/Tour Operator/Other), `clientIds` (clients who've booked through this vendor), `website`, `notes`.

### `db.planner` (`PL001`, ...)
Follow-up tasks: `title`, `dueDate`, `done`, `clientId`, `tripId` (links back to the trip that spawned it), `completionNoteType`, `desc`, `createdAt`.

---

## 3. Navigation / Features

The left nav has 7 sections (`view` state: `dashboard`, `clients`, `trips`, `vendors`, `planner`, `reports`, `calendar`, `email`).

### Dashboard
Summary stats (client count, total trips, confirmed, upcoming, **Total Revenue**, points deployed), a recent-trips table, and a top-clients-by-revenue list.

**Points deployed** (`tripBookedPoints()`) totals only the granular redemption entries recorded in each trip's Booked Trip Details — `booked.airline.pts[].amount` plus every `booked.hotel[].amount` — not the simple top-level `pointsUsed` field on the trip's basic form, which is a separate, less precise number that isn't rolled into this total. The drill-down list is built the same way, one row per trip with `tripBookedPoints(t) > 0`.

The **Total Revenue** and **Upcoming** stat tiles' drill-down lists (§ below) are filtered to trips whose *displayed* status is Completed or Upcoming — Planning, Confirmed, and Cancelled trips are excluded from those two lists specifically (a Completed trip with a future `departDate` displays as "Upcoming" and counts for both). The headline dollar/count figures themselves are unaffected — only the drill-down row lists are filtered. The other stat tiles' drill-downs (Clients, Total trips, Confirmed, Points deployed) are unfiltered by status, same as before.

### Clients
Searchable/sortable table (search matches name, email, city). Click a row to open the Add/Edit Client modal with the full field set from §2, plus a note-taking timeline (`notesLog`) with typed entries (Email Sent/Received, Initial Call, Follow-up, General, Trip Import, Text Message Sent/Received, Lead, Mailchimp Email Sent, Facebook Message), file attachments, and inline Paying Client / Subscriber toggles.

Stats: Clients, Total Revenue, Total Trips.

### Trips
Searchable/sortable table with inline status badges, points/value columns, supplier links, and invoice numbers. Stats: Trips (Distinct Invoices), Total Revenue.

The Add/Edit Trip modal covers flight, hotel, cruise, and generic per-brand loyalty-balance sections (shown/hidden based on which client is selected, mirroring their stored balances), plus a **Booked Trip Details** section — see §2's `booked` field for the full schema. It's organized into Airline / Hotel / Cruise / Car Rental / Tours / Theme Park / Train / Bus, each with its own confirmation number field; Airline and Hotel additionally capture miles/points redemptions (program + amount + cash cost). Cruise Line selection cascades the Ship Name and Cabin Type dropdowns, reusing the same option lists as the quote builder (`getQuoteConfig`).

### Suppliers (`vendors`)
Vendor/partner directory with per-vendor stats (trip count, linked clients, revenue) computed live from `db.trips`. Page-level stats: Total Suppliers, Total Trips, Total Clients, Total Revenue.

**Revenue import creates a missing Supplier automatically.** `extractRevenueRow()` still matches a row's Name against existing Suppliers by exact case-insensitive name first, but if nothing matches and Name differs from Class (i.e. Name is presumed to be the supplier being paid), it now carries that candidate name forward instead of leaving the trip supplier-less. `finalizeImport()` creates the Supplier record for it — before creating/linking the client or trip for that row — deduping by name within the same import batch so multiple rows naming the same new supplier don't create duplicates. This applies to both the manual "Clean & Import Revenue File"/"Import Revenue CSV" paths and the automatic Outlook revenue-report email sync (§4.4), since they share this same pipeline. Re-running an import after a supplier now exists (auto-created or manually added) also backfills it onto any already-imported trip that was missing one, the same way it already backfills `invoiceDate`. The weaker Item/Class-text substring match (used only when Name itself doesn't clearly indicate a supplier) still never auto-creates — that heuristic is too speculative to safely mint new Supplier records from.

### Planner
Task list of follow-ups, most created automatically by the trip-form importer (one per new submission) or the contact-form importer (§4.5). Stats: Open Tasks, Total Tasks.

Checking a task's box (`toggleTaskDone(id, skipRender)`) saves the change immediately but updates that row in place (checked, struck through, faded) instead of fully re-rendering the list — so it stays visible and its edit/delete buttons stay reachable right after checking it, rather than instantly disappearing from the Open-tasks filter. The row drops out of view the next time the Planner page actually re-renders (navigating away and back, or changing the Open/Done filter). Delete (trash icon) always works immediately regardless.

### Clickable stat tiles (drill-down)
Every stat tile at the top of a page (Dashboard, Clients, Trips, Suppliers, Planner) is clickable and opens a modal listing the records behind that number, each row clickable through to open that client/trip/supplier/task (`openStatDrilldownModal()`). The two stats that live inside another already-open modal — Vendor Detail and Invoice Detail — instead scroll to and briefly highlight the breakdown table already shown right below them (`flashDrilldownTarget()`), since the app has a single shared modal container and can't nest a second modal on top of the first.

### Reports
Three tabs (`window._rptActiveTab`: `activity` / `invoice` / `certs`):
- **Activity Report** — filter `notesLog` entries across all clients by date range, note type, and client; export to CSV.
- **By Invoice #** — filter trips by date range, supplier, and client; export to CSV. ("Invoice" here means a distinct trip/booking reference, used to avoid double-counting revenue across records that share a booking.) The date range can filter by either **Travel Date** (`departDate`) or **Invoice Date** (`invoiceDate`) — pick whichever matches what you're trying to answer, since a trip's travel date and its transaction/booking date can fall in different periods. Both dates are shown as separate columns in the results and CSV export regardless of which one is being filtered.
- **Unused Certificates** (`getUnusedCertificatesReportData()`) — scans every client's `referralCredits` and groups the rows by `certNumber` (one certificate can have a row on more than one client's record — see the Email section below on **Referral Credit Earned**), collecting the full set of referrer names and referred names onto each group, then filters out any group where `used` is true. Optionally filterable to one referrer client; exports to CSV; clicking a row opens the first referrer's client record. Since `syncReferralCreditUsedAcrossClients()` (see below) keeps every row for a given certNumber in sync, a group's `used` flag is really one shared fact, not independent per row.

### Calendar
Month-grid view. Trips are painted across every day from `departDate` to `returnDate` (capped at 60 days per trip to avoid runaway rendering on bad data).

### Email
A lightweight mail-merge tool: pick a client (or, for the referral template, multiple clients — see below), pick one of the canned templates (`TEMPLATES` in index.html — Welcome New Client, General Follow-Up, Trip Confirmation, Thank You & Referral, **Referral Credit Earned**), preview with placeholders substituted, then send.

Most templates use `{{firstName}}`/`{{fullName}}`/`{{email}}` against a single selected client and send as a plain-text `mailto:` body (mailto bodies can't carry HTML/images). **Referral Credit Earned** (`requiresReferral:true` on its `TEMPLATES` entry, no `body` string — see below) is different in every respect:

- Selecting it swaps "1. Select Client" into a multi-select checkbox list labeled "Referrer(s)", and reveals a second multi-select checkbox list, "Referred Client(s)". Picking the same client as both a referrer and a referred client shows an inline warning instead of sending a nonsensical email.
- **$100 referral bonus certificate**: exactly **one** per send, regardless of how many referrers or referred people are selected — `referralCertificateHtml()` shows the Miles Man logo, every selected referrer's name joined onto the "issued to" line (`joinNames()` — "Aaron and Alice", "Aaron, Alice, and Sam"), a unique sequential number, and fixed terms text (good for $100 off next booking fees/trip cost; a trip means a unique booking record number; no value once redeemed; non-transferable but usable when booking a trip for someone else via the referrer's own miles/points/credit card).
- **Referral credit rows still track per (referrer, referred person) pair**: `addReferralCreditEntries()` still writes one `referralCredits` row (§2) per referrer per referred person onto each referrer's own client record, so e.g. 2 referrers together referring 2 people is 4 credit rows — but all 4 share the *same* `certNumber`, since only one certificate was actually issued for the whole send. Because more than one client's record can hold a row for the same certNumber, checking (or unchecking) a row's "Used" box and saving that client propagates the same used/unused state onto every other client's row sharing that certNumber (`syncReferralCreditUsedAcrossClients()`, called from `saveClient()`) — a certNumber's used status is one shared fact, not independent per client.
- **Certificate numbering**: a single ever-increasing counter, `localStorage['mm_next_certificate_number']` (starts at 1, never reused, never reset). `peekNextCertificateNumber()` reads it for preview display without advancing it; `consumeCertificateNumbers(1)` is the only thing that actually advances it, and only runs once per send — `renderReferralCreditPreview()`'s `finalize()` memoizes the result so clicking both "Open in Outlook" and "Log as Note" (or either twice) for the same preview doesn't burn an extra number or double-add credit rows. Previewing/reselecting clients never consumes a number, only an actual send/log does.
- **Sending mechanics differ from every other template here**: because the certificate embeds a logo image, this can't go out as a plain mailto: body. `renderReferralCreditPreview()` builds styled HTML (`referralCreditEmailBodyHtml()`) and copies it to the clipboard (`copyHtmlToClipboard()`, same technique Email Quote/Itinerary use) before opening a subject-only `mailto:` for pasting into Outlook.
- **PDF "attachment"**: a `mailto:` link has no way to attach a file automatically (true of every email client, not a limitation specific to this app). Clicking "Open in Outlook" also renders just the certificate (`certificatesPdfHtml()`, via the same `generateQuotePdfBlob()` used for quote PDFs) and triggers a browser download (`downloadPdfBlob()`) named `Referral-Certificate-<number>.pdf` — the closest real equivalent to an attachment, with a toast telling the user to attach the downloaded file manually. "Log as Note" doesn't download a PDF (no email is actually being opened on that path).

There are two **separate**, more elaborate modals reached from header buttons in the Email menu:

- **Email Quote** (`openEmailQuoteModal`) — purpose-built for building line-itemized cruise pricing quotes by hand. `QUOTE_TEMPLATE_LINES` lists which cruise lines get a full styled HTML template (header/hero/pricing table/included-items/payment-terms) instead of the generic plain-text fallback every other cruise line uses: **Virgin Voyages, Princess, Royal Caribbean, Ritz Carlton Yachts, Seabourn, Explora Journeys, Windstar**. Virgin Voyages and Princess have their own named cabin-tier/fare-tier/add-on structure (`QUOTE_CRUISE_CONFIG`); the other five (Royal Caribbean, Ritz Carlton Yachts, Seabourn, Explora Journeys, Windstar) share one generic Cabin/Suite Category + Total Price + Insurance + Add-ons structure — the row *labels* are generic, but of these five, Ritz Carlton Yachts/Seabourn/Explora Journeys/Windstar now populate real named cabin/suite categories in that Cabin Category column too (via `QUOTE_CRUISE_CONFIG`'s `cabinTypes`, the same lists §2's `booked.cruise.cabins` uses), while Royal Caribbean still falls back to generic Interior/Window/Balcony/Suite since it has no `QUOTE_CRUISE_CONFIG` entry of its own. Each of the seven has its own `xxxQuoteOpts()`/`xxxQuoteHtml()`/`xxxQuoteBodyHtml()` trio and its own "what's included" copy — the three ultra-luxury lines (Ritz Carlton Yachts, Seabourn, Explora Journeys) are all-inclusive, so their included-items lists reflect that (all-suite, all dining, beverages including spirits, gratuities, WiFi); Windstar isn't an all-inclusive line, so it uses Royal Caribbean's non-inclusive Cabin Category structure and included-items copy (main dining, onboard entertainment, stateroom) instead.
  - **Logos**: the header shows the Miles Man logo plus (when set) the cruise line's own logo, via a `cruiseLogoDataUri`/`Width`/`Height`/`Alt` set of opts — falls back to Miles Man logo only if empty. Virgin Voyages, Princess, and Royal Caribbean logos were rasterized from Wikimedia Commons SVGs (`XXX_LOGO_DATA_URI` constants). Seabourn's is a low-resolution (452×190) PNG from Commons uploaded by a third party under CC0, not an official Carnival/Seabourn release — usable but lower quality/shakier provenance than the other three. **Ritz Carlton Yachts, Explora Journeys, and Windstar have no logo** (`''` placeholder) — nothing usable exists on Wikimedia Commons for any of the three (nothing at all for the Yacht Collection; the only Explora Journeys and Windstar copies found are Wikipedia non-free/fair-use content, not legally reusable in a commercial email) — all three fall back to Miles Man logo only until an official logo file is sourced from the brand's own press/media kit.
  - **PDF saved to Drive**: every sent quote (styled-template or plain-text) also gets rendered client-side to PDF (`generateQuotePdfBlob()`, via `html2pdf.js`) and uploaded fire-and-forget to a "Miles Man Quotes" Drive folder (`DRIVE_QUOTES_FOLDER_NAME`), named `<client name>.<cruise line>.<sailing date>.pdf` (falls back to `Quote` for a missing client/cruise line, or today's date for a missing sailing date). Silently skipped (with a toast) if Google Drive isn't connected — never forces a login redirect mid-send.
- **Email Itinerary** (`openEmailItineraryModal`) — pick a client, pick one of their actual `db.trips` records, and it generates a styled HTML recap straight from whatever that trip has filled in: dates, airline/flight class, hotel, cruise line/ship, booking reference, supplier, points/cash/total value, trip notes, plus a section per Booked Trip Details category (Car Rental, Tours, Theme Park, Train, Bus) sourced from `trip.booked` — every section (including these five) is conditional on the trip actually having that data, so e.g. a flight-only trip shows no Train/Bus/Car Rental/Tours/Theme Park boxes at all. Since `booked.tours` is an array, each tour entry gets its own "Tour Details" box (titled "Tour 1 Details", "Tour 2 Details", etc. once there's more than one). Reuses the same header/branding shell as Email Quote.

Both share the same send mechanics: the rendered HTML is copied to the clipboard (`copyHtmlToClipboard()` — `mailto:` bodies are plain-text only) and `mailto:` is opened to the client's address for pasting into Outlook, then an `Email Sent` note is logged on the client record.

---

## 4. Integrations

### 4.1 Google Drive Backup
"Backup to Google Drive" / "Restore from Google Drive" buttons (File menu, now grouped under a "Manual Fallback (not identity-verified)" label — see §4.1a). OAuth PKCE flow, token exchange/refresh proxied through `api/drive-token.js` (holds `GOOGLE_CLIENT_SECRET` server-side). Backs up the entire `db` object as one JSON file (`milesman-crm-backup.json`) via `driveBackup()`/`driveRestore()`, with the browser talking to the Drive API directly using its own access token.

**Multi-device conflict protection**: `mm_last_known_remote_modified` (localStorage) tracks the Drive file's `modifiedTime` as of this device's last successful backup or restore. Before any backup upload, `driveConflictDetected()` compares that against the file's *current* `modifiedTime` on Drive — if they differ, another device has backed up more recently, and the upload is blocked (with a toast telling the user to restore first) rather than silently overwriting newer data.

`DRIVE_SCOPE` includes `openid email` alongside `drive.file` — not used by this path at all, but every token exchange/refresh here also opportunistically returns and stores an `id_token` (`mm_drive_id_token`) purely so §4.1a's Secure Sync has a fresh one available without its own separate sign-in flow.

### 4.1a Secure Sync (server-verified alternative)
"Secure Sync: Save" / "Secure Sync: Load" (File menu, styled as the primary path, above the Manual Fallback group) — an additive alternative to §4.1, not a replacement; both read/write the exact same `milesman-crm-backup.json` file and can be used interchangeably. The difference is *who* decides whether the read/write happens:

- §4.1's buttons: the browser itself holds a Drive access token and talks to Drive directly — no server-side identity check beyond Google's own OAuth consent screen and `drive.file` scoping.
- Secure Sync: the browser sends a Google **ID token** (`mm_drive_id_token`, captured as a side effect of the §4.1 token flow — see above) to a new endpoint, `api/secure-sync.js`, on the `milesman-auth` Vercel proxy. That endpoint verifies the token against Google's `tokeninfo` endpoint (checks signature validity, audience, `email_verified`), checks the email against an `ALLOWED_EMAILS` allowlist, and only then uses its **own** stored Drive credential (`DRIVE_SERVER_REFRESH_TOKEN`, a one-time real OAuth grant from an allowed account) to read/write the backup file. The browser never holds a credential capable of reaching the data on this path.

Required Vercel env vars for `api/secure-sync.js` (in addition to the already-set `GOOGLE_CLIENT_SECRET`): `DRIVE_SERVER_REFRESH_TOKEN`, `ALLOWED_EMAILS` (comma-separated). Setup convenience: **Copy Drive Refresh Token** (Debug Panel area) copies this device's already-obtained `mm_drive_refresh` value to the clipboard for pasting into Vercel — no separate OAuth flow needed to stand up the server side, as long as Backup/Restore has been connected at least once already.

**This is real, not cosmetic**: unlike the password gate (§1), the verification here happens on a server the browser's own JS can't skip or edit. It narrows one specific gap — a third party with no access to an allowed Google account pulling the data over the network — but doesn't change anything about data already resident in a device's `localStorage`, and doesn't (yet) gate the app's own rendering/login, only this one sync path.

### 4.2 Outlook Email Sync
"Sync Outlook Emails" — OAuth PKCE against Microsoft Graph (`Mail.Read` scope). For every client with an email on file, pulls matching Inbox/Sent messages and logs them to that client's `notesLog` (as `Email Sent`/`Email Received` notes). Incremental after the first run via the `mm_last_outlook_sync` timestamp marker; "Reset Outlook Login" clears that marker to force a full resync. Pagination caps at 8,000 messages/folder per sync pass (`MAX_PAGES=80`, `$top=100`) — the Debug Panel logs a warning if a mailbox is too large to fully cover in one pass.

### 4.3 Mailchimp Activity Sync
Two related buttons:
- **Sync Mailchimp Activity** — fetches the single most-recently-sent Mailchimp campaign, then for each client checks (via the campaign activity-feed API, keyed by an MD5 hash of their lowercased email) whether they actually received it, and if so logs a `Mailchimp Email Sent` note with the campaign subject/body. Idempotent (a `mcKey` on each note prevents re-logging the same campaign for the same client).
- **Log Mailchimp Campaign** — a manual fallback: type in a subject/summary yourself and pick which clients to log it against, without hitting the Mailchimp API at all.

### 4.4 Automatic Trip-Form Email Import
Every 5 minutes (and once ~5s after page load), while the CRM tab is open, `checkForNewTripFormEmails()` polls the same connected Outlook inbox for new emails matching `TRIPFORM_EMAIL_SUBJECT_RE` — a loose regex (`/^New submission\b.*\bBook a trip$/i`) rather than one exact literal string, since the notification service's exact wording between "New submission" and "Book a trip" has already changed once ("for" → "-") and silently broke matching entirely until diagnosed — and imports each one automatically — creating/enriching client records and a trip record exactly like the manual CSV import (§5's "Import pipeline" below shares the same `processTripFormRow()` logic). `checkForNewContactFormEmails()` (§4.5) runs on the same `setInterval`/`setTimeout` calls, so both checks fire together every 5 minutes.

**Important constraint**: this is *only* a foreground-tab poller, not a real background job — there is no server to run it when nobody has the CRM open. **This used to fail completely silently** (no log line at all) when Outlook wasn't connected — now it logs `skipped — Outlook not connected` (same fix applied to §4.5 and the revenue-report email check) so a lapsed connection is visible in the Debug Panel instead of a silent no-op. It also now logs how many messages were fetched and any near-miss subject matches, to make a future subject-wording change easier to diagnose than the incident above was.

**Parsing approach**: submit-form.com's notification email has no reliable delimiter between fields in its plain-text form — an unanswered field just runs straight into the next field's label with no separator. `parseTripFormEmailText()` works around this by building the complete set of every field label the intake form can possibly submit (`buildTripFormFieldLabels()`, mirroring intake-form.html's `name="..."` attributes exactly, including the dynamic per-brand balance-grid and per-traveler fields), finding every one that actually appears in a given email in one regex pass (longest labels matched first, so e.g. "Referred By" can't shadow "Referred By Detail"; word-boundary-guarded so short labels like "Airline" don't match mid-word inside typed text like "Alaska Airlines"), and taking each match's value as the text up to the next matched label. A separate pass swaps the literal token "Other" for a sentinel wherever a select-with-Other field's value is genuinely "Other" (to disambiguate it from the immediately-following "X Other" label's own text), then maps it back after matching.

Deduplication: processed message IDs are kept in `mm_tripform_processed_ids` (capped at 500) so the same email is never imported twice.

**Whenever a new field is added to the intake form, several places need updating** (all in index.html) or the new field silently won't reach the CRM from a real submission:
1. The `addLine(...)` call in `processTripFormRow()` (so it lands in the trip's notes).
2. The label list in `buildTripFormFieldLabels()` (so the email importer can find it — the manual CSV import path doesn't need this, only the automatic email path).
3. If the field should also become a structured trip field rather than just free-text notes — the `db.trips.push({...})` object itself (see `tripDepartDate`/`tripReturnDate`'s fallback chain for an example of a field feeding a structured column from more than one possible source).
4. If the field is a brand name that might match an existing Supplier record (an airline, hotel brand, cruise line, car rental company, theme park, or tour vendor) — add it to the `matchVendorByName(...)` calls near the bottom of `processTripFormRow()` so the client gets linked onto that supplier and it's eligible to become the trip's `supplierId`. This path never creates a new vendor, only links to ones that already exist, matching by exact case-insensitive name. (The Revenue importer's `extractRevenueRow`/`finalizeImport` used to follow this same never-create rule too, but now creates a missing Supplier on the fly — see the Suppliers section in §3 — since a revenue report's Name column is a much stronger signal that the text really is a supplier than a Book a Trip form's brand-preference fields are.)

### 4.5 Automatic Contact-Form Email Import
The website's general contact form (`themilesman.com`, unrelated to the Book a Trip form) emails a `New submission from Miles Man Contact Form` notification per submission, in the same flattened "Label Value Label Value..." layout but with a much smaller fixed field set: `first_name`, `last_name`, `email`, `phone`, `message`, followed by a `Submitted <time> - <date>` footer.

`checkForNewContactFormEmails()` polls for this subject on the same 5-minute cycle as §4.4 (folded into the same `setInterval`/`setTimeout` calls, not a separate timer) and turns every submission into a lead via `processContactFormRow()`:
- Creates or matches/enriches a client record (same email/name matching as the trip-form importer).
- Logs a `Lead` note (`noteType: 'Lead'`) with the inquiry text.
- Creates a follow-up Planner task (`completionNoteType: 'Lead'`).

`message` is deliberately excluded from the generic label-boundary scan (`parseContactFormEmailText()`) and instead runs to the end of the text once its label is found — an inquiry can easily contain the words "email" or "phone" ("please email me back"), which would otherwise be mistaken by the scan for the start of a later field and truncate the message. Deduplication mirrors §4.4: processed message IDs in `mm_contactform_processed_ids` (capped at 500).

---

## 5. The Public Intake Form ("Book a Trip")

[intake-form.html](intake-form.html) is a standalone page with no dependency on index.html — it duplicates the constants it needs (`AIRLINES`, `HOTELS`, `CRUISE_LINES`, `CAR_RENTALS`, `CREDIT_CARDS`, their status-tier maps, `SHIPS_BY_CRUISE_LINE`, cabin-type maps) so they must be **kept in sync by hand** whenever one file's list changes — there is no shared module.

### Structure
- **Your Information**: contact details, structured address, preferences (Airline/Hotel/Cruise Line, each with an "Other" free-text fallback), and per-brand loyalty balance grids. "Number of Travelers" dynamically renders additional traveler blocks (name, DOB, citizenship, preferences, balances) for travelers 2+.
- **Trip Details**: a "Type of Travel Needed" checkbox row (Airline / Hotel / Tours / Cruise / Car Rental / Theme Park Tickets / Train / Bus) that each conditionally reveal their own detail section. **Destination** is a single always-visible field (not tied to any one checkbox, and not required) that sits above all of them, since it applies regardless of which service is needed.
  - **Airline Details** — departure/arrival city, dates, trip direction (+ dynamic multi-city stops), class of service (Basic Economy / Economy / Premium Economy / Business / First), a Non-Stop Flights Only yes/no question, and airline preference (with Other).
  - **Cruise Details** — cruise line (drives dependent Ship Name and Cabin Type dropdowns), nights, sailing date, departure port, cabin type, people in cabin, loyalty number, and — only when Cruise Line = Princess — a Cruisetour yes/no question. Cruise Line itself also has an Other free-text fallback.
  - **Hotel Details** — location, brand (with Other), a Check-in Date, nights, room type, people per room, number of rooms.
  - **Car Rental Details** — company (with Other), size, pickup/dropoff location, date, and time.
  - **Theme Park Details** — park (Disney World / Disneyland California / Universal Studios Hollywood / Universal Studios Orlando), and a multi-select ticket-type dropdown scoped to whichever park is chosen (each park has a different realistic ticket menu, e.g. Universal Orlando includes an Epic Universe standalone ticket and a 4-park hopper).
  - **Train** — departure/arrival city, departure/return date, and class of service (Coach / Business Class / First Class / Sleeper Car).
  - **Bus** — same fields as Train (departure/arrival city, departure/return date, class of service from the identical Coach / Business Class / First Class / Sleeper Car list), kept as a fully separate `booked.bus` category rather than folded into Train.
  - Tours Details (revealed by the Tours checkbox) also has a **Tour Vendor** pulldown (Tauck / Get Your Guide / Viator / Other) above the freeform description textarea.
  - Trip Type, Payment Preference, Notes, and a Trip Insurance yes/no question always appear, unconditional on the checkboxes above.

Every pulldown with an "Other" option (Airline, Hotel Brand, Cruise Line, Car Rental Company, Tour Vendor, and the "Your Information" preference selects) reveals a paired free-text input when "Other" is selected, via a shared `pref-other-sel`/`pref-other-wrap` class convention and one delegated `change` listener — adding a new "Other"-capable select just needs those two classes plus the paired wrap/input, no new JS.

**Depart date fallback for the Calendar**: the CRM's trip record needs *some* date to show up on the Calendar (`departDate`) and to sort correctly. Since Depart Date/Return Date only exist in Airline Details, `processTripFormRow()` falls back through `Depart Date → Sailing Date → Pickup Date → Hotel Check-in Date → Train Departure Date → Bus Departure Date` (and similarly for the return date) so a cruise-only, car-rental-only, hotel-only, train-only, or bus-only request still gets a usable date.

### Multi-select flattening
The Ticket Type field is a real `<select multiple>`. Since a browser would otherwise submit one `Theme Park Ticket Type` entry per chosen option, the custom submit handler collapses the selections into a single comma-joined string before sending — so the importer's one-value-per-field assumption holds without any special-casing downstream.

### Auto-resizing iframe
When embedded via `<iframe>` (as it is on the WordPress page), a fixed pixel height goes stale the instant a field is added or the page reflows for a different viewport width — silently clipping the bottom of the form, including the submit button. The page reports its real height to `window.parent` via `postMessage` (`ResizeObserver` + `MutationObserver` + a 1s poll fallback, since a parent-driven width change reflows content without firing either of those inside the frame). The **embedding page** needs a matching listener to actually resize the iframe element — see the snippet at the bottom of this section.

```html
<iframe id="milesman-intake-frame" src="https://milesmaneric.github.io/milesman-crm/intake-form.html" style="width:100%;height:2600px;border:none;"></iframe>
<script>
window.addEventListener('message', function(e){
  if (e.data && e.data.type === 'milesman-intake-height') {
    document.getElementById('milesman-intake-frame').style.height = e.data.height + 'px';
  }
});
</script>
```

### Import pipeline
1. **Manual**: submit-form.com's dashboard exports submissions as CSV. "Import" in the CRM (`importFormspreeSubmissions()`) reads the CSV and, for each row, calls the shared `processTripFormRow(getVal, counters)`.
2. **Automatic**: §4.4 above — same `processTripFormRow()`, fed from a parsed notification email instead of a CSV row.

Either path: matches/creates the primary client (by email, then exact name, then first+last name), matches/creates a client for every additional traveler (linked via the trip's `clientIds`), matches the requested Airline/Cruise Line/Hotel Brand/Car Rental Company/Theme Park/Tour Vendor against existing Supplier records by exact name (linking the client onto every match, and setting the first match in that priority order as the trip's `supplierId`/`supplierName` — never creates a new vendor), creates the trip record (`status: 'Planning'`), and creates a Planner follow-up task linked back to the trip.

---

## 6. Debug Panel

A hidden diagnostic log (`debugLog(msg)`, persisted to `localStorage['mm_debug_log']`) used throughout the Outlook sync, Mailchimp sync, Drive backup, and auto-import features to record what happened on each run — request counts, pagination truncation warnings, per-client match counts, errors. This is the first place to look when a sync "did nothing" or produced unexpected results.

---

## 7. Known Limitations

- **No true backend.** Everything described as "automatic" (email polling, backups) only runs while a browser tab has the page open. There is no cron job, no server-side worker.
- **Two independent copies of shared constants** (airline/hotel/cruise-line lists, status tiers, ship/cabin-type maps) between index.html and intake-form.html. A brand added to one must be manually added to the other, plus any hardcoded `<option>` lists that aren't driven by the JS arrays (the "Preferred X" and top-level "Airline"/"Hotel Brand" selects are hardcoded; balance grids and per-traveler blocks are array-driven).
- **`localStorage` is the only live datastore** — clearing browser data with no recent Drive backup loses everything.
- **Aggressive host/CDN caching has bitten this project before**: the WordPress-embedded form was once observed being served with a 31-day `Cache-Control` header, meaning code fixes could take up to a month to reach real visitors until the cache was purged. Worth checking response headers directly (`fetch(url, {cache:'no-store'})`) whenever "I pushed a fix but nothing changed" comes up for the WordPress-embedded page specifically.
- **Supplier auto-linking is exact-name-only, never fuzzy.** A form submission's Airline/Hotel Brand/Cruise Line/Car Rental Company/Theme Park/Tour Vendor only links to a Supplier record whose `name` matches character-for-character (case-insensitive). A vendor named "Delta Air Lines" won't match a submission for "Delta" — keep Supplier names matching the exact option text used on the intake form.
- **No true submissions API for the intake form.** submit-form.com (the form backend) doesn't expose a polling API for raw submission data, only a dashboard/CSV export and webhooks — the CRM's automatic import stays email-based (§4.4) rather than polling submissions directly, since a webhook would need a server to receive it and this app doesn't have one.
- **The password gate (§1) is a casual deterrent, not real security.** The repo is public, so the check's own logic and the `localStorage` data it guards are both readable by anyone who looks — it only stops someone who stumbles on the URL from seeing data at a glance. Secure Sync (§4.1a) is the one path with actual server-side verification, and it's additive/optional, not the default gate on the app itself.
- **Generic loyalty tiers for the three newest cruise lines.** `CRUISE_STATUS['Explora Journeys']`, `['Seabourn']`, and `['Ritz Carlton Yachts']` are all a placeholder `['Silver','Gold','Platinum']` — their actual program tier names (if any) weren't confirmed before adding them; "Other" + free text still covers anything specific a client actually has.
- **Exact-string-matching email subjects are fragile against upstream wording changes** — this already happened once for the trip-form notification subject (§4.4) and went undetected for a while because the old code logged nothing when zero messages matched. The regex fix and added diagnostic logging reduce the *silent* half of this risk, but an exact-match subject constant could still need updating again if a notification service changes its wording.
