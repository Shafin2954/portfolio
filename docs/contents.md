# Portfolio Content v2 — Final, Drop-In Ready

Everything below is finished copy. Paste it in. New since v1: **ZATCA e-Invoicing SaaS** and **Tax Certificate Generator** added to Selected Work, reordered for impact, plus **full detail-page content for every work item** (bottom section — that's what each card redirects to).

`[NEED]` = real data only you have. Empty beats fabricated — never ship a fake number.

---

## SECTION NAMES (unchanged from v1)

| Section | Use this | Why |
|---|---|---|
| Hero | — | No heading. |
| Domains | **Domains** | Clean. |
| Projects (`#made`) | **Selected Work** | Reads senior. |
| Shelf (`#otherwise`) | **Side Quests** | "Otherwise" is cryptic to a cold client. |
| Contact (`#find`) | **Get in Touch** | No one misreads it. |

---

## 1. Hero

**Tagline:**
> **Statistician & builder.**
> I build across data, software, and craft — models that predict, tools that work, systems that ship.

**SEO description:**
> Applied statistics & data science student and working developer. I build AI tools, data pipelines, and production software — across data, code, and craft.

---

## 2. Domains

- **Builder** — `Software · Systems · Tools`
  _"I build things that ship and survive contact with real users."_
- **Analyst** — `Statistics · Data · Models`
  _"I find the signal in the noise, then make it impossible to ignore."_
- **Creative** — `Origami · Music · Design`
  _"Every constraint is just a design prompt."_

---

## 3. Selected Work

Reordered to front-load the strongest, most client-convincing work. **8 cards**; the two new ones (ZATCA, Tax Certificate) are your most commercial. Cut to the **6 CORE** if you want it tighter — drop the two `optional` cards.

A cold client scans for one thing: *can this person solve my problem and finish.* Every card answers that.

---

### Card 1 — Fixeth · **CORE** · flagship
**Tags:** Next.js · Supabase · pgvector RAG · n8n · Whisper · Claude
**Hook:** _An AI tutor that speaks Bengali first._

A full AI-native learning platform built for Bangladeshi students in their own language. It transcribes educational video with Whisper, embeds it into a pgvector knowledge base, and uses retrieval-augmented Claude to answer questions and adapt to each learner. Built end to end — frontend, database, automation, and the AI layer. Active flagship for THE INFINITY AI BUILDFEST 2026.

**Visual:** product screenshot or 15s demo clip.

---

### Card 2 — ZATCA e-Invoicing SaaS · **CORE** · commercial · NEW
**Tags:** Flask · Python · ZATCA / Fatoora · e-Invoicing · PDF
**Hook:** _Invoicing that satisfies Saudi tax law — automatically._

A SaaS for Saudi Arabia that generates and prints **ZATCA-compliant invoices** and automates the invoicing workflow. Saudi mandates a strict e-invoicing format — required tax fields, QR, structured output — and non-compliance carries penalties. This handles the compliance so the business doesn't have to. Built on a Flask backend.

**Metric:** `[NEED]` — invoices processed / businesses served / hours saved per month. Most convincing card for Gulf clients; a number here matters.
**Visual:** a compliant invoice (with QR) or the dashboard.

---

### Card 3 — Bangladesh Tax Certificate Generator · **CORE** · the deep one · NEW
**Tags:** Odoo 18 · Python · QWeb · XML · NBR tax logic
**Hook:** _Every employee's income-tax certificate, computed from scratch._

A custom Odoo module that encodes Bangladesh's salary income-tax rules end to end — income heads, the income-slab brackets and their tax percentages, challan records (each linked to the official government verification page), a monthly XML intake for all employees' data, and per-employee certificate printing. No off-the-shelf logic existed; I wrote the slab math and challan-linking myself.

**Metric:** `[NEED]` — employees covered / time saved per tax cycle.
**Visual:** a generated certificate (sanitized) + the challan-link detail.

---

### Card 4 — Heart Disease Prediction · **CORE** · the hard number
**Tags:** CatBoost · LightGBM · XGBoost · Ensembling · Python
**Hook:** _0.954 ROC-AUC. Top 15%._

A competition-grade pipeline for Kaggle Playground S6E2: gradient-boosted ensembles (CatBoost, LightGBM, XGBoost) with pseudo-labeling and rank-blend stacking, pushing past 0.954 ROC-AUC — top 15%. Heavy feature engineering and disciplined validation, not luck.

**Visual:** leaderboard screenshot / feature-importance chart.

---

### Card 5 — DU Bus Route Viewer · **CORE** · shipped web app
**Tags:** Next.js · Leaflet · OSRM · Supabase
**Hook:** _Every campus bus route, mapped to the road._

A web app that renders Dhaka University's bus routes as road-accurate polylines — routing real streets through OSRM instead of straight lines — with corrections stored in Supabase and a manual correction workflow for fixing the map where data falls short.

**Visual:** live map screenshot or scroll-through clip.

---

### Card 6 — Secondary Currency for Odoo 18 · **CORE** · paid client work
**Tags:** Odoo 18 · Python · XML · Proxmox · WireGuard
**Hook:** _Real client. Real deployment. Two currencies, one inventory._

A custom Odoo module for a Myanmar export client that tracks inventory value in a second currency (MMK) alongside the company default — live across stock moves and reports. Built, tested, and deployed to production over a WireGuard VPN on a Proxmox LXC container.

**Metric:** `[NEED]` — e.g. hours/month of manual reconciliation removed.
**Visual:** screen recording of the dual-currency flow, or a clean diagram.

---

### Card 7 — cppConomy · optional · differentiator
**Tags:** C++ · Agent-based modeling · Numerical methods
**Hook:** _I simulated a market from first principles._

An agent-based microeconomic simulation in C++: Cobb-Douglas and CES production, Walrasian tâtonnement to solve for equilibrium prices, consumer-surplus tracking — behind a clean, styled CLI.

**Visual:** terminal recording / equilibrium plot.

---

### Card 8 — HealthMax · optional · range + impact
**Tags:** AI · NLP · Healthcare · Bangla
**Hook:** _AI triage for health workers who don't speak English._

A Bangla-language AI triage assistant for rural community health workers in Bangladesh, built at the Harvard HSIL Hackathon. It reads plain-language symptom descriptions and helps frontline workers prioritize care.

**Visual:** demo screenshot or hackathon photo.

---

**Curation notes:**
- **Tightest 6 (recommended):** Cards 1–6. Drops cppConomy + HealthMax.
- **Odoo-heavy on purpose:** Cards 3 + 6 + the ZATCA compliance flavor lean ERP/compliance — that's your highest-earning skill, so the weighting is correct for freelance conversion. Card 1 (AI) and Card 4 (data) keep the range visible.
- **Bench, ready to slot:** AgriBase (time-series flavor — promote only if you drop HealthMax), Baymax voice model, local file-organizer agent, robotics video.
- **Stay cut:** the "I built this scroll navigation" meta-card — the site itself proves the frontend; mention it in the colophon if you target pure-frontend gigs.

---

## 4. Side Quests (shelf)

- **Speedcubing** — _"Sub-30 second solves. Pattern recognition, drilled since school."_
- **Violin** — _"Classical training, folk instinct."_ `[optional: add years]`
- **Origami** — _"I fold Satoshi Kamiya's hardest models — and design my own."_
- **Chess** — _"Endgames first. Openings are overrated."_
- **Ambigram design** — _"Words that read the same upside down. Typography as a puzzle."_

Swap the 5th for _Competitive programming — "algorithms for sport"_ if you'd rather signal CS over art here. SVG note stands: one stroke style across the line art.

---

## 5. Get in Touch

**Headline:**
> I'm open to freelance projects and collaborations. If you're building something, let's talk.

Alternates: _"If something here caught your attention, I'd like to hear what you're building."_ · _"Good problems welcome — data, software, or otherwise."_

**CTA:** add a 4th link — **Résumé (PDF)**. On Upwork/Fiverr/LinkedIn, a one-click résumé converts.

---

---

# 6. Detailed Work Pages

Full content for the page each card redirects to. Same template throughout: **hook → stack → the problem → what I built → the hard part → outcome → visual.** Fill every `[NEED]`.

---

## ▸ Fixeth
**An AI tutor that speaks Bengali first.**
**Stack:** Next.js · Supabase · pgvector · n8n · Whisper · Claude

**The problem.** Bangladeshi students learn in Bengali, but the best AI learning tools are English-first and fail them — answers in the wrong language, no local context. Quality, adaptive tutoring in Bengali barely exists.

**What I built.** A full AI-native learning platform, end to end. Educational video is transcribed with Whisper, chunked, and embedded into a pgvector knowledge base. A retrieval-augmented Claude layer answers student questions grounded in that material and adapts to the learner. n8n orchestrates the batch ingestion pipeline; Next.js drives the frontend; Supabase handles data and auth. I built every layer myself — UI, database, automation, and the AI.

**The hard part.** Making RAG actually work *Bengali-first* — retrieval quality, chunking, and answer grounding in a lower-resource language — plus a reliable video→transcript→embedding pipeline that runs unattended.

**Outcome.** Flagship project for THE INFINITY AI BUILDFEST 2026 EdTech Track. `[NEED: status — finalist / users / demo link]`

**Visual.** Product screenshot or a 15-second demo clip.

---

## ▸ ZATCA e-Invoicing SaaS
**Invoicing that satisfies Saudi tax law — automatically.**
**Stack:** Flask · Python · ZATCA / Fatoora e-invoicing · PDF generation · `[NEED: QR / XML-UBL / ZATCA API — confirm what yours does]`

**The problem.** Saudi Arabia mandates ZATCA-compliant e-invoicing. Every invoice must follow a strict structure — required tax fields, VAT handling, a compliant QR code, correct numbering — and getting it wrong means failed validation and penalties. Smaller businesses have no easy tooling for this.

**What I built.** A Flask-based SaaS that generates and prints ZATCA-compliant invoices and automates the invoicing workflow — producing correctly structured, print-ready tax invoices so the business stays compliant without manual effort. `[NEED: name the specifics you implemented — QR/TLV encoding, UBL XML, reporting/clearance integration, batch printing. List only what's真 true.]`

**The hard part.** Encoding a government compliance spec exactly. Regulatory output is unforgiving — fields, formats, and the QR have to match the standard or the invoice is rejected. Most of the work was correctness, not features.

**Outcome.** `[NEED: invoices processed / businesses served / time saved.]`

**Visual.** A compliant invoice showing the QR, or the SaaS dashboard.

> ⚠️ If this was client/work-for-hire, showcase it as a case study (sanitized) — don't publish the client's code or resell it. Your expertise is yours to market regardless.

---

## ▸ Bangladesh Tax Certificate Generator
**Every employee's income-tax certificate, computed from scratch.**
**Stack:** Odoo 18 · Python · QWeb (PDF) · XML · NBR salary-tax rules

**The problem.** Bangladeshi employers must compute each employee's salary income tax and issue tax certificates — across income heads, the NBR's income-slab brackets, and challan tracking. By hand, across a whole payroll, it's slow and error-prone, and there's no ready Odoo module for it.

**What I built.** A custom Odoo module that encodes the full logic myself:
- **Income heads / slots** and the **income-slab brackets** with their tax percentages — the slab/marginal math written from scratch.
- **Challan records**, each linked to the **official government challan-verification page**, so every payment is independently verifiable.
- A **monthly XML intake** that loads all employees' salary and tax data.
- **Per-employee certificate printing** via QWeb — data in → computed tax → verifiable challans → printed certificate.

**The hard part.** No off-the-shelf logic exists for this. I wrote the bracket computation and challan-linking to match NBR rules, and got the math right per employee — the part I'm proudest of.

**Outcome.** `[NEED: employees covered / company / time saved per cycle.]`

**Visual.** A generated certificate (sanitized), the challan-verification links, and the XML intake flow.

> ⚠️ Same caveat as ZATCA: showcase freely, but to *sell* this as a product, build a clean-room version if the original was client-owned.

---

## ▸ Heart Disease Prediction
**0.954 ROC-AUC. Top 15%.**
**Stack:** CatBoost · LightGBM · XGBoost · pseudo-labeling · rank-blend stacking · Python

**The problem.** Kaggle Playground S6E2: predict heart disease, ranked on ROC-AUC. At the top of the board, every thousandth of an AUC point is a fight.

**What I built.** A gradient-boosted ensemble — CatBoost, LightGBM, XGBoost — combined with pseudo-labeling and rank-blend stacking, on top of heavy feature engineering and a disciplined cross-validation setup that kept the leaderboard honest.

**The hard part.** Squeezing marginal AUC out of blending and pseudo-labels *without* leaking — the discipline to trust clean validation over a flattering public score.

**Outcome.** 0.954+ ROC-AUC, top 15% of the leaderboard.

**Visual.** Leaderboard screenshot, feature-importance chart, or prediction-vs-actual plot.

---

## ▸ DU Bus Route Viewer
**Every campus bus route, mapped to the road.**
**Stack:** Next.js · Leaflet · OSRM · Supabase

**The problem.** Dhaka University students need to see bus routes accurately. Straight-line maps between stops are wrong — they ignore the actual roads buses drive.

**What I built.** A web app rendering each route as a road-accurate polyline by routing through OSRM, with route data and corrections stored in Supabase. Because real-world map data is imperfect, I added a manual correction workflow (via geojson.io) to fix routes where the automatic path falls short.

**The hard part.** Snapping routes to real roads reliably, and building a correction loop so bad data could be fixed without a redeploy.

**Outcome.** `[NEED: routes mapped / users, if any.]`

**Visual.** Live map screenshot or a short scroll-through clip.

---

## ▸ Secondary Currency for Odoo 18
**Real client. Real deployment. Two currencies, one inventory.**
**Stack:** Odoo 18 · Python · XML · Proxmox · WireGuard

**The problem.** A Myanmar export client needed inventory valued in a second currency (MMK) alongside the company default — kept consistent across stock moves and reporting, not bolted on after the fact.

**What I built.** A custom Odoo module that computes and displays the secondary currency across stock moves, valuation, and reports. I built, tested, and deployed it to the client's production system over a WireGuard VPN into a Proxmox LXC container.

**The hard part.** Hooking cleanly into Odoo's stock-move and valuation layer so the second currency stayed correct everywhere — and doing a safe remote production deployment.

**Outcome.** `[NEED: hours/month of manual reconciliation removed, or stock moves tracked across both currencies.]`

**Visual.** Screen recording of the dual-currency flow, or a clean architecture diagram.

---

## ▸ cppConomy *(optional)*
**I simulated a market from first principles.**
**Stack:** C++ · agent-based modeling · numerical methods

**The problem.** Markets are taught with curves and equations. I wanted to understand equilibrium by *building* one — agents, goods, and prices that settle on their own.

**What I built.** An agent-based microeconomic simulation in C++: Cobb-Douglas and CES production functions, Walrasian tâtonnement to iterate toward equilibrium prices, and consumer-surplus tracking — all behind a clean, styled command-line interface.

**The hard part.** Getting tâtonnement to converge stably, and modeling agents whose interactions actually produce sensible equilibria.

**Outcome.** A working market simulator. `[NEED: repo link.]`

**Visual.** Terminal recording or an equilibrium-convergence plot.

---

## ▸ HealthMax *(optional)*
**AI triage for health workers who don't speak English.**
**Stack:** AI · NLP · Bangla · Healthcare

**The problem.** Rural community health workers in Bangladesh are the front line of care, but English-only triage tools are useless to them.

**What I built.** A Bangla-language AI triage assistant, built at the Harvard HSIL Hackathon, that reads plain-language symptom descriptions and helps frontline workers prioritize care — closing the gap where English-first tools fail.

**The hard part.** Bangla symptom understanding and triage logic that's safe and useful in a low-resource, high-stakes setting.

**Outcome.** `[NEED: hackathon result / demo link.]`

**Visual.** Demo screenshot or a hackathon photo.

---

## Assets you still need (the only thing left)
- **Visuals** for: Fixeth, ZATCA invoice (with QR), Tax Certificate (sanitized) + challan links, Heart Disease (leaderboard/chart), DU Bus (map), Secondary Currency (flow/diagram), cppConomy, HealthMax
- A handful of **metrics** — every `[NEED: ... ]` above
- Matched domain illustration set (one stroke weight, monochrome)
- Custom domain
- **Résumé PDF**

---
_v2 · ZATCA + Tax Certificate added · detail pages complete · drop-in ready_