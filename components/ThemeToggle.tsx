"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const hasDark = document.documentElement.classList.contains("dark");
    setIsDark(hasDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="text-xs font-mono px-2 py-1 rule-all text-[var(--graphite)] inline-block opacity-50"
      >
        Theme
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="text-xs font-mono px-2.5 py-1 rule-all rounded-none bg-[var(--surface)] text-[var(--graphite)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer flex items-center gap-1.5"
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: isDark ? "var(--accent)" : "var(--graphite)" }}
      />
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
