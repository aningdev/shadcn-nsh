/** One line of a line-by-line comparison: `same` on both sides, `del` only before, `add` only after. */
export type DiffLine = {
  kind: "same" | "add" | "del";
  text: string;
};

/**
 * Compare two texts line by line (a longest-common-subsequence alignment).
 *
 * Long enough for a component file (a few hundred lines) and dependency-free,
 * which is what this CLI keeps to. The output is the whole of both texts in
 * order: unchanged lines once, a removed line before the added ones that
 * replace it.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;

  // `length[i][j]`: lines `a[i…]` and `b[j…]` have in common.
  const length: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      length[i][j] =
        a[i] === b[j] ? length[i + 1][j + 1] + 1 : Math.max(length[i + 1][j], length[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: "same", text: a[i] });
      i += 1;
      j += 1;
    } else if (length[i + 1][j] >= length[i][j + 1]) {
      out.push({ kind: "del", text: a[i] });
      i += 1;
    } else {
      out.push({ kind: "add", text: b[j] });
      j += 1;
    }
  }
  while (i < n) out.push({ kind: "del", text: a[i++] });
  while (j < m) out.push({ kind: "add", text: b[j++] });
  return out;
}

/** How many lines each side has alone. */
export function countChanges(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.kind === "add") added += 1;
    else if (line.kind === "del") removed += 1;
  }
  return { added, removed };
}

/** `(+2 -1)`, the summary `add` and `diff` show next to a path. */
export function changeSummary(added: number, removed: number) {
  return `(+${added} -${removed})`;
}

/** The comparison as text: `- ` removed, `+ ` added, the rest unchanged. */
export function formatDiff(lines: DiffLine[]) {
  return lines
    .map((line) =>
      line.kind === "add"
        ? `+ ${line.text}`
        : line.kind === "del"
          ? `- ${line.text}`
          : `  ${line.text}`,
    )
    .join("\n");
}
