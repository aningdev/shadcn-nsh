/** One component with a docs page. @see components.generated.ts */
export type ComponentDoc = {
  /** The registry item's name, which is the page's file name. */
  slug: string;
  title: string;
  /** Path under https://nsh.dev/elements/; null for a piece with no nsh/base element. */
  nshElement: string | null;
  description: string;
};
