"""Privacy Policy for themilesman.com. Same single-source idea as agreement_source.py:
edit the text here, run `python client-agreement/privacy_policy.py`, then update the
WordPress page (slug privacy-policy). Plain ASCII only (WP inline content house rule).
Writes client-agreement/out/privacy-policy-wordpress.html and privacy-policy-review.html.
"""
import html
import os
import re

TITLE = "Privacy Policy"
EFFECTIVE = "October 31, 2026"
COMPANY = "Miles Man LLC, a New Jersey limited liability company doing business as Miles Man"

SECTIONS = [
    ("1. Who We Are", [
        'This Privacy Policy explains how Miles Man LLC, doing business as Miles Man ("Miles Man," "we," "us"), collects, uses, and shares personal information when you visit themilesman.com, fill out our forms, or use our travel agency and points and miles consulting services. We are located at 622 Arlington Avenue, Westfield, New Jersey 07090. Contact: eric@themilesman.com, (908) 419-7700.',
        'It applies to our website, our online forms (trip request, additional travelers, credit card authorization, Terms and Conditions, and post-trip survey), our newsletter, and our communications with you. It should be read together with our Terms and Conditions.',
    ]),
    ("2. Information We Collect", [
        'Information you give us. This can include your name, email address, phone number, home address, date of birth, passport and ID details (name as shown on the ID, number, expiration date, and country of citizenship), loyalty program and frequent traveler numbers, travel preferences and trip details, health, mobility, dietary, or accessibility needs that you tell us about, information about your travel companions, payment card details on the Credit Card Authorization Form, your signature, survey responses, and anything you write to us in a message or form.',
        'Information collected automatically. When you visit our website we and our service providers receive technical information such as your IP address, browser and device type, the pages you view, the page that referred you, and the date and time of your visit, using cookies and similar technologies (see Section 6).',
        'Information from others. We receive information from the airlines, cruise lines, hotels, and other suppliers we book with (for example booking confirmations), from people who refer you to us, and from advertising platforms if you respond to one of our ads.',
        'What we do not collect. We do not ask for or store your loyalty program or card issuer passwords. We make award bookings together with you on a live screen share.',
    ]),
    ("3. How We Use Information", [
        'We use personal information to research, price, and make bookings for you; to provide award booking and consulting services; to take payments you authorize; to communicate with you about your trips and our services; to send our newsletter and offers if you have asked for them; to keep records for legal, tax, and accounting purposes; to prevent fraud and keep our systems secure; to understand how our website is used and improve it; and to comply with the law and enforce our Terms and Conditions.',
    ]),
    ("4. Credit Card Information", [
        'Card details are collected only on our Credit Card Authorization Form, either filled in and signed online or uploaded as a completed PDF. The form goes straight into a private, access-restricted file storage account. It is not emailed, not posted on our website, and not stored in your browser. We use the card only for payments you have authorized, such as our fees and amounts owed to suppliers. Access is limited to the people who need it to process your bookings.',
    ]),
    ("5. How We Share Information", [
        'With suppliers. We share what is needed to make and manage your bookings with the airlines, cruise lines, hotels, resorts, tour operators, insurers, and other suppliers you ask us to book, including those outside the United States. They have their own privacy practices.',
        'With service providers. We use companies that help us run our business, such as email and productivity tools (Microsoft 365), cloud file storage and signing records (Google Drive), website hosting, security, and delivery (WordPress, Jetpack, Cloudflare, and Vercel), email marketing (Mailchimp), analytics (Google Analytics and WordPress.com Stats), and payment processors, card networks, and banks. They may use the information only to provide their services to us.',
        'For legal reasons. We may disclose information when the law requires it, to respond to legal process, to protect our rights, safety, or property, or in connection with a sale or reorganization of our business.',
        'We do not sell your personal information.',
    ]),
    ("6. Cookies and Analytics", [
        'Our website uses cookies and similar tools to keep the site working and secure and to measure traffic. These include WordPress.com and Jetpack Stats, Google Analytics, Mailchimp site tracking, and Cloudflare security tools. You can block or delete cookies in your browser settings, though parts of the site may not work as well. We may advertise through platforms such as Meta (Facebook and Instagram) and Google; when you interact with an ad, that platform collects information under its own policy.',
    ]),
    ("7. Email and Text Messages", [
        'We send booking-related messages as part of our services. If you subscribe to our newsletter or have agreed to marketing messages, you can opt out at any time using the unsubscribe link in the message or by contacting us. Opting out of marketing does not stop booking-related messages. We send text messages only to people who have agreed to receive them.',
    ]),
    ("8. How Long We Keep Information", [
        'We keep personal information for as long as we need it to provide our services and to meet legal, tax, accounting, and dispute-resolution requirements. After that we delete it or make it anonymous where we reasonably can.',
    ]),
    ("9. Security", [
        'We use reasonable safeguards to protect personal information, including access controls and encrypted connections. No method of storing or sending information is completely secure, so we cannot guarantee absolute security.',
    ]),
    ("10. Your Choices and Rights", [
        'You may ask us to tell you what personal information we hold about you, to correct it, or to delete it, and you may opt out of marketing at any time. Depending on where you live, including New Jersey, you may have additional rights under state law. Email eric@themilesman.com or call (908) 419-7700. We may need to confirm your identity first, and we will respond within the time the law requires. We may keep information we are required to keep, such as booking and tax records.',
    ]),
    ("11. Children", [
        'Our services and website are for adults. We do not knowingly collect personal information from children under 18. If you book travel for a minor, you provide that information as a parent or legal guardian.',
    ]),
    ("12. Other Websites", [
        'Our website may link to other sites, such as suppliers and booking platforms. We are not responsible for their content or privacy practices.',
    ]),
    ("13. Changes to This Policy", [
        'We may update this Privacy Policy from time to time. The effective date at the top shows when it was last changed, and the current version is always on our website.',
    ]),
    ("14. Contact Us", [
        'Miles Man LLC, 622 Arlington Avenue, Westfield, New Jersey 07090. Email eric@themilesman.com. Phone (908) 419-7700.',
    ]),
]

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)


