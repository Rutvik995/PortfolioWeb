import { profile } from "@/content/profile";

export default function TechStack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>03 / TECHNICAL STACK</span>
          <span>Verified Toolchain</span>
        </div>

        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 id="stack-title" className="display-section text-[var(--ink)] mb-4 font-normal">
            Tools chosen for <em className="italic text-[var(--accent)]">production stability.</em>
          </h2>
          <p className="text-base text-[var(--graphite)] leading-relaxed">
            No percentage bars or logo walls. Every tool listed below is actively used in my repositories
            for state management, schema enforcement, data warehousing, or API serving.
          </p>
        </div>

        {/* Typographic Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 rule-t pt-8">
          {profile.stackGroups.map((group, idx) => (
            <div key={group.category} className="space-y-4">
              <div className="border-b border-[var(--rule)] pb-3">
                <span className="text-xs font-mono text-[var(--accent)] font-semibold block mb-1">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-xl text-[var(--ink)] font-normal">
                  {group.category}
                </h3>
                <p className="text-xs text-[var(--graphite)] mt-1.5 leading-relaxed">
                  {group.qualifier}
                </p>
              </div>

              {/* Items List */}
              <ul className="space-y-2 text-sm font-mono text-[var(--ink)]">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 py-1 rule-b last:border-b-0 border-[var(--rule)]/60"
                  >
                    <span className="text-[var(--accent)] text-xs" aria-hidden="true">&ndash;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
