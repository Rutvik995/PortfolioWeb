"use client";

import { useState } from "react";
import { notes } from "@/content/notes";

export default function Writing() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const toggleNote = (slug: string) => {
    setActiveSlug(activeSlug === slug ? null : slug);
  };

  return (
    <section id="notes" aria-labelledby="notes-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>06 / TECHNICAL NOTES &amp; ESSAYS</span>
          <span>Field Notes from Cortex</span>
        </div>

        <div className="max-w-2xl mb-12">
          <h2 id="notes-title" className="display-section text-[var(--ink)] mb-4 font-normal">
            Lessons from the <em className="italic text-[var(--accent)]">compiler boundary.</em>
          </h2>
          <p className="text-base text-[var(--graphite)] leading-relaxed">
            Practical reflections on multi-agent orchestrations, context budgeting, and unit-testing
            stochastic models without bleeding API credits.
          </p>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {notes.map((note) => {
            const isOpen = activeSlug === note.slug;
            return (
              <article
                key={note.slug}
                className="paper-card p-6 md:p-8 rule-all transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-serif text-2xl text-[var(--ink)] font-normal">
                    <button
                      type="button"
                      onClick={() => toggleNote(note.slug)}
                      className="text-left hover:text-[var(--accent)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
                    >
                      {note.title}
                    </button>
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--graphite)]">
                    <span>{note.date}</span>
                    <span className="text-[var(--rule)]">&middot;</span>
                    <span>{note.readTime}</span>
                  </div>
                </div>

                <p className="text-sm text-[var(--graphite)] leading-relaxed mb-4 max-w-3xl">
                  {note.summary}
                </p>

                {/* Expanded Full Article View */}
                {isOpen && (
                  <div className="rule-t pt-6 mt-6 max-w-none text-sm font-sans text-[var(--ink)] leading-relaxed whitespace-pre-line">
                    {note.content}
                  </div>
                )}

                <div className="rule-t pt-3 mt-4 flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => toggleNote(note.slug)}
                    className="editorial-link font-medium text-[var(--ink)] cursor-pointer"
                  >
                    {isOpen ? "[ Collapse technical note ]" : "Read full essay &rarr;"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
