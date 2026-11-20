import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

import { DemoPanel } from "@/components/fd/demo-panel";
import { InstallTabs } from "@/components/fd/install-tabs";
import { components } from "@/lib/components";
import {
  baseOptions,
  NSH_SITE_URL,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "@/lib/layout.shared";

import { PALETTES } from "../../demos/palettes";

/**
 * The site's front page: what this is, how to start, and the theme showcase running live. It is
 * Fumadocs' home layout (the nav bar, no sidebar); the docs start one link away. The numbers are
 * read from the generated component list, so the page never claims a count by hand.
 */
export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: SITE_TITLE }, { name: "description", content: SITE_DESCRIPTION }],
  }),
});

const FEATURES: { title: string; body: ReactNode }[] = [
  {
    title: "Copy into your app",
    body: (
      <>
        <code>add</code> writes the component, its theme and the looks it imports into your app,
        then forgets them. No runtime package to keep in sync: the files are yours to change.
      </>
    ),
  },
  {
    title: "Native behavior",
    body: (
      <>
        Keyboard, focus, accessibility and platform idioms come from <code>nsh/base</code>. The
        components only decide how things look.
      </>
    ),
  },
  {
    title: "The look is data",
    body: (
      <>
        Colors and surfaces are read from <code>theme.json</code> and <code>finishes.json</code>,
        never written in a component, so one theme swaps the whole look — even while the app runs.
      </>
    ),
  },
  {
    title: "Phone, desktop, terminal",
    body: (
      <>
        Each component adapts its density and controls to a touch screen, a pointer and a keyboard,
        and draws in the terminal too.
      </>
    ),
  },
  {
    title: "The shadcn/ui shape",
    body: (
      <>
        A registry, a CLI and one file per component, with the composition and names you know from
        shadcn/ui: <code>Trigger</code>, <code>Content</code>, <code>Item</code>.
      </>
    ),
  },
  {
    title: "Every page is live",
    body: (
      <>
        Each component page runs its demo in the browser through NSH&apos;s web target, in the phone
        or the desktop layout and in any of the themes.
      </>
    ),
  },
];

function Home() {
  return (
    <HomeLayout
      {...baseOptions()}
      // Router paths: the layout renders these through the router's `Link`, which adds the
      // basepath itself — as the sidebar's `/docs/…` from `source.ts`.
      links={[
        { text: "Docs", url: "/docs/getting-started" },
        { text: "Components", url: "/docs/components" },
        { text: "Themes", url: "/docs/themes" },
      ]}
    >
      <main className="mx-auto flex w-full max-w-(--fd-layout-width) min-w-0 flex-col gap-20 px-4 py-16 md:px-8 md:py-24">
        <section className="flex flex-col items-center gap-6 text-center">
          <a
            href={NSH_SITE_URL}
            className="border-fd-border text-fd-muted-foreground hover:text-fd-foreground rounded-full border px-3 py-1 text-xs transition-colors"
          >
            Built on Native Shell ↗
          </a>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Native components you copy into your app
          </h1>
          <p className="text-fd-muted-foreground max-w-2xl text-lg text-balance">
            Styled UI for NSH, built on <code>nsh/base</code> and handed to you as files you own —
            what shadcn/ui gives React.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/docs/getting-started"
              className="bg-fd-primary text-fd-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get started
            </a>
            <a
              href="/docs/components"
              className="border-fd-border bg-fd-card hover:bg-fd-accent rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Browse components
            </a>
          </div>
          <div className="w-full max-w-xl text-left">
            <InstallTabs command="npx shadcn-nsh@latest init" />
          </div>
          <dl className="text-fd-muted-foreground flex gap-10 text-sm">
            <Stat value={components.length} label="components" />
            <Stat value={PALETTES.length} label="themes" />
          </dl>
        </section>

        <section className="flex flex-col gap-6">
          <Heading
            title="See it running"
            body="The theme showcase, live. Switch the theme, or the phone and desktop layouts."
          />
          <DemoPanel name="themes" />
          <p className="text-fd-muted-foreground -mt-3 text-sm">
            The whole gallery — its shell and its scenes, the theme chosen inside the app —{" "}
            <a href="/showcase" className="text-fd-foreground font-medium underline">
              runs on its own page
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <Heading title="Why shadcn-nsh" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border-fd-border bg-fd-card flex flex-col gap-2 rounded-xl border p-5"
              >
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-fd-muted-foreground text-sm">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-fd-border bg-fd-card flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Start with one component</h2>
          <p className="text-fd-muted-foreground max-w-xl">
            <code>init</code> sets up the theme and the <code>@/</code> alias; <code>add</code>{" "}
            copies a component and what it needs.
          </p>
          <div className="w-full max-w-xl text-left">
            <InstallTabs command={"npx shadcn-nsh@latest init\nnpx shadcn-nsh@latest add button"} />
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/docs/getting-started" className="font-medium underline">
              Getting started
            </a>
            <a href="/docs/cli" className="font-medium underline">
              CLI
            </a>
            <a href={REPO_URL} className="font-medium underline">
              GitHub ↗
            </a>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <dt className="sr-only">{label}</dt>
      <dd className="text-fd-foreground text-2xl font-semibold">{value}</dd>
      <span>{label}</span>
    </div>
  );
}

function Heading({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {body && <p className="text-fd-muted-foreground">{body}</p>}
    </div>
  );
}
