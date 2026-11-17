# Master Content & Placeholders Checklist (`CONTENT.md`)

This document lists every item marked `[[FILL]]`, `[[CONFIRM]]`, or `[[ASK RUTVIK]]` across the codebase. Every item is cross-referenced with its exact source file for quick editing.

---

## 1. Professional Experience & Career (`content/profile.ts`)

| Location | Item | Current Text / Setting | Action Required by Rutvik |
| :--- | :--- | :--- | :--- |
| `content/profile.ts` | **Shreesoftech Internship Description** | `[[FILL: 2-3 additional sentences on what you built at Shreesoftech from LinkedIn]]` | Add 2–3 sentences describing your work on mobile features, background caching, or client APIs. |
| `content/profile.ts` | **Shreesoftech Skills Line** | `Android, Kotlin, Mobile Architecture, REST APIs, SQLite / Room [[FILL]]` | Add any specific libraries or Android tools listed on your LinkedIn. |
| `content/profile.ts` | **Innovation Intellect Skills Line** | `Agentic AI development, data analysis, NLP, IoT interfaces, predictive modeling [[FILL]]` | Complete with the exact skills tagged on your LinkedIn profile. |
| `content/profile.ts` | **Certifications List** | `Deep Learning Specialization`, `PostgreSQL Database Admin`, `LangChain Certification [[CONFIRM]]` | Confirm names of verified certifications or remove/replace with your actual certificates. |
| `content/profile.ts` | **Education Display** | `MSc in Data Science (2022 — 2024)` | **[[ASK RUTVIK]]**: Confirm whether you wish to display your academic degree publicly in the About section or omit it to emphasize a pure industry engineering background. |

---

## 2. Projects & Systems Verification (`content/projects.ts`)

| Project Slug | Item | Current Setting | Action Required |
| :--- | :--- | :--- | :--- |
| `cortex` | **Redis Checkpointer** | Dual-storage: Redis + PostgreSQL | **[[CONFIRM]]**: Confirm if Redis is actively deployed as the volatile checkpointer or if PostgreSQL handles both state and chat history. |
| `cortex` | **Repository Link** | `https://github.com/Rutvik995` | Update `repoUrl` if Cortex has a distinct repository name. |
| `solar-agent` | **SCADA Telemetry Scale** | `5 plants, 113 days, 13k+ rows, 232 tests` | **[[FILL]]**: Update numbers if the dataset or test suite has grown. |
| `solar-agent` | **Repository Link** | `https://github.com/Rutvik995` | Update `repoUrl` if you have a public repository URL. |
| `nl-to-sql` | **Repository Link** | `DataAnalysis_Multi-Agentic-System` | Verified valid GitHub URL. |
| `arvex-stock` | **Repository Link** | `STOCK-ALGO` | Verified valid GitHub URL. |
| `aquaserve` | **Stack Confirmation** | Native Android in Kotlin, Node.js, Express | **[[CONFIRM]]**: GitHub shows native Android in Kotlin (old site previously claimed React Native). Confirm Kotlin is accurate. |
| `invoice-webapp` | **Repository & Demo Link** | `https://github.com/Rutvik995` | **[[CONFIRM]]**: Supply the specific repository link and/or live deployment URL. |
| `power-bi-dashboards`| **Repository Link** | `Power-BI-Dashboards` | Verified valid GitHub URL. |
| `travel-ai-agent` | **Repository Link** | `Travel_AI_Agent` | Verified valid GitHub URL. |
| *Optional System* | **Document RAG Q&A Engine** | Omitted from active list | **[[ASK RUTVIK]]**: Confirm whether to include a 9th project entry for your long-form Document RAG system. |

---

## 3. General Site Settings & Assets (`content/profile.ts`)

| Location | Item | Current Setting | Action Required |
| :--- | :--- | :--- | :--- |
| `content/profile.ts` | **Résumé PDF** | `/resume.pdf` | Place your PDF résumé at `portfolio-web/public/resume.pdf` or link to your cloud document. |
| `content/profile.ts` | **Production Domain** | `https://rutvikbhanderi.dev` | If your custom domain differs (e.g. `rutvikbhanderi.com`), update `metadataBase` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`. |
| `content/profile.ts` | **Photo Config Flag** | `showPhoto: false` | Strictly adheres to the **NO IMAGES RULE**. If you ever choose to show a natural personal headshot in the future, set to `true` and provide `/public/rutvik.jpg`. |
