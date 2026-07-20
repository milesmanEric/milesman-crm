# Miles Man CRM — User Guide

A plain-English walkthrough of how to actually use the CRM day to day. For technical/architecture details (data model, integrations, code structure), see [DOCUMENTATION.md](DOCUMENTATION.md) instead — this guide is written for the person using the tool, not the person maintaining the code.

---

## What this tool does

The CRM tracks everything about your clients, their trips, your suppliers, and your follow-up tasks — clients booking trips (flights, hotels, cruises, car rentals, tours, theme parks, trains), often paid for partly or fully with miles/points.

Two things feed it automatically, with no action needed from you:
- **Book a Trip form** submissions (from the website) become client + trip records.
- **Contact Form** submissions (from the website) become client + lead records.

Both are checked automatically every 5 minutes as long as the CRM tab is open and Outlook is connected (see [Connecting Outlook](#connecting-outlook) below).

---

## The stat numbers at the top of every page are clickable

Every number in the row of boxes at the top of Dashboard, Clients, Trips, Suppliers, and Planner can be clicked. It opens a list of exactly which records add up to that number — click any row in that list to jump straight to that client, trip, supplier, or task. This is the fastest way to answer "which trips make up this revenue number" or "who are these upcoming clients."

(On a Supplier's or Invoice's own detail screen, the numbers there instead scroll you down to the transaction table that's already shown below — no extra click needed to see the detail, it's already on the same screen.)

---

## Clients

**Adding a client**: Clients page → **+ Add Client**. Name and email are required. Everything else — phone, address, birthdate, citizenship/birth country, how they were referred, preferred airline/hotel/cruise line, and mileage/points balances for every airline, hotel, cruise line, car rental, and credit card program — is optional and can be filled in over time.

**Notes**: every client has a running note timeline. Add a note and tag it with a type (Email Sent, Email Received, Initial Call, Follow-up, General, Text Message Sent/Received, **Lead**, Mailchimp Email Sent, Facebook Message) so the Activity Report can filter on it later.

**Paying Client / Subscriber**: two checkboxes on the client record, useful for filtering your list down to real clients vs. newsletter-only contacts.

**Attachments**: paste Google Drive links directly, or use "Browse Google Drive" to pick a file without leaving the CRM.

---

## Trips

**Adding a trip**: Trips page → **+ Add Trip**, or open a client and add a trip from there. Client and Destination are the only required fields.

The trip form has two parts:

1. **The basics** — origin/destination, dates, status (Planning/Confirmed/Completed/Cancelled), trip type, airline, hotel, cruise line, points used, cash paid, total value, booking reference, and a free-text Notes box. This is what shows up in the Trips list and on the Calendar.

2. **Booked Trip Details** — a more detailed, confirmed-booking recap, broken into the same categories as the public trip-request form: **Airline, Hotel, Cruise, Car Rental, Tours, Theme Park, Train.** Each one has its own **confirmation number** field, so you're not hunting through Notes for a locator code.
   - **Airline** and **Hotel** also let you record **miles/points redemptions** — pick the loyalty program (any airline, hotel, or credit card program) it came from, how many points/miles were used, and the cash cost that went with it (taxes/fees, or however you like to track it). This is important when a booking is paid for with a mix of sources — e.g. part Delta miles, part a transferred Amex points balance.
   - **Hotel** supports **more than one hotel per trip** — click **+ Add Hotel** for each additional stay (useful for multi-city trips). Each hotel entry gets its own confirmation number, check-in date, number of nights, price, and its own miles/points program + amount. Remove a hotel entry with the trash icon on that row.
   - Picking a **Cruise Line** automatically updates the Ship Name and Cabin Type choices to that cruise line's real options.

None of this is required — fill in whatever you actually have confirmed. Leave a category blank if it doesn't apply to that trip.

---

## Suppliers

The Suppliers page (labeled "Suppliers" in the nav, called `vendors` internally) is your directory of airlines, hotels, cruise lines, car rental companies, and referral partners. Each supplier card shows how many trips and clients are linked to it and how much revenue has flowed through it, computed automatically from your trip records — you don't update these numbers by hand.

**Automatic supplier linking**: when a client's trip request names an airline, hotel brand, cruise line, car rental company, theme park, or tour vendor that matches an existing Supplier record by name, the client gets linked onto that supplier automatically, and that supplier becomes the trip's supplier if nothing else already claimed that slot. This only works for an **exact name match** — if a supplier is named "Delta Air Lines" in your list but a request says just "Delta," it won't connect automatically. Keep supplier names matching the option text on the intake form (e.g. "Delta," "Marriott," "Royal Caribbean") for this to work reliably.

---

## Planner

Your follow-up task list. Most tasks get created automatically — one per new trip request and one per new contact-form lead — but you can add your own anytime with **+ Add Task**. Marking a task Done hides it from the default view; switch the filter to "Done" to see completed tasks again.

---

## Calendar

A month view with every trip painted across its travel dates. Click into a day to see (and add) trips landing on that date.

---

## Reports

Two tabs:
- **Activity Report** — every note logged across every client, filterable by date range, note type, and client. Export to CSV.
- **By Invoice #** — trips grouped by booking/invoice reference, filterable by date range, supplier, and client. Export to CSV. (This avoids double-counting revenue when a booking has multiple line items sharing the same reference.)

  The date range has a **Filter By** choice: **Travel Date** or **Invoice Date**. These can be genuinely different dates — a trip might get booked in June for August travel — so if a trip you're expecting isn't showing up for a date range, try switching which date you're filtering by before assuming something's wrong. Invoice Date only gets filled in automatically for revenue-imported trips; you can also set it by hand on any trip's Invoice Date field.

---

## Emailing clients

Three different tools, depending on what you need:

- **Email** (the mail-merge tool) — quick canned messages: Welcome New Client, General Follow-Up, or Trip Confirmation. Pick a client, preview with their name/email filled in, send.
- **Email Quote** — for building a real cruise pricing quote to send a client, with cabin options and pricing laid out in a styled email. Has ready-made polished templates for Virgin Voyages and Princess.
- **Email Itinerary** — pick a client and one of their **actual booked trips**, and it builds a nicely formatted recap email straight from whatever's on that trip record (dates, flight/hotel/cruise details, confirmation info, points/cash/value, and your trip notes). Any section the trip doesn't have data for is simply left out — it never shows an empty "Hotel Details" box for a flight-only trip.

All three work the same way at send time: the email gets copied to your clipboard (since a plain `mailto:` link can't carry formatting) and Outlook opens addressed to the client — paste (Ctrl/Cmd+V) into the body and send. A note gets logged on the client's record automatically.

---

## Connecting Outlook

Email menu → **Sync Outlook Emails**. This is a one-time login (until you sign out or the token expires) that unlocks:
- Logging sent/received emails to each client's notes automatically.
- Automatically importing Book a Trip form submissions and Contact Form leads every 5 minutes.

**This only runs while the CRM tab is open in your browser** — there's no server running these checks in the background, so if you close the tab, imports pause until you reopen it.

If something seems stuck (Outlook not syncing, an import that should have happened didn't), try **Reset Outlook Login** and reconnect.

---

## Backing up your data

Everything lives in your browser only — closing the tab doesn't lose data, but clearing your browser's data, or a browser crash with corrupted storage, would. Use **Backup to Google Drive** regularly (or after any significant batch of changes) as your real safety net. **Restore from Google Drive** pulls the latest backup down if you ever need to recover, or if you're picking up on a different computer.

If you back up from two devices without restoring in between, the CRM will warn you and block the upload rather than silently overwriting the other device's newer data — restore first, then back up again.

---

## Mailchimp

If you send a newsletter/campaign through Mailchimp, **Sync Mailchimp Activity** checks which of your clients actually received the most recent campaign and logs it to their notes automatically. **Log Mailchimp Campaign** is the manual fallback if you'd rather just note that a campaign went out without connecting to Mailchimp's API.

---

## When something goes wrong

Every import/sync feature writes to a hidden **Debug Log** as it runs — request counts, warnings, per-client match results, errors. This is the first place to check when a sync "did nothing" or an import skipped something you expected to see. Ask whoever maintains the CRM's code how to open it if you can't find it.
