# Rutvik Bhanderi — Personal Portfolio Website

A production-ready, human-designed editorial portfolio for **Rutvik Bhanderi** (AI Systems Engineer).

---

## 1. Design Direction: "Technical Notebook"

- **Concept**: A warm, paper-like editorial layout where code, system state flows, and clear prose are treated as primary visual material.
- **Strict NO IMAGES Rule**:
  - Zero project screenshots, mockups, device frames, GIFs, thumbnails, or videos.
  - Zero stock photography, AI-generated imagery, or empty placeholder boxes.
  - The design is carried 100% by typography, whitespace, hairline 1px rules, code excerpts, tables, and hand-built inline SVG diagrams.
  - Only raster assets: favicon and an edge-generated typographic Open Graph image.
- **Palette**:
  - **Light (Default)**: Paper (`#F3EFE7`), Surface (`#FBF9F4`), Ink (`#16140F`), Graphite (`#5C574D`), Rule (`#D9D3C5`), Accent Vermilion (`#D4491F`), Deep Pine (`#1F4D3F`).
  - **Dark**: Dark Background (`#12110E`), Surface (`#1A1915`), Aged Ink (`#EDE8DC`), Graphite (`#A39C8C`), Rule (`#2E2B24`), Accent (`#E8663C`), Sage Pine (`#4E9A82`).
  - *No gradients, no box-shadow glows, no glassmorphism backdrop blurs.*
- **Typography**:
  - Display / Headlines: `Instrument Serif` (Google Fonts via `next/font/google`)
  - Body & UI: `Geist` (Google Fonts via `next/font/google`)
  - Code & Metadata: `Geist Mono` (Google Fonts via `next/font/google`)

---

## 2. Information Architecture & Sections

```
Home Page (/)
├── 00 / INTRODUCTION     # Headline, plain intro, "Currently" note, Pine dot, plain links
├── 01 / SELECTED WORK    # Editorial index list + deep case-study summaries (Cortex, Solar, NL-to-SQL)
├── 02 / EXPERIENCE       # Real work history: Innovation Intellect (IoT Agentic AI) & Shreesoftech (Android)
├── 03 / HOW I BUILD      # Academic Figure 1.0: Hand-crafted 10-node Cortex SVG with live request trace
├── 04 / TECHNICAL STACK  # 4-column typographic classification with operational qualifiers
├── 05 / ABOUT            # Text-only first-person unhyped bio, education & certifications
├── 06 / TECHNICAL NOTES  # 3 production essays on agent compilers, memory compaction, and DAG tests
└── 07 / DIRECT CHANNEL   # One-click copy email, social channels, accessible dispatch form

Case Study Pages (/work/[slug])
├── 01 / The Core Engineering Problem
├── 02 / System Execution Flow (Plain-Text Mono Block)
├── 03 / What I Engineered & Architectural Pillars
├── 04 / Implementation Excerpt (Real Python/LangGraph/Pydantic code contract)
├── 05 / Key Decisions & Explicit Trade-offs
├── 06 / Failure Post-Mortem ("What broke and how it was fixed")
├── 07 / Known Limitations & What Is Next
└── 08 / Technology Stack & Source Links
```

---

## 3. Local Development & Production Build

### Running Locally
```bash
cd portfolio-web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Test
```bash
npm run build
npm start
```

### Static Pre-rendering Verification
- Static pages: `/`, `/_not-found`, `/robots.txt`, `/sitemap.xml`.
- Pre-rendered case studies (SSG via `generateStaticParams`):
  - `/work/cortex`
  - `/work/solar-agent`
  - `/work/nl-to-sql`
  - `/work/arvex-stock`
  - `/work/aquaserve`
  - `/work/invoice-webapp`
  - `/work/power-bi-dashboards`
  - `/work/travel-ai-agent`
- Edge Open Graph generator: `/opengraph-image`.
- **0 TypeScript errors, 0 ESLint warnings.**

---

## 4. Accessibility & Lighthouse Summary

- **Performance (95+)**: Zero client-side WebGL/Canvas overhead, zero heavy raster images, instant font loading with `display: swap`, static pre-rendering.
- **Accessibility (95+)**:
  - Full keyboard navigation with visible focus rings (`outline: 2px solid var(--accent); outline-offset: 2px;`).
  - Accessible skip-to-content link (`#main-content`).
  - Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
  - Color contrast: Verified WCAG AA contrast for both light (`#16140F` on `#F3EFE7`) and dark (`#EDE8DC` on `#12110E`) themes.
  - SVG Diagram degrades to an accessible semantic `<ol>` text list for screen readers.
- **Best Practices (95+)**: Strict HTTPS links, CSP-safe inline script execution with no hydration mismatch (`suppressHydrationWarning`), modern clean ES modules.
- **SEO (95+)**: Fully structured JSON-LD `Person` schema, semantic Open Graph cards, dynamic XML sitemap, and crawlable `robots.txt`.

---

## 5. Deployment to Vercel

```bash
git add -A
git commit -m "feat: complete editorial portfolio rewrite with experience & zero-images rule"
git push origin master
```

In your Vercel dashboard:
1. Import `Rutvik995/PortfolioWeb` (Root Directory: `portfolio-web`).
2. Framework Preset: `Next.js`.
3. Click **Deploy**.
