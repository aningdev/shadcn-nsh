"use client";

import { useLocation } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { docsChannelHref } from "@/lib/base";

/**
 * Header version selector that lets visitors switch directly between the latest `release` docs
 * (`/`) and the `dev` docs from `main` (`/dev/`) while staying on the same relative page.
 */
export function VersionSwitch() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dev = import.meta.env.DOCS_CHANNEL === "dev";
  const version = `v${import.meta.env.DOCS_VERSION}`;
  const ahead = !dev && import.meta.env.DOCS_UNRELEASED;

  const items = [
    {
      id: "release" as const,
      label: version,
      ahead,
      detail: "Latest release",
      href: docsChannelHref("release", pathname),
      active: !dev,
    },
    {
      id: "dev" as const,
      label: "dev",
      ahead: false,
      detail: "main branch",
      href: docsChannelHref("dev", pathname),
      active: dev,
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Switch documentation version"
        className="text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-foreground focus-visible:ring-fd-ring inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs font-normal transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <span>{dev ? "dev" : version}</span>
        {ahead && (
          <>
            <span aria-hidden>+</span>
            <span className="sr-only"> with unreleased changes</span>
          </>
        )}
        <ChevronDown aria-hidden="true" className="size-3 opacity-70" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-48 min-w-44 p-1">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={item.active ? "true" : undefined}
              onClick={
                item.active
                  ? (event) => {
                      event.preventDefault();
                      setOpen(false);
                    }
                  : undefined
              }
              className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                item.active
                  ? "bg-fd-accent/60 text-fd-accent-foreground"
                  : "text-fd-popover-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-mono text-xs font-medium">
                  {item.label}
                  {item.ahead && <span aria-hidden>+</span>}
                </span>
                <span className="text-fd-muted-foreground text-[11px]">{item.detail}</span>
              </span>
              {item.active && (
                <Check aria-hidden="true" className="text-fd-primary size-3.5 shrink-0" />
              )}
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
