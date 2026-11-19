"use client";

/**
 * `/docs/components/coverage`: one table per official set — shadcn/ui's components, the `nsh/base`
 * elements and the NSH primitives — saying what this library has for each row. Nothing here is
 * written by hand: the rows are `src/lib/official.ts`, the pages they point at are the generated
 * component list, and the state of a row is `stateOf`. `bun run check:pages` holds both sides to
 * `references/`.
 *
 * The three tables and their headings' prose stay in `content/docs/components/coverage.mdx`, which
 * asks for each table by `group`; this module only draws the rows.
 */
import type { ReactNode } from "react";

import { components } from "@/lib/components";
import {
  NSH_ELEMENTS,
  SHADCN_UI,
  nshElementUrl,
  shadcnUrl,
  stateOf,
  type OfficialEntry,
  type OfficialState,
} from "@/lib/official";

const pages = new Set(components.map((component) => component.slug));
const titleOf = new Map(components.map((component) => [component.slug, component.title]));

const STATE_LABELS: Record<OfficialState, string> = {
  covered: "Covered",
  planned: "Planned",
  missing: "Missing",
  "not-doing": "Not doing",
  primitive: "Primitive",
};

/** Green when nothing is asked of this library, yellow for a gap still open, red for never. The
 * dot's colour is the theme's: `--color-fd-success` and its neighbours (fumadocs's own roles). */
const DOT: Record<OfficialState, string> = {
  covered: "bg-fd-success",
  primitive: "bg-fd-success",
  planned: "bg-fd-warning",
  missing: "bg-fd-warning",
  "not-doing": "bg-fd-error",
};

type Row = { entry: OfficialEntry; state: OfficialState; served: string[] };

const rows = (entries: readonly OfficialEntry[]): Row[] =>
  entries.map((entry) => ({
    entry,
    state: stateOf(entry, pages),
    served: entry.ours.filter((slug) => pages.has(slug)),
  }));

const tally = (list: Row[]) => {
  const counts = new Map<OfficialState, number>();
  for (const row of list) counts.set(row.state, (counts.get(row.state) ?? 0) + 1);
  return [...counts].map(([state, n]) => `${n} ${STATE_LABELS[state].toLowerCase()}`);
};

/** The official set a table answers for: shadcn/ui, an NSH group, or `shadcn`. */
export type CoverageGroup = "shadcn" | "base" | "primitives";

function entriesOf(group: CoverageGroup): readonly OfficialEntry[] {
  if (group === "shadcn") return SHADCN_UI;
  return NSH_ELEMENTS.filter((entry) => entry.group === group);
}

/** What a row's first column links to: the official page of the row's own set. */
function officialHref(group: CoverageGroup, id: string): string {
  return group === "shadcn" ? shadcnUrl(id) : nshElementUrl(id);
}

function Served({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return <>—</>;
  return (
    <>
      {slugs.map((slug, index) => (
        <span key={slug}>
          {index > 0 ? ", " : null}
          <a href={`/docs/components/${slug}`}>{titleOf.get(slug)}</a>
        </span>
      ))}
    </>
  );
}

function State({ row }: { row: Row }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`mr-1.5 inline-block size-2 rounded-full align-middle ${DOT[row.state]}`}
      />
      {STATE_LABELS[row.state]}
      {row.entry.note ? (
        <>
          {" "}
          — <span className="text-fd-muted-foreground">{row.entry.note}</span>
        </>
      ) : null}
    </>
  );
}

/** The line each table opens with, after the counts: what the table shows beyond its rows. */
const LEAD: Record<CoverageGroup, ReactNode> = {
  shadcn: (
    <>
      A renamed one shows the rename in the second column — <code>dropdown-menu</code> is{" "}
      <code>menu</code>, <code>sonner</code> is <code>toast</code>, <code>chart</code> is{" "}
      <code>plot</code>.
    </>
  ),
  base: (
    <>
      One element can give more than one page — <code>menu</code> also gives the context menu,
      <code>button</code> the pressable.
    </>
  ),
  primitives: (
    <>
      These are the elements every component is drawn with; an app uses them directly, and this
      library wraps none of them.
    </>
  ),
};

export function CoverageTable({ group }: { group: CoverageGroup }) {
  const list = rows(entriesOf(group));
  const primitives = group === "primitives";
  const noun =
    group === "shadcn" ? (
      "components"
    ) : group === "base" ? (
      <>
        elements of <code>nsh/base</code>
      </>
    ) : (
      "primitives"
    );

  return (
    <>
      <p>
        {list.length} {noun}: {tally(list).join(", ")}. {LEAD[group]}
      </p>
      <table>
        <thead>
          <tr>
            <th>{group === "shadcn" ? "shadcn/ui" : "NSH"}</th>
            <th>Here</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr key={row.entry.id}>
              <td>
                <a href={officialHref(group, row.entry.id)} rel="noopener noreferrer">
                  {row.entry.id}
                </a>
              </td>
              <td>{primitives ? "—" : <Served slugs={row.served} />}</td>
              <td>
                <State row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
