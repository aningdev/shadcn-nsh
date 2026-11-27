"use client";

import { useState } from "react";

import { CONTROL_FOCUS } from "@/components/fd/toolbar";

/** A command or snippet with one copy control. The text is the accessible name's object. */
export function CommandBlock({ code, label = "Copy" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="border-fd-border bg-fd-secondary/40 flex items-start gap-3 rounded-lg border px-3 py-2.5">
      <pre className="m-0 min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-6">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        className={`text-fd-foreground hover:bg-fd-accent shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${CONTROL_FOCUS}`}
        onClick={() => {
          void navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? "Copied" : label}
      </button>
    </div>
  );
}
