import { profile } from "@/content/profile";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-[var(--bg)] transition-colors">
      <div className="container-grid">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs font-mono text-[var(--graphite)]">
          {/* Left: Copyright & Witty Line */}
          <div>
            <p className="text-[var(--ink)] font-sans text-sm mb-1">
              &copy; {currentYear} Rutvik Bhanderi. Built in Rajkot, India.
            </p>
            <p className="text-[11px] text-[var(--graphite)]">
              {profile.dryWit.footerNote}
            </p>
          </div>

          {/* Right: Anchors & Back-to-Top */}
          <div className="flex items-center gap-6">
            <a
              href="#intro"
              className="editorial-link text-[var(--ink)] hover:text-[var(--accent)]"
            >
              Back to top &uarr;
            </a>
            <span className="text-[var(--rule)]" aria-hidden="true">|</span>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ink)] transition-colors"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ink)] transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
