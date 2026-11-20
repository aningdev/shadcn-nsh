// The contacts of the long-list scenes (`item`, from the Gallery's `Lists.tsx`): demo content, not
// a component, so it does not go into the registry.

/** First name, last name, and what each is known for. */
const people = [
  ["Ada", "Lovelace", "Analytical Engine notes"],
  ["Alan", "Kay", "Smalltalk"],
  ["Barbara", "Liskov", "CLU, substitution"],
  ["Brian", "Kernighan", "AWK, The C book"],
  ["Claude", "Shannon", "Information theory"],
  ["Dennis", "Ritchie", "C, Unix"],
  ["Donald", "Knuth", "TeX, TAOCP"],
  ["Edsger", "Dijkstra", "Shortest paths"],
  ["Frances", "Allen", "Optimizing compilers"],
  ["Grace", "Hopper", "COBOL, the first compiler"],
  ["Guido", "van Rossum", "Python"],
  ["Ken", "Thompson", "Unix, UTF-8"],
  ["Linus", "Torvalds", "Linux, Git"],
  ["Margaret", "Hamilton", "Apollo flight software"],
  ["Niklaus", "Wirth", "Pascal, Oberon"],
] as const;

/** A section heading: the letter and how many names it holds. */
export type ContactHeading = { heading: string; count: number };

/** A contact. */
export type Contact = { name: string; note: string };

export type ContactRow = ContactHeading | Contact;

/** The rows: each letter's heading, then its contacts, and the headings' indices (the ones that stick). */
export function contactRows(): { rows: ContactRow[]; headings: number[] } {
  const rows: ContactRow[] = [];
  const headings: number[] = [];
  for (const letter of [...new Set(people.map((p) => p[0][0]))]) {
    const group = people.filter((p) => p[0][0] === letter);
    headings.push(rows.length);
    rows.push({ heading: letter, count: group.length });
    for (const [first, last, note] of group) rows.push({ name: `${first} ${last}`, note });
  }
  return { rows, headings };
}
