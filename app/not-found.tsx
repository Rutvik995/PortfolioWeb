import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { profile } from "@/content/profile";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[70vh] flex items-center justify-center py-24">
        <div className="container-grid max-w-xl text-center space-y-6">
          <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
            State: 404 / Pruned Node
          </p>

          <h1 className="font-serif text-5xl md:text-6xl text-[var(--ink)] font-normal">
            Page not found.
          </h1>

          <p className="font-mono text-xs text-[var(--graphite)] leading-relaxed max-w-md mx-auto">
            {profile.dryWit.notfoundQuote}
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--accent)] transition-colors"
            >
              &larr; Return to Root State
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
