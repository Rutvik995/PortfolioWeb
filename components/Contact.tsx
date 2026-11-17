"use client";

import { useState } from "react";
import { profile } from "@/content/profile";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    // Client-side confirmation state (can be hooked to a Server Action / Resend)
    setFormSubmitted(true);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>06 / DIRECT CHANNEL</span>
          <span>Rajkot (UTC +05:30)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Contact & Links (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-8">
            <h2 id="contact-title" className="display-hero text-[var(--ink)] font-normal">
              Have something worth automating?{" "}
              <em className="font-serif italic text-[var(--accent)] font-normal">
                Let&apos;s talk.
              </em>
            </h2>

            <p className="text-base md:text-lg text-[var(--graphite)] leading-relaxed max-w-xl">
              I am open to full-time AI/ML engineering roles, agentic system architect contracts,
              and select freelance engineering projects.
            </p>

            {/* Prominent Copy-to-Clipboard Email Action */}
            <div className="paper-card p-6 rule-all">
              <span className="text-xs font-mono uppercase text-[var(--graphite)] tracking-wider block mb-2">
                Primary Direct Email
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <a
                  href={`mailto:${profile.email}`}
                  className="font-serif text-2xl md:text-3xl text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] break-all"
                >
                  {profile.email}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs font-mono px-4 py-2 rule-all bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[var(--pine)]" />
                      <span>Copied to clipboard</span>
                    </>
                  ) : (
                    <span>[ Copy Address ]</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Outbound Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
              <div className="p-4 rule-all bg-[var(--surface)]">
                <span className="text-[var(--graphite)] block mb-1">Source Code</span>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-link font-medium text-[var(--ink)]"
                >
                  github.com/Rutvik995 &rarr;
                </a>
              </div>

              <div className="p-4 rule-all bg-[var(--surface)]">
                <span className="text-[var(--graphite)] block mb-1">Network</span>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-link font-medium text-[var(--ink)]"
                >
                  linkedin/rutvikbhanderi &rarr;
                </a>
              </div>

              <div className="p-4 rule-all bg-[var(--surface)]">
                <span className="text-[var(--graphite)] block mb-1">Curriculum Vitae</span>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-link font-medium text-[var(--accent)]"
                >
                  Download PDF &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Minimal Clean Contact Form (Cols 8-12) */}
          <div className="lg:col-span-5">
            <div className="paper-card p-6 md:p-8 rule-all">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-6 rule-b pb-3">
                Send a Dispatch
              </h3>

              {formSubmitted ? (
                <div className="p-6 bg-[var(--code-bg)] text-xs font-mono text-[var(--ink)] leading-relaxed space-y-3">
                  <p className="font-semibold text-sm text-[var(--pine)]">
                    &check; Dispatch Received
                  </p>
                  <p>
                    Thank you. Your message has been logged. You can also reach me directly at{" "}
                    <a href={`mailto:${profile.email}`} className="underline text-[var(--accent)]">
                      {profile.email}
                    </a>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="editorial-link text-[11px] text-[var(--graphite)]"
                  >
                    [ Send another message ]
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
                  <div>
                    <label htmlFor="name" className="block text-[var(--graphite)] mb-1.5 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 bg-[var(--bg)] rule-all text-[var(--ink)] font-sans text-sm focus:outline-none focus:border-[var(--accent)] rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[var(--graphite)] mb-1.5 uppercase tracking-wider">
                      Your Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full p-2.5 bg-[var(--bg)] rule-all text-[var(--ink)] font-sans text-sm focus:outline-none focus:border-[var(--accent)] rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[var(--graphite)] mb-1.5 uppercase tracking-wider">
                      Project Objective / Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about what you are building or looking to automate..."
                      className="w-full p-2.5 bg-[var(--bg)] rule-all text-[var(--ink)] font-sans text-sm focus:outline-none focus:border-[var(--accent)] rounded-none resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[var(--ink)] text-[var(--bg)] text-xs font-mono hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer rounded-none uppercase tracking-wider font-semibold"
                  >
                    Transmit Dispatch &rarr;
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
