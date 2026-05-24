# Portfolio Design Plan — Shafin Ahmed
**Theme:** Warm minimal · generalist · light (cream)

---

## Color Palette

| Variable | Hex | Use |
|---|---|---|
| `--cream` | `#F5F0E8` | Page background |
| `--paper` | `#EDE8DC` | Card / section alt bg |
| `--ink` | `#1C1A16` | All text, bars |
| `--rust` | `#C4600A` | Single accent — links, tags, dots |
| `--brown` | `#8B7355` | Secondary text, sublabels |
| `--muted` | `#A09888` | Tertiary text, descriptions |
| `--stroke` | `#D4C9B5` | Borders, dashed lines, shelf |

---

## Typography

- **Display / headings:** Cormorant Garamond (Google Fonts) — weight 300 for large, 600 for section labels
- **Body:** DM Sans (Google Fonts) — weight 300/400
- **Labels / tags / mono detail:** JetBrains Mono — weight 400, color `--rust` only

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400&family=JetBrains+Mono&display=swap');

:root {
  --cream: #F5F0E8;
  --paper: #EDE8DC;
  --ink: #1C1A16;
  --rust: #C4600A;
  --brown: #8B7355;
  --muted: #A09888;
  --stroke: #D4C9B5;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Type scale:
- h1 name: `font-size: clamp(3rem, 8vw, 6rem)`, weight 300
- Section heading: `font-size: 1rem`, weight 600, letter-spacing 0.05em
- Body: `font-size: 0.875rem`, weight 300, line-height 1.75
- Tags/labels: `font-size: 0.7rem`, mono, color `--rust`

---

## Global Layout

```
html, body { height: 100%; margin: 0; background: var(--cream); color: var(--ink); }

.page-wrapper {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.section {
  scroll-snap-align: start;
  min-height: 100vh;
  width: 100%;
}
```

### Navigation — right-side dot index (fixed)
```html
<nav class="dot-nav">
  <a href="#index"     class="dot" data-label="Index"></a>
  <a href="#domains"   class="dot" data-label="Domains"></a>
  <a href="#made"      class="dot" data-label="Made"></a>
  <a href="#otherwise" class="dot" data-label="Otherwise"></a>
  <a href="#find"      class="dot" data-label="Find me"></a>
</nav>
```
```css
.dot-nav {
  position: fixed; right: 24px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12px;
  z-index: 100;
}
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--stroke);
  transition: background 0.3s, transform 0.3s;
  position: relative;
}
.dot.active { background: var(--rust); transform: scale(1.4); }
.dot::after {
  content: attr(data-label);
  position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%);
  font: 0.65rem var(--font-mono);
  color: var(--rust);
  white-space: nowrap;
  opacity: 0; transition: opacity 0.2s;
  pointer-events: none;
}
.dot:hover::after { opacity: 1; }
```

Activate dots via IntersectionObserver on each `.section`.

### Custom cursor
```css
* { cursor: none; }
.cursor-dot   { width:8px; height:8px; background:var(--ink); border-radius:50%; position:fixed; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition:width .2s,height .2s,background .2s; }
.cursor-ring  { width:28px; height:28px; border:1.5px solid var(--ink); border-radius:50%; position:fixed; pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:all .15s ease; background:transparent; }
/* on hoverable: cursor-ring grows, cursor-dot shrinks */
/* on links: cursor-dot background becomes var(--rust) */
```
Disable both on `@media (pointer: coarse)`.

---

## Sections

---

### 01 — Index
**Full viewport, cream background, asymmetric layout**

```html
<section class="section" id="index">
  <div class="index-layout">
    <div class="index-name">
      <h1>Shafin<br>Ahmed</h1>
    </div>
    <div class="index-illustration">
      <!-- your SVG/PNG illustration, crops at right edge -->
      <img src="./assets/illus-hero.svg" alt="illustration">
    </div>
    <p class="index-tagline">
      Statistician & builder. I work across data,<br>software, and creative systems.
    </p>
    <span class="index-scroll-hint">↓ scroll</span>
    <div class="rust-dot"></div>
  </div>
</section>
```

```css
.index-layout {
  position: relative;
  height: 100vh;
  padding: 10vh 8vw;
  overflow: hidden;
}
.index-name h1 {
  font: 300 clamp(3rem,8vw,6rem)/1 var(--font-display);
  color: var(--ink);
  margin: 0;
  /* Entry animation */
  animation: slideInLeft 0.8s ease-out both;
}
.index-illustration {
  position: absolute;
  top: 8vh; right: 0;
  width: clamp(180px, 22vw, 320px);
  /* crops at edge intentionally — no border, no box */
  animation: fadeIn 0.8s 0.4s ease-out both;
}
.index-illustration img { width: 100%; }
.index-tagline {
  position: absolute;
  bottom: 10vh; left: 8vw;
  font: 300 0.85rem/1.75 var(--font-body);
  color: var(--brown);
  max-width: 320px;
}
.rust-dot {
  position: absolute;
  bottom: calc(10vh + 28px);
  left: calc(8vw + 300px);
  width: 7px; height: 7px;
  background: var(--rust);
  border-radius: 50%;
}
.index-scroll-hint {
  position: absolute;
  bottom: 10vh; right: 8vw;
  font: 0.65rem var(--font-mono);
  color: var(--muted);
  /* fades out after first scroll — remove class via JS */
  transition: opacity 0.4s;
}

@keyframes slideInLeft {
  from { transform: translateX(-40px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

### 02 — Domains (HORIZONTAL SURPRISE)
**Full viewport. Vertical scroll enters it; inside, user scrolls horizontally.**

```html
<section class="section" id="domains">
  <div class="domains-track" id="domainsTrack">

    <div class="domain-panel" data-domain="builder">
      <div class="domain-bg"></div>           <!-- parallax layer 0.35x -->
      <div class="domain-illus">
        <img src="./assets/illus-builder.svg" alt="builder illustration">
      </div>                                  <!-- parallax layer 0.65x -->
      <div class="domain-slant"></div>
      <div class="domain-label">
        <h2>Builder</h2>
        <span>Software · Systems · Tools</span>
      </div>
    </div>

    <div class="domain-panel" data-domain="analyst">
      <div class="domain-bg"></div>
      <div class="domain-illus">
        <img src="./assets/illus-analyst.svg" alt="analyst illustration">
      </div>
      <div class="domain-slant"></div>
      <div class="domain-label">
        <h2>Analyst</h2>
        <span>Statistics · Data · Models</span>
      </div>
    </div>

    <div class="domain-panel" data-domain="creative">
      <div class="domain-bg"></div>
      <div class="domain-illus">
        <img src="./assets/illus-creative.svg" alt="creative illustration">
      </div>
      <!-- no slant on last panel -->
      <div class="domain-label">
        <h2>Creative</h2>
        <span>Origami · Music · Design</span>
      </div>
    </div>

  </div>
</section>
```

```css
#domains {
  overflow: hidden;
  position: relative;
}
.domains-track {
  display: flex;
  width: 300vw;       /* 3 panels × 100vw */
  height: 100vh;
  will-change: transform;
}
.domain-panel {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 6vh 6vw;
}
.domain-panel[data-domain="builder"]  { background: #F0EAE0; }
.domain-panel[data-domain="analyst"]  { background: #E8E0D4; }
.domain-panel[data-domain="creative"] { background: #E0D8CC; }

/* Slanted ink divider bar */
.domain-slant {
  position: absolute;
  top: -10%; right: -2vw;
  width: 4vw; height: 120%;
  background: var(--ink);
  transform: skewX(-12deg);
  z-index: 3;
}

/* Parallax illustration */
.domain-illus {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(160px, 20vw, 280px);
  z-index: 2;
  will-change: transform;
  /* JS sets translateX for 0.65x parallax, translateY for mouse */
}
.domain-illus img { width: 100%; }

/* Background texture layer */
.domain-bg {
  position: absolute;
  inset: 0;
  /* add subtle noise texture via CSS or bg-image */
  background-image: url('./assets/noise.png');
  background-size: 200px;
  opacity: 0.04;
  z-index: 1;
  will-change: transform;
  /* JS sets translateX for 0.35x parallax */
}

/* Label */
.domain-label {
  position: relative; z-index: 4;
}
.domain-label h2 {
  font: 300 clamp(2rem, 5vw, 4rem)/1 var(--font-display);
  color: var(--ink);
  margin: 0 0 6px;
}
.domain-label span {
  font: 0.7rem var(--font-mono);
  color: var(--brown);
}
```

#### Horizontal scroll JS logic

```js
const track       = document.getElementById('domainsTrack');
const section     = document.getElementById('domains');
const panels      = track.querySelectorAll('.domain-panel');
const bgLayers    = track.querySelectorAll('.domain-bg');
const illusLayers = track.querySelectorAll('.domain-illus');
const totalScroll = (panels.length - 1) * window.innerWidth;

let hintPlayed = false;

// Entry hint — nudge right once
function playEntryHint() {
  if (hintPlayed) return;
  hintPlayed = true;
  track.style.transition = 'transform 0.15s ease-out';
  track.style.transform = 'translateX(-60px)';
  setTimeout(() => {
    track.style.transition = 'transform 0.3s ease-in-out';
    track.style.transform = 'translateX(0)';
    setTimeout(() => { track.style.transition = ''; }, 300);
  }, 150);
}

// Convert vertical wheel inside section to horizontal scroll
let currentX = 0;
section.addEventListener('wheel', (e) => {
  e.preventDefault();
  currentX = Math.max(0, Math.min(totalScroll, currentX + e.deltaY));
  applyTranslate(currentX);
}, { passive: false });

function applyTranslate(x) {
  // Main track
  track.style.transform = `translateX(-${x}px)`;
  // Parallax bg: 0.35x
  bgLayers.forEach(el => el.style.transform = `translateX(${x * 0.35}px)`);
  // Parallax illus: 0.65x
  illusLayers.forEach(el => {
    const current = el._mouseY || 0;
    el.style.transform = `translateX(${x * 0.35}px) translateY(${current}px)`;
  });
}

// Mouse Y drift on illustrations
section.addEventListener('mousemove', (e) => {
  const cy = window.innerHeight / 2;
  const drift = ((e.clientY - cy) / cy) * 8; // ±8px
  illusLayers.forEach(el => {
    el._mouseY = drift;
    el.style.transform = el.style.transform.replace(/translateY\([^)]+\)/, '') + ` translateY(${drift}px)`;
  });
});

// IntersectionObserver to trigger hint
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) playEntryHint(); });
}, { threshold: 0.5 });
obs.observe(section);
```

> **Touch / mobile:** replace wheel listener with touch start/move/end delta logic, same math.

---

### 03 — Made
**Vertical section, cream bg, 2–3 projects**

```html
<section class="section" id="made" style="background: var(--cream); padding: 12vh 10vw;">
  <p class="section-eyebrow">Made</p>

  <article class="project-card">
    <div class="project-text">
      <span class="project-meta">Inventory Module · 2025</span>
      <h3 class="project-title">Secondary Currency<br>for Odoo 18</h3>
      <p class="project-decision">
        Chose ORM patches over a custom model because the client's
        existing data structure couldn't afford a mid-deployment migration.
      </p>
      <p class="project-body">
        Tracks inventory value in BDT and USD simultaneously for a
        Bangladesh-based exporter. Deployed over WireGuard VPN, zero downtime.
      </p>
      <div class="project-tags">
        <span>Python</span><span>Odoo</span><span>PostgreSQL</span>
      </div>
    </div>
    <div class="project-image">
      <img src="./assets/screenshot-odoo.png" alt="Odoo secondary currency module screenshot">
    </div>
  </article>

  <!-- 2nd card: add margin-top: 12vh and stagger left by 4vw for asymmetry -->

