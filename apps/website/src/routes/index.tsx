import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

import { InstallTabs } from "@/components/fd/install-tabs";
import { ShowcaseFrame } from "@/components/fd/showcase-frame";
import { sitePath } from "@/lib/base";
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
 * The site's front page: what this is, the showcase app running live, and the questions a visitor
 * asks first. It is Fumadocs' home layout (the nav bar, no sidebar); the docs start one link away.
 * The numbers are read from the generated component list, so the page never claims a count by hand.
 */
export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: SITE_TITLE }, { name: "description", content: SITE_DESCRIPTION }],
  }),
});

/** The questions a visitor asks before trying it; each answer is checked against the repo. */
const FAQ: { question: string; answer: ReactNode }[] = [
  {
    question: "Is this an official NSH project?",
    answer: (
      <>
        No, it is a community project. Behavior, keyboard and accessibility come from NSH&apos;s own{" "}
        <code>nsh/base</code>, unchanged; the look starts from NSH&apos;s official example UI and is
        owned and maintained here.
      </>
    ),
  },
  {
    question: "How does it relate to shadcn/ui? Can I use it in a React web app?",
    answer: (
      <>
        It follows shadcn/ui&apos;s model — a registry, a CLI, one file per component, and parts
        named <code>Trigger</code>, <code>Content</code>, <code>Item</code> — but the components
        draw NSH native views, not the DOM, so they don&apos;t run in a React DOM app. An NSH app
        reaches the browser through NSH&apos;s web target, which is how every demo on this site
        runs.
      </>
    ),
  },
  {
    question: "Why copy files instead of installing a package? How do I get updates?",
    answer: (
      <>
        <code>add</code> writes the component, its theme and the looks it imports into your app,
        then forgets them: there is no runtime package of ours to keep in sync, and the files are
        yours to change. <code>npx shadcn-nsh@latest diff</code> shows which copies differ from the
        registry; <code>add &lt;name&gt; --overwrite</code> writes the new version over yours.
      </>
    ),
  },
  {
    question: "Which platforms does it run on?",
    answer: (
      <>
        Wherever NSH does: iOS, Android, macOS, Windows, Linux, the web and the terminal. Each
        component adapts its density and controls to a touch screen, a pointer and a keyboard.
      </>
    ),
  },
  {
    question: "Which NSH version do I need?",
    answer: (
      <>
        Each release tracks one NSH CLI version — 0.9.x is written against v0.6.1. The{" "}
        <a href={`${REPO_URL}#compatibility`}>compatibility table</a> lists them all.
      </>
    ),
  },
  {
    question: "Which themes are there? Can I make my own?",
    answer: (
      <>
        Six ship: default, shadcn, solid-glass, apple (Liquid Glass on macOS and iOS 26), material
        (Material 3 Expressive on Android), and winui (WinUI 3 on Windows); <code>native</code>{" "}
        picks apple on Apple platforms, material on Android, winui on Windows, and default
        elsewhere. Choose one with <code>init --theme</code>, add more with{" "}
        <code>add theme-&lt;name&gt;</code> and switch at run time with <code>selectTheme</code>. A
        theme is data — <code>theme.json</code> and <code>semantics.json</code> — so yours is an
        edit away. See <a href={sitePath("/docs/themes")}>Themes</a>.
      </>
    ),
  },
  {
    question: "Does it work with AI coding assistants?",
    answer: (
      <>
        Every docs page is also Markdown: add <code>.md</code> to its URL.{" "}
        <a href={sitePath("/llms.txt")}>/llms.txt</a> indexes them and{" "}
        <a href={sitePath("/llms-full.txt")}>/llms-full.txt</a> holds them all in one file.
      </>
    ),
  },
  {
    question: "What is the license?",
    answer: <>MIT. The copied files are yours, with no runtime dependency on this project.</>,
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
            NSH components
            <br />
            you copy into your app
          </h1>
          <p className="text-fd-muted-foreground max-w-2xl text-lg text-balance">
            Styled, themeable UI for Native Shell, built on <code>nsh/base</code>. Add a component
            with the CLI and the file is yours — what shadcn/ui does for React.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={sitePath("/docs/getting-started")}
              className="bg-fd-primary text-fd-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get started
            </a>
            <a
              href={sitePath("/docs/components")}
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
            body="NSH's official Gallery, rebuilt with these components: its sidebar and its scenes, the theme and the appearance chosen live inside the app."
          />
          <ShowcaseFrame />
        </section>

        <section className="flex flex-col gap-6">
          <Heading title="FAQ" />
          <div className="border-fd-border divide-fd-border divide-y border-y">
            {FAQ.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-fd-muted-foreground text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-fd-muted-foreground pb-4 [&_a]:underline [&_a]:underline-offset-2">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <a
            href={sitePath("/docs/getting-started")}
            className="self-start font-medium underline underline-offset-4"
          >
            Get started →
          </a>
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
