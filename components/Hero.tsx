import Link from "next/link";
import { profile } from "@/content/profile";

/*
 * ============================================================================
 * HEADLINE ALTERNATIVES CONSIDERED:
 * 1. Selected: "I build AI agents that *actually finish the job.*"
 *    Why: Direct, memorable, and addresses the industry-wide frustration with
 *    fragile agents that abandon goals halfway.
 * 2. Alternative A: "Autonomous multi-agent systems, *engineered for the real world.*"
 * 3. Alternative B: "From research notebook to production: *reliable agentic AI.*"
 * ============================================================================
 */

export default function Hero() {
  return (
    <section
      id="intro"
      aria-labelledby="hero-title"
      className="pt-16 pb-20 md:pt-24 md:pb-32 rule-b"
    >
      <div className="container-grid">
        {/* Section marker & Location */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-8 md:mb-12">
          <span>00 / INTRODUCTION</span>
          <span>{profile.location}</span>
        </div>

        {/* 12-Column Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Headline & Bio (Cols 1-8) */}
          <div className="lg:col-span-8">
            <p className="text-xs font-mono text-[var(--graphite)] mb-4 tracking-wide uppercase">
              {profile.role} &middot; {profile.location}
            </p>

            <h1
              id="hero-title"
              className="display-hero text-[var(--ink)] mb-8 font-normal"
            >
              I build AI agents that{" "}
              <em className="font-serif italic text-[var(--accent)] font-normal">
                actually finish the job.
              </em>
            </h1>

            <p className="text-base md:text-lg text-[var(--graphite)] max-w-2xl leading-relaxed mb-8">
              I architect autonomous multi-agent pipelines using LangGraph and Python,
              and build the production databases, state checkpoints, APIs, and clean interfaces
              around them so intelligent systems operate reliably outside a research notebook.
            </p>

            {/* Availability Line with Pine Dot */}
            <div className="flex items-center gap-2.5 text-xs font-mono text-[var(--graphite)] mb-8">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: "var(--pine)" }}
                aria-hidden="true"
              />
              <span>{profile.availability}</span>
            </div>

            {/* Plain Underlined External Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-sans pt-2">
              <a
                href={`mailto:${profile.email}`}
                className="editorial-link"
              >
                Email
              </a>
              <span className="text-[var(--rule)]" aria-hidden="true">/</span>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link"
              >
                GitHub
              </a>
              <span className="text-[var(--rule)]" aria-hidden="true">/</span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link"
              >
                LinkedIn
              </a>
              <span className="text-[var(--rule)]" aria-hidden="true">/</span>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link"
              >
                R&eacute;sum&eacute; (PDF)
              </a>
            </div>
          </div>

          {/* Right Column: "Currently" Marginalia Note (Cols 9-12) */}
          <div className="lg:col-span-4 lg:pt-8">
            <div className="paper-card p-5 md:p-6 rule-all">
              <p className="text-xs font-mono uppercase text-[var(--graphite)] mb-2.5 tracking-wider">
                Status / Focus
              </p>
              <p className="text-xs font-mono text-[var(--ink)] leading-relaxed mb-4">
                {profile.dryWit.currently}
              </p>
              <div className="rule-t pt-3 flex items-center justify-between text-[11px] font-mono text-[var(--graphite)]">
                <span>Architecture</span>
                <span className="text-[var(--accent)]">LangGraph 10-Node</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