</section>
```

```css
.section-eyebrow {
  font: 0.7rem var(--font-mono);
  color: var(--rust);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6vh;
}
.project-card {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 48px;
  align-items: start;
  margin-bottom: 10vh;
}
/* Stagger alternate cards */
.project-card:nth-child(even) {
  margin-left: 4vw;
  grid-template-columns: 240px 1fr;
}
.project-meta {
  font: 0.7rem var(--font-mono);
  color: var(--rust);
  display: block;
  margin-bottom: 10px;
}
.project-title {
  font: 400 clamp(1.4rem,3vw,2rem)/1.15 var(--font-display);
  color: var(--ink);
  margin: 0 0 14px;
}
.project-decision {
  font: italic 300 0.82rem/1.75 var(--font-body);
  color: var(--brown);
  margin-bottom: 10px;
}
.project-body {
  font: 300 0.8rem/1.7 var(--font-body);
  color: var(--muted);
  margin-bottom: 14px;
}
.project-tags {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.project-tags span {
  font: 0.65rem var(--font-mono);
  color: var(--rust);
  border: 0.5px solid var(--rust);
  padding: 2px 8px;
  border-radius: 2px;
}
.project-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 4px;
  border: 0.5px solid var(--stroke);
}
.project-image img { width: 100%; height: 100%; object-fit: cover; }
```

---

### 04 — Otherwise
**Shelf layout — objects at different heights on a ruled line**

```html
<section class="section" id="otherwise" style="background: var(--paper);">
  <div class="shelf-wrapper">
    <p class="section-eyebrow">Otherwise</p>
    <div class="shelf">
      <div class="shelf-line"></div>
      <div class="shelf-shadow"></div>

      <div class="shelf-item" data-stat="sub-30s 3×3">
        <img src="./assets/illus-cube.svg" alt="Rubik's cube">
      </div>
      <div class="shelf-item tall" data-stat="classical + folk">
        <img src="./assets/illus-violin.svg" alt="Violin">
      </div>
      <div class="shelf-item wide" data-stat="Satoshi Kamiya models">
        <img src="./assets/illus-crane.svg" alt="Origami crane">
      </div>
      <div class="shelf-item" data-stat="endgame study">
        <img src="./assets/illus-chess.svg" alt="Chess knight">
      </div>
      <div class="shelf-item" data-stat="top 15% Kaggle S6E2">
        <img src="./assets/illus-kaggle.svg" alt="Kaggle chart">
      </div>
    </div>
  </div>
