// A copy's confirmation: the check a copy button shows for a moment, and the timer that takes it back.

import { cleanup, signal } from "nsh";

/** How long a copy's confirmation stays up, in milliseconds. */
export const COPIED_FOR = 2000;

/** What `useCopied` hands a copy button. */
export interface Copied {
  /** Whether the copy just happened: the label and the glyph read it. */
  readonly copied: () => boolean;
  /** The text is on the clipboard: show the confirmation for `COPIED_FOR`, then take it back. */
  readonly mark: () => void;
}

/**
 * A copy's confirmation. `mark()` flips it on and schedules it off; a second mark restarts the
 * wait. The timer is cleared with the component, so a mark never lands after it is gone.
 */
export function useCopied(): Copied {
  const copied = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => clearTimeout(timer));
  return {
    copied,
    mark: () => {
      copied.set(true);
      clearTimeout(timer);
      timer = setTimeout(() => copied.set(false), COPIED_FOR);
    },
  };
}