def esc(s):
    return html.escape(s, quote=False)


def para(p):
    m = re.match(r'^([A-Z][A-Za-z0-9 ,\-/]{2,60}\.) (.+)$', p, flags=re.S)
    if m and len(m.group(2)) > 40 and m.group(1).count(' ') <= 8:
        return '<p><strong>%s</strong> %s</p>' % (esc(m.group(1)), esc(m.group(2)))
    return '<p>%s</p>' % esc(p)


def body():
    parts = ['<style>',
             '.mm-priv{max-width:820px;margin:0 auto;line-height:1.65}',
             '.mm-priv h2{font-size:1.2em;margin:1.8em 0 .5em}',
             '.mm-priv p{margin:0 0 .85em}',
             '.mm-priv .mm-meta{background:#f3f6fb;border:1px solid #d6e0ee;border-radius:10px;padding:14px 18px;font-size:.95em;margin:0 0 1.5em}',
             '</style>',
             '<div class="mm-priv">',
             '<div class="mm-meta"><strong>%s</strong><br>%s<br>Effective %s.</div>' % (esc(TITLE), esc(COMPANY), esc(EFFECTIVE))]
    for heading, paras in SECTIONS:
        parts.append('<h2>%s</h2>' % esc(heading))
        parts.extend(para(x) for x in paras)
    parts.append('</div>')
    return '\n'.join(parts)


if __name__ == '__main__':
    b = body()
    assert all(ord(c) < 127 for c in b), 'non-ascii'
    wp = '<!-- wp:html -->\n' + b + '\n<!-- /wp:html -->'
    open(os.path.join(OUT, 'privacy-policy-wordpress.html'), 'w', encoding='ascii', newline='\n').write(wp)
    review = ('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
              '<title>Privacy Policy - draft for review</title><style>body{font-family:Georgia,serif;margin:0;padding:24px 16px 60px;background:#fff;color:#1a1a1a;font-size:17px}'
              '.banner{max-width:820px;margin:0 auto 18px;background:#fff7e0;border:1px solid #f0d58a;padding:10px 14px;border-radius:8px;font:14px sans-serif}</style></head><body>'
              '<div class="banner">DRAFT FOR REVIEW - not published. This is how the page text will read on themilesman.com.</div>\n' + b + '</body></html>')
    open(os.path.join(OUT, 'privacy-policy-review.html'), 'w', encoding='utf8', newline='\n').write(review)
    print('built privacy policy, %d sections, ~%d words' % (len(SECTIONS), sum(len(x.split()) for _, ps in SECTIONS for x in ps)))
