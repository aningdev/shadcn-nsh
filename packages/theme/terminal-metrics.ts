/**
 * Terminal idiom sizes for the standard control scale.
 *
 * `controlHeight` and `metrics` in `theme.ts` call these so a terminal reads the character grid
 * while every other idiom keeps the active tier's object unchanged.
 */

/** One tier's control heights (`sm`, `md`, `lg`). */
export interface TierHeights {
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
}

/** One tier's control spacing. */
export interface TierControlSpacing {
  readonly padding: number;
  readonly gap: number;
}

/**
 * Heights a control draws. In the terminal every step is one character row; otherwise the active
 * tier's heights, the same object.
 */
export function controlHeights<T extends TierHeights>(
  inTerminal: boolean,
  tierHeights: T,
  row: number,
): T | TierHeights {
  if (!inTerminal) return tierHeights;
  return { sm: row, md: row, lg: row };
}

/**
 * Padding and gap a control draws. In the terminal both are one character column; otherwise the
 * active tier's spacing, the same object.
 */
export function controlSpacing<T extends TierControlSpacing>(
  inTerminal: boolean,
  tierControl: T,
  column: number,
): T | TierControlSpacing {
  if (!inTerminal) return tierControl;
  return { padding: column, gap: column };
}
