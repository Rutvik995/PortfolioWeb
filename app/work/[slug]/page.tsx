import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { projects } from "@/content/projects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CaseStudyProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} — Case Study | Rutvik Bhanderi`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main id="main-content" className="py-16 md:py-24 rule-b">
        <article className="container-grid max-w-4xl">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--graphite)] mb-8">
            <Link href="/#work" className="editorial-link">
              &larr; Return to Selected Work
            </Link>
            <span>/</span>
            <span className="uppercase text-[var(--ink)]">{project.title}</span>
          </div>

          {/* Header */}
          <header className="mb-12 pb-8 rule-b">
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--accent)] mb-3">
              <span>{project.category}</span>
              <span className="text-[var(--rule)]">&middot;</span>
              <span>{project.year}</span>
              <span className="text-[var(--rule)]">&middot;</span>
              <span>Role: {project.role}</span>
            </div>

            <h1 className="display-hero text-[var(--ink)] font-normal mb-4">
              {project.title}
            </h1>

            <p className="text-xl md:text-2xl font-serif italic text-[var(--graphite)] leading-relaxed mb-6">
              {project.tagline}
            </p>

            {/* Scope / Metric Badge */}
            {project.metricsOrScope && (
              <div className="p-3 bg-[var(--surface)] rule-all inline-block text-xs font-mono text-[var(--ink)] mb-6">
                <span className="text-[var(--graphite)]">Verified Scope: </span>
                <span className="font-semibold text-[var(--accent)]">{project.metricsOrScope}</span>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-link font-medium text-[var(--ink)]"
                >
                  Inspect Source Repository &rarr;
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-link font-medium text-[var(--accent)]"
                >
                  Live Deployment &rarr;
                </a>
              )}
            </div>
          </header>

          {/* Body Sections */}
          <div className="space-y-16 text-base text-[var(--ink)]">
            {/* 1. Problem Statement */}
            {project.problem && (
              <section>
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                  01 / The Core Engineering Problem
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-4">
                  Why standard approaches fail
                </div>
                <p className="text-[var(--graphite)] leading-relaxed text-base">
                  {project.problem}
                </p>
              </section>
            )}

            {/* 2. System Flow (Plain-Text Mono Block) */}
            <section className="rule-t pt-12">
              <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                02 / System Execution Flow
              </h2>
              <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-4">
                Sequential State Transitions
              </div>
              <div className="p-4 bg-[var(--code-bg)] rule-all overflow-x-auto">
                <code className="text-xs font-mono text-[var(--ink)] whitespace-nowrap block">
                  {project.systemFlow}
                </code>
              </div>
            </section>

            {/* 3. What I Built */}
            {project.whatIBuilt && (
              <section className="rule-t pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                  03 / What I Engineered
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-4">
                  System Architecture &amp; Delivery
                </div>
                <p className="text-[var(--graphite)] leading-relaxed text-base mb-6">
                  {project.whatIBuilt}
                </p>

                {project.architectureNotes && (
                  <div className="paper-card p-6 rule-all">
                    <h3 className="font-mono text-xs uppercase text-[var(--graphite)] mb-3 tracking-wider">
                      Architectural Pillars
                    </h3>
                    <ul className="space-y-2.5 text-sm font-mono text-[var(--ink)]">
                      {project.architectureNotes.map((note, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-2">
                          <span className="text-[var(--accent)] mt-0.5" aria-hidden="true">&bull;</span>
                          <span className="leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 4. Real Code Excerpt (Where available) */}
            {project.codeExcerpt && (
              <section className="rule-t pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                  04 / Implementation Excerpt
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-4">
                  Concrete code contract
                </div>
                <div className="rule-all bg-[var(--code-bg)] p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--graphite)] pb-2.5 mb-3 rule-b border-[var(--rule)]">
                    <span>{project.codeExcerpt.filename}</span>
                    <span>{project.codeExcerpt.language}</span>
                  </div>
                  <pre className="text-xs font-mono text-[var(--ink)] overflow-x-auto leading-relaxed">
                    <code>{project.codeExcerpt.code}</code>
                  </pre>
                  <p className="text-[11px] font-mono text-[var(--graphite)] mt-3 pt-2 rule-t border-[var(--rule)]">
                    &bull; {project.codeExcerpt.annotation}
                  </p>
                </div>
              </section>
            )}

            {/* 5. Key Decisions & Trade-offs */}
            {project.keyDecisions && project.keyDecisions.length > 0 && (
              <section className="rule-t pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                  05 / Key Decisions &amp; Trade-offs
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-6">
                  Explicit architectural trade-offs
                </div>

                <div className="space-y-6">
                  {project.keyDecisions.map((kd, kIdx) => (
                    <div key={kIdx} className="p-6 rule-all bg-[var(--surface)] space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                          D.0{kIdx + 1}
                        </span>
                        <h4 className="font-serif text-xl text-[var(--ink)] font-normal">
                          {kd.decision}
                        </h4>
                      </div>
                      <div className="text-xs font-mono text-[var(--graphite)] space-y-1.5">
                        <p>
                          <strong className="text-[var(--ink)]">Rationale:</strong> {kd.reasoning}
                        </p>
                        <p>
                          <strong className="text-[var(--accent)]">Trade-off Accepted:</strong> {kd.tradeoff}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. What Broke and How I Fixed It */}
            {project.whatBrokeAndFix && project.whatBrokeAndFix.length > 0 && (
              <section className="rule-t pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] mb-3">
                  06 / Failure Post-Mortem
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-6">
                  What broke in practice and how it was fixed
                </div>

                <div className="space-y-6">
                  {project.whatBrokeAndFix.map((item, bIdx) => (
                    <div key={bIdx} className="p-6 rule-all bg-[var(--surface)] space-y-3">
                      <p className="font-serif text-lg text-[var(--ink)] font-normal">
                        &ldquo;{item.issue}&rdquo;
                      </p>
                      <div className="text-xs font-mono space-y-2 rule-t pt-3">
                        <p className="text-[var(--graphite)]">
                          <strong className="text-[var(--ink)] uppercase">Root Cause: </strong>
                          {item.rootCause}
                        </p>
                        <p className="text-[var(--ink)]">
                          <strong className="text-[var(--pine)] uppercase">Engineered Resolution: </strong>
                          {item.resolution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Known Limitations & What's Next */}
            {project.knownLimitations && project.knownLimitations.length > 0 && (
              <section className="rule-t pt-12">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                  07 / Known Limitations &amp; What Is Next
                </h2>
                <div className="font-serif text-2xl text-[var(--ink)] font-normal mb-4">
                  Honest production boundaries
                </div>
                <ul className="space-y-2 list-disc list-inside text-sm text-[var(--graphite)] leading-relaxed">
                  {project.knownLimitations.map((limitation, lIdx) => (
                    <li key={lIdx}>{limitation}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* 8. Stack Summary */}
            <section className="rule-t pt-12">
              <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-3">
                08 / Technology Stack
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.stack.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono px-3 py-1 bg-[var(--surface)] rule-all text-[var(--ink)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Footer Navigation */}
          <div className="rule-t pt-12 mt-16 flex items-center justify-between text-xs font-mono text-[var(--graphite)]">
            <Link href="/#work" className="editorial-link text-[var(--ink)]">
              &larr; Back to all projects
            </Link>
            <a href="mailto:rutvik.professional@gmail.com" className="editorial-link text-[var(--accent)]">
              Discuss this architecture &rarr;
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
