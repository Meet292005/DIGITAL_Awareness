from django.core.management.base import BaseCommand

from awareness.models import Achievement, LearningCategory, LearningModule, Lesson


CONTENT = [
    ("Phishing & fraud", "fraud-scams", "phishing-attacks", "Spot the phish",
     "Recognize the pressure tactics and odd details that make a message worth a second look.",
     "A message arrives saying your college account will close in ten minutes unless you verify it. The sender name looks familiar, but its email address uses a slightly different domain.\n\nWarning signs: unexpected urgency, links that do not match the official website, requests for passwords or one-time codes, and unexpected attachments.\n\nSafer move: do not reply or open the link. Visit the service using its official app or a saved address, and report suspicious messages through your institution's official channel.\n\nTry this: hover over links on a computer or press and hold on mobile to preview the real destination. Never share an OTP with anyone."),
    ("Payments & UPI", "fraud-scams", "upi-payment-fraud", "Keep UPI payments safe",
     "Understand what a payment request really means before you tap approve.",
     "Someone offering a second-hand laptop says they have sent a UPI collect request so they can pay you. The request asks you to enter your PIN.\n\nWarning signs: you must never enter a UPI PIN to receive money; requests to scan a QR code to claim a refund; callers asking you to install remote-access apps.\n\nSafer move: check the transaction details in your bank's official app. A UPI PIN authorizes money leaving your account. Contact your bank through its official number if a payment looks unfamiliar.\n\nTry this: verify the payee name and amount on-screen before approving every payment."),
    ("Social media security", "social-media-security", "social-media-security", "Lock down your social accounts",
     "Make your account harder to impersonate and easier to recover.",
     "A new follower sends a link to vote in a campus contest, then asks you to forward a verification code. The account has copied a friend's profile photo.\n\nWarning signs: unexpected requests for codes, newly created look-alike accounts, login alerts you did not trigger, and public posts containing recovery clues.\n\nSafer move: enable multi-factor authentication using your account's official settings, keep recovery details current, review active sessions, and confirm unusual requests with your friend another way.\n\nTry this: set older personal posts and your friends list to the smallest audience you are comfortable with."),
    ("Password protection", "password-security", "password-protection", "Make passwords work for you",
     "Create distinct, memorable passphrases and secure your account recovery.",
     "A shopping site used the same password as your email announces a breach. Someone tries that password on your social account.\n\nWarning signs: password reuse, short predictable phrases, password reset emails you did not request, and reused recovery questions.\n\nSafer move: use a password manager to create a unique password for each account. Add multi-factor authentication, especially to email and financial accounts. Never share a login code.\n\nTry this: change the reused password on the breached service and on every other account that shared it, starting with your email."),
    ("Identity protection", "identity-theft", "identity-theft", "Protect your personal details",
     "Reduce how much personal information a stranger can use to impersonate you.",
     "A caller claims to be from a delivery service and asks you to confirm your full address and a code sent to your phone.\n\nWarning signs: unexpected requests for identity documents, combinations of personal details, or login/recovery codes; forms reached through unsolicited messages.\n\nSafer move: share only what a service genuinely needs, check the domain before uploading documents, and contact organizations using a verified channel. Report suspected financial misuse to your bank promptly.\n\nTry this: remove unnecessary personal details from public profiles and use different recovery answers that are not guessable from your posts."),
    ("Online wellbeing", "online-wellbeing", "cyberbullying", "Respond to cyberbullying",
     "Know how to respond safely and support someone targeted online.",
     "An edited screenshot about a student is being forwarded in a class group. Replies are getting personal and threatening.\n\nWarning signs: repeated targeting, threats, unwanted sharing of private images or messages, and coordinated harassment.\n\nSafer move: do not amplify the post. Save evidence securely, block and report the account, tell a trusted adult or campus support contact, and contact local emergency services if someone is in immediate danger.\n\nTry this: check in privately with the person targeted, ask what support they want, and avoid sharing screenshots more widely."),
    ("Jobs & opportunities", "fraud-scams", "fake-job-offers", "See through fake job offers",
     "Check a role and recruiter before sending money or personal documents.",
     "A recruiter promises a guaranteed remote internship after a short chat and asks for a refundable registration fee and a photo of your ID.\n\nWarning signs: upfront fees, an offer without a real interview, pressure to act quickly, personal email addresses posing as a company, and vague job details.\n\nSafer move: find the role on the company's official careers page, verify the recruiter's work email independently, and never pay for a job offer. Ask a campus placement office to review anything that feels unusual.\n\nTry this: search the exact job title on the employer's website and call a number published there, not one from the message."),
    ("Online shopping", "online-shopping-scams", "online-shopping-scams", "Shop online with confidence",
     "Check sellers, payment methods, and return policies before you buy.",
     "A social media shop offers a new phone at a tiny fraction of its normal price, but accepts only a direct bank transfer.\n\nWarning signs: prices that are implausibly low, missing company details, copied product images, no clear returns policy, and pressure to pay outside a trusted platform.\n\nSafer move: check independent reviews and the seller's contact and return details. Prefer a payment method with a dispute process. Do not follow payment links sent in surprise messages.\n\nTry this: open the retailer's website directly, confirm its domain, and look for secure payment options and a real delivery/return policy."),
    ("Digital privacy", "digital-privacy", "digital-privacy", "Take charge of your digital footprint",
     "Know what apps collect and make intentional choices about your information.",
     "A simple flashlight app requests access to contacts, microphone, and location even though none are needed for its core job.\n\nWarning signs: unnecessary permissions, privacy notices that hide unexpected data sharing, and account settings that make everything public by default.\n\nSafer move: review app permissions in your phone settings, remove what an app does not need, update your devices, and use privacy controls to limit tracking and sharing.\n\nTry this: check location access for social apps and choose only-while-using or off when continuous access is not necessary."),
    ("Safe browsing", "safe-browsing", "safe-browsing-practices", "Browse without the nasty surprises",
     "Make safer choices when opening files, links, and public Wi-Fi.",
     "A pop-up says your device is infected and asks you to call a number. You are also connected to an open Wi-Fi network at a café.\n\nWarning signs: alarming pop-ups, surprise downloads, misspelled website addresses, browser certificate warnings, and requests to install unknown software.\n\nSafer move: close the tab without calling its number, keep your browser and operating system updated, and avoid sensitive transactions on networks you do not trust. Use official app stores for software.\n\nTry this: if a site looks suspicious, close it and type the official site address yourself instead of following its link."),
]

