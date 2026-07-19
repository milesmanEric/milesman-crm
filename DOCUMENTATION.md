# Miles Man CRM — Documentation

A single-file CRM for a travel agency built around points/miles-based bookings, plus a public lead-intake form embedded on the agency's WordPress site.

- **CRM**: [index.html](index.html)
- **Public intake form**: [intake-form.html](intake-form.html) — embedded on `themilesman.com/book-a-trip-form/` via an `<iframe>`

---

## 1. Architecture

- **Static, client-side only.** No backend server, no database. Both pages are self-contained HTML/CSS/JS files.
- **Hosting**: GitHub Pages, served from the `main` branch at `https://milesmaneric.github.io/milesman-crm/`.
- **Persistence**: the CRM's entire dataset lives in the browser's `localStorage` under the key `milesman_crm_v2`, as one JSON blob (`db = {clients, trips, vendors, planner}`). There is no server-side copy — the only durable backup is the Google Drive JSON export (see [§5.1](#51-google-drive-backup)).
- **Deploy process**: edit the file, commit, push to `main`. GitHub Pages auto-deploys. No build step.
  - Line endings must be `LF`, not `CRLF` (Windows editors default to CRLF — normalize before committing, e.g. `sed -i 's/\r$//' index.html`).
- **Third-party services used**: Google Drive API (backup), Microsoft Graph API (Outlook email sync + auto-import), Mailchimp API (campaign activity sync), submit-form.com (public form submission backend). API keys/secrets for Drive and Mailchimp are held server-side by a small proxy (`milesman-auth.vercel.app`, referenced in code as `DRIVE_AUTH_SERVER`) since those APIs don't support CORS from a browser. Outlook uses OAuth PKCE directly from the browser (no proxy needed — Microsoft's token endpoint supports CORS for SPAs).

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

### `db.trips` (`T001`, `T002`, ...)
`clientId`/`clientName` = primary/billing contact. `clientIds` = array of additional linked client IDs (companions on a shared trip — a trip shows up on every linked client's record, not just the primary contact's).

`origin`, `destination`, `departDate`, `returnDate`, `status` (Planning / In Process / Confirmed / Completed / Cancelled), `type` (Leisure/Business/Honeymoon/Family/Adventure), `airline`, `flightClass`, `hotel`, `hotelNights`, `cruiseLine`, `shipName`, `pointsUsed`, `cashPaid`, `totalValue`, `bookingRef`, `product`, `supplierId`/`supplierName`, `notes` (freeform — most intake-form fields that don't have a dedicated column end up compiled here as `Label: value` lines).

### `db.vendors` (`V001`, ...) — "Suppliers" in the nav
`name`, `type` (Supplier / Referral Partner / DMC), `category` (Airline/Hotel/Cruise Line/Car Rental/Tour Operator/Other), `clientIds` (clients who've booked through this vendor), `website`, `notes`.

### `db.planner` (`PL001`, ...)
Follow-up tasks: `title`, `dueDate`, `done`, `clientId`, `tripId` (links back to the trip that spawned it), `completionNoteType`, `desc`, `createdAt`.

---

## 3. Navigation / Features

The left nav has 7 sections (`view` state: `dashboard`, `clients`, `trips`, `vendors`, `planner`, `reports`, `calendar`, `email`).

### Dashboard
Summary stats (client count, trip count, confirmed, upcoming, total value, points deployed), a recent-trips table, and a top-clients-by-revenue list.

### Clients
Searchable/sortable table (search matches name, email, city). Click a row to open the Add/Edit Client modal with the full field set from §2, plus a note-taking timeline (`notesLog`) with typed entries (Email Sent/Received, Initial Call, Follow-up, General, Trip Import, Text Message Sent/Received, Lead, Mailchimp Email Sent, Facebook Message), file attachments, and inline Paying Client / Subscriber toggles.

### Trips
Searchable/sortable table with inline status badges, points/value columns, supplier links, and invoice numbers. The Add/Edit Trip modal covers flight, hotel, cruise, and generic per-brand loyalty-balance sections (shown/hidden based on which client is selected, mirroring their stored balances).

### Suppliers (`vendors`)
Vendor/partner directory with per-vendor stats (trip count, linked clients, revenue) computed live from `db.trips`.

### Planner
Task list of follow-ups, most created automatically by the trip-form importer (one per new submission). Marking a task done removes it from the default view (a "Done" filter brings it back).

### Reports
Two tabs:
- **Activity Report** — filter `notesLog` entries across all clients by date range, note type, and client; export to CSV.
- **By Invoice #** — filter trips by date range, supplier, and client; export to CSV. ("Invoice" here means a distinct trip/booking reference, used to avoid double-counting revenue across records that share a booking.)

### Calendar
Month-grid view. Trips are painted across every day from `departDate` to `returnDate` (capped at 60 days per trip to avoid runaway rendering on bad data).

### Email
A lightweight mail-merge tool: pick a client, pick one of three canned templates (Welcome New Client, General Follow-Up, Trip Confirmation — see `TEMPLATES` in index.html), preview with `{{firstName}}`/`{{fullName}}`/`{{email}}` substituted, then send via `mailto:`.

There is a **separate**, more elaborate **Email Quote** modal (`openEmailQuoteModal`, reached from a header button) purpose-built for building line-itemized cruise pricing quotes — it has bespoke HTML templates for Virgin Voyages and Princess (with their specific cabin-type/fare-tier/add-on structures) and a generic fallback for other cruise lines.

---

## 4. Integrations

### 4.1 Google Drive Backup
Manual "Backup to Google Drive" / "Restore from Google Drive" buttons. OAuth PKCE flow (no server secret needed on the Drive side). Backs up the entire `db` object as one JSON file (`milesman-crm-backup.json`) via `driveBackup()`/`driveRestore()`.

**Multi-device conflict protection**: `mm_last_known_remote_modified` (localStorage) tracks the Drive file's `modifiedTime` as of this device's last successful backup or restore. Before any backup upload, `driveConflictDetected()` compares that against the file's *current* `modifiedTime` on Drive — if they differ, another device has backed up more recently, and the upload is blocked (with a toast telling the user to restore first) rather than silently overwriting newer data.

### 4.2 Outlook Email Sync
"Sync Outlook Emails" — OAuth PKCE against Microsoft Graph (`Mail.Read` scope). For every client with an email on file, pulls matching Inbox/Sent messages and logs them to that client's `notesLog` (as `Email Sent`/`Email Received` notes). Incremental after the first run via the `mm_last_outlook_sync` timestamp marker; "Reset Outlook Login" clears that marker to force a full resync. Pagination caps at 8,000 messages/folder per sync pass (`MAX_PAGES=80`, `$top=100`) — the Debug Panel logs a warning if a mailbox is too large to fully cover in one pass.

### 4.3 Mailchimp Activity Sync
Two related buttons:
- **Sync Mailchimp Activity** — fetches the single most-recently-sent Mailchimp campaign, then for each client checks (via the campaign activity-feed API, keyed by an MD5 hash of their lowercased email) whether they actually received it, and if so logs a `Mailchimp Email Sent` note with the campaign subject/body. Idempotent (a `mcKey` on each note prevents re-logging the same campaign for the same client).
- **Log Mailchimp Campaign** — a manual fallback: type in a subject/summary yourself and pick which clients to log it against, without hitting the Mailchimp API at all.

### 4.4 Automatic Trip-Form Email Import
Every 5 minutes (and once ~5s after page load), while the CRM tab is open, `checkForNewTripFormEmails()` polls the same connected Outlook inbox for new emails with the exact subject `New submission for Book a trip` (the notification submit-form.com sends per public-form submission) and imports each one automatically — creating/enriching client records and a trip record exactly like the manual CSV import (§5.1 below shares the same `processTripFormRow()` logic).

**Important constraint**: this is *only* a foreground-tab poller, not a real background job — there is no server to run it when nobody has the CRM open. It silently does nothing (no login prompt, no error toast) until Outlook has already been connected via the manual "Sync Outlook Emails" flow at least once.

**Parsing approach**: submit-form.com's notification email has no reliable delimiter between fields in its plain-text form — an unanswered field just runs straight into the next field's label with no separator. `parseTripFormEmailText()` works around this by building the complete set of every field label the intake form can possibly submit (`buildTripFormFieldLabels()`, mirroring intake-form.html's `name="..."` attributes exactly, including the dynamic per-brand balance-grid and per-traveler fields), finding every one that actually appears in a given email in one regex pass (longest labels matched first, so e.g. "Referred By" can't shadow "Referred By Detail"; word-boundary-guarded so short labels like "Airline" don't match mid-word inside typed text like "Alaska Airlines"), and taking each match's value as the text up to the next matched label. A separate pass swaps the literal token "Other" for a sentinel wherever a select-with-Other field's value is genuinely "Other" (to disambiguate it from the immediately-following "X Other" label's own text), then maps it back after matching.

Deduplication: processed message IDs are kept in `mm_tripform_processed_ids` (capped at 500) so the same email is never imported twice.

**Whenever a new field is added to the intake form, three places need updating** (all in index.html) or the new field silently won't reach the CRM from a real submission: the `addLine(...)` call in `processTripFormRow()`, the label list in `buildTripFormFieldLabels()`, and — if the field should also become a structured trip field rather than just free-text notes — the `db.trips.push({...})` object itself.

---

## 5. The Public Intake Form ("Book a Trip")

[intake-form.html](intake-form.html) is a standalone page with no dependency on index.html — it duplicates the constants it needs (`AIRLINES`, `HOTELS`, `CRUISE_LINES`, `CAR_RENTALS`, `CREDIT_CARDS`, their status-tier maps, `SHIPS_BY_CRUISE_LINE`, cabin-type maps) so they must be **kept in sync by hand** whenever one file's list changes — there is no shared module.

### Structure
- **Your Information**: contact details, structured address, preferences (Airline/Hotel/Cruise Line, each with an "Other" free-text fallback), and per-brand loyalty balance grids. "Number of Travelers" dynamically renders additional traveler blocks (name, DOB, citizenship, preferences, balances) for travelers 2+.
- **Trip Details**: a row of "Type of Travel Needed" checkboxes (Airline / Hotel / Tours / Cruise / Car Rental / Theme Park Tickets) that each conditionally reveal their own detail section:
  - **Airline Details** — departure/arrival city, dates, trip direction (+ dynamic multi-city stops), class of service, airline preference.
  - **Cruise Details** — cruise line (drives dependent Ship Name and Cabin Type dropdowns), nights, sailing date, departure port, cabin type, people in cabin, loyalty number, and — only when Cruise Line = Princess — a Cruisetour yes/no question.
  - **Hotel Details** — location, brand (with Other), nights, room type, people per room, number of rooms.
  - **Car Rental Details** — company, size, pickup/dropoff location, date, and time.
  - **Theme Park Details** — park (Disney World / Disneyland California / Universal Studios Hollywood / Universal Studios Orlando), and a multi-select ticket-type dropdown scoped to whichever park is chosen (each park has a different realistic ticket menu, e.g. Universal Orlando includes an Epic Universe standalone ticket and a 4-park hopper).
  - Trip Type, Payment Preference, Notes, and a Trip Insurance yes/no question always appear, unconditional on the checkboxes above.

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

Either path: matches/creates the primary client (by email, then exact name, then first+last name), matches/creates a client for every additional traveler (linked via the trip's `clientIds`), creates the trip record (`status: 'In Process'`), and creates a Planner follow-up task linked back to the trip.

---

## 6. Debug Panel

A hidden diagnostic log (`debugLog(msg)`, persisted to `localStorage['mm_debug_log']`) used throughout the Outlook sync, Mailchimp sync, Drive backup, and auto-import features to record what happened on each run — request counts, pagination truncation warnings, per-client match counts, errors. This is the first place to look when a sync "did nothing" or produced unexpected results.

---

## 7. Known Limitations

- **No true backend.** Everything described as "automatic" (email polling, backups) only runs while a browser tab has the page open. There is no cron job, no server-side worker.
- **Two independent copies of shared constants** (airline/hotel/cruise-line lists, status tiers, ship/cabin-type maps) between index.html and intake-form.html. A brand added to one must be manually added to the other, plus any hardcoded `<option>` lists that aren't driven by the JS arrays (the "Preferred X" and top-level "Airline"/"Hotel Brand" selects are hardcoded; balance grids and per-traveler blocks are array-driven).
- **`localStorage` is the only live datastore** — clearing browser data with no recent Drive backup loses everything.
- **Aggressive host/CDN caching has bitten this project before**: the WordPress-embedded form was once observed being served with a 31-day `Cache-Control` header, meaning code fixes could take up to a month to reach real visitors until the cache was purged. Worth checking response headers directly (`fetch(url, {cache:'no-store'})`) whenever "I pushed a fix but nothing changed" comes up for the WordPress-embedded page specifically.
