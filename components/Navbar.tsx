"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Approach", href: "#approach" },
  { label: "Stack", href: "#stack" },
  { label: "About", href: "#about" },
  { label: "Notes", href: "#notes" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-none rule-b transition-colors">
      <div className="container-grid">
        <nav
          className="flex items-center justify-between h-14 md:h-16"
          aria-label="Main Navigation"
        >
          {/* Wordmark (Left) */}
          <Link
            href="/"
            className="font-serif text-lg md:text-xl font-normal tracking-tight text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Rutvik Bhanderi
          </Link>

          {/* Desktop Nav Links (Center) */}
          <div className="hidden md:flex items-center gap-7 text-sm font-sans text-[var(--graphite)]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[var(--ink)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions (Right) */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <a
              href="#contact"
              className="hidden sm:inline-block text-xs font-mono editorial-link text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              Get in touch &rarr;
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden text-xs font-mono px-2 py-1 rule-all text-[var(--graphite)] hover:text-[var(--ink)]"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 rule-t flex flex-col gap-3 font-sans text-sm text-[var(--graphite)]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[var(--ink)]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 font-mono text-xs text-[var(--accent)] underline"
            >
              Get in touch &rarr;
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
