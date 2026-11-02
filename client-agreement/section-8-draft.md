# Section 8 is now in the Terms (version 2026-11-03). Counsel questions below are still open.

Items in [brackets] are open questions for counsel or facts to confirm.

## Replacement for Section 8 (Travel Insurance)

**8. Travel Insurance**

Travel insurance is optional, and we encourage you to consider it for every trip. Depending on the plan, it can cover trip cancellation and interruption, medical emergencies abroad, travel delays, and lost baggage. Some coverage, such as "Cancel for Any Reason" (CFAR) coverage and coverage for pre-existing conditions, is available only if you buy the plan within a short window after your first trip payment. Each plan sets its own deadlines and conditions, so please read the plan documents.

Who provides it. Travel insurance is provided by the insurer, or in some cases by a cruise line's protection plan and its insurer. It is a contract between you and that company. Miles Man is not the insurer. The plan documents, not this agreement and not anything we say, control what is covered, what is excluded, how to file a claim, and every deadline. Claims are handled by the insurer or plan administrator, not by us.

Our compensation. We make travel insurance available through [cruise line protection plans and the Berkshire Hathaway travel insurance program: confirm exact plan and insurer names]. We earn a commission when you buy a plan through us. The insurer or cruise line pays that commission, and it is not an extra charge to you. [Counsel: confirm whether the commission disclosure should state the amount or only that we are paid.]

What we do and do not do. We can tell you which plans we make available, give you the plan documents and the enrollment link, and answer general questions about how to enroll. We do not give insurance advice, tell you which plan or coverage is right for you, or decide whether a loss is covered. Choosing a plan is your decision. [Counsel: confirm this matches our licensing or registration status in New Jersey and in the states where clients live, and what we may say about plans.]

Your decision. You may buy insurance through us, buy it somewhere else, or not buy it. If you decline the insurance we make available, we may ask you to confirm that in writing. You accept the financial risk of losses insurance might have covered, such as trip cancellation, medical emergencies abroad, travel delays, and lost baggage, and coverage that must be bought within a deadline may no longer be available if you wait. [Counsel: confirm whether a separate decline acknowledgement should be used.]

Disclosures that your state requires will be provided with the plan documents.

## Fix for the Section 7 list punctuation (DONE in Terms version 2026-11-03)

Current: item (e) ends "; and", item (f) ends with a period, and item (g) ends with a semicolon before a separate sentence.

Change to:

(e) follow Supplier rules and the law while you travel, and arrive on time for every departure, check-in, and transfer;
(f) keep your loyalty program, card issuer, and Supplier accounts in good standing and tell us about anything that could affect a booking; and
(g) arrange directly with each Supplier any assistance or accommodation that you or a traveler needs because of a health, medical, mobility, dietary, or accessibility need. We do not collect health information, so please do not send it to us.

## Open questions for counsel

1. Does selling these plans and earning commission require an insurance producer license or registration in New Jersey (see DOBI Bulletin 26-02) and in other states? Do any limited-lines or travel-retailer exemptions apply, and must the Terms say so?
2. Which words are safe in the Terms: "make available" and "encourage you to consider", versus "recommend"?
3. Is the commission disclosure adequate as drafted?
4. Do state disclosure rules require anything in the Terms rather than with the plan documents?
5. Should declining insurance be a separate signed acknowledgement?

## Steps once approved (same as the last version change)

1. Edit `agreement_source.py` (Section 8, Section 7 punctuation, new VERSION).
2. Run `python3 client-agreement/build.py` and rebuild the review file.
3. Deploy the new `agreement-text.js` to Vercel first, then publish the page changes. Update WordPress.
4. Update the tracker's insurance steps and re-merge.
