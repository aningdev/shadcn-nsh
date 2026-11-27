import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

import { DualInstallTabs } from "@/components/fd/dual-install";
import { ShowcaseFrame } from "@/components/fd/showcase-frame";
import { ThemeCardGrid } from "@/components/fd/theme-cards";
import { sitePath } from "@/lib/base";
import {
  NSH_SITE_URL,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  baseOptions,
} from "@/lib/layout.shared";

/**
 * The site's front page: what this library is, both ways to install it, the built-in themes,
 * the showcase, and the questions a visitor asks first. Fumadocs' home layout draws the nav and
 * no sidebar. The docs start one link away.
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
        No, it is a community project. Behavior, keyboard navigation, and accessibility come from
        NSH&apos;s own <code>nsh/base</code>, unchanged. The look starts from NSH&apos;s official
        example UI and is owned and maintained here.
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
    question: "TSX nshm or the copy-into-app CLI — which do I use?",
    answer: (
      <>
        Both ship the same source, and neither adds a third-party runtime dependency.{" "}
        <code>nsh add github:aningdev/shadcn-nsh</code> resolves the TSX <code>nshm</code> module.
        There is no <code>package.json</code> entry and no <code>node_modules</code> for this
        library; import from <code>shadcn-nsh/&lt;name&gt;</code> and switch themes with{" "}
        <code>selectTheme</code>. The CLI (<code>npx shadcn-nsh@latest init</code>, then{" "}
        <code>add &lt;name&gt;</code>) copies the files into the app. After that they are yours:{" "}
        <code>diff</code> shows what changed, and <code>add &lt;name&gt; --overwrite</code> writes
        the registry&apos;s version over yours. Use <code>nshm</code> when you want the module as it
        ships. Use the CLI when you want to edit the shell or the look.
      </>
    ),
  },
  {
    question: "Which platforms does it run on?",
    answer: (
      <>
        Wherever NSH does: iOS, Android, macOS, Windows, Linux, the web, and the terminal. Each
        component adapts its density and controls to a touch screen, a pointer, and a keyboard.
      </>
    ),
  },
  {
    question: "Which NSH version do I need?",
    answer: (
      <>
        Each release tracks one NSH CLI version. The{" "}
        <a href={`${REPO_URL}#compatibility`}>compatibility table</a> lists them.
      </>
    ),
  },
  {
    question: "Do the built-in themes clone native controls 1:1?",
    answer: (
      <>
        No. Each theme distills the colors, radii, surfaces, and motion of its design system onto
        the same <code>nsh/base</code> controls. It does not replicate every platform widget. The
        mapping and the deliberate trade-offs are on each{" "}
        <a href={sitePath("/docs/themes")}>theme page</a>.
      </>
    ),
  },
  {
    question: "Can I make my own theme?",
    answer: (
      <>
        Yes. <code>defineTheme()</code> takes a built-in theme&apos;s spec and the fields you
        change; <code>selectTheme()</code> applies it while the app runs. See{" "}
        <a href={sitePath("/docs/customizing")}>Customizing</a>.
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
        { text: "Get started", url: "/docs/getting-started" },
        { text: "Components", url: "/docs/components" },
        { text: "Themes", url: "/docs/themes" },
        { text: "Architecture", url: "/docs/architecture" },
      ]}
    >
      <main className="mx-auto flex w-full max-w-(--fd-layout-width) min-w-0 flex-col gap-16 px-4 py-12 md:px-8 md:py-16">
        <section className="border-fd-border bg-fd-card/40 flex flex-col gap-6 rounded-2xl border px-5 py-8 md:px-10 md:py-12">
          <a
            href={NSH_SITE_URL}
            className="border-fd-border text-fd-muted-foreground hover:text-fd-foreground w-fit rounded-full border px-3 py-1 text-xs transition-colors"
          >
            Built on Native Shell ↗
          </a>
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Styled, themeable UI for Native Shell
            </h1>
            <p className="text-fd-muted-foreground max-w-2xl text-lg text-balance">
              Native interaction on every platform, from <code>nsh/base</code>, with no third-party
              runtime dependency. Install it as a TSX <code>nshm</code> module, or copy it into the
              app with the CLI.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={sitePath("/docs/getting-started")}
              className="bg-fd-primary text-fd-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get started
            </a>
            <a
              href={sitePath("/docs/components")}
              className="border-fd-border bg-fd-card hover:bg-fd-accent rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Browse components
            </a>
            <a
              href={sitePath("/docs/architecture")}
              className="text-fd-muted-foreground hover:text-fd-foreground px-2 py-2 text-sm font-medium"
            >
              Architecture
            </a>
          </div>
          <div className="w-full max-w-2xl">
            <DualInstallTabs />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <Heading
            title="Foundations"
            body="Behavior from NSH, appearance from a theme, and one source installed two ways."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <article className="border-fd-border bg-fd-card flex flex-col gap-3 rounded-xl border p-5">
              <h3 className="text-base font-medium">Native behavior, styled shells</h3>
              <p className="text-fd-muted-foreground text-sm leading-6">
                Interaction, keyboard navigation, and accessibility come from <code>nsh/base</code>.
                The shell adapts density and input across iOS, Android, macOS, Windows, Linux, the
                web, and the terminal.
              </p>
            </article>
            <article className="border-fd-border bg-fd-card flex flex-col gap-3 rounded-xl border p-5">
              <h3 className="text-base font-medium">3-layer data-driven themes</h3>
              <p className="text-fd-muted-foreground text-sm leading-6">
                Tokens in <code>theme.json</code>, a <code>ThemeSpec</code> for surfaces, controls,
                metrics, and motion, then native materials and WGSL shaders.{" "}
                <code>nativeTheme()</code> follows the platform. <code>defineTheme()</code> derives
                your own.
              </p>
              <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a
                  href={sitePath("/docs/customizing")}
                  className="font-medium underline underline-offset-4"
                >
                  Customizing
                </a>
                <a
                  href={sitePath("/docs/architecture")}
                  className="font-medium underline underline-offset-4"
                >
                  Architecture
                </a>
              </p>
            </article>
            <article className="border-fd-border bg-fd-card flex flex-col gap-3 rounded-xl border p-5">
              <h3 className="text-base font-medium">Zero-dependency dual distribution</h3>
              <p className="text-fd-muted-foreground text-sm leading-6">
                Built-in UI icons use the lucide <code>IconNode</code> shape, and an app can still
                pass lucide icons in. The same source installs with <code>nsh add</code> or is
                copied in by the CLI and then owned by the app.
              </p>
            </article>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <Heading
            title="Built-in themes"
            body="Each card is that theme's own light and dark colors, radii, and surfaces."
          />
          <ThemeCardGrid columns="three" />
          <p className="text-fd-muted-foreground max-w-3xl text-sm leading-6">
            Each built-in theme distills the visual style of its design system — colors, radii,
            surfaces, and motion — rather than replicating every platform widget 1:1.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              href={sitePath("/docs/customizing")}
              className="font-medium underline underline-offset-4"
            >
              Custom themes
            </a>
            <a
              href={sitePath("/docs/architecture")}
              className="font-medium underline underline-offset-4"
            >
              Architecture
            </a>
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <Heading
            title="See it running"
            body="The showcase app, rebuilt with these components. Desktop and Phone reload the frame. The palette changes inside the app."
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
                <p className="text-fd-muted-foreground pb-4 leading-7 [&_a]:underline [&_a]:underline-offset-2">
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

function Heading({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {body ? <p className="text-fd-muted-foreground">{body}</p> : null}
    </div>
  );
}
