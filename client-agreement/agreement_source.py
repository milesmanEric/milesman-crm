# Single source of truth for the Miles Man Terms and Conditions.
#
# build.py renders this into (1) the HTML for the themilesman.com page and
# (2) vercel-endpoints/agreement-text.js, which api/client-agreement.js stamps
# into every signed PDF. Edit the text HERE, bump VERSION, re-run build.py,
# republish the WordPress page and redeploy the Vercel project - never edit
# the generated files by hand, or the website copy and the signed copy drift.
#
# Plain ASCII only (the PDF uses standard fonts). A paragraph that starts with
# "(a)", "(b)", ... is rendered indented as a sub-clause.

VERSION = "2026-10-30"
TITLE = "Terms and Conditions"
COMPANY = "Miles Man LLC, doing business as Miles Man Travel Agency"
SHORT = "Miles Man"

FEE_URLS = "themilesman.com/book-a-trip/ and themilesman.com/award-booking-service/"

SECTIONS = [
    ("1. Who These Terms Are Between, and What They Cover", [
        'These Terms and Conditions (the "Terms") are between Miles Man LLC, doing business as Miles Man Travel Agency, located in Westfield, New Jersey ("Miles Man," "we," "us"), and the person who signs below ("Client," "you"). Contact: eric@themilesman.com, (908) 419-7700.',
        'These Terms are a one-time, master agreement. Once you sign them, they govern every service we provide to you, now and in the future, until they are ended under Section 18. You do not need to sign again for each trip. The details of each individual trip or service (dates, suppliers, travelers, prices, and fees) are set out in the quotes, itineraries, invoices, and booking confirmations we send you (each a "Booking Confirmation"), which are part of these Terms.',
        'These Terms cover two kinds of services, together the "Services": (a) Travel Agency Services - researching, recommending, booking, changing, and supporting travel such as cruises, flights, hotels, car rentals, trains, tours, transfers, and theme park vacations; and (b) Points and Miles Services - award booking (redeeming your airline miles, hotel points, and transferable credit card points for travel) and consulting on earning and using miles, points, and credit card rewards.',
        'You confirm that you are at least 18 years old and that you have authority to sign for, and to make bookings on behalf of, every traveler in your party. You are responsible for sharing these Terms and each Supplier\'s terms with those travelers.',
        'Acceptance. You accept these Terms by signing them, by checking the acceptance box online, or, if you have not yet signed, by paying a deposit or fee or proceeding with a booking after we have given you a copy of them or a link to them.',
    ]),
    ("2. Our Role: Travel Agent Only", [
        'We act solely as your travel agent and as a sales agent and intermediary between you and the independent companies that actually provide your travel, such as airlines, cruise lines, hotels, resorts, car rental companies, railways, tour operators, transfer companies, theme parks, insurers, and booking platforms ("Suppliers"). We do not own, operate, or control any Supplier. We are not responsible for any act, omission, breach of contract, or insolvency or bankruptcy of any Supplier.',
        'Each Supplier\'s own terms, tickets, contracts, and policies govern your travel, including its rules on payment, cancellation, changes, refunds, baggage, check-in, conduct, health, and safety. Those terms are part of what you agree to when you travel, and they can be strict. We will pass them along when we receive them, but it is your responsibility to read them.',
        'A booking is not confirmed until the Supplier confirms it. Availability and prices are not guaranteed until the booking is confirmed and any required payment is made.',
    ]),
    ("3. Points and Miles Services", [
        'Award booking. When we book travel with your miles or points, the points stay in your own accounts. We do not ask for or store your loyalty program passwords. We make award bookings together with you on a live screen share, so that you stay logged in and in control. During that session you authorize us to search, hold, and book the specific travel you have approved.',
        'Credit card authorization. For each award booking we obtain your signed Credit Card Authorization Form. It covers:',
        '(a) our service fee for the booking;',
        '(b) any non-award travel bookings (i.e., fares, taxes, fees, etc.); and',
        '(c) any change, cancellation, or redeposit charges that the airline, hotel, loyalty program, or other Supplier applies to that booking.',
        'Transfers of points are usually final. Moving points from a credit card program to an airline or hotel program is almost always irreversible and often takes time. You agree not to transfer points until award space has been confirmed and you have approved the specific transfer. We are not responsible for a transfer you make before the space is confirmed, or against our advice, or for space that disappears after you transfer.',
        'Award rules are set by the programs, not by us. Airline, hotel, and credit card programs can change their prices, rules, partners, availability, fees, and benefits at any time, with or without notice, and can devalue, expire, or cancel points and awards. We do not guarantee that award space exists, that an award price will stay the same, or that any program will honor a redemption. Changing or canceling an award can carry program fees, and redeposited miles may be charged a fee or lost.',
        'Consulting. Our consulting is educational and strategic: it covers things like which cards to hold, how to earn toward a goal, and how to use points. We do not guarantee any result, such as a number of points earned, the value you get from points, or approval for any credit card. You make your own decisions about which cards to apply for and how to use them. You are responsible for card terms, annual fees, interest, minimum spending requirements, credit score effects, taxes on any rewards, and compliance with each card issuer\'s rules.',
        'Not financial advice. We are travel and rewards advisors. We are not licensed financial advisors, accountants, attorneys, or credit counselors, and nothing we say is investment, tax, legal, or credit advice. Point and mile values are estimates and opinions, not promises, and points have no guaranteed cash value. Consult a qualified professional about your finances.',
        'Compensation disclosure. Some credit card issuers, loyalty programs, and other companies may pay us a referral fee or commission if you apply or buy through a link or recommendation from us. We aim to recommend what is right for you, and you are never required to use our links.',
    ]),
    ("4. Fees", [
        'Our service fees. Our service fees are the ones on our posted fee schedule, found on our website at ' + FEE_URLS + ' (the "Fee Schedule"). The Fee Schedule that applies to a given service is the one in effect when we accept that booking request, unless we quote you a different fee in writing.',
        'The Fee Schedule is subject to change. We may change, add, or remove fees at any time by updating our website. A change never affects a fee we have already quoted or confirmed to you in writing, or a booking that has already been confirmed. We will confirm the applicable fee to you in writing before we charge it.',
        'Fees are separate from Supplier charges. Our fees are in addition to anything the Supplier charges, such as fares, rates, taxes, resort fees, fuel surcharges, award taxes and fees, baggage fees, change and cancellation fees, and government charges. We are not responsible for those charges or for changes to them.',
        'When fees are charged. For a booking, our service fee is charged once the booking is confirmed. If a booking cannot be completed because no award space or suitable option exists, we will not charge a booking fee. Consulting is charged at the hourly rate on the Fee Schedule for the time spent, as confirmed in writing, and is billed separately from any trip. Fees for changes to a completed booking are as shown on the Fee Schedule.',
        'Fees are non-refundable. Once a service fee (including any booking, planning, concierge, change, or consulting fee) is charged, it is earned and is 100% non-refundable, even if you later cancel or change your trip or the Supplier does not refund you. We refund a fee only if we made an error or if the law requires it.',
        'Commissions. Suppliers may pay us commissions or incentives on some bookings. Consistent with our Fee Schedule, our fees are charged on non-commissionable items. We may keep any commission or incentive a Supplier pays us.',
        'Free consultations. An introductory consultation we offer at no charge (currently 15 minutes) creates no obligation for either of us.',
        'Referral credits. A referral credit, such as the one described on our website, has no cash value, applies to a future booking\'s service fee or trip cost, and is used up once redeemed.',
    ]),
    ("5. Payment and Card Authorization", [
        'All payments to us and to Suppliers are made by credit card unless we agree otherwise in writing. You authorize us to charge the card you give us on our Credit Card Authorization Form for (a) our fees, and (b) amounts owed to Suppliers for the Services you approve, including deposits, final payments, award taxes and fees, and Supplier change or cancellation charges.',
        'This authorization applies both to bookings made with miles and points and to bookings paid for with cash (non-miles and points bookings). For cash bookings it covers payment for the travel itself, such as fares, rates, cruise and package prices, and tickets, together with the related taxes, fees, surcharges, and other charges.',
        'You confirm that you are the cardholder or are authorized to use the card, and that the card information you give us is accurate. Card details are collected on the separate Credit Card Authorization Form and are not stored in these Terms.',
        'You agree to meet every deposit and final payment deadline strictly. A Supplier may automatically cancel a booking, apply penalties, and keep the payments you have already made if a deposit or final payment is missed or declined. If you dispute a charge, please contact us first so we can resolve it. If you cancel or dispute a charge for services we have already provided or paid for on your behalf, you remain responsible for those amounts, and we may recover them along with the reasonable costs of collecting them to the extent the law permits.',
        'Chargebacks. You are responsible for all charges you authorize. To the fullest extent the law allows, you agree not to start a credit card chargeback or payment dispute against us because of a Supplier\'s cancellation, delay, default, or bankruptcy, or because of an event described in Section 12, since those matters are between you and the Supplier. If you start a chargeback in breach of this paragraph, you agree to pay us the full amount of the chargeback plus the reasonable legal and administrative costs we incur to dispute it. This paragraph does not limit any right you have under the law to dispute an unauthorized charge or a billing error.',
        'Prices, itineraries, and availability are subject to change by the Supplier until a deposit or payment is received and confirmed. Prices are quoted in the currency stated, and Suppliers may add surcharges, taxes, or exchange-rate adjustments.',
    ]),
    ("6. Changes, Cancellations, and Refunds", [
        'Changes and cancellations are governed by the Supplier\'s rules, and many bookings are partly or wholly non-refundable. Please make every request to change or cancel in writing (email is fine) as early as possible, because Supplier deadlines can pass quickly. A request is not effective until we confirm it and, where needed, the Supplier does.',
        'Refunds come from the Supplier, not from us, and can take weeks or months. We cannot guarantee that a Supplier will grant any refund. We will pass along any refund we receive, less any non-refundable amounts owed to us or to Suppliers.',
        'Suppliers sometimes change schedules, itineraries, ships, aircraft, and hotels, or cancel services altogether. We will help you understand and respond to those changes, but we cannot guarantee a particular outcome and are not responsible for the Supplier\'s decision.',
    ]),
    ("7. Your Responsibilities", [
        'You agree to:',
        '(a) give us complete, accurate information, including each traveler\'s name exactly as it appears on the government-issued ID or passport they will travel with, date of birth, contact details, and any health, mobility, dietary, or accessibility needs. Errors can cause fees, denied boarding, or lost bookings, and name corrections can be costly or impossible;',
        '(b) read every quote, itinerary, invoice, and confirmation as soon as you receive it and tell us right away, and in any case within 48 hours, about anything that is wrong;',
        '(c) obtain and carry valid travel documents and meet all entry requirements, including passports (many countries require validity of six months beyond your trip), visas, electronic travel authorizations, REAL ID or other ID, vaccinations, testing requirements, health documents, and consents for minors. We may mention requirements as a courtesy, but you are solely responsible for them, and requirements can change;',
        '(d) check government travel advisories and health notices for your destinations;',
        '(e) follow Supplier rules and the law while you travel, and arrive on time for every departure, check-in, and transfer; and',
        '(f) keep your loyalty program, card issuer, and Supplier accounts in good standing and tell us about anything that could affect a booking.',
        'We are not responsible if you or any traveler is denied boarding or entry for any reason, including missing or invalid documents or unmet health requirements.',
    ]),
    ("8. Travel Insurance", [
        'We strongly recommend comprehensive travel insurance, including "Cancel for Any Reason" (CFAR) coverage where it is available. Coverage such as CFAR, and coverage for pre-existing conditions, often must be bought within a short window after your first trip payment. You acknowledge that we have recommended travel insurance and offered you the opportunity to buy it. Insurance is a contract between you and the insurer, not us, and benefits, exclusions, and deadlines are the insurer\'s. If you choose not to buy insurance, you accept the financial risk of losses it might have covered, such as trip cancellation, medical emergencies abroad, travel delays, and lost baggage.',
    ]),
    ("9. Travel Risks", [
        'Travel involves risk. These risks include accidents, illness, injury, delays, cancellations, lost or damaged baggage, weather and natural disasters, crime, terrorism, civil unrest, strikes, political or health emergencies, and the acts or failures of Suppliers and other third parties. You choose to travel knowing these risks and accept them for yourself and for the travelers you book. We do not control these events.',
    ]),
    ("10. Limits on Our Responsibility", [
        'To the fullest extent the law allows: (a) we are not responsible for the acts, errors, omissions, breaches of contract, delays, insolvency, bankruptcy, or failures of any Supplier or other third party, or for any loss, injury, illness, death, damage, expense, or inconvenience arising from them; (b) we are not responsible for changes to or devaluations of loyalty programs, points, miles, or credit card benefits, or for award space that is unavailable or withdrawn; (c) we are not responsible for losses caused by events outside our reasonable control, as described in Section 12; and (d) our total responsibility to you for any claim arising from the Services is limited to the service fees you actually paid to us for the specific service that gave rise to the claim.',
        'We are also not liable for indirect, incidental, special, consequential, or punitive damages, or for lost enjoyment, lost time, or lost profits.',
        'Nothing in these Terms limits responsibility that cannot be limited by law, such as for our own fraud or willful misconduct. If a claim relates to a Supplier, your remedy is generally against that Supplier, and we will reasonably help you present the claim.',
    ]),
    ("11. Your Indemnity", [
        'You agree to be responsible for, and to reimburse us for, losses, claims, and reasonable costs we incur because of information you gave us that was false or incomplete, your violation of the law or of a Supplier\'s rules, the actions of the travelers you booked, or your misuse of the Services, to the extent permitted by law.',
    ]),
    ("12. Events Beyond Our Control", [
        'Neither of us is in breach of these Terms for a delay or failure caused by events beyond reasonable control, such as acts of God, natural disasters, severe weather, fire, epidemics or public health emergencies, war, terrorism, civil unrest, strikes, government action or travel restrictions, Supplier insolvency, or failures of the internet, power, or communications. Fees already earned and amounts already paid to Suppliers stay payable, and any refund is subject to the Supplier\'s rules.',
    ]),
    ("13. Privacy and Your Information", [
        'To provide the Services we collect and use personal information that you give us, which can include names, contact details, dates of birth, passport and ID details, loyalty program numbers, travel preferences, health or accessibility needs, and payment details. We use it to research and make bookings, to communicate with you, to take payments, to keep required records, and to improve our services.',
        'You authorize us to share this information with the Suppliers and service providers needed to carry out your bookings, including those located outside the United States, who have their own privacy practices. We do not sell your personal information. We use reasonable safeguards to protect it, but no system is perfectly secure.',
        'We do not ask for or store your loyalty program or card issuer passwords. If you choose to share any login details with us, you do so at your own risk, and we will use them only for the specific task you request.',
        'We keep records for as long as needed to provide the Services and meet legal, tax, accounting, and dispute-resolution needs. You may ask to see, correct, or (where the law allows) delete your information by contacting us.',
    ]),
    ("14. Communications", [
        'You agree that we may contact you by email, phone, text message, and online messaging about your bookings and the Services. These are essential communications. If you receive our marketing or newsletters, you can opt out at any time using the link in the message or by contacting us, and opting out of marketing does not stop booking-related messages.',
    ]),
    ("15. Our Materials", [
        'Our guides, strategies, spreadsheets, and recommendations are provided for your personal use. You may not resell or republish them or use them to compete with us.',
    ]),
    ("16. Disputes and Governing Law", [
        'These Terms are governed by the laws of the State of New Jersey, without regard to its conflict-of-law rules. If a dispute arises, please contact us first. We will both try in good faith to resolve it informally for at least 30 days. If that does not work, either of us may bring the claim in the state or federal courts located in New Jersey, and you and we consent to the jurisdiction and venue of those courts, except where the law requires a different forum.',
    ]),
    ("17. Changes to These Terms and to Our Fees", [
        'We may update these Terms from time to time by posting the new version at themilesman.com/terms-and-conditions/ and, when the change is material, notifying you by email. A new version applies to bookings and services you request after it is posted and does not change bookings already confirmed. If you request new services after a new version is posted, you accept it. If you do not accept a new version, tell us before requesting new services.',
    ]),
    ("18. Term and Ending These Terms", [
        'These Terms start when you sign them and continue until either of us ends it by written notice (email is fine). We may also decline or stop providing Services, for example for non-payment, abusive conduct, or suspected fraud. Ending these Terms does not affect bookings already made, fees already earned, amounts you owe, or any section that by its nature should continue (including Sections 4, 5, 9, 10, 11, 13, 16, and 19).',
    ]),
    ("19. General Provisions", [
        'Entire agreement. These Terms, together with each Booking Confirmation, your Credit Card Authorization Form, and the Fee Schedule as described in Section 4, are our entire agreement about the Services and replaces earlier discussions about them. A Booking Confirmation controls for that trip if it conflicts with these Terms on a specific item such as price or dates.',
        'If a provision is unenforceable, the rest stays in effect. A failure to enforce a right is not a waiver of it. You may not transfer these Terms without our written consent. We may use subcontractors and affiliates to perform the Services. Notices may be sent by email to the address on file for you and to eric@themilesman.com for us.',
        'Some provisions of these Terms, such as limits on responsibility or on a remedy, may not apply to you if they are not permitted by the law of the state where you live, including New Jersey. In that case, they apply to the fullest extent the law allows, and nothing here takes away rights you cannot waive under applicable law.',
    ]),
    ("20. Electronic Signature and Electronic Records Consent", [
        'You agree to do business with us electronically. You agree that your electronic signature on these Terms, whether drawn on screen or typed, has the same legal effect as a handwritten signature, and that these Terms, Booking Confirmations, receipts, and other notices and documents may be delivered and signed electronically under the federal E-SIGN Act and the Uniform Electronic Transactions Act.',
        'To access electronic records you need an internet-connected device, a current web browser, an email address, and software that can open PDF files. You may ask us for a paper copy of these Terms or any record at no charge, and you may withdraw your consent to electronic records at any time by emailing eric@themilesman.com, but withdrawing may mean we can no longer provide some Services.',
        'When you sign, we record the date and time, your name and email address, the version of the Terms you accepted, your network address, and your browser type. We keep a signed copy as a PDF, and you may download your copy when you sign.',
    ]),
]

ACKNOWLEDGMENT = (
    'By signing below, I confirm that I have read and understood these Terms and Conditions '
    '(version ' + VERSION + '), that I agree to be bound by them for all Services that Miles Man LLC '
    'provides to me, and that I am authorized to sign for everyone in my travel party.'
)
