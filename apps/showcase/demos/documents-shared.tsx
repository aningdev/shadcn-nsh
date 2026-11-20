// Shared by the Documents and workspaces demos: the short hint that changes with a pointer.
import { platform } from "nsh";

/** The sentence a pointer sees, and the one a finger sees. */
export function hint(touch: string, pointerText: string) {
  return platform.desktop ? pointerText : touch;
}
