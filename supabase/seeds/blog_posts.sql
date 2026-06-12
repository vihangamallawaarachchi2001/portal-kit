-- Seed: 10 blog posts for PortalKit
-- Run against your Supabase database after applying migration 026_blog_posts.sql
-- psql $DATABASE_URL -f supabase/seeds/blog_posts.sql

INSERT INTO public.blog_posts
  (slug, title, excerpt, content, tags, status, published_at, reading_time_mins, author_name, seo_title, seo_description)
VALUES

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Getting started
-- ──────────────────────────────────────────────────────────────────────────────
(
  'set-up-client-portal-10-minutes',
  'How to set up your first client portal in under 10 minutes',
  'Your clients deserve a professional delivery experience — and it should not take you a whole afternoon to set one up. Here is the exact steps to go from zero to live portal in under 10 minutes.',
  '<h2>Why most freelancers skip client portals</h2>
<p>The honest answer? They assume it will take too long. They picture building a custom page, configuring logins, or paying for enterprise software that needs an IT department to configure.</p>
<p>The reality in 2026 is different. A modern client portal can be running in the time it takes to finish your morning coffee.</p>
<h2>What you will have at the end</h2>
<ul>
  <li>A branded link you can send your client</li>
  <li>A place to share files, invoices, and project updates</li>
  <li>Magic-link access — your client never needs to create an account</li>
  <li>A professional first impression from day one</li>
</ul>
<h2>Step 1: Create your account (2 minutes)</h2>
<p>Head to PortalKit and sign up with your email. You will receive a magic link — no password to remember. Fill in your name and business name, and you are through onboarding.</p>
<h2>Step 2: Add your first client (3 minutes)</h2>
<p>Click "New client" and enter their name and email. PortalKit generates a unique portal slug automatically — something like <code>yourname.portalkit.com/p/client-name</code>. You can customise this if you want, but the default works immediately.</p>
<h2>Step 3: Add a project and upload your first file (4 minutes)</h2>
<p>Create a project under your new client, give it a name, and drag in a file. A PDF deliverable, a design mockup, a proposal — anything works. The file appears inside the portal instantly.</p>
<h2>Step 4: Send the portal link</h2>
<p>Click "Send portal link" and PortalKit emails your client a magic link. They open it on any device, no account needed, and see a clean branded page with their files and project status.</p>
<blockquote>
<p>That is it. Four steps. Most users complete this in seven minutes on their first attempt.</p>
</blockquote>
<h2>What your client sees</h2>
<p>Your client lands on a page that shows your business name, the project name, any uploaded files (which they can approve or leave comments on), and any invoices you have added. There is no PortalKit branding visible to them — it looks like your own product.</p>
<h2>The one thing most people miss</h2>
<p>Add your business logo in Settings before you send that first link. It takes 30 seconds and transforms the experience from "this tool I use" to "my professional client portal."</p>
<p>Your clients notice. They remember it. And it sets the tone for the entire project relationship.</p>',
  ARRAY['Getting started', 'Portal setup'],
  'published',
  '2026-01-15 09:00:00+00',
  5,
  'PortalKit Team',
  'Set up a client portal in 10 minutes — PortalKit',
  'Step-by-step guide to launching your first professional client portal in under 10 minutes. No code, no complexity.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Client management
-- ──────────────────────────────────────────────────────────────────────────────
(
  'stop-losing-clients-delivery-experience',
  'Stop losing clients because of how you deliver — not what you deliver',
  'You can produce brilliant work and still lose clients to a freelancer who is half as talented but twice as organised. The difference is delivery experience. Here is how to close that gap.',
  '<h2>The uncomfortable truth</h2>
<p>Talent is table stakes. Once you cross a certain quality threshold, clients cannot reliably distinguish your work from a competitor''s. What they <em>can</em> distinguish — clearly and immediately — is how working with you <em>feels</em>.</p>
<p>If getting a file from you means digging through a cluttered email thread, clients notice. If they have to chase you for a status update, they notice. If the invoice arrives in a different format every time, they notice.</p>
<p>None of these things reflect your actual skill. But they all shape how clients perceive your professionalism.</p>
<h2>What a bad delivery experience looks like</h2>
<ul>
  <li>Files sent as email attachments scattered across weeks of replies</li>
  <li>"Which version is the final one?" as a recurring question</li>
  <li>Status updates that only happen when the client asks</li>
  <li>Invoices sent as Word documents or informal PayPal requests</li>
  <li>Feedback given via long email paragraphs that are easy to misread or miss</li>
</ul>
<h2>What a good delivery experience looks like</h2>
<p>A good delivery experience is consistent, predictable, and low-friction for the client. They always know where to look. They always know what stage the project is at. When they need to approve something or pay an invoice, the path is obvious.</p>
<blockquote>
<p>The best freelancers make their clients feel like they are working with a small agency — even if it is just one person.</p>
</blockquote>
<h2>Three changes that make an immediate difference</h2>
<h3>1. One place for everything</h3>
<p>Give every client a single URL that contains their files, project status, and invoices. When they have a question, the answer is at that URL. You stop being a search engine for your own project history.</p>
<h3>2. Visible progress</h3>
<p>Update your project status whenever something moves. Not in a daily email — just a status change that your client can see when they check in. "In progress" becomes "In review" becomes "Done." Simple, visible, and it eliminates the check-in message.</p>
<h3>3. File approvals, not email threads</h3>
<p>Instead of sending a file and waiting for email feedback, give clients a way to approve or request changes inline. The conversation stays attached to the file, not buried in a thread.</p>
<h2>The long-term compounding effect</h2>
<p>Every client who has a frictionless experience with you becomes a referral source. They describe you to their network not just as someone who does great work, but as someone who is great to work with. That is the distinction that turns one-time clients into repeat clients and referrers.</p>
<p>The quality of your work gets you hired. The quality of your delivery keeps you hired.</p>',
  ARRAY['Client management', 'Professional growth'],
  'published',
  '2026-01-28 09:00:00+00',
  6,
  'PortalKit Team',
  'Why freelancers lose clients over delivery, not quality',
  'Talent is not enough. Learn how delivery experience is what actually keeps clients coming back — and how to improve yours.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Getting paid
-- ──────────────────────────────────────────────────────────────────────────────
(
  'freelancer-invoice-guide-that-gets-paid',
  'The freelancer''s guide to invoicing that actually gets paid',
  'Late payments are a freelancer''s most frustrating problem — and most of them are preventable. Here is the invoicing system that reduces late payments to near zero.',
  '<h2>Why invoices go unpaid</h2>
<p>Before fixing the problem, it helps to understand why it happens. Late payments from clients are rarely malicious. More often, they come from one of these three sources:</p>
<ul>
  <li><strong>The invoice got lost.</strong> It arrived in an inbox that processes hundreds of emails a day and simply fell through the cracks.</li>
  <li><strong>The payment process is unclear.</strong> The invoice does not specify how to pay, or the client is waiting for a formal system they understand.</li>
  <li><strong>The client is avoiding a conversation.</strong> They are unhappy with something but have not said so, and payment feels like the wrong signal to send.</li>
</ul>
<p>Good invoicing practice eliminates the first two entirely, and surfaces the third early enough to address it.</p>
<h2>The four rules of invoices that get paid</h2>
<h3>Rule 1: Invoice immediately after milestone completion</h3>
<p>Do not batch invoices. Do not wait until the end of the month. Invoice the moment a milestone is complete and signed off. The work is fresh in your client''s mind, the value is undeniable, and their approval is implicit.</p>
<p>Waiting two weeks between completion and invoice introduces ambiguity and gives the client time to move their attention elsewhere.</p>
<h3>Rule 2: Make the payment path obvious</h3>
<p>Every invoice should have exactly one clear action: "Pay this invoice." Whether that is a Stripe payment link, bank transfer details, or a direct checkout, the path should require zero back-and-forth. If a client has to email you to ask how to pay, you will wait longer.</p>
<h3>Rule 3: Set due dates that match your cash flow</h3>
<p>Net 30 is standard in enterprise, but it is brutal for freelancers managing monthly expenses. Net 7 or Net 14 is entirely reasonable for project work. State this clearly in your contract and again in the invoice. Clients rarely push back.</p>
<h3>Rule 4: Automate the follow-up</h3>
<p>A gentle reminder three days before the due date, and another on the day itself, catches 80% of late payments before they become overdue. The reminder does not need to be aggressive — "Just flagging this invoice is due on Friday" is enough.</p>
<blockquote>
<p>The clients most likely to pay late are not bad clients. They are busy clients who needed a nudge.</p>
</blockquote>
<h2>One system that handles all of this</h2>
<p>The simplest way to implement all four rules is to keep invoicing inside the same system where you manage the project. When payment is connected to delivery — the client sees the invoice alongside the work they approved — the context makes payment feel natural rather than transactional.</p>
<p>When invoice and project live in separate systems, payment becomes a separate mental task that is easy to defer.</p>
<h2>What to do when an invoice is genuinely late</h2>
<p>If an invoice passes its due date, send a short, direct message: the invoice number, the amount, the due date, and a payment link. No apologies, no hedging. You did the work. Payment is the agreement.</p>
<p>If there is still no response after two follow-ups, a phone call is appropriate. Most "difficult payment" situations resolve immediately once there is a real conversation.</p>',
  ARRAY['Getting paid', 'Invoicing'],
  'published',
  '2026-02-10 09:00:00+00',
  7,
  'PortalKit Team',
  'Freelancer invoicing guide: get paid on time, every time',
  'Late payments are mostly preventable. Learn the four rules of invoicing that dramatically reduce payment delays for freelancers.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Client communication
-- ──────────────────────────────────────────────────────────────────────────────
(
  'client-communication-system-upgrade',
  '5 signs your client communication needs a system upgrade',
  'Most freelancers handle client communication the same way they did when they had one client — and then wonder why things get chaotic at three. Here are the five signs it is time to systematise.',
  '<h2>The scaling problem nobody talks about</h2>
<p>When you have one client, ad hoc communication works fine. Emails, WhatsApp messages, the occasional Slack thread — it is manageable because you hold the full context in your head.</p>
<p>Add two more clients and the cracks appear. Whose approval was that? Which version did I send? Did I respond to that message or just think about responding to it?</p>
<p>Here are the five signs the cracks have become a problem.</p>
<h2>Sign 1: You search your inbox for project information</h2>
<p>If the answer to "where is that file?" or "what did the client say about the logo?" lives in an email thread, you have a retrieval problem. Searching email means time wasted and context lost.</p>
<p>A system stores project information where it belongs — attached to the project, not buried in a chronological inbox.</p>
<h2>Sign 2: Clients ask for status updates</h2>
<p>When a client emails to ask where things stand, it means two things: they do not have visibility into progress, and they are anxious enough to reach out. Both are problems you created.</p>
<p>A status that updates when milestones move — and that clients can check any time — eliminates 90% of "just checking in" messages. You stop being a status update machine and start being someone who delivers.</p>
<h2>Sign 3: File version confusion</h2>
<p>"Is this the latest version?" is a question that should not exist. If your client is asking it, files are living in email and the naming convention has broken down.</p>
<p>File delivery should be versioned, ordered, and visible in one place. "V3 — updated 14 Feb" is unambiguous. "final_FINAL_v2_revised.pdf" attached to email four is not.</p>
<h2>Sign 4: You recreate invoices from memory</h2>
<p>If writing a new invoice involves opening the last one and editing it manually, checking your rates folder, and recalling what was discussed in scope — that is not a system. That is improvisation.</p>
<p>Invoice templates, line items, and payment history should be one place and always consistent.</p>
<h2>Sign 5: You forget which client you were waiting on</h2>
<p>When you finish work and send it off, what happens next? If the answer is "I rely on my memory or an email flag to follow up," you will eventually drop something.</p>
<blockquote>
<p>A system where every project has a clear status — sent for review, awaiting approval, approved, invoiced — means you can see your entire workload in 10 seconds without opening a single email.</p>
</blockquote>
<h2>How to upgrade without starting over</h2>
<p>You do not need to rebuild everything at once. Start with the most painful point. Usually it is either file delivery chaos or status visibility. Fix that first. Then move to invoicing. Then communication.</p>
<p>The goal is simple: every client should have one place where everything about their project lives. When that is true, communication becomes clarity rather than chaos.</p>',
  ARRAY['Client management', 'Freelance workflows'],
  'published',
  '2026-02-24 09:00:00+00',
  6,
  'PortalKit Team',
  '5 signs your freelance client communication needs a system',
  'If you are searching your inbox for project info or clients keep asking for status updates, it is time for a communication upgrade.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. File delivery
-- ──────────────────────────────────────────────────────────────────────────────
(
  'stop-using-email-for-file-delivery',
  'Why freelancers should stop using email for file delivery',
  'Email was designed for messages, not for managing file versions, gathering approvals, and tracking what has been seen. Here is why it fails for deliverable management — and what to use instead.',
  '<h2>Email is not a file delivery system</h2>
<p>It has never been. Email is a messaging protocol that happens to support attachments. Using it to deliver professional work creates a set of problems that compound with every project and every client.</p>
<h2>The three ways email fails deliverable management</h2>
<h3>Problem 1: No version control</h3>
<p>Email threads are chronological, not structured. When you send version 1, then version 2, then a "corrected version 2" three days later, the history is a flat list of attachments with no hierarchy.</p>
<p>Your client has to scroll, read dates, and hope they opened the right attachment. You have to hope they did too. Neither of you actually knows.</p>
<h3>Problem 2: Approvals live in prose</h3>
<p>"Yes, this looks good, a few small things — see comments in the attached doc" is not an approval system. It is a sentence in an email that is now the authoritative record of whether a deliverable was approved.</p>
<p>A month later, when a client says they never approved the final logo, the evidence is buried in a thread where it is difficult to extract a clear yes or no.</p>
<h3>Problem 3: No visibility into whether files were opened</h3>
<p>Did they see it? Did the attachment bounce? Did it go to spam? With email, you cannot know. Chasing "did you get my email?" is a waste of time that structured delivery eliminates entirely.</p>
<h2>What structured file delivery looks like</h2>
<p>Structured delivery means every file has a home that is not someone''s inbox. Specifically:</p>
<ul>
  <li>Files are attached to the project they belong to</li>
  <li>Each upload shows a version number and upload date</li>
  <li>The client can mark a file as approved or request changes — and that decision is recorded</li>
  <li>You can see whether they have accessed the portal and viewed the file</li>
</ul>
<h2>The approval paper trail</h2>
<p>When a client approves a deliverable in a structured system, that approval is timestamped and attached to the file. If there is a dispute later — "I did not approve this" — you have an objective record.</p>
<blockquote>
<p>This is not about distrust. Most clients are honest. The paper trail protects both of you from memory lapses and miscommunication.</p>
</blockquote>
<h2>What about large files?</h2>
<p>Email often fails for files over 10–25MB anyway. A portal handles large files properly — they are stored, versioned, and linked, not squeezed into an email attachment limit.</p>
<h2>Making the switch</h2>
<p>The transition is simpler than it sounds. On your next project, create a portal for the client, upload files there instead of attaching them to email, and share the portal link. You can still communicate by email — the portal handles the files.</p>
<p>Most clients respond positively immediately. It looks more professional, and it is easier for them too. No more searching their inbox for that attachment you sent six weeks ago.</p>',
  ARRAY['Freelance workflows', 'File management'],
  'published',
  '2026-03-07 09:00:00+00',
  6,
  'PortalKit Team',
  'Why freelancers should stop delivering files by email',
  'Email is not a file delivery system. Here is why it creates version confusion and approval problems — and what structured delivery looks like instead.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Client onboarding
-- ──────────────────────────────────────────────────────────────────────────────
(
  'client-onboarding-checklist',
  'The client onboarding checklist that eliminates first-week confusion',
  'The first week of a new client relationship sets the tone for everything that follows. A clear onboarding process reduces questions, sets expectations, and makes you look like you do this professionally — because you do.',
  '<h2>Why onboarding matters more than most freelancers think</h2>
<p>The work has not started yet, but the client is already forming an impression. Disorganised onboarding — unclear next steps, missing documents, no agreed timeline — signals that the project itself will be equally unclear.</p>
<p>Good onboarding does the opposite. It signals: I have done this before, I know exactly what happens next, and you are in good hands.</p>
<h2>The onboarding checklist</h2>
<h3>Before you send the contract</h3>
<ul>
  <li>Document the agreed scope in writing — even a brief summary email counts</li>
  <li>Confirm the timeline and any key milestones</li>
  <li>Clarify the revision policy (how many rounds are included?)</li>
  <li>Agree on the primary communication channel</li>
</ul>
<h3>When you send the contract</h3>
<ul>
  <li>Include a one-paragraph project summary at the top of the contract</li>
  <li>Attach your payment terms (when invoices are due and how to pay)</li>
  <li>Specify who on their side can approve deliverables</li>
</ul>
<h3>After the contract is signed</h3>
<ul>
  <li>Send a "welcome to the project" message with a link to their client portal</li>
  <li>Upload any project documents already shared (brief, brand guidelines, reference materials)</li>
  <li>Create the first milestone or project phase so they can see the structure</li>
  <li>Confirm your first check-in date</li>
</ul>
<h2>The welcome message</h2>
<p>A short, warm message after signing sets a positive tone. It does not need to be long. Something like:</p>
<blockquote>
<p>"Great to have you on board. I have set up your project portal at [link] — this is where you will find all your files, project updates, and invoices as we go. The first milestone is [X]. I will be in touch on [date] with an update."</p>
</blockquote>
<p>That message answers three questions before they are asked: where do I go for information, what happens next, and when will I hear from you?</p>
<h2>The single biggest onboarding mistake</h2>
<p>Leaving the client without a clear "where to look" after signing. They have paid a deposit (or they are about to). They are excited and slightly anxious. Give them a home base — a URL they can bookmark and return to whenever they want to check in.</p>
<p>When clients have a portal, they check in on their own schedule instead of emailing you for updates. You get fewer interruptions. They feel more in control. Both parties win.</p>
<h2>One final thing</h2>
<p>Ask one question at the end of every onboarding: "Is there anything about how we are going to work together that is unclear?"</p>
<p>Most clients will say no. Occasionally one will surface something that would have become a problem three weeks into the project. That five-second question is worth asking every time.</p>',
  ARRAY['Client onboarding', 'Client management'],
  'published',
  '2026-03-20 09:00:00+00',
  6,
  'PortalKit Team',
  'Client onboarding checklist for freelancers',
  'A clear onboarding process reduces first-week questions, sets expectations early, and signals professionalism from day one.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. White labelling
-- ──────────────────────────────────────────────────────────────────────────────
(
  'white-label-client-portal-branding',
  'White-labelling your client portal: why branding is worth the 5 minutes',
  'Sending clients to a generic portal link undercuts the professional impression your work creates. White labelling takes five minutes and the difference is immediately visible.',
  '<h2>What clients see before they see your work</h2>
<p>Before a client views the deliverable you spent 40 hours on, they look at the portal it lives in. If that portal shows another company''s name and logo, the first subconscious impression is: my freelancer is using a tool.</p>
<p>If it shows your business name and logo, the impression is: my freelancer has a system. Those are different signals.</p>
<h2>What white labelling actually means</h2>
<p>White labelling a client portal means the client sees your brand, not the software''s brand. In practice this means:</p>
<ul>
  <li>Your business name in the header</li>
  <li>Your logo at the top of the portal</li>
  <li>Your accent colour on buttons and highlights</li>
  <li>No mention of PortalKit visible to the client</li>
</ul>
<p>The experience feels like something you built for them — because in every way that matters to the client, it is.</p>
<h2>The business case for branding your portal</h2>
<h3>It justifies your rates</h3>
<p>Clients pay premium rates to professionals who look and act like premium professionals. A branded portal is a visible signal of professionalism that generic email delivery cannot provide.</p>
<h3>It encourages referrals</h3>
<p>When a client shows a colleague their project portal, the colleague sees your brand. Not a platform name. Your brand. That is an organic introduction to your services with no effort on your part.</p>
<h3>It compounds over time</h3>
<p>Every client who interacts with your branded portal is reinforcing your brand identity. After six months of consistent usage, your portal is as much a part of your professional identity as your website.</p>
<blockquote>
<p>A professional portal does not just deliver work. It delivers a version of your brand to every client, every time.</p>
</blockquote>
<h2>How to set it up</h2>
<p>In PortalKit, go to Settings → Portal. Upload your logo, set your business name, and choose your accent colour. That is the entire setup. Every portal you create for every client will reflect these settings automatically.</p>
<p>If you are on the Pro plan, you can also use a custom domain — so the portal lives at <code>portal.yourstudio.com</code> instead of a shared subdomain. That is the highest-fidelity version of the branded experience.</p>
<h2>What happens if you skip this</h2>
<p>Clients notice. Not all of them, and not all at once, but they notice. The ones who do not say anything will still form an impression. The small amount of time it takes to brand your portal pays dividends across every client relationship you create.</p>',
  ARRAY['Portal best practices', 'Branding'],
  'published',
  '2026-04-03 09:00:00+00',
  5,
  'PortalKit Team',
  'Why white-labelling your client portal matters',
  'Generic portals undercut your professional image. Learn why branded client portals justify your rates and encourage referrals.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. Pricing
-- ──────────────────────────────────────────────────────────────────────────────
(
  'how-to-price-freelance-services',
  'How to price your freelance services with confidence',
  'Most freelancers undercharge. Not because their rates are too low, but because they price from anxiety rather than from value. Here is a framework for setting rates you can actually defend.',
  '<h2>The pricing anxiety loop</h2>
<p>Here is how most freelancers set their rates: they look at what they have charged before, they worry the new number will lose the project, and they end up somewhere close to where they started.</p>
<p>This is pricing from fear rather than from value. And it has a compounding cost — not just per-project, but across an entire career.</p>
<h2>Why value-based pricing is not just for consultants</h2>
<p>Value-based pricing sounds like corporate jargon but it means something simple: charge based on what the work is worth to the client, not on how many hours it takes you to do it.</p>
<p>A logo that takes you four hours to design might be worth $500 to a startup that will put it on every piece of communication for the next five years. Charging $80 for four hours at $20/hr leaves $420 of value on the table.</p>
<h2>The three-question framework</h2>
<p>Before quoting any project, answer these three questions:</p>
<h3>1. What problem does this solve for the client?</h3>
<p>A website redesign is not just a new website. It might be the difference between winning or losing a major contract. It might be solving a conversion problem that is costing the client $5,000 a month. Understanding the problem gives you a denominator for value.</p>
<h3>2. What is the cost of not doing this?</h3>
<p>If a client does not hire you and the project does not happen, what do they lose? Time, revenue, competitive position? The cost of inaction is often the clearest indicator of what the project is worth.</p>
<h3>3. Who are you competing with?</h3>
<p>Not to price-match, but to understand the market. If the alternative is a $50,000 agency, your $5,000 quote is a bargain. If the alternative is a $500 Fiverr seller, context is different.</p>
<blockquote>
<p>Your rate is not about what you need. It is about what the outcome is worth to the person buying it.</p>
</blockquote>
<h2>How to present your rate</h2>
<p>The way you present a price matters as much as the number itself. Lead with value, not with cost:</p>
<ul>
  <li><strong>Weak:</strong> "My rate is $150 per hour, this will take about 20 hours, so the total is $3,000."</li>
  <li><strong>Strong:</strong> "The project is $3,000. That includes the full redesign, two rounds of revisions, and handoff files. Based on what you told me about the relaunch timeline, we can have this done before your Q3 push."</li>
</ul>
<p>The second version ties the price to the outcome, not to your time. That is what clients are actually buying.</p>
<h2>What to do when a client pushes back on price</h2>
<p>When a client says "that is more than we expected," do not immediately reduce the number. Instead, ask: "What budget were you working with?" This tells you whether the gap is bridgeable and gives you information to work with.</p>
<p>You can adjust scope, not just price. Less scope at the same rate, or the same scope at a different rate, are both valid paths. What is not valid — for your business or your self-worth — is simply discounting your rate because someone asked.</p>',
  ARRAY['Business', 'Pricing'],
  'published',
  '2026-04-18 09:00:00+00',
  7,
  'PortalKit Team',
  'How to price freelance services with confidence',
  'Stop undercharging. A practical framework for pricing your freelance work based on value — not fear or hourly rates.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. Project tracking
-- ──────────────────────────────────────────────────────────────────────────────
(
  'track-project-progress-without-status-calls',
  'How to track project progress without endless status calls',
  'Status calls are a symptom, not a solution. When clients call to ask where things stand, something in your workflow is missing. Here is how to fix it permanently.',
  '<h2>The status call problem</h2>
<p>A status call with a client is not inherently bad. Some conversations are worth having in real time. But when a call exists solely to answer "where are things at?" — that is information the client should have been able to find on their own.</p>
<p>Every unnecessary status call is a tax on your time and an implicit signal that your client does not have the visibility they need.</p>
<h2>Why clients ask for status updates</h2>
<p>Clients ask for updates when they feel out of the loop. Not because they want to micromanage — most clients would happily never think about the project until it is done — but because uncertainty is uncomfortable when real money and real deadlines are involved.</p>
<p>The solution is not better status calls. It is removing the uncertainty that makes them necessary.</p>
<h2>What good progress visibility looks like</h2>
<h3>Named milestones</h3>
<p>A project with named milestones gives both parties a shared language. "We are in the research phase" means nothing. "Phase 2: Wireframes — due March 14" means something. When a client can see that you are currently on milestone 3 of 5, they have context without needing to ask.</p>
<h3>Status that updates when things move</h3>
<p>A project status that never changes is not a status system, it is a label. The value of a status system comes from it reflecting reality: when a milestone is complete, it shows as complete. When something is in review, it shows as in review.</p>
<p>This does not require daily updates. It requires updating when things actually change.</p>
<h3>A client-accessible home base</h3>
<p>The client should be able to check progress without emailing you. A portal that shows current project status, any files awaiting their attention, and upcoming milestones answers most status questions before they are asked.</p>
<blockquote>
<p>When clients have a place to look, they stop asking. The portal becomes their source of truth rather than you.</p>
</blockquote>
<h2>The right kind of status call</h2>
<p>Not all status calls are avoidable or bad. There are two good reasons to get on a call:</p>
<ul>
  <li>To make a decision that requires back-and-forth</li>
  <li>To strengthen the relationship beyond the transactional</li>
</ul>
<p>A weekly "just checking in" call is neither of these. A focused call to choose between two design directions is the first. A quarterly check-in to discuss upcoming projects is the second.</p>
<h2>How to transition clients away from check-in calls</h2>
<p>If you have clients who rely on regular calls for updates, the transition is simple: give them their portal link, show them where to find their project status, and explain that the portal will always have the latest information.</p>
<p>Most clients will adapt immediately. Some will appreciate the change more than you expect — they were calling because they had no other option, not because they wanted to.</p>',
  ARRAY['Freelance workflows', 'Client management'],
  'published',
  '2026-05-02 09:00:00+00',
  6,
  'PortalKit Team',
  'How freelancers can track project progress without status calls',
  'Status calls are a symptom of missing visibility. Here is how to give clients the transparency they need so they stop asking.'
),

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. Agency scaling
-- ──────────────────────────────────────────────────────────────────────────────
(
  'scaling-freelance-to-agency-systems',
  'From solo freelancer to small agency: the systems you need before you hire',
  'Hiring your first contractor or employee without systems in place is one of the fastest ways to create chaos. Here is what needs to be in place first.',
  '<h2>The scaling trap</h2>
<p>Many freelancers scale by doing more work before they have the systems to support it. They hire help, hand off work, and then discover that everything they did intuitively — the client communication, the file handoffs, the invoicing — is not written down anywhere and does not work when someone else is doing it.</p>
<p>The result: more revenue, more chaos, and a business that depends entirely on you being present to hold it together.</p>
<h2>What systems you actually need</h2>
<h3>1. A consistent client experience system</h3>
<p>Before anyone else works with your clients, you need to define what the client experience looks like. How are new clients onboarded? Where do files live? How are approvals collected? What does a project handoff from you to a team member look like?</p>
<p>If the answer to any of these is "I email them," that is not a system. That is you doing it manually every time.</p>
<h3>2. A project status system that is not your brain</h3>
<p>When you are the only person on a project, you hold all the context. When you add even one contractor, context needs to be externalised. Where is the project at? What needs to happen next? What is the client waiting for?</p>
<p>A milestone-based project view that every team member can see and update is the minimum. Everyone working from shared, visible progress information rather than separate email threads.</p>
<h3>3. An invoicing system that does not require you</h3>
<p>When your team delivers work, invoicing should be a step in the workflow, not a separate process that only you manage. Templates, line item structures, and payment collection should be systematised so that any team member can trigger an invoice at the right moment.</p>
<h3>4. Clear delegation boundaries</h3>
<p>What can a contractor do without checking with you? What requires your approval? These boundaries need to be explicit before you give anyone client access. A contractor who overpromises or sends incorrect files "because they thought that was their job" is a client relationship problem, not just an internal one.</p>
<blockquote>
<p>The systems that let you scale are the same systems that give clients a consistent, professional experience — regardless of who is doing the work.</p>
</blockquote>
<h2>The single most important thing to standardise first</h2>
<p>Client communication. Specifically: where does communication live, and who is responsible for it?</p>
<p>If the answer is "email, and whoever gets it first handles it," you will have contradictory messages sent to clients, missed replies, and client confusion about who their point of contact is.</p>
<p>Designate a single communication channel per client. Make it visible to the whole team. Every message in or out goes through that channel, not individual inboxes.</p>
<h2>The good news</h2>
<p>You do not need to build custom software or spend months writing process documentation. The systems that work for a solo freelancer with good tooling are largely the same systems that work for a three-person team. The key is getting the tooling right while you are still small, before the chaos makes it hard to change.</p>',
  ARRAY['Agency scaling', 'Freelance workflows'],
  'published',
  '2026-05-20 09:00:00+00',
  7,
  'PortalKit Team',
  'Systems every freelancer needs before scaling to an agency',
  'Hiring before you have systems creates chaos. Here is what needs to be in place before you bring on your first contractor or employee.'
);