</section>
```

```css
.shelf-wrapper {
  padding: 12vh 10vw 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.shelf {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: clamp(16px, 3vw, 40px);
  margin-top: auto;
  padding-bottom: 48px;
}
.shelf-line {
  position: absolute;
  bottom: 48px; left: -10vw; right: -10vw;
  height: 1px;
  background: var(--stroke);
}
.shelf-shadow {
  position: absolute;
  bottom: 38px; left: 0; right: 0;
  height: 10px;
  background: radial-gradient(ellipse at center, rgba(28,26,22,.07) 0%, transparent 70%);
}
.shelf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}
.shelf-item img {
  width: clamp(40px, 6vw, 80px);
  height: auto;
  display: block;
}
.shelf-item.tall img  { height: clamp(70px, 10vw, 130px); width: auto; }
.shelf-item.wide img  { width: clamp(60px, 8vw, 110px); }

/* Each item at a different bottom offset for irregular shelf feel */
.shelf-item:nth-child(3) { margin-bottom: 16px; }
.shelf-item:nth-child(4) { margin-bottom: 6px; }
.shelf-item:nth-child(5) { margin-bottom: 10px; }

/* Stat tooltip on hover */
.shelf-item::after {
  content: attr(data-stat);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  font: 300 0.72rem/1 var(--font-body);
  color: var(--brown);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.shelf-item:hover { transform: translateY(-8px); }
.shelf-item:hover::after { opacity: 1; }
```

---

### 05 — Find me
**Minimal contact — cream-darkest bg**

```html
<section class="section" id="find" style="background: #E0D8CC; display:flex; align-items:center; padding: 0 10vw;">
  <div>
    <h2 class="find-headline">
      If something I've built<br>interests you,<br>let's talk about it.
    </h2>
    <div class="find-links">
      <a href="https://github.com/Shafin2954" class="find-link">GitHub</a>
      <a href="#" class="find-link">LinkedIn</a>
      <a href="mailto:you@email.com" class="find-link">Email</a>
    </div>
  </div>
</section>
```

```css
.find-headline {
  font: 300 clamp(1.6rem,4vw,3rem)/1.3 var(--font-display);
  color: var(--ink);
  margin: 0 0 32px;
}
.find-links { display: flex; gap: 28px; }
.find-link {
  font: 300 0.9rem var(--font-body);
  color: var(--rust);
  text-decoration: none;
  position: relative;
  padding-bottom: 2px;
}
/* Animated underline left→right */
.find-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 1px;
  background: var(--rust);
  transform: scaleX(1);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.find-link:hover::after {
  transform: scaleX(0);
  transform-origin: right;
}
/* Then re-draws from left */
.find-link:hover::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 1px;
  background: var(--rust);
  transform: scaleX(0);
  transform-origin: left;
  animation: underlineIn 0.3s 0.15s ease forwards;
}
@keyframes underlineIn {
  to { transform: scaleX(1); }
}
```

---

## Illustrations — What to Make

Each illustration replaces a dashed placeholder. Style guidelines:
- Clean line art or flat vector — no shading, no gradients
- All ink-colored (`#1C1A16`) or two-tone with `--rust` accent
- Each has a distinct, instantly readable silhouette

