// The reference of `split-view.tsx`: the same page, the look spread on `nsh/base`'s SplitView and
// NavPage. The render check requires the two to draw the same pixels.
import { alpha, colors, focusRing, header, hovered, rounded, shape } from "@shadcn-nsh/theme";
import { ChevronLeft, PanelLeft } from "lucide";
import type { JSX } from "nsh";
import { horizontalSizeClass, mount, platform, Scroll, signal, Text, View, windowSize } from "nsh";
import {
  NavPage as BaseNavPage,
  SplitView as BaseSplitView,
  type ColumnVisibility,
} from "nsh/base";

import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { createNavStack, NavStack } from "@/packages/ui/nav-stack";
import {
  splitViewColumnLook,
  splitViewHeaderLook,
  splitViewLook,
  splitViewTriggerLook,
  type SplitViewColumn,
} from "@/packages/ui/split-view";

import { DemoPage } from "./kit";
import { Log, Panel, Segmented, Split, ui, wide } from "./stage";

const folders = ["Inbox", "Drafts", "Archive"] as const;
type Folder = (typeof folders)[number];
const notes: Record<Folder, string[]> = {
  Inbox: ["Design review", "Release notes", "Lunch next week"],
  Drafts: ["Quarterly update"],
  Archive: ["Conference badges"],
};
const visibilities = [
  "all",
  "doubleColumn",
  "detailOnly",
] as const satisfies readonly ColumnVisibility[];

/** One column shows where the window is horizontally compact. */
const compact = () => horizontalSizeClass() === "compact";

/** The system draws the header on iOS and Android; everywhere else the app's bar does. */
const systemHeader = platform.os === "ios" || platform.os === "android";

/**
 * What the scene opens on. A phone shows the sidebar (`"all"`). A desktop too narrow for three
 * 320-point columns — the inspector sits beside the stage below about 1360 — opens on two. A wide
 * window shows every column.
 */
const initialVisibility = (): ColumnVisibility => {
  if (compact()) return "all";
  if (windowSize().width < 1360) return "doubleColumn";
  return "all";
};

/** A way back to the column before, in the header's leading slot. */
function BackButton(props: { title: string; onPress: () => void }) {
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={`Back to ${props.title}`}
      hitSlop={6}
      hoverStyle={hovered()}
      focusVisibleStyle={focusRing()}
      style={{
        height: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingStart: 4,
        paddingEnd: 8,
        ...rounded(shape.control),
      }}
    >
      <Icon icon={ChevronLeft} size={18} tint={colors.foreground} />
      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
        {props.title}
      </Text>
    </View>
  );
}

/** A row of a column: its title, its selection in the brand's tint. */
function Row(props: { title: string; selected: boolean; onPress: () => void }) {
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={props.title}
      accessibilityState={{ selected: props.selected }}
      hoverStyle={props.selected ? undefined : hovered()}
      focusVisibleStyle={focusRing()}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        ...rounded(shape.control),
        backgroundColor: props.selected ? alpha(colors.brand, 0.12) : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: colors.foreground,
          fontWeight: props.selected ? "600" : "400",
        }}
      >
        {props.title}
      </Text>
    </View>
  );
}

/** The sidebar button, the look spread on a view: hide the sidebar, or show every column. */
function Trigger(props: {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (event: { columnVisibility: ColumnVisibility }) => void;
}) {
  const shown = () => props.columnVisibility === "automatic" || props.columnVisibility === "all";
  const look = splitViewTriggerLook();
  return (
    <View
      onPress={() =>
        props.onColumnVisibilityChange({
          columnVisibility: shown() ? "doubleColumn" : "all",
        })
      }
      role="button"
      accessibilityLabel={shown() ? "Hide the sidebar" : "Show the sidebar"}
      accessibilityState={{ selected: shown() }}
      hitSlop={6}
      hoverStyle={look.hoverStyle()}
      activeStyle={look.activeStyle()}
      focusVisibleStyle={look.focusVisibleStyle()}
      style={[look.style(), null]}
    >
      <Icon icon={PanelLeft} size={look.glyph().size} tint={look.glyph().tint} />
    </View>
  );
}

