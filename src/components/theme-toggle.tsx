"use client";

import { useEffect, useState } from "react";

import { DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY, isThemeMode, type ThemeMode } from "@/lib/theme";

function readThemeFromDocument(): ThemeMode {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isThemeMode(currentTheme) ? currentTheme : DEFAULT_THEME;
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, theme);
  root.style.colorScheme = theme;
  root.classList.toggle("dark", theme === "dark");

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures in private browsing or restricted environments.
  }
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.8v1.8" />
      <path d="M10 15.4v1.8" />
      <path d="m4.9 4.9 1.3 1.3" />
      <path d="m13.8 13.8 1.3 1.3" />
      <path d="M2.8 10h1.8" />
      <path d="M15.4 10h1.8" />
      <path d="m4.9 15.1 1.3-1.3" />
      <path d="m13.8 6.2 1.3-1.3" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.9 3.1a6.9 6.9 0 1 0 2.9 12.6A6.2 6.2 0 0 1 12 17.9 6.9 6.9 0 0 1 5.1 11c0-3.2 2.2-5.9 5.3-6.6a7.5 7.5 0 0 0 3.5-1.3Z" />
      <path d="M14.6 5.1h.01M16.7 7.2h.01" />
    </svg>
  );
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(readThemeFromDocument());
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const buttonLabel = mounted ? `Switch to ${nextTheme} mode` : "Theme toggle";
  const buttonTone = isDark
    ? "border-slate-800 bg-slate-950 text-slate-50 shadow-[0_10px_24px_rgba(2,6,23,0.24)]"
    : "border-slate-200 bg-white text-slate-700 shadow-sm";
  const iconTone = isDark ? "text-slate-100" : "text-slate-700";
  const accentTone = isDark ? "text-sky-300/80" : "text-amber-500";

  function onToggle() {
    const updatedTheme = isDark ? "light" : "dark";
    applyTheme(updatedTheme);
    setTheme(updatedTheme);
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!mounted}
      aria-label={buttonLabel}
      aria-pressed={isDark}
      title={buttonLabel}
      className={`group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-default disabled:opacity-100 ${mounted ? "opacity-100" : "opacity-0"} ${buttonTone}`}
    >
      <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_55%)]" aria-hidden="true" />
      <span className={`relative z-10 transition duration-200 group-hover:scale-[1.04] ${iconTone}`} aria-hidden="true">
        {isDark ? (
          <span className="relative block">
            <MoonIcon className="h-4.5 w-4.5" />
            <span className={`pointer-events-none absolute -right-1 -top-1 ${accentTone}`}>
              <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 4.2 11 7l2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1 1-2.8Z" />
              </svg>
            </span>
          </span>
        ) : (
          <SunIcon className={`h-4.5 w-4.5 ${accentTone}`} />
        )}
      </span>
    </button>
  );
}
