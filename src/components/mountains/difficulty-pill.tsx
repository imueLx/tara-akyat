"use client";

import { useEffect, useId, useRef, useState } from "react";

import { difficultyBand, difficultyTone } from "@/lib/difficulty";

type Props = {
  score: number;
  interactive?: boolean;
  note?: string;
  sourceUrl?: string;
};

const defaultDifficultyNote =
  "This score is a mountain-level estimate. Route condition, season, weather, and closures can make the actual hike easier or harder.";

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
}

export function DifficultyPill({ score, interactive = false, note, sourceUrl }: Props) {
  const safeScore = Math.max(1, Math.min(9, Math.round(score)));
  const band = difficultyBand(safeScore);
  const tone = difficultyTone(safeScore);
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const currentIndex = activeElement ? focusableElements.indexOf(activeElement) : -1;

      if (currentIndex === -1) {
        event.preventDefault();
        const fallbackIndex = event.shiftKey ? focusableElements.length - 1 : 0;
        focusableElements[fallbackIndex]?.focus();
        return;
      }

      if (!event.shiftKey && currentIndex === focusableElements.length - 1) {
        event.preventDefault();
        focusableElements[0]?.focus();
        return;
      }

      if (event.shiftKey && currentIndex === 0) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflowRef.current ?? "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus();
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  if (!interactive) {
    return (
      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${tone}`}>
        {safeScore}/9 {band}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${tone}`}
      >
        {safeScore}/9 {band}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <section
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            aria-describedby={`${dialogId}-description`}
            tabIndex={-1}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Difficulty note</p>
            <h3 id={`${dialogId}-title`} className="mt-2 text-lg font-semibold text-slate-900">
              {safeScore}/9 {band}
            </h3>
            <p id={`${dialogId}-description`} className="mt-2 text-sm leading-6 text-slate-700">
              {note ?? defaultDifficultyNote}
            </p>

            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Open difficulty source
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
            >
              Close
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