/** A column's page: the look spread on `nsh/base`'s NavPage, the header included. */
function Column(props: {
  column: SplitViewColumn;
  title: string;
  leading?: JSX.Element;
  children: JSX.Element;
}) {
  const look = splitViewColumnLook(props.column);
  const headerLook = splitViewHeaderLook(props.column);
  return (
    <BaseNavPage
      title={props.title}
      headerStyle={header.headerStyle}
      headerLeft={systemHeader ? props.leading : undefined}
      header={
        systemHeader ? undefined : (
          <View style={headerLook.bar()}>
            {props.leading}
            <View
              style={{
                flex: 1,
                minWidth: 0,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: props.leading ? 0 : 4,
              }}
            >
              <Text style={headerLook.title()}>{props.title}</Text>
            </View>
          </View>
        )
      }
      style={[look.page(), null]}
    >
      <View style={{ flex: 1, backgroundColor: look.page().backgroundColor }}>
        {props.children}
      </View>
    </BaseNavPage>
  );
}

function App() {
  const visibility = signal<ColumnVisibility>(initialVisibility());
  const folder = signal<Folder>(folders[0]);
  const note = signal(notes.Inbox[0]!);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  const sidebar = createNavStack(["folders"]);
  const list = createNavStack(["notes"]);
  const detail = createNavStack(["note"]);
  const setVisibility = (columnVisibility: ColumnVisibility) => {
    visibility.set(columnVisibility);
    log(`onColumnVisibilityChange: ${columnVisibility}`);
  };

  return (
    <DemoPage title="Split view">
      <Text style={{ color: ui().muted }}>
        {compact()
          ? "Pick a folder, then a note: each brings the next column in front"
          : "Choose which columns show; narrow the window to see one at a time"}
      </Text>
      <Split
        grow
        width={1040}
        inspector={
          <>
            <Panel title="columnVisibility">
              <Segmented
                options={visibilities}
                value={visibility()}
                onChange={(next) => setVisibility(next)}
              />
            </Panel>
            <Log title="events" lines={events()} minHeight={96} />
          </>
        }
      >
        <View
          style={{
            height: wide() ? 420 : 460,
            width: "100%",
            maxWidth: "100%",
            ...sectionSurface(),
            overflow: "hidden",
          }}
        >
          <BaseSplitView
            style={[splitViewLook().root(), null]}
            columnVisibility={visibility()}
            onColumnVisibilityChange={({ columnVisibility }) => setVisibility(columnVisibility)}
            sidebar={
              <NavStack state={sidebar}>
                {() => (
                  <Column column="sidebar" title="Folders">
                    <Scroll style={{ flex: 1 }} contentStyle={{ padding: 6, gap: 2 }}>
                      {folders.map((name) => (
                        <Row
                          title={name}
                          selected={!compact() && folder() === name}
                          onPress={() => {
                            folder.set(name);
                            note.set(notes[name][0]!);
                            if (compact()) setVisibility("doubleColumn");
                          }}
                        />
                      ))}
                    </Scroll>
                  </Column>
                )}
              </NavStack>
            }
            content={
              <NavStack state={list}>
                {() => (
                  <Column
                    column="content"
                    title={folder()}
                    leading={
                      compact() ? (
                        <BackButton title="Folders" onPress={() => setVisibility("all")} />
                      ) : (
                        <Trigger
                          columnVisibility={visibility()}
                          onColumnVisibilityChange={({ columnVisibility }) =>
                            setVisibility(columnVisibility)
                          }
                        />
                      )
                    }
                  >
                    <Scroll style={{ flex: 1 }} contentStyle={{ padding: 6, gap: 2 }}>
                      {notes[folder()].map((name) => (
                        <Row
                          title={name}
                          selected={!compact() && note() === name}
                          onPress={() => {
                            note.set(name);
                            if (compact()) setVisibility("detailOnly");
                          }}
                        />
                      ))}
                    </Scroll>
                  </Column>
                )}
              </NavStack>
            }
            detail={
              <NavStack state={detail}>
                {() => (
                  <Column
                    column="detail"
                    title={note()}
                    leading={
                      compact() ? (
                        <BackButton
                          title={folder()}
                          onPress={() => setVisibility("doubleColumn")}
                        />
                      ) : undefined
                    }
                  >
                    <View style={{ flex: 1, padding: 16, gap: 10 }}>
                      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
                        {note()}
                      </Text>
                      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
                        {`In ${folder()}. Each column is a NavStack of its own, so its pages stay as the others change.`}
                      </Text>
                    </View>
                  </Column>
                )}
              </NavStack>
            }
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
