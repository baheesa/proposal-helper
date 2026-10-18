// Starter playbook built from the proposals in the user's own document.
window.PA_GEMINI_KEY = ""; // ← paste your Gemini API key here between the quotes
window.PA_SEED = (function () {
  const RULES = `PROPOSAL FORMULA (use this order)
1. Hook: the first line. 4 to 10 words. A bold statement about the risk or hidden opportunity in his situation. Curious or a little uneasy, never rude. "(with respect)" is fine when it is blunt. If the job post says the proposal must start with a certain word, start the hook with that word.
2. Greeting: "Hi {first name}," then say I saw his job post and restate his need in his own words. "Hi there" when there is no name.
3. Insider line (only if true): one sentence that shows I have done this before. Use only my profile and samples.
4. What I noticed: one or two specific things about his site or profile (from the audit or my notes), or one sharp insight about his situation.
5. Questions: 2 or 3, numbered, easy to answer, that qualify him (website age, what Search Console shows, where he ranks now, access, documents).
6. Close: one short casual line inviting a quick discussion.
7. Sign-off: a short role title tied to the hook (GBP Expert, Gem Finder, Your Optimizer), then my name.
8. P.S.: one line that backs up the hook with a fact or a consequence.

STYLE
- 70 to 130 words in total. Plain words, short lines, a little attitude.
- Never invent numbers like "3 times more calls" or "50% more traffic". Use a number only if it was measured on his site or I can name the source.
- Never say a report or sample is attached unless my profile lists one.
- Answer anything the job post asks for: price, timeline, examples, a starting word.
- Never promise rankings, reinstatement or review removal.
- No filler: "I am excited", "I came across", "I would love to", "message me right now".`;

  const AVOID = `- Invented statistics in the P.S. or the body (3 times more calls, 5 to 9% more revenue, 50% more traffic, 7 times more clicks).
- Sign-offs that are just a number ("Your 7 times more", "Your at least 50%").
- Saying "report attached" or "I worked on a similar project" with nothing to show.
- Pushy closes like "message me right now".
- Half-written or copy-pasted lines, typos, and the same P.S. on different jobs.
- Generic openers that could fit any job.`;

  const SIGNOFFS = "GBP Expert, Your Local Scientist, Your Optimizer, Gem Finder, Your Customer Magnet, Your Authority Maintainer, Your Auditor, Your SEO Scientist";

  const C = (name, fears, angle, hooks, questions, reqs, flags) => ({ name, fears, angle, hooks, questions, reqs, flags });
  const CATS = [
    C("GBP setup (new profile)", "Getting suspended. Doing it wrong and starting over. Not knowing what documents are needed.", "Safe, legitimate verification. The profile must match the real world: name, address, phone, signage, website.", "Your Google business profile will get suspended.\nA rushed profile ends with no profile.", "Do you have a website? How old is it?\nDo you have photos of your shop, work and services?\nDo you have a business registration or licence and signage under the same name and address?", ["Business name, address and phone exactly as registered", "Website link and its age", "Storefront or service-area business", "Registration or licence", "Photos of the premises and work", "Services, hours, areas covered", "Verification method he can receive (video, phone, email, postcard)"], "No website or storefront. Wants a fake or virtual address. Wants instant verification."),
    C("GBP verification and suspension", "Losing calls every day. Being scammed again. A permanent ban.", "Calm and urgent. Find the likely cause, give the steps, say what I need today. Never guarantee reinstatement.", "Doubting Google will never make reverification successful.\nEvery failed attempt makes the next one harder.", "What was the most important reason you faced in reverification?\nWhen was it suspended and what notice did you get?\nWhat changed before it happened (address, name, category, website)?", ["Profile link", "Suspension date and notice text", "What changed before the suspension", "Documents available (licence, utility bill, premises photos, signage)", "Address type (storefront, home, virtual office)", "Past appeals and outcomes", "Website matches name, address and phone"], "Address is a PO box or virtual office. Asks for a guarantee. Many failed attempts already."),
    C("GBP optimization and management", "Doing something that gets the listing suspended. Paying and seeing no calls.", "Policy-safe process, clear list of what I will fix, a fast first win. Wrong category and half-managed profiles are the usual cause.", "Your profile is working half as hard as it could.\nA half-managed profile is worse than a quiet one.", "Do you already have a list of primary local keywords you want to rank for?\nWhat is most challenging, the profile or the website?\nWhere does the profile show up now for your main service?", ["Profile link", "Access level (owner, manager, none)", "Target keywords and cities", "Competitors he watches", "Services and categories now", "One-time or monthly", "Reporting he expects (calls, direction requests, website clicks)"], "Wants rankings guaranteed. Wants fake reviews or keyword-stuffed names."),
    C("Review management and removal", "Fake or unfair reviews staying up. Breaking platform rules. A bad reply making it worse.", "Policy-safe approach. Ask the customer to update after the issue is solved, report real violations, reply well, earn genuine reviews. Never fake reviews.", "Regain the trust the reviews have ruined.\nOne unanswered review costs more than you think.", "What type of reviews need to go? Are they about your service or do they look like spam?\nIs the reviewer a real customer?\nHow many reviews and what rating do you have now?", ["Platforms and profile links", "Current rating and review count", "The problem: negative, fake, too few, no replies", "Real customer or suspected spam", "Brand voice for replies", "Access or approval flow for replies", "One-time clean-up or ongoing"], "Wants every negative review removed. Wants fake reviews written."),
    C("Local SEO audit and strategy (GBP + website)", "Paying for a generic report. Being upsold afterwards. Not knowing what to fix first.", "Show I already looked at his site and profile. Name one or two real findings. Promise a prioritized fix list.", "Optimization will take your ranking down, with respect.\nYour audit should start with what is holding you back, not what to add.", "What is most challenging, the profile or the website?\nWhere are you ranking now on Google?\nDo you have Search Console and GA4 access?", ["Website and profile links", "Main service and city or service area", "Competitors he knows", "Goal: calls, leads or rankings", "Whether rankings or calls dropped, and when", "Access he can give", "Report format and deadline", "Paid trial or long-term"], "Wants a long audit for a very small budget. Wants free sample work."),
    C("Technical and on-page SEO", "Paying for fixes that change nothing. Breaking the site. Losing current traffic.", "Use measured observations from the audit (load time, missing meta tags, headings, structure). Explain the cause in one line.", "Your website misses what Google wants.\nYour pages are speaking, but not to Google.", "What is your target audience? How old is the website?\nWhat does Search Console show, if you remember?\nWhich platform is the site on?", ["Website link and platform", "Admin access or developer contact", "Search Console and Analytics access", "Pages that matter most", "Implementation or recommendations only", "Report format", "One-time or ongoing"], "Wants the work done in 24 hours. Wants advanced development work."),
    C("Keyword research", "Targeting keywords that bring the wrong visitors. Getting a raw list with no direction.", "Customer-focused, location-based keywords grouped by page and priority, with Search Console data when available.", "Don't leave your golden keywords.\nThe right keywords are already hiding in your own data.", "How old is your website?\nIs your Search Console data available?\nWhich services and cities matter most?", ["Website link and platform", "Services and cities", "Search Console access", "Competitors", "Tools and spreadsheet format he wants", "Pages to map keywords to"], "Wants thousands of keywords for a tiny budget."),
    C("Search Console and indexing", "Not appearing on Google at all. Not knowing what is wrong. Wasted months.", "Find out why pages are not indexed: robots.txt, noindex, canonicals, sitemap. Show the cause, then the fix.", "Your console data has hidden gems in it.\nGoogle may not even know your site exists.", "How old is your website?\nWhat page of Google is it ranking on now?\nWhat does Search Console say about indexing?", ["Website link and age", "Search Console access", "Sitemap status", "robots.txt and noindex settings", "Recent site changes or migration", "Target countries and keywords"], "Wants first-page rankings overnight."),
    C("Citations and NAP cleanup", "Wrong information spread across directories. Junk directories. No proof of work.", "Manual work only, exact name, address and phone matching the profile, with a spreadsheet of every listing checked.", "You need a sharp eye, not an expert (with respect).\nOne wrong digit in your phone number can cost you calls.", "What are the exact name, address and phone to use?\nDo you know of old addresses or names still online?\nWhich listings do you already control?", ["Exact name, address, phone and website", "Old names, addresses or phones", "Known problem listings", "Directories he wants covered", "Spreadsheet columns he wants", "Access or claim status", "Instructions about the Google profile (touch it or not)"], "Wants automated bulk submissions. Wants me to touch the profile when he said not to."),
    C("Duplicate or unauthorized listings", "Losing calls to a duplicate. Ownership disputes. A competitor or ex-employee controlling a listing.", "Explain the legitimate process: Google's reporting and ownership tools, with proof of the business. No guarantees, no tricks.", "A duplicate listing is stealing your calls.\nTwo profiles for one business means neither ranks.", "Which profile is the real one and who controls it?\nCan you share the links of the duplicates?\nDo you have proof of the business (licence, signage, utility bill)?", ["Links to every duplicate", "Which profile is the real one", "Who has owner access", "Proof of business", "Number of locations", "Timeline"], "Wants removal without owner access. Wants a free test case. Heavy speed pressure."),
    C("Local website and service-area pages", "Pages that never rank. Thin copy. Looking the same as every competitor.", "A plan for specific service and location pages, how I check the competition, and what I need from him.", "Your service pages are not answering where your customers live.\nOne page for every city is how you get ignored.", "Which services and cities matter most?\nWhat platform is the site on?\nWho supplies photos and facts about the work?", ["Website link and platform", "Services and cities", "Pages that exist now", "Competitors and keywords", "Who writes the content", "Access", "One-time or monthly"], "Wants hundreds of near-duplicate city pages."),
    C("AI search (AEO and GEO)", "Being invisible in ChatGPT and AI answers. Hype with no plan.", "Be honest: fundamentals come first (clear business facts, citations, reviews, schema, useful pages). Show what I can check and what nobody can promise.", "AI cannot recommend a business it cannot find.\nAI answers read the same facts Google does.", "Do you already show up on Google for your main service?\nWhich AI tools do your customers use?\nWhat does your site say about who you are and where you work?", ["Website link", "Main services and locations", "Competitors", "Current rankings", "Reporting he expects", "Budget"], "Wants guaranteed placement in AI answers."),
    C("Link building and white label", "Spammy links that hurt the site. Low-quality directories. No reports.", "Quality local links only, clear scope, a report he can show his own client. State what I do not do.", "Cheap links are the fastest way to lose rankings.\nA bad link costs more than no link.", "Which niche and which cities?\nWhat links do the clients have now?\nWhat does the monthly report need to show?", ["Niche and locations", "Existing links", "Number of clients", "Report format and branding", "Budget per client", "Tools he uses"], "Very low pay. Wants guaranteed rankings or PBN links."),
    C("Content and AdSense review", "Another rejection. Paying for fixes that do not help.", "Review content depth, trust pages, topic coverage and traffic. Say what can and cannot be fixed.", "Your content may be good and still look empty to Google.\nLow value usually means low depth, not low effort.", "How many posts are live and what do they cover?\nDo you have Privacy Policy, About and Contact pages?\nHow many clicks does Search Console show?", ["Site link and platform", "Number of posts", "Trust pages", "Search Console data", "Rejection email text", "Rewrite included or review only"], "Wants approval guaranteed. Wants policy-violating methods."),
  ].map((c, i) => ({ id: "seed" + i, ...c }));

  const E = (cat, job, text) => ({ id: "ex" + Math.random().toString(36).slice(2, 8), cat, job, text, seed: true, created: 0 });
  const EXAMPLES = [
    E("GBP setup (new profile)", "Google Business Profile setup for a loan agency in the United States. Only has the website. Vendor handles everything else.", `Your Google business profile will get suspended.

Hi there, saw your job post for a specialist to create a complete Google business profile with care. I think I might be a good match.

Your registered business name, address and phone number are the mandatory information. Your website will give the other details such as services, hours and areas covered. But the business has to look real and checkable, otherwise the profile can get suspended.

Do you have photos of your shop, work and services?

GBP Expert
Baheesa Fatima

P.S: A non serious creation of a profile can lead to suspension later and difficult verifications.`),
    E("GBP optimization and management", "Eyewear shop in AlKhobar, KSA. Has a Google Maps listing but no traffic or reviews. Wants visibility, reviews and sales.", `Your profile might get suspended.

Hi there, saw your job post for a person to grow your business profile and website traffic online. Your Google business profile doesn't connect to customers, and even the address looks suspicious.

Do you have a Saudi business registration or licence and storefront signage under the same business name and address?

Your Customer Magnet
Baheesa Fatima

P.S: I make your Google business profile and website work as magnets for customers.`),
    E("Citations and NAP cleanup", "One-time local citation audit in a Google Sheet: directories, current status, NAP issues, recommended action.", `You need a sharp eye, not an expert (with respect).

Hi there, I saw your job post for a citation audit. I have the sharp researcher's eye that experts often neglect when a project becomes just another task instead of a mission. I think we might be a good match.

I can deliver a clear audit report covering current citations, inconsistencies and potential citation sites.

Your Auditor
Baheesa Fatima`),
    E("Local SEO audit and strategy (GBP + website)", "Dental WordPress website in New York City. GBP, local keywords, on-page, service pages, citations, internal linking.", `Optimization will take your ranking down, with respect.

Hi Alamin, saw your job post for a Local SEO expert for your dental WordPress website and GBP. I have read all the optimization, local and technical details and I think we might be a good match. I have a couple of questions to clarify.

1. What's most challenging, the GBP or the website?
2. Where are you ranking now on Google?

Your only Local Scientist
Baheesa Fatima

P.S: Wrong keywords and bad citations hurt rankings.`),
    E("Keyword research", "Local keyword research for a cleaning service Webflow website: priority, target pages, service plus location terms.", `Don't leave your golden keywords.

Hi Shah Alam, saw your job post to design a high intent, location focused keyword strategy for your cleaning service website. I think we might be a good match. I've read all the tools, keyword types and opportunities you listed, and I have a couple of questions.

1. How old is your website?
2. Is your Search Console data available?

These answers will help me dig out customer focused keywords.

Best,
Baheesa Fatima

P.S: Console data is a gold mine for reaching potential customers through search.`),
    E("Search Console and indexing", "Part-time Google Search Console support: review performance, find issues, fix indexing.", `Your console data has hidden gems in it.

Hi Ravi, saw your job post to increase website visibility using Google Search Console data. I have a couple of questions before we talk about how much optimization will help.

1. How old is your website?
2. What Google page is it ranking on now?

Gem Finder
Baheesa Fatima

P.S: A thorough analysis usually brings low hanging fruit (gems) that lift rankings when focused.`),
    E("GBP verification and suspension", "New website a year ago, location change after 13 years, repeated failed attempts to get re-verified by Google.", `Doubting Google will never make reverification successful.

Hi there, saw your job post for a specialist to help with reverification of your Google business profile. I think I might be a good match.

Could you tell me the most important reason you faced in reverification? It will help me build a similar strategy to get verified.

GBP Expert
Baheesa Fatima

P.S: A non serious verification attempt can end with no profile at all.`),
    E("GBP setup (new profile)", "Create and optimize a new Google Business Profile for a plumbing WordPress website. NAP consistency, services, verification.", `Your Google business profile will get suspended.

Hi there, saw your job post for a specialist to create and optimize a complete Google business profile with care. I think I might be a good match. To verify a profile properly, I follow safe and legitimate ways. A bad or non serious profile creation can lead to no results.

Do you have a website? If so, how old is it?

GBP Expert
Baheesa Fatima

P.S: A non serious creation of a profile can lead to suspension later and difficult verifications.`),
    E("Review management and removal", "Help with removal of wrong reviews on a Google account.", `Regain the trust the reviews have ruined.

Hi there, saw your job post for wrong reviews removal. I build and maintain authority.

Can you tell me the type of reviews to be removed? Are they about your service or do they look like spam?

Your Authority Maintainer
Baheesa Fatima`),
    E("Search Console and indexing", "One-time SEO audit for a rice export company in Vietnam whose website does not appear on Google. Wants indexing, robots.txt, noindex, canonical, titles fixed and a report. Asked for cost, timeline and examples.", `Your website misses what Google wants....

Hey Jay, you need to audit and optimize the website. I just went through it and it loads like a wooden wheel. It takes at least 3.6 seconds to load. The meta tags, headings, structure, AI optimization and keyword focus are missing.

Without proper keywords, Google doesn't know what to rank the site for.

Before I move forward, I have a few questions:
1. What's your target audience? How old is the website?
2. What's showing up in Search Console, if you remember?

Let's have a quick discussion.

Your Optimizer
Baheesa Fatima`),
    E("Technical and on-page SEO", "SEO consultant wanted to rank the site number 1 and get more leads: audits, keywords, on-page, technical, local, links, monthly reporting.", `Wrong SEO will enter you in a race you never wanted to be.

Hey there, saw your job post for an SEO consultant to rank you no. 1.

With no keyword focus, rankings stay stuck and Google is confused about what to rank you for. Customers never stay on websites that perform like a wooden wheel, and AI can't recommend a business it can't find.

A proper strategy, from audit and keyword focus to fixes, solves the rankings and brings the customers.

Before we move forward, I have a few questions:
1. What's your target audience? How old is the business?
2. Where does Search Console rank you so far?

Let's have a quick discussion.

Your Optimizer
Baheesa Fatima

P.S. SEO is a race and it matters far more to enter it with the right keywords.`),
  ];

  return { v: 2, rules: RULES, avoid: AVOID, signoffs: SIGNOFFS, categories: CATS, examples: EXAMPLES, name: "Baheesa Fatima" };
})();
