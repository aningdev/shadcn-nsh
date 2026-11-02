import { signal, type Signal } from "nsh";

/** Controlled/uncontrolled open flag shared by composition roots. */
export type OpenState = {
  open: () => boolean;
  setOpen: (next: boolean, reason?: string) => void;
};

export function createOpenState(options: {
  open?: boolean | null;
  defaultOpen?: boolean;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}): OpenState {
  const uncontrolled = signal(options.defaultOpen ?? false);
  return {
    open: () => (options.open != null ? Boolean(options.open) : uncontrolled()),
    setOpen: (next, reason = "triggerPress") => {
      if (options.open == null) uncontrolled.set(next);
      options.onOpenChange?.({ open: next, reason });
    },
  };
}

/** Mutable slot filled by a Trigger part before Content reads it. */
export type TriggerSlot = {
  get: () => (() => unknown) | undefined;
  set: (accessor: () => unknown) => void;
};

export function createTriggerSlot(): TriggerSlot {
  let accessor: (() => unknown) | undefined;
  return {
    get: () => accessor,
    set: (next) => {
      accessor = next;
    },
  };
}

export type ItemRegistry<T extends { value: string }> = {
  items: Signal<T[]>;
  register: (item: T) => void;
  unregister: (value: string) => void;
};

export function createItemRegistry<T extends { value: string }>(
  initial: T[] = [],
): ItemRegistry<T> {
  const items = signal<T[]>(initial, { equals: false });
  return {
    items,
    register: (item) => {
      items.update((list) => {
        const next = list.filter((i) => i.value !== item.value);
        next.push(item);
        return next;
      });
    },
    unregister: (value) => {
      items.update((list) => list.filter((i) => i.value !== value));
    },
  };
}
