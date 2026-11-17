import { profile } from "@/content/profile";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>04 / ABOUT &amp; BACKGROUND</span>
          <span>Rajkot, India</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Story & Photo Placeholder (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 id="about-title" className="display-section text-[var(--ink)] font-normal">
              Engineered with care, <em className="italic text-[var(--accent)]">tested against reality.</em>
            </h2>

            {/* Photo / Portrait Placeholder */}
            <div className="paper-card p-6 rule-all flex flex-col sm:flex-row items-center gap-6 my-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[var(--code-bg)] rule-all flex flex-col items-center justify-center text-center p-3 flex-shrink-0">
                <span className="font-serif text-3xl text-[var(--accent)] font-normal">RB</span>
                <span className="text-[10px] font-mono text-[var(--graphite)] mt-1">
                  [[Rutvik photo]]
                </span>
              </div>
              <div className="text-xs font-mono text-[var(--graphite)] leading-relaxed">
                <p className="font-semibold text-[var(--ink)] mb-1">
                  Rutvik Bhanderi
                </p>
                <p className="mb-2">
                  AI Systems Engineer &middot; Rajkot, Gujarat, India
                </p>
                <p className="text-[11px] text-[var(--graphite)]">
                  Photo placeholder: replace with an unfiltered natural headshot in <code>/public/rutvik.jpg</code>.
                </p>
              </div>
            </div>

            {/* Candid Unhyped 150-word Bio */}
            <div className="space-y-4 text-base text-[var(--graphite)] leading-relaxed">
              {profile.bio.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Right Column: Compact Timeline (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] rule-b pb-3">
              Compact Experience &amp; Trajectory
            </h3>

            <div className="space-y-6">
              {profile.timeline.map((item, tIdx) => (
                <div key={tIdx} className="relative pl-6 rule-l border-[var(--rule)]">
                  {/* Timeline dot */}
                  <span
                    className="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-[var(--surface)] border border-[var(--graphite)]"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-mono text-[var(--accent)] font-medium block mb-1">
                    {item.year}
                  </span>
                  <h4 className="font-serif text-lg text-[var(--ink)] font-normal">
                    {item.role}
                  </h4>
                  <p className="text-xs font-mono text-[var(--graphite)] mb-1.5">
                    {item.organization}
                  </p>
                  <p className="text-xs text-[var(--graphite)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
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
