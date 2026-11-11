import { signal } from "nsh";

/** Controlled/uncontrolled open flag shared by composition roots. */
export type OpenState = {
  open: () => boolean;
  setOpen: (next: boolean, reason?: string) => void;
};

/** What a root's `onOpenChange` gets. */
export type OpenChangeEvent<Reason extends string = string> = {
  open: boolean;
  reason: Reason;
};

/** The open flag of a composition root: the app's `open` when it gives one, else its own. */
export function createOpenState<Reason extends string = string>(options: {
  open?: boolean | null;
  defaultOpen?: boolean;
  onOpenChange?: (event: OpenChangeEvent<Reason>) => void;
}): OpenState {
  const uncontrolled = signal(options.defaultOpen ?? false);
  return {
    open: () => (options.open != null ? Boolean(options.open) : uncontrolled()),
    setOpen: (next, reason = "triggerPress") => {
      if (options.open == null) uncontrolled.set(next);
      options.onOpenChange?.({ open: next, reason: reason as Reason });
    },
  };
}