| File | Subject | Key silhouette |
|---|---|---|
| `illus-hero.svg` | You — arbitrary, personal | Open to you |
| `illus-builder.svg` | Code / tools | Terminal window or wrench |
| `illus-analyst.svg` | Data / stats | Chart or scatter plot |
| `illus-creative.svg` | Origami / music | Crane or music note |
| `illus-cube.svg` | Rubik's cube | 3×3 cube isometric |
| `illus-violin.svg` | Violin | Tall, narrow silhouette |
| `illus-crane.svg` | Paper crane | Wide wingspan |
| `illus-chess.svg` | Knight piece | Recognisable chess silhouette |
| `illus-kaggle.svg` | Data competition | Simple bar or line chart |
| `noise.png` | Paper grain texture | 200×200px subtle noise |

---

## File Structure

```
/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── illus-hero.svg
    ├── illus-builder.svg
    ├── illus-analyst.svg
    ├── illus-creative.svg
    ├── illus-cube.svg
    ├── illus-violin.svg
    ├── illus-crane.svg
    ├── illus-chess.svg
    ├── illus-kaggle.svg
    ├── noise.png
    └── screenshots/
        └── (project screenshots)
```

---

## Checklist — anti-AI tells

- [ ] No typed/animated role text
- [ ] No blob backgrounds
- [ ] No glassmorphism (no `backdrop-filter`)
- [ ] No blue/purple/neon palette
- [ ] Single accent color only (`--rust`)
- [ ] Italic trade-off sentence on every project card
- [ ] Shelf instead of interest card grid
- [ ] Specific stats not generic descriptions
- [ ] Real screenshots not SVG icons
- [ ] Meta tags: `description`, `og:title`, `og:image`, `canonical`
- [ ] Alt text on every illustration
- [ ] Custom cursor disabled on touch devices

---

## Meta tags (add to `<head>`)

```html
<meta name="description" content="Shafin Ahmed — statistician and builder. Data, software, and creative systems.">
<meta property="og:title" content="Shafin Ahmed">
<meta property="og:description" content="Statistician & builder. Works across data, software, and creative systems.">
<meta property="og:image" content="./assets/og-image.png">
<link rel="canonical" href="https://yourdomain.com">
<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
```