"use client";

import * as React from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

import { THEME_ATTRIBUTE, type ThemeMode, isThemeMode } from "@/lib/theme";

function useDocumentTheme(): ThemeMode {
  const [theme, setTheme] = React.useState<ThemeMode>("light");

  React.useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const value = root.getAttribute(THEME_ATTRIBUTE);
      if (isThemeMode(value)) {
        setTheme(value);
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function Toaster(props: ToasterProps) {
  const theme = useDocumentTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
}
