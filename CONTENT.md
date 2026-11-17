# Content Verification & Placeholder Checklist (`CONTENT.md`)

This document lists every placeholder marked `[[FILL]]` or `[[CONFIRM]]` across the codebase. As requested in the specification, all placeholder items are compiled here so Rutvik can easily review, customize, and supply exact real data.

---

## 1. Global & Profile Details (`content/profile.ts`)

| Location | Item | Current Setting | Action Required / What Rutvik Must Provide |
| :--- | :--- | :--- | :--- |
| `content/profile.ts` | **Résumé PDF** | `/resume.pdf` | Place your finalized PDF résumé in `portfolio-web/public/resume.pdf` or update `resumeUrl` with your Google Drive / hosted link. |
| `content/profile.ts` | **Production Domain** | `https://rutvikbhanderi.dev` | If your custom domain differs (e.g., `rutvikbhanderi.com`), update `baseUrl` in `app/sitemap.ts`, `app/robots.ts`, and `app/layout.tsx`. |
| `components/About.tsx` | **Natural Portrait Photo** | Photo placeholder | Place an unfiltered, natural headshot in `portfolio-web/public/rutvik.jpg`. The component currently displays an editorial monogram card `RB`. |
| `content/profile.ts` | **Education in Timeline** | `MSc in Data Science` | Listed under experience. *Note*: If you prefer not to display academic details publicly, simply remove the `isEducation` entry from `content/profile.ts`. |

---

## 2. Project Verification & Placeholders (`content/projects.ts`)

### Project 1: Cortex (`content/projects.ts` -> `slug: "cortex"`)
- **Redis Checkpointer**:
  - *Current Status*: Documented as `Redis + PostgreSQL` dual storage.
  - *Action*: Confirm whether Redis is actively used in your deployment or if PostgreSQL serves as both the checkpointer and relational store.
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995`
  - *Action*: If Cortex has a dedicated private or public repo name (e.g. `https://github.com/Rutvik995/Cortex-Agent`), update `repoUrl`.
- **Known Limitations**:
  - Documented: Subprocess vs. microVM sandboxing, single-thread WebSocket event loop, long-running job queue. Confirm these accurately represent current staging boundaries.

### Project 2: Solar Power Plant Analysis Agent (`slug: "solar-agent"`)
- **Telemetry Dataset Scale**:
  - *Current Setting*: `5 utility-scale plants · 113 days of telemetry · 13k+ sensor rows · 232-test regression suite`.
  - *Action*: Confirm or update the exact row count and plant count if new data has been added.
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995`
  - *Action*: Update `repoUrl` if there is a direct public repository link.

### Project 3: Natural-Language-to-SQL Data Analyst (`slug: "nl-to-sql"`)
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995/DataAnalysis_Multi-Agentic-System`
  - *Action*: Verified valid GitHub repo URL.

### Project 4: ARVEX Stock Analysis (`slug: "arvex-stock"`)
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995/STOCK-ALGO`
  - *Action*: Verified valid GitHub repo URL.
- **Methodology Note**:
  - Documented: Autoregressive drift limitations over >5-day horizons.

### Project 5: AquaServe (`slug: "aquaserve"`)
- **Technology Stack Confirmation**:
  - *Current Setting*: `Android / Kotlin`, `Node.js`, `Express`, `PostgreSQL`, `Google Maps SDK`.
  - *Action*: Confirm whether this was implemented natively in Kotlin or with React Native. (Current code reflects Native Android/Kotlin as noted in GitHub).

### Project 6: Invoice Web App (`slug: "invoice-webapp"`)
- **Stack & Link**:
  - *Current Setting*: `React / Next.js`, `TypeScript`, `Node.js`, `PostgreSQL`.
  - *Action*: Supply public GitHub repository link or live demo URL if available.

### Project 7: Power BI Enterprise Dashboards (`slug: "power-bi-dashboards"`)
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995/Power-BI-Dashboards`
  - *Action*: Verified valid GitHub repo URL.

### Project 8: Travel AI Agent (`slug: "travel-ai-agent"`)
- **Repository Link**:
  - *Current Setting*: `https://github.com/Rutvik995/Travel_AI_Agent`
  - *Action*: Verified valid GitHub repo URL.

### Project 9 (Optional): Document RAG Q&A Engine
- *Action*: Confirm whether you want to include a dedicated card for your long-form Document RAG system. It is currently available to be toggled in `content/projects.ts`.

---

## 3. Contact Form & Email Integration (`components/Contact.tsx`)

- **Primary Email**: `rutvik.professional@gmail.com` (Verified active).
- **Form Dispatch Action**:
  - Currently includes accessible client-side confirmation feedback.
  - *Optional Upgrade*: If you wish to receive form submissions via email automatically, connect Resend or Formspree in a Next.js Server Action in `app/actions/contact.ts`.

---

## 4. Media & Screenshots

- *Current State*: The site utilizes clean, high-precision typographic placeholders and technical SVG diagrams. No stock art or AI-generated fake UI mockups are used.
- *When Ready*: Place real production screenshots of Cortex, the Solar Inverter dashboard, or AquaServe in `/public/projects/[slug].png` to replace the placeholders.
