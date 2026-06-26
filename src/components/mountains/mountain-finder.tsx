"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type MountainFinderOption = {
  value: string;
  label: string;
  province: string;
  region: string;
  searchable: string;
};

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bmount\b/g, "mt")
    .replace(/\bmt\.?\b/g, "mt")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Props = {
  options: MountainFinderOption[];
  value: string;
  onChange: (value: string, label: string) => void;
  inputId?: string;
  placeholder?: string;
};

export function MountainFinder({
  options,
  value,
  onChange,
  inputId = "mountain-finder",
  placeholder = "Search mountain, province, or region...",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selected = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filtered = React.useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) {
      return options;
    }

    return options.filter((option) => option.searchable.includes(normalized));
  }, [options, query]);

  const listboxId = `${inputId}-listbox`;

  const selectOption = React.useCallback(
    (option: MountainFinderOption) => {
      onChange(option.value, option.label);
      setQuery("");
      setOpen(false);
      setHighlightIndex(0);
    },
    [onChange],
  );

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[highlightIndex];
      if (option) {
        selectOption(option);
      }
    }
  }

  const displayValue = open ? query : (selected?.label ?? "");

  return (
    <div ref={containerRef}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 border-input bg-white px-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100",
          selected && !open && "border-sky-300 bg-sky-50",
        )}
      >
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label="Search mountains"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={displayValue}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={handleInputKeyDown}
          className="h-14 w-full touch-manipulation border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
        />
      </div>

      {open ? (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Mountain search results"
          className="mt-2 max-h-[min(18rem,50vh)] overflow-y-auto rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No mountain matches that search yet.
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((option, index) => {
                const isHighlighted = index === highlightIndex;
                const isSelected = value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                    className={cn(
                      "flex w-full cursor-pointer flex-col rounded-xl px-3 py-2.5 text-left outline-none transition",
                      isHighlighted
                        ? "bg-sky-100 text-sky-950"
                        : isSelected
                          ? "bg-sky-50 text-foreground"
                          : "bg-white text-foreground hover:bg-slate-50",
                    )}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 text-xs text-slate-500">
                      {option.province}, {option.region}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
