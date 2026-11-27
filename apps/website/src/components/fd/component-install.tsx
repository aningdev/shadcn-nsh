"use client";

import { useState } from "react";

import { CommandBlock } from "@/components/fd/command-block";
import { InstallTabs } from "@/components/fd/install-tabs";
import { CONTROL_FOCUS } from "@/components/fd/toolbar";

const NSHM_ADD = "nsh add github:aningdev/shadcn-nsh";

/**
 * Public shells whose PascalCase slug is not an export of that file. Everything else uses the
 * slug (`alert-dialog` → `AlertDialog`), which matches the module's main component.
 */
const IMPORT_NAMES: Record<string, string> = {
  "color-picker": "ColorPanel",
  "emoji-picker": "EmojiPanel",
  resizable: "ResizablePanelGroup",
};

function importName(slug: string): string {
  return (
    IMPORT_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}

/**
 * Shown on a component page, under the preview, without editing the component markdown.
 * CLI copies the file; `nshm` resolves the same source as a module.
 */
export function ComponentInstallBar({ slug }: { slug: string }) {
  const [mode, setMode] = useState<"cli" | "nshm">("cli");
  const name = importName(slug);

  return (
    <section
      aria-label="Installation"
      className="not-prose border-fd-border my-8 overflow-hidden rounded-xl border"
    >
      <div className="border-fd-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-medium">Installation (CLI / nshm)</p>
        <div role="tablist" aria-label="Installation mode" className="flex gap-1">
          {(
            [
              { id: "cli", label: "CLI" },
              { id: "nshm", label: "nshm" },
            ] as const
          ).map((item) => {
            const selected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`rounded-md px-3 py-1 text-sm font-medium ${CONTROL_FOCUS} ${
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
      </div>
      <div className="flex flex-col gap-3 p-4">
        {mode === "cli" ? (
          <InstallTabs command={`npx shadcn-nsh@latest add ${slug}`} />
        ) : (
          <>
            <CommandBlock code={NSHM_ADD} label="Copy" />
            <CommandBlock code={`import { ${name} } from "shadcn-nsh/${slug}";`} label="Copy" />
            <p className="text-fd-muted-foreground text-sm">
              The module exports the public shells of that file. Nothing is copied, and there is no
              npm package to install.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
