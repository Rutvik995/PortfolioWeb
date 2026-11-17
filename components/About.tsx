import { profile } from "@/content/profile";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>05 / ABOUT &amp; BACKGROUND</span>
          <span>{profile.location}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Candid Prose Bio (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 id="about-title" className="display-section text-[var(--ink)] font-normal">
              Engineered with care, <em className="italic text-[var(--accent)]">tested against reality.</em>
            </h2>

            {/* Unhyped 150-word First-Person Story (Strictly text-only, no photo placeholders) */}
            <div className="space-y-4 text-base text-[var(--graphite)] leading-relaxed">
              {profile.bio.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            {/* Key Focus Areas (Text list) */}
            <div className="p-5 bg-[var(--surface)] rule-all space-y-2 mt-6">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold block">
                Core Architectural Focus
              </span>
              <p className="text-xs font-mono text-[var(--ink)] leading-relaxed">
                Deterministic StateGraph state machines &middot; Multi-tenant compound isolation &middot;
                Hierarchical context compaction &middot; AST query validation &middot; Golden trace CI testing
              </p>
            </div>
          </div>

          {/* Right Column: Academic Background & Certifications (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Education (Optional flag noted in content) */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] rule-b pb-2">
                Education &middot; Advanced Data Science
              </h3>
              <div className="p-4 bg-[var(--surface)] rule-all space-y-1">
                <span className="text-xs font-mono text-[var(--accent)] font-medium">
                  {profile.education.year}
                </span>
                <h4 className="font-serif text-lg text-[var(--ink)] font-normal">
                  {profile.education.degree}
                </h4>
                <p className="text-xs font-mono text-[var(--graphite)]">
                  {profile.education.institution}
                </p>
                <p className="text-xs text-[var(--graphite)] leading-relaxed pt-1">
                  {profile.education.note}
                </p>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] rule-b pb-2">
                Technical Certifications
              </h3>
              <ul className="space-y-2 text-xs font-mono text-[var(--ink)]">
                {profile.certifications.map((cert, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2 py-1 rule-b last:border-b-0 border-[var(--rule)]/60">
                    <span className="text-[var(--accent)]">&ndash;</span>
                    <span className="leading-relaxed">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resume Callout */}
            <div className="paper-card p-4 rule-all text-xs font-mono text-[var(--graphite)]">
              <span>Looking for a formal PDF curriculum vitae? </span>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link text-[var(--ink)] font-medium"
              >
                Download R&eacute;sum&eacute; &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
