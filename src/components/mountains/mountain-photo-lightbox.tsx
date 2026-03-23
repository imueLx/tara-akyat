"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  name: string;
  imageUrl: string;
  imageSourceUrl?: string | null;
  objectPosition: string;
};

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
}

export function MountainPhotoLightbox({ name, imageUrl, imageSourceUrl, objectPosition }: Props) {
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        className="group relative mb-4 block h-52 w-full overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 sm:h-64"
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 960px"
          quality={75}
          style={{ objectPosition }}
        />
        <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/8" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
          onClick={() => setIsOpen(false)}
        >
          <section
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            tabIndex={-1}
            className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3">
              <h2 id={`${dialogId}-title`} className="text-sm font-semibold text-slate-900 sm:text-base">
                {name}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Close
              </button>
            </div>

            <div className="relative aspect-[4/3] max-h-[75vh] overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-contain"
                sizes="100vw"
                quality={80}
              />
            </div>

            {imageSourceUrl ? (
              <a
                href={imageSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Open image source
              </a>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
