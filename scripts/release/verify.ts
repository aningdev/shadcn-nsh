/**
 * Whether a release reached everyone (CONTRIBUTING.md, Releasing): `bun run release:verify vX.Y.Z`
 * after pushing the tag. It waits until every check passes or the time runs out, so a release is
 * one command to watch instead of a loop of `sleep`s and `gh run view`s:
 *
 * - the tag's workflow runs (`Publish shadcn-nsh CLI`, `Deploy docs`) finished and succeeded;
 * - npm has the version under its dist-tag (`latest`, or `next` for a pre-release);
 * - the GitHub release exists and is not a draft;
 * - the docs root names the version, and `/dev/` answers.
 *
 * `--wait <minutes>` (default 20) bounds the wait; `--wait 0` checks once. Reading the runs and the
 * release uses `gh`, logged in as you.
 */
import { $ } from "bun";

const REPO = "aningdev/shadcn-nsh";
const PACKAGE = "shadcn-nsh";
const SITE = "https://shadcn-nsh.aning.dev/";
const POLL_MS = 15_000;

export type Status = { ok: boolean; detail: string };
export type Check = { name: string; run: () => Promise<Status> };

/** The npm dist-tag a version is published under (publish-cli.yml). */
export function distTag(version: string): string {
  return version.includes("-") ? "next" : "latest";
}

/** Whether a page's HTML carries the header's version label for `tag` (version-switch.tsx). */
export function servesVersion(html: string, tag: string): boolean {
  return html.includes(`>${tag}<`);
}

type Run = { name: string; status: string; conclusion: string; url: string };

/** The tag's runs, by workflow: done when every one completed, failed when one did not succeed. */
export function runsStatus(runs: Run[], tag: string): Status {
  if (runs.length === 0) return { ok: false, detail: `no workflow run for ${tag} yet` };
  const pending = runs.filter((r) => r.status !== "completed");
  const failed = runs.filter((r) => r.status === "completed" && r.conclusion !== "success");
  const list = (rs: Run[]) =>
    rs.map((r) => `${r.name} (${r.conclusion || r.status}) ${r.url}`).join(", ");
  if (failed.length > 0) return { ok: false, detail: `failed: ${list(failed)}` };
  if (pending.length > 0) return { ok: false, detail: `running: ${list(pending)}` };
  return { ok: true, detail: runs.map((r) => r.name).join(", ") };
}

function checks(tag: string): Check[] {
  const version = tag.slice(1);
  return [
    {
      name: "workflow runs",
      run: async () => {
        const out =
          await $`gh run list -R ${REPO} --branch ${tag} --event push --json name,status,conclusion,url`
            .quiet()
            .nothrow();
        if (out.exitCode !== 0) return { ok: false, detail: out.stderr.toString().trim() };
        return runsStatus(JSON.parse(out.stdout.toString()) as Run[], tag);
      },
    },
    {
      name: "npm",
      run: async () => {
        const res = await fetch(`https://registry.npmjs.org/${PACKAGE}`, {
          headers: { accept: "application/vnd.npm.install-v1+json" },
        });
        if (!res.ok) return { ok: false, detail: `registry answered ${res.status}` };
        const tags = ((await res.json()) as { "dist-tags": Record<string, string> })["dist-tags"];
        const tagName = distTag(version);
        const at = tags[tagName];
        return { ok: at === version, detail: `${tagName} is ${at}` };
      },
    },
    {
      name: "GitHub release",
      run: async () => {
        const out = await $`gh release view ${tag} -R ${REPO} --json isDraft,url`.quiet().nothrow();
        if (out.exitCode !== 0) return { ok: false, detail: "no release yet" };
        const release = JSON.parse(out.stdout.toString()) as { isDraft: boolean; url: string };
        return {
          ok: !release.isDraft,
          detail: release.isDraft ? `draft ${release.url}` : release.url,
        };
      },
    },
    {
      name: "docs root",
      run: async () => {
        const res = await fetch(`${SITE}?release=${Date.now()}`);
        if (!res.ok) return { ok: false, detail: `${SITE} answered ${res.status}` };
        const ok = servesVersion(await res.text(), tag);
        return { ok, detail: ok ? `${SITE} serves ${tag}` : `${SITE} does not serve ${tag} yet` };
      },
    },
    {
      name: "docs /dev/",
      run: async () => {
        const res = await fetch(`${SITE}dev/?release=${Date.now()}`);
        return { ok: res.ok, detail: `${SITE}dev/ answered ${res.status}` };
      },
    },
  ];
}

async function main(argv: string[]): Promise<number> {
  const tag = argv.find((a) => /^v\d+\.\d+\.\d+/.test(a));
  const waitAt = argv.indexOf("--wait");
  const minutes = waitAt === -1 ? 20 : Number(argv[waitAt + 1]);
  if (!tag || !Number.isFinite(minutes) || minutes < 0) {
    console.error("usage: bun run release:verify vX.Y.Z [--wait <minutes>]");
    return 2;
  }
  const deadline = Date.now() + minutes * 60_000;
  const left = checks(tag);
  for (;;) {
    const results = await Promise.all(
      left.map(async (c) => ({
        c,
        s: await c.run().catch((e: Error) => ({ ok: false, detail: e.message })),
      })),
    );
    for (const { c, s } of results) {
      if (s.ok) {
        console.log(`ok    ${c.name}: ${s.detail}`);
        left.splice(left.indexOf(c), 1);
      }
    }
    // A failed run will not turn green by waiting.
    const failed = results.find(
      ({ c, s }) => c.name === "workflow runs" && s.detail.startsWith("failed"),
    );
    if (left.length === 0) return 0;
    if (failed || Date.now() + POLL_MS > deadline) {
      for (const { c, s } of results.filter(({ s }) => !s.ok))
        console.error(`FAIL  ${c.name}: ${s.detail}`);
      return 1;
    }
    await Bun.sleep(POLL_MS);
  }
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
