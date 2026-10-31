/** Join a path onto Astro `base`. Handles BASE_URL with or without a trailing slash. */
export function withBase(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "") || "";
  const cleaned = path.replace(/^\/+/, "");
  if (!cleaned) return base || "/";
  return `${base}/${cleaned}`;
}