LEGACY_QUESTIONS = [
    ("A surprise message threatens account closure. What is the safest next step?", ["Click its link quickly", "Visit the service using its official app or saved address", "Reply with your password"], 1, "Use a trusted route instead of the unexpected link."),
    ("What information should you never share in response to a surprise request?", ["A public support-page URL", "An OTP or login code", "A product name"], 1, "A one-time password can authorize access or a transaction."),
    ("What does a UPI PIN authorize?", ["Money leaving your account", "Money arriving in your account", "A delivery confirmation"], 0, "Entering a UPI PIN authorizes a debit from your account."),
    ("A recruiter asks for a fee to guarantee an internship. What should you do?", ["Pay before the role expires", "Verify the role on the official careers page and do not pay for an offer", "Send an identity document first"], 1, "Legitimate job offers do not require candidates to pay an upfront fee."),
    ("An app requests permissions unrelated to what it does. What is a safer response?", ["Grant all permissions", "Review and deny unnecessary access", "Install it from a message link"], 1, "Give apps only the permissions they need for features you use."),
]

QUESTION_BANK = {
    "phishing-attacks": [
        ("A college account message threatens closure in ten minutes. What is the safest first move?", ["Use the link in the message", "Open the college portal from its saved address", "Reply asking if it is real"], 1, "A trusted route avoids links supplied in an unexpected message."),
        ("Which sender detail deserves a closer look?", ["A familiar display name", "A slightly misspelled email domain", "A message sent during class"], 1, "Look-alike domains are often used to imitate trusted organizations."),
        ("A message asks for your one-time login code. What should you do?", ["Share it if the sender knows your name", "Send only the last few digits", "Never share it; contact the service independently"], 2, "Login codes can give someone access to your account."),
        ("A link preview points to a different domain than the displayed text. What does that suggest?", ["The link may be misleading", "The page will load faster", "The message is automatically safe"], 0, "Check the actual destination, not only the words shown in a message."),
        ("What is a good way to report a suspicious college message?", ["Forward it to classmates", "Use the institution's official reporting channel", "Reply to the sender"], 1, "Reporting through a verified channel helps the institution investigate safely."),
    ],
    "upi-payment-fraud": [
        ("A buyer sends a collect request and says you must enter your UPI PIN to receive money. What should you do?", ["Enter it to accept the payment", "Decline; a PIN authorizes money leaving your account", "Share the PIN with the buyer"], 1, "A UPI PIN authorizes a debit; it is not needed to receive money."),
        ("Someone sends a QR code to claim a refund. What is the safest response?", ["Scan it and enter your PIN", "Ask them to send a second QR", "Do not scan it; verify the refund in your bank's official app"], 2, "Unexpected refund QR codes can lead to payment requests."),
        ("A caller asks you to install an app so they can help fix a bank payment. What is the risk?", ["They can remotely view or control your device", "It guarantees your refund", "It hides your bank balance"], 0, "Remote-access apps can expose your device and financial accounts."),
        ("Before approving a UPI payment, what should you check?", ["Payee name and amount", "Only the sender's profile photo", "Whether the message uses your nickname"], 0, "Confirm the payee and amount on the official payment screen."),
        ("You see a transaction you do not recognize. What should you do?", ["Call a number from the payment message", "Contact your bank through its official app or number", "Share your PIN so support can reverse it"], 1, "Use independently verified bank contact details and never reveal your PIN."),
    ],
    "social-media-security": [
        ("A new account using your friend's photo asks for your login code. What is safest?", ["Send the code to help your friend", "Confirm with your friend through another channel", "Post the code privately"], 1, "Verify unusual requests separately; copied profiles can impersonate friends."),
        ("What is a strong way to make a social account harder to take over?", ["Reuse your email password", "Use a unique password and enable multi-factor authentication", "Put your recovery code in your bio"], 1, "Unique credentials and multi-factor authentication reduce account-takeover risk."),
        ("A login alert appears that you did not trigger. What should you do?", ["Ignore every alert", "Use the platform's official settings to secure the account and review sessions", "Reply to the alert with your password"], 1, "Secure the account through its official app or website and remove unfamiliar sessions."),
        ("Which post could make account recovery questions easier to guess?", ["A photo of a meal", "Public details about your school, birthday, or family", "A picture of a sunset"], 1, "Personal details posted publicly can help someone guess recovery information."),
        ("A contest link asks you to sign in through an unfamiliar page. What should you do?", ["Enter your social password", "Use the link only if it has your profile photo", "Open the platform directly and check there"], 2, "Go directly to the official app/site instead of signing in through an unsolicited link."),
    ],
    "password-protection": [
        ("A breached shopping site used the same password as your email. What should you prioritize?", ["Change the email password to a unique one", "Keep it until the site contacts you", "Change only your profile picture"], 0, "Email can reset other accounts, so secure it with a unique password first."),
        ("Which password habit best limits damage from one breach?", ["Reuse one memorable password", "Use a different password for every account", "Add your birth year to every password"], 1, "Unique passwords prevent one exposed credential from unlocking other accounts."),
        ("What can help you create and keep track of unique passwords?", ["A password manager", "A public notes page", "A message to a friend"], 0, "A reputable password manager can create and store distinct passwords."),
        ("You receive a password-reset email you did not request. What is a safer action?", ["Click its link and enter your current password", "Ignore the email and check account security through the official site", "Forward it with your login code"], 1, "Use the official service directly to review security and avoid unexpected links."),
        ("Where should multi-factor authentication be especially important?", ["Email and financial accounts", "Only accounts with public posts", "Only accounts you rarely use"], 0, "Email and financial accounts can unlock or affect many other services."),
    ],
    "identity-theft": [
        ("A delivery caller asks for a texted login code to confirm your address. What should you do?", ["Read them the code", "Ask for their staff number and share it", "Do not share the code; contact the service through its official channel"], 2, "Unexpected callers should not receive your login or recovery codes."),
        ("Before uploading an identity document, what should you check?", ["That the request came through a verified official service", "That the page has a logo", "That the message says urgent"], 0, "A logo can be copied; verify the site and the reason for the request independently."),
        ("Which information combination can help someone impersonate you?", ["Public weather and sports news", "Personal identifiers and account-recovery details", "A generic product review"], 1, "Multiple personal details can be combined to impersonate or target someone."),
        ("You suspect someone used your identity for a financial account. What should you do first?", ["Contact your bank through its official channel", "Reply to the suspicious message", "Post your documents online to warn others"], 0, "Contact the affected financial institution promptly using a verified channel."),
        ("How can you reduce identity clues on public profiles?", ["Post recovery answers for convenience", "Limit unnecessary personal details and audience", "Use the same security answers everywhere"], 1, "Share only what is needed and limit who can see personal information."),
    ],
    "cyberbullying": [
        ("A threatening edited screenshot is spreading in a class group. What is a safer first response?", ["Forward it so everyone knows", "Save evidence securely and do not amplify it", "Reply with a threat"], 1, "Preserve evidence without increasing the harm or distribution."),
        ("How can you support the person targeted?", ["Ask privately what support they want", "Demand that they post a public response", "Share their messages with more groups"], 0, "Private, respectful support lets the targeted person choose what help they need."),
        ("What can help stop repeated harassment on a platform?", ["Block and report the account", "Argue with the account all night", "Post the person's private details"], 0, "Blocking and reporting uses platform safety tools without escalating contact."),
        ("Someone is being threatened with immediate physical harm. What should you do?", ["Treat it as a joke", "Contact a trusted adult/campus support or local emergency services if danger is imminent", "Share the threat publicly for likes"], 1, "Immediate danger needs help from trusted people or emergency services."),
        ("Why avoid forwarding humiliating screenshots?", ["It can spread the harm and expose private information", "It removes the original post", "It automatically reports the account"], 0, "Do not amplify harmful content or expose private messages to more people."),
    ],
    "fake-job-offers": [
        ("A recruiter promises an internship after a short chat but asks for a refundable fee. What is the red flag?", ["An upfront payment request", "A company careers page", "A job description"], 0, "Legitimate employers do not require candidates to pay a fee to secure an offer."),
        ("How can you verify a job listing?", ["Check it on the company's official careers page", "Trust a forwarded screenshot", "Use only the phone number in the message"], 0, "Find the employer's official site independently and check the role there."),
        ("A recruiter uses a personal email address and pressures you to act now. What should you do?", ["Send your ID to hold the role", "Verify the recruiter through the employer's official contact", "Pay a smaller fee"], 1, "Urgency and an unverified address are reasons to pause and independently confirm."),
        ("Before sharing identity documents for a job, what should you confirm?", ["The recruiter and role are legitimate through verified channels", "The offer has a countdown timer", "The recruiter knows your college"], 0, "Confirm legitimacy before sharing sensitive documents."),
        ("You are unsure about a campus placement offer. Who could help review it?", ["A campus placement office", "The sender of an unsolicited message only", "A stranger in a public chat"], 0, "A trusted campus placement office can help verify employers and opportunities."),
    ],
    "online-shopping-scams": [
        ("A social shop offers a new phone at a tiny fraction of its usual price and accepts only bank transfer. What is safest?", ["Pay quickly before it sells out", "Pause and verify the seller and independent reviews", "Send a photo of your card"], 1, "Implausibly low prices and irreversible payment pressure are warning signs."),
        ("What should you check before buying from an unfamiliar store?", ["Independent reviews, contact details, and return policy", "Only the follower count", "Whether the seller uses emojis"], 0, "Check seller legitimacy and policies before handing over payment details."),
        ("A seller asks you to pay outside the trusted marketplace. Why pause?", ["You may lose the platform's payment protections", "It guarantees faster shipping", "It verifies the seller automatically"], 0, "Off-platform payments can remove dispute and buyer-protection options."),
        ("A surprise message includes a payment link for an order issue. What should you do?", ["Open it and enter card details", "Go to the retailer's official app/site directly", "Forward it to another shopper"], 1, "Use the retailer's official app or typed address instead of unexpected links."),
        ("Which payment choice is safer for an unfamiliar retailer?", ["A method with a dispute process", "A direct transfer to a stranger", "Sharing your card PIN"], 0, "A payment method with dispute protection can help if something goes wrong."),
    ],
    "digital-privacy": [
        ("A flashlight app asks for your microphone and contacts. What should you do?", ["Grant everything so it works", "Review and deny permissions it does not need", "Share your contacts with the developer"], 1, "Limit app permissions to what its features actually need."),
        ("How can you reduce continuous location sharing?", ["Set location to off or only while using when appropriate", "Share it publicly", "Give every app always-on access"], 0, "Review location access and choose the least access that supports the feature."),
        ("What is a safer default for an old personal post?", ["Make it public for everyone", "Review its audience and limit sharing if needed", "Add your phone number"], 1, "Regularly review who can see personal posts and profile details."),
        ("An app's privacy notice reveals unexpected data sharing. What is a good next step?", ["Review settings and decide whether to limit or stop using it", "Ignore all app permissions", "Post your password in a review"], 0, "Check settings and choose intentionally what information the app can access."),
        ("Which habit helps protect your digital footprint?", ["Review app permissions and privacy controls regularly", "Accept every default without checking", "Use public Wi-Fi for every sensitive account"], 0, "Periodic privacy reviews help keep data sharing aligned with your choices."),
    ],
    "safe-browsing-practices": [
        ("A pop-up says your device is infected and tells you to call a number. What should you do?", ["Call immediately", "Close the tab without calling the number", "Install the pop-up's software"], 1, "Scare pop-ups use fake alerts to pressure people into unsafe actions."),
        ("A website address has a subtle spelling change. What should you do?", ["Check carefully and open the official address yourself", "Enter your password to test it", "Assume it is safe if it has a logo"], 0, "Look-alike domains can imitate trusted websites."),
        ("Where should you get software updates and apps?", ["Official system settings or app stores", "A surprise download pop-up", "A link from an unknown chat"], 0, "Official update mechanisms reduce the risk of installing malicious software."),
        ("You are on open café Wi-Fi. What is a safer habit?", ["Avoid sensitive transactions on a network you do not trust", "Disable device updates", "Share your bank login with the café"], 0, "Avoid exposing sensitive activity on networks you do not trust."),
        ("A browser shows a certificate warning. What should you do?", ["Stop and verify the website instead of ignoring the warning", "Enter payment details anyway", "Download an unknown fix"], 0, "A certificate warning can indicate a connection or site problem; do not bypass it casually."),
    ],
}


