"use client";

/**
 * The demos' palette, in the demo panel's toolbar: a dropdown of the palettes the demos offer
 * (`demos/palettes.ts`), NSH Gallery (the one the demos are built with) first. A choice goes into
 * the demo app's storage and the panels load again — a running app cannot see a later write
 * (`src/lib/palette.ts` says why).
 */
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CONTROL_FOCUS, CONTROL_WIDTH } from "@/components/fd/toolbar";
import { choosePalette, onPaletteChange, storedPalette } from "@/lib/palette";

import { PALETTES, type PaletteId } from "../../../demos/palettes";

export function PaletteSwitch({ label = "Demo theme" }: { label?: string }) {
  // The stored choice is read after mount: it is the visitor's, not the build's.
  const [current, setCurrent] = useState<PaletteId>("nsh-gallery");
  // Chrome counts a click on a `<select>` as a focus to show, so the ring would stay on after a
  // choice made with the pointer until the next click elsewhere. A choice made with the pointer
  // lets the focus go; one made with the keys keeps it, ring and all.
  const byPointer = useRef(false);

  useEffect(() => {
    setCurrent(storedPalette());
    return onPaletteChange(() => setCurrent(storedPalette()));
  }, []);

  // The browser's own arrow sits where the platform puts it (hard against the edge on macOS):
  // it is hidden, and the chevron drawn here sits on the same inset as the label.
  return (
    <span className={`relative inline-flex ${CONTROL_WIDTH}`}>
      <select
        aria-label={label}
        title={label}
        value={current}
        onPointerDown={() => (byPointer.current = true)}
        onKeyDown={() => (byPointer.current = false)}
        onChange={(event) => {
          const id = event.currentTarget.value as PaletteId;
          choosePalette(id);
          setCurrent(id);
          if (byPointer.current) event.currentTarget.blur();
        }}
        className={`bg-fd-muted text-fd-foreground h-8 w-full appearance-none rounded-lg border pr-8 pl-2.5 text-sm ${CONTROL_FOCUS}`}
      >
        {PALETTES.map((palette) => (
          <option key={palette.id} value={palette.id}>
            {palette.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="text-fd-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2"
      />
    </span>
  );
}
