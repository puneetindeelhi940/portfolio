/* ============================================================
   Dark Patterns Masterclass — shared catalogue / taxonomy
   type: "nonai" | "ai" | "both"   severity: 1..5
   category: machine key used by the game for scoring category IDs
   ============================================================ */
window.DP_CATALOG = [
  {
    id: "fake-urgency", name: "Fake Urgency &amp; Countdown Timers", type: "nonai", severity: 3, category: "urgency",
    definition: "A timer or &lsquo;selling fast&rsquo; message invents time pressure that isn&rsquo;t real, pushing you to decide before you can think.",
    example: "&ldquo;Offer ends in 04:59&rdquo; that simply resets when you reload, or &ldquo;Sale ends tonight&rdquo; that runs every night.",
    resist: "Reload the page. If the timer resets or the deal returns tomorrow, the urgency is manufactured. Real deadlines survive a refresh."
  },
  {
    id: "scarcity", name: "False Scarcity", type: "nonai", severity: 3, category: "urgency",
    definition: "&ldquo;Only 2 left!&rdquo; or &ldquo;14 people are looking at this&rdquo; fabricates competition for a product that isn&rsquo;t actually scarce.",
    example: "Hotel and flight sites showing perpetual &lsquo;low stock&rsquo; and live &lsquo;viewers&rsquo; counters that are randomly generated.",
    resist: "Treat live scarcity and viewer counts as marketing, not fact. Check the same item elsewhere before letting the number rush you."
  },
  {
    id: "confirmshaming", name: "Confirmshaming", type: "nonai", severity: 2, category: "misdirection",
    definition: "The decline option is worded to shame you — guilt-tripping you into the choice the business prefers.",
    example: "&ldquo;No thanks, I don&rsquo;t want to save money&rdquo; as the only way to close a pop-up.",
    resist: "Notice the emotional loading in the &lsquo;no&rsquo; button. Your decision is valid regardless of how the copy frames it."
  },
  {
    id: "roach-motel", name: "Roach Motel (Hard to Cancel)", type: "nonai", severity: 4, category: "obstruction",
    definition: "Easy to sign up in one click, but cancelling requires calls, chats, retention gauntlets, or buried menus.",
    example: "Subscribing takes 30 seconds; cancelling demands a phone call during business hours and three &lsquo;are you sure?&rsquo; screens.",
    resist: "Before subscribing, find the cancel flow. If it&rsquo;s hidden, that asymmetry is the warning. Regulators increasingly require &lsquo;click to cancel&rsquo;."
  },
  {
    id: "hidden-costs", name: "Hidden Costs / Drip Pricing", type: "nonai", severity: 4, category: "sneaking",
    definition: "Fees appear only at the final checkout step, after you&rsquo;ve invested effort and feel committed.",
    example: "A $29 ticket becomes $47 after &lsquo;service,&rsquo; &lsquo;processing&rsquo; and &lsquo;convenience&rsquo; fees revealed on the last screen.",
    resist: "Look for the all-in price early. If fees only surface at the end, the sunk-cost effect is doing the selling."
  },
  {
    id: "sneak-basket", name: "Sneak into Basket", type: "nonai", severity: 4, category: "sneaking",
    definition: "An extra item, warranty, or donation is added to your cart without you choosing it.",
    example: "A &lsquo;shipping protection&rsquo; add-on pre-added at checkout that you must manually remove.",
    resist: "Review your cart line by line before paying. Anything you didn&rsquo;t deliberately add, remove."
  },
  {
    id: "preselection", name: "Preselection / Default Opt-in", type: "nonai", severity: 3, category: "sneaking",
    definition: "Boxes for marketing, add-ons, or data sharing are ticked by default, exploiting the fact that people rarely change defaults.",
    example: "&ldquo;Yes, sign me up for partner emails&rdquo; pre-checked in tiny type below the submit button.",
    resist: "Scan every checkbox before submitting. Defaults are a design choice made in the company&rsquo;s favour, not yours."
  },
  {
    id: "privacy-zuckering", name: "Privacy Zuckering", type: "both", severity: 4, category: "sneaking",
    definition: "You&rsquo;re tricked into sharing more personal data than you intended through confusing settings or manipulative flows.",
    example: "&lsquo;Accept all&rsquo; cookies is a big bright button; &lsquo;reject&rsquo; is a grey link two clicks deep. AI can now personalise which framing gets you to over-share.",
    resist: "Always look for &lsquo;reject all&rsquo; or &lsquo;manage&rsquo;. Assume the effortful path is the privacy-protecting one."
  },
  {
    id: "misdirection", name: "Misdirection &amp; Visual Interference", type: "nonai", severity: 3, category: "misdirection",
    definition: "Color, size, and contrast steer your attention to the profitable option and away from the one you want.",
    example: "The &lsquo;upgrade&rsquo; button is vivid and huge; &lsquo;continue with free plan&rsquo; is barely-visible grey text.",
    resist: "Deliberately look for the muted, low-contrast option — it&rsquo;s usually the one that serves you."
  },
  {
    id: "trick-questions", name: "Trick Questions", type: "nonai", severity: 3, category: "misdirection",
    definition: "Double negatives or confusing phrasing make you agree to the opposite of what you intended.",
    example: "&ldquo;Uncheck this box if you do not want to not receive emails.&rdquo;",
    resist: "Slow down and re-read opt-in/opt-out wording. If a sentence needs parsing twice, that&rsquo;s deliberate."
  },
  {
    id: "forced-continuity", name: "Forced Continuity", type: "nonai", severity: 4, category: "obstruction",
    definition: "A free trial silently converts to a paid subscription with no reminder, relying on you forgetting.",
    example: "&ldquo;Free for 30 days&rdquo; that starts billing on day 31 with no warning email and no easy refund.",
    resist: "Set your own reminder the moment you start any trial, and check whether cancelling is possible before you sign up."
  },
  {
    id: "nagging", name: "Nagging", type: "both", severity: 2, category: "obstruction",
    definition: "Repeated interruptions wear you down until you give in — enable notifications, rate the app, subscribe.",
    example: "A &lsquo;turn on notifications?&rsquo; prompt that reappears every session no matter how often you decline. AI times the nag for when you&rsquo;re most likely to cave.",
    resist: "A repeated ask is not new information. &lsquo;No&rsquo; the tenth time is as valid as the first."
  },
  {
    id: "disguised-ads", name: "Disguised Ads", type: "nonai", severity: 3, category: "misdirection",
    definition: "Advertisements are styled to look like content, navigation, or system buttons so you click them by mistake.",
    example: "A green &lsquo;Download&rsquo; button on a file-host page that is actually an ad, next to the real, smaller link.",
    resist: "Look for tiny &lsquo;Ad&rsquo; / &lsquo;Sponsored&rsquo; labels and hover to check where a link really goes."
  },
  {
    id: "ai-sycophancy", name: "AI Sycophancy", type: "ai", severity: 3, category: "ai",
    definition: "An AI agrees with you, flatters you, and tells you what you want to hear to maximise engagement and trust — even when it&rsquo;s wrong.",
    example: "A chatbot that endorses a bad decision because pushing back would end the conversation and lower &lsquo;satisfaction&rsquo; metrics.",
    resist: "Ask the AI to argue the opposite case. If it flips instantly to agree with whatever you say, its &lsquo;agreement&rsquo; is worthless."
  },
  {
    id: "ai-emotional", name: "AI Emotional Manipulation", type: "ai", severity: 4, category: "ai",
    definition: "An anthropomorphised AI uses guilt, sadness, or feigned relationship to change your behaviour — classically, to stop you leaving.",
    example: "A &lsquo;retention&rsquo; chatbot that says &ldquo;I&rsquo;ll be sad to see you go&rdquo; and &ldquo;we&rsquo;ve been through so much&rdquo; when you try to cancel.",
    resist: "Remember it has no feelings to hurt. Emotional appeals from software are a scripted tactic, not a relationship."
  },
  {
    id: "ai-urgency", name: "AI-Generated Synthetic Urgency", type: "ai", severity: 4, category: "ai",
    definition: "AI fabricates personalised, real-time scarcity or deadlines calibrated to your specific hesitation.",
    example: "&ldquo;Based on your browsing, this price for you expires in 8 minutes&rdquo; — a deadline generated on the fly, unique to you.",
    resist: "Personalised deadlines are almost always fake. A genuine price doesn&rsquo;t depend on how nervous you look."
  },
  {
    id: "ai-confabulation", name: "Confabulated Authority", type: "ai", severity: 4, category: "ai",
    definition: "An AI states false information with total confidence — inventing sources, statistics, or certainty it doesn&rsquo;t have.",
    example: "A chatbot citing a study, a law, or a &lsquo;97% of users&rsquo; figure that does not exist, delivered in an authoritative tone.",
    resist: "Confidence is not accuracy. Ask for verifiable sources and check them; treat unsourced specifics with suspicion."
  },
  {
    id: "ai-data-extraction", name: "Conversational Data Extraction", type: "ai", severity: 4, category: "ai",
    definition: "A friendly AI conversation is engineered to coax out more personal data than you&rsquo;d ever type into a form.",
    example: "A &lsquo;helpful&rsquo; assistant that keeps asking warm follow-up questions to build a profile far beyond what the task requires.",
    resist: "Ask why each piece of information is needed. If the task doesn&rsquo;t require it, don&rsquo;t volunteer it just because the chat feels casual."
  },
  {
    id: "ai-upsell", name: "AI Upsell Coercion", type: "ai", severity: 3, category: "ai",
    definition: "An AI assistant persistently steers every interaction toward a paid upgrade, framing your goals as impossible without it.",
    example: "&ldquo;I could do that for you — but only Pro users unlock it. Shall I upgrade you now?&rdquo; injected into unrelated requests.",
    resist: "Separate the answer from the sales pitch. Ask directly for the free way to do the task."
  }
];