class Command(BaseCommand):
    help = "Create the starter DigiAware learning curriculum and achievement catalogue."

    def handle(self, *args, **options):
        created_modules = 0
        created_lessons = 0
        for category_name, category_slug, slug, title, description, content in CONTENT:
            category, _ = LearningCategory.objects.get_or_create(
                slug=category_slug,
                defaults={"name": category_name, "description": f"Practical lessons about {category_name.lower()}."},
            )
            module, created = LearningModule.objects.get_or_create(
                slug=slug,
                defaults={
                    "category": category,
                    "title": title,
                    "description": description,
                    "difficulty": LearningModule.Difficulty.BEGINNER,
                    "estimated_minutes": 8,
                    "is_published": True,
                },
            )
            created_modules += int(created)
            questions = [
                {"prompt": prompt, "options": choices, "correct_index": correct, "explanation": explanation}
                for prompt, choices, correct, explanation in QUESTION_BANK[slug]
            ]
            lesson, lesson_created = Lesson.objects.get_or_create(
                module=module,
                position=1,
                defaults={
                    "title": title,
                    "content": content,
                    "knowledge_check": questions,
                },
            )
            created_lessons += int(lesson_created)
            if not lesson_created and lesson.knowledge_check == [
                {"prompt": prompt, "options": choices, "correct_index": correct, "explanation": explanation}
                for prompt, choices, correct, explanation in LEGACY_QUESTIONS
            ]:
                lesson.knowledge_check = questions
                lesson.save(update_fields=["knowledge_check"])

        badges = [
            ("cyber-beginner", "Cyber Beginner", "Earned your first lesson completion.", "sparkles"),
            ("scam-detective", "Scam Detective", "Completed a lesson about scams or phishing.", "search"),
            ("privacy-guardian", "Privacy Guardian", "Completed a lesson about privacy or social media.", "eye"),
            ("phishing-expert", "Phishing Expert", "Completed the phishing awareness lesson.", "shield-check"),
            ("cyber-safety-champion", "Cyber Safety Champion", "Completed all ten starter lessons.", "award"),
        ]
        for slug, name, description, icon in badges:
            Achievement.objects.update_or_create(slug=slug, defaults={"name": name, "description": description, "icon": icon})

        self.stdout.write(self.style.SUCCESS(f"Curriculum ready: {created_modules} modules and {created_lessons} lessons created."))
