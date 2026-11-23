import { createFileRoute } from "@tanstack/react-router";

import { sitePathname } from "@/lib/base";
import { docsLlms } from "@/lib/source";

export const Route = createFileRoute("/docs/{$}.md")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await docsLlms.serve(sitePathname(new URL(request.url).pathname))) ??
        new Response(null, { status: 404 }),
    },
  },
});
