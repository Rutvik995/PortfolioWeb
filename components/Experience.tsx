import { profile } from "@/content/profile";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>02 / PROFESSIONAL EXPERIENCE</span>
          <span>Verified Work History</span>
        </div>

        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 id="experience-title" className="display-section text-[var(--ink)] mb-4 font-normal">
            Real systems in <em className="italic text-[var(--accent)]">production settings.</em>
          </h2>
          <p className="text-base text-[var(--graphite)] leading-relaxed">
            Hands-on engineering across industrial IoT environments, automated multi-agent pipelines,
            and native mobile infrastructure.
          </p>
        </div>

        {/* Reverse Chronological Experience List */}
        <div className="space-y-12">
          {profile.experiences.map((exp, idx) => (
            <article
              key={exp.company}
              className="paper-card p-6 md:p-8 rule-all transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-4 pb-4 rule-b">
                <div>
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold block mb-1">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl text-[var(--ink)] font-normal">
                    {exp.role}
                  </h3>
                  <p className="font-mono text-xs text-[var(--ink)] mt-1 font-semibold">
                    {exp.company}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[var(--graphite)]">
                  <span>{exp.period}</span>
                  <span className="text-[var(--rule)]">&middot;</span>
                  <span>{exp.location}</span>
                  <span className="text-[var(--rule)]">&middot;</span>
                  <span className="text-[var(--accent)] font-medium">[{exp.mode}]</span>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-3 text-sm text-[var(--graphite)] leading-relaxed mb-6 list-disc list-inside">
                {exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Skills Line (Mono) */}
              <div className="rule-t pt-4 text-xs font-mono text-[var(--graphite)]">
                <span className="text-[var(--ink)] font-semibold uppercase">Technologies &amp; Competencies: </span>
                <span>{exp.skillsLine}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Subtle bridge sentence */}
        <p className="text-xs font-mono text-[var(--graphite)] mt-8 leading-relaxed">
          Note: The deterministic agent architecture, schema validation, and state isolation patterns
          developed in these industrial environments directly inform the design of my open-source projects.
        </p>
      </div>
    </section>
  );
}
