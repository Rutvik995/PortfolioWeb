"use client";

import { useState } from "react";
import Link from "next/link";
import { projects, Project } from "@/content/projects";

export default function SelectedWork() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>("cortex");

  const toggleExpand = (slug: string) => {
    setExpandedSlug(expandedSlug === slug ? null : slug);
  };

  const topProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section id="work" aria-labelledby="work-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>01 / SELECTED WORK</span>
          <span>{projects.length} Documented Systems</span>
        </div>

        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 id="work-title" className="display-section text-[var(--ink)] mb-4 font-normal">
            Engineered systems, <em className="italic text-[var(--accent)]">not just wrappers.</em>
          </h2>
          <p className="text-base text-[var(--graphite)] leading-relaxed">
            Detailed case studies with real architectural decisions, database schemas, and honest
            post-mortems of what broke in production.
          </p>
        </div>

        {/* Featured Deep-Dive Projects (Top 3) */}
        <div className="space-y-8 mb-16">
          {topProjects.map((project, idx) => {
            const isExpanded = expandedSlug === project.slug;
            return (
              <article
                key={project.slug}
                className="paper-card p-6 md:p-8 rule-all transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                      0{idx + 1}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl text-[var(--ink)] font-normal">
                      <Link
                        href={`/work/${project.slug}`}
                        className="hover:text-[var(--accent)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                      >
                        {project.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--graphite)]">
                    <span>{project.category}</span>
                    <span className="text-[var(--rule)]">&middot;</span>
                    <span>{project.year}</span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm md:text-base text-[var(--graphite)] leading-relaxed max-w-3xl mb-6">
                  {project.summary}
                </p>

                {/* Key Stack Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-mono px-2 py-0.5 bg-[var(--code-bg)] text-[var(--ink)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Expandable Architecture Insights */}
                {isExpanded && project.problem && (
                  <div className="rule-t pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans text-[var(--graphite)]">
                    <div>
                      <h4 className="font-mono uppercase tracking-wider text-[var(--ink)] mb-2 font-semibold">
                        The Core Problem
                      </h4>
                      <p className="leading-relaxed mb-4">{project.problem}</p>

                      <h4 className="font-mono uppercase tracking-wider text-[var(--ink)] mb-2 font-semibold">
                        Engineering Highlights
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside">
                        {project.architectureNotes?.slice(0, 3).map((note, nIdx) => (
                          <li key={nIdx} className="leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-mono uppercase tracking-wider text-[var(--ink)] mb-2 font-semibold">
                        Critical Trade-off
                      </h4>
                      {project.keyDecisions?.[0] && (
                        <div className="p-3 bg-[var(--code-bg)] text-[var(--ink)] mb-4">
                          <p className="font-semibold mb-1">
                            {project.keyDecisions[0].decision}
                          </p>
                          <p className="text-[11px] text-[var(--graphite)] leading-relaxed">
                            {project.keyDecisions[0].tradeoff}
                          </p>
                        </div>
                      )}

                      <h4 className="font-mono uppercase tracking-wider text-[var(--ink)] mb-2 font-semibold">
                        Verified Metric
                      </h4>
                      <p className="font-mono text-xs text-[var(--accent)] font-medium">
                        {project.metricsOrScope}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="rule-t pt-4 mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/work/${project.slug}`}
                      className="editorial-link font-medium text-[var(--ink)]"
                    >
                      Read full case study &rarr;
                    </Link>
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--graphite)] hover:text-[var(--accent)]"
                      >
                        GitHub &rarr;
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(project.slug)}
                    className="text-[var(--graphite)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    {isExpanded ? "[ Hide architecture notes ]" : "[ View quick architectural notes ]"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Index Table of Additional Systems */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-6">
            Additional Applications, Analytics &amp; Tooling
          </h3>

          <div className="rule-t">
            {otherProjects.map((project) => (
              <div
                key={project.slug}
                className="rule-b py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--surface)] transition-colors px-2 md:px-3"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h4 className="font-serif text-xl text-[var(--ink)] font-normal">
                      <Link
                        href={`/work/${project.slug}`}
                        className="hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                      >
                        {project.title}
                      </Link>
                    </h4>
                    <span className="text-xs font-mono text-[var(--graphite)]">
                      ({project.year})
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[var(--graphite)] leading-relaxed max-w-2xl">
                    {project.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[var(--graphite)]">
                  <span className="hidden sm:inline-block">{project.category}</span>
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-link text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      Source &rarr;
                    </a>
                  )}
                  <Link
                    href={`/work/${project.slug}`}
                    className="editorial-link text-[var(--accent)] font-medium"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
