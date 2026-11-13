// The official link scene (`references/nsh/website/demos/el-link.tsx`) with this library's part:
// breadcrumbs whose current page is the route last opened, a paragraph with two links in it, a
// site outside the app with its arrow, and an archived page that takes no press; the route and
// what the app heard beside them.
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Link, linkSize } from "@/packages/ui/link";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

const visited = signal(new Set<string>());
const events = signal<string[]>([]);
const route = signal("/docs/link");

const opened = ({ href }: { href: string }) => {
  visited.set(new Set(visited()).add(href));
  events.set([`onOpen ${href}`, ...events()].slice(0, 4));
};

function DocLink(props: {
  href: string;
  label: string;
  openWith?: "system" | "app";
  disabled?: boolean;
  current?: boolean;
  icon?: boolean;
  inline?: boolean;
}) {
  return (
    <Link
      href={props.href}
      openWith={props.openWith ?? "app"}
      disabled={props.disabled}
      current={props.current}
      visited={visited().has(props.href)}
      inline={props.inline}
      icon={props.icon}
      onOpen={(e: { href: string }) => {
        opened(e);
        if ((props.openWith ?? "app") === "app") route.set(e.href);
      }}
    >
      {props.label}
    </Link>
  );
}

function App() {
  const crumb = (href: string, label: string) => (
    <DocLink href={href} label={label} current={route() === href} />
  );
  const slash = () => <Text style={{ color: ui().faint, fontSize: linkSize }}>/</Text>;
  return (
    <DemoPage title="Link">
      <Text style={{ color: ui().muted }}>
        {desktop ? "Click a link, or Tab to one and press Return" : "Tap a link"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="route · visited">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {route()} · {visited().size} visited
              </Text>
            </Panel>
            <Log title="onOpen({ href })" lines={events()} minHeight={110} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {crumb("/docs", "Docs")}
            {slash()}
            {crumb("/docs/elements", "Elements")}
            {slash()}
            {crumb("/docs/link", "Link")}
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22, color: ui().text }}>
            {"Read the "}
            <DocLink href="/docs/release-notes" label="release notes" inline />
            {" and the "}
            <DocLink href="/docs/migration" label="migration guide" inline />
            {" before you update."}
          </Text>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <View style={{ gap: 10 }}>
            <DocLink href="https://example.com/" label="example.com" openWith="system" icon />
            <DocLink href="/docs/archive" label="Archived docs" disabled />
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
