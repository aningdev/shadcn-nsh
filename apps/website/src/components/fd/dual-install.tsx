"use client";

import { useState } from "react";

import { CommandBlock } from "@/components/fd/command-block";
import { InstallTabs } from "@/components/fd/install-tabs";
import { CONTROL_FOCUS } from "@/components/fd/toolbar";

const NSHM_ADD = "nsh add github:aningdev/shadcn-nsh";

const MODES = [
  { id: "nshm", label: "nshm" },
  { id: "cli", label: "CLI" },
] as const;

type Mode = (typeof MODES)[number]["id"];

/**
 * The home page's install switch: TSX `nshm` (one command, copy) or the copy-into-app CLI
 * (`InstallTabs`, npm / pnpm / bun). The CLI tabs keep the shared package-manager group.
 */
export function DualInstallTabs({
  cliCommand = "npx shadcn-nsh@latest init",
}: {
  cliCommand?: string;
}) {
  const [mode, setMode] = useState<Mode>("nshm");

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Install mode" className="flex flex-wrap gap-1">
        {MODES.map((item) => {
          const selected = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${CONTROL_FOCUS} ${
                selected
                  ? "bg-fd-primary text-fd-primary-foreground"
                  : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
              }`}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {mode === "nshm" ? (
        <CommandBlock code={NSHM_ADD} label="Copy" />
      ) : (
        <InstallTabs command={cliCommand} />
      )}
    </div>
  );
}
