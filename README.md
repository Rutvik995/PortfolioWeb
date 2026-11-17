# Rutvik Bhanderi — Personal Portfolio Website

A production-grade, editorial portfolio for **Rutvik Bhanderi** (AI Systems Engineer). Designed around the **"Technical Notebook"** concept: warm paper tones, flat surfaces with 1px hairline rules, zero gradients, zero glassmorphism, authentic engineering diagrams, and an academic journal aesthetic.

---

## 1. Design System & Identity

- **Theme Palette**:
  - **Light (Default)**: Paper (`#F3EFE7`), Surface (`#FBF9F4`), Ink (`#16140F`), Graphite (`#5C574D`), Rule (`#D9D3C5`), Vermilion Accent (`#D4491F`), Deep Pine (`#1F4D3F`).
  - **Dark**: Dark Background (`#12110E`), Surface (`#1A1915`), Aged Ink (`#EDE8DC`), Graphite (`#A39C8C`), Rule (`#2E2B24`), Accent (`#E8663C`), Sage Pine (`#4E9A82`).
- **Typography**:
  - Display / Headlines: `Instrument Serif` (Google Fonts via `next/font/google`)
  - Body & UI: `Geist` (Google Fonts via `next/font/google`)
  - Code & Metadata: `Geist Mono` (Google Fonts via `next/font/google`)
- **Key Principles**:
  - **No AI-generated clichés**: No neon cyan/violet gradients, no glowing blobs, no glassmorphism backdrop-blurs, no custom cursors, no fake telemetry, no percentage bars.
  - **Restrained Motion**: Subtle 1px rule draws, instant theme switching with no flash of unstyled theme, and full support for `prefers-reduced-motion`.
  - **Single Focal Accent**: Only one focal vermilion accent per viewport.

---

## 2. Project Architecture

```
portfolio-web/
├── app/
│   ├── layout.tsx             # Root layout with fonts, JSON-LD Person schema & theme script
│   ├── page.tsx               # Single-page editorial homepage
│   ├── globals.css            # Technical Notebook CSS variables & Tailwind v4 tokens
│   ├── not-found.tsx          # Custom 404 page with dry wit
│   ├── opengraph-image.tsx    # Typographic edge OG image generator
│   ├── robots.ts              # Search engine crawler permissions
│   ├── sitemap.ts             # Dynamic XML sitemap generator
│   └── work/[slug]/page.tsx   # Static case study deep-dive pages (SSG)
├── components/
│   ├── Navbar.tsx             # Wordmark, section links, theme toggle, "Get in touch"
│   ├── ThemeToggle.tsx        # Accessible Light/Dark switcher
│   ├── ThemeScript.tsx        # Client script preventing theme FOUC
│   ├── Hero.tsx               # Editorial headline, plain intro, "Currently" note
│   ├── SelectedWork.tsx       # Expandable project index and case study cards
│   ├── AgentArchitecture.tsx  # Hand-crafted Cortex 10-node SVG graph with interactive trace
│   ├── TechStack.tsx          # 4-column typographic stack with qualifiers
│   ├── About.tsx              # Candid bio, natural photo placeholder, compact timeline
│   ├── Writing.tsx            # 3 technical essays drawn from Cortex production learnings
│   ├── Contact.tsx            # Copy-to-clipboard email, social channels, minimal form
│   └── Footer.tsx             # Copyright, subtle humor line, back-to-top link
├── content/
│   ├── projects.ts            # Typed data for all 8+1 systems & case study details
│   ├── notes.ts               # Technical essays & compiler post-mortems
│   └── profile.ts             # Biography, principles, timeline, and dry-wit quotes
├── CONTENT.md                 # Master checklist of [[FILL]] placeholders for Rutvik
└── README.md                  # This document
```

---

## 3. Local Development

### Prerequisites
- Node.js `18.18+` or `20+` / `24+`
- npm or pnpm / yarn

### Installation
```bash
cd portfolio-web
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Building & Production Verification

```bash
# Build the optimized production release (SSG + Edge)
npm run build

# Start the local production server
npm start
```

### Build Output Verification
- Static pages prerendered (`/`, `/_not-found`, `/sitemap.xml`, `/robots.txt`).
- Static Case Study pages prerendered (`/work/cortex`, `/work/solar-agent`, `/work/nl-to-sql`, etc.).
- Edge Dynamic Open Graph generator (`/opengraph-image`).
- TypeScript strict checking passes with **0 errors**.

---

## 5. Deployment (Vercel)

1. Push your repository to GitHub:
   ```bash
   git add -A
   git commit -m "feat: complete editorial portfolio rewrite"
   git push origin master
   ```
2. In [Vercel](https://vercel.com):
   - Import `Rutvik995/PortfolioWeb` (Root directory: `portfolio-web`).
   - Framework preset: `Next.js`.
   - Click **Deploy**.
3. Point your custom domain (e.g. `rutvikbhanderi.dev`) to Vercel DNS.

---

## 6. Accessibility & Performance Checklist

- [x] **WCAG AA Contrast**: Checked across paper background (`#F3EFE7`) and ink text (`#16140F`), and dark background (`#12110E`) with aged ink (`#EDE8DC`).
- [x] **Visible Focus Rings**: Accent vermilion (`outline: 2px solid var(--accent); outline-offset: 2px;`) across all interactive links and form inputs.
- [x] **Skip Link**: Accessible "Skip to main content" link for screen readers and keyboard users.
- [x] **Reduced Motion**: All animations and transitions disable automatically under `prefers-reduced-motion: reduce`.
- [x] **No Canvas/WebGL Overhead**: Zero heavy CPU/GPU rendering, keeping performance above 95+ on Lighthouse.
