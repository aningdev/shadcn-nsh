var e=`// The reference of \`sidebar.tsx\`: the same page, the look spread on \`nsh\`'s own View and Text (and
// \`nsh/base\`'s Collapsible for the sub menu) instead of worn by the component. The render check
// requires the two to draw the same pixels. A narrow window draws the column in the page's \`Sheet\`,
// as the component does, so the press the render case takes lands here too.
import { colors } from "@shadcn-nsh/theme";
import {
  BookOpen,
  Bot,
  ChartPie,
  ChevronRight,
  ChevronsUpDown,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Map,
  PanelLeft,
  Plus,
  Settings2,
  SquareTerminal,
} from "lucide";
import { mount, platform, safeArea, Scroll, signal, Text, View, windowSize } from "nsh";
import { Collapsible } from "nsh/base";

import { IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon, IconLabel } from "@/packages/ui/lib/icons";
import { insetSurface, narrowWindow } from "@/packages/ui/lib/surface";
import { Separator } from "@/packages/ui/separator";
import { Sheet, SheetContent } from "@/packages/ui/sheet";
import {
  sidebarGroupLook,
  sidebarInputLook,
  sidebarLook,
  sidebarMenuActionLook,
  sidebarMenuBadgeLook,
  sidebarMenuButtonLook,
  sidebarMenuSkeletonLook,
  sidebarMenuSubButtonLook,
  sidebarMenuSubLook,
  sidebarSize,
  type SidebarCollapsible,
  type SidebarSide,
  type SidebarVariant,
} from "@/packages/ui/sidebar";
import { Skeleton } from "@/packages/ui/skeleton";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Panel, Split, ui, wide } from "./stage";

/** The rows of the "Platform" group: a name, an icon, and the pages under it. */
const NAV = [
  {
    title: "Playground",
    icon: SquareTerminal,
    active: true,
    items: ["History", "Starred", "Settings"],
  },
  { title: "Models", icon: Bot, items: ["Genesis", "Explorer", "Quantum"] },
  { title: "Documentation", icon: BookOpen, items: ["Introduction", "Get started", "Tutorials"] },
  { title: "Settings", icon: Settings2, items: ["General", "Team", "Billing"] },
];

/** The rows of the "Projects" group: a name, an icon, and how much is new in it. */
const PROJECTS = [
  { name: "Design engineering", icon: Frame, badge: "12" },
  { name: "Sales & marketing", icon: ChartPie, badge: "4" },
  { name: "Travel", icon: Map },
];

/** The page's four figures: what shadcn puts in the page beside the column. */
const FIGURES = [
  { title: "Total revenue", value: "$1,250.00", hint: "+12.5% this month" },
  { title: "New customers", value: "1,234", hint: "−20% this period" },
  { title: "Active accounts", value: "45,678", hint: "+12.5% this month" },
  { title: "Growth rate", value: "4.5%", hint: "+4.5% this month" },
];

/** What the provider decides: a touch screen, or a window too narrow for the column. */
const mobile = () => !platform.desktop || narrowWindow();

/** The column's axes, as the \`Sidebar\` in the demo declares them. */
const AXES = {
  side: (): SidebarSide => "left",
  collapsible: (): SidebarCollapsible => "icon",
};

/** The column's own look options: its axes and the variant it meets the page in. */
const COLUMN_AXES = { ...AXES, variant: (): SidebarVariant => "sidebar" };

/** A list of rows: a column of them 4 points apart, as \`SidebarMenu\` lays them out. */
const menuStyle = (): Parameters<typeof View>[0]["style"] => ({
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  gap: sidebarSize.menuGap,
});

/** The column's content: a header, a separator, the groups and a footer — the component's tree. */
function Column(props: { open: () => boolean; expanded: () => string[] }) {
  const { open, expanded } = props;
  const isOpen = (title: string) => expanded().includes(title);
  const look = sidebarLook({ ...COLUMN_AXES, open, isMobile: mobile });
  const group = sidebarGroupLook({ ...AXES, open, isMobile: mobile });
  const input = sidebarInputLook({ ...AXES, open, isMobile: mobile });
  const skeleton = sidebarMenuSkeletonLook();
  // The parts the component takes out of the tree while the column is folded to its icons: the
  // search field, the group's action, a row's action and badge, the open sub menu.
  const folded = () => !open() && !mobile();
  return (
    <>
      <View style={look.header}>
        <View style={menuStyle()}>
          <View style={{ position: "relative" }}>
            <View
              style={
                sidebarMenuButtonLook({ ...AXES, open, isMobile: mobile, size: () => "lg" }).style
              }
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: ui().inset.backgroundColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon icon={GalleryVerticalEnd} size={16} tint={ui().text} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: ui().text, numberOfLines: 1 }}
                >
                  Acme Inc.
                </Text>
                <Text style={{ fontSize: 11, color: ui().muted, numberOfLines: 1 }}>
                  Enterprise
                </Text>
              </View>
              <Icon icon={ChevronsUpDown} size={14} tint={ui().muted} />
            </View>
          </View>
        </View>
        <If when={!folded()}>
          <Input placeholder="Search" style={input.style} />
        </If>
      </View>
      <Separator style={look.separator} />
      <Scroll style={look.content}>
        <View style={look.contentRows}>
          <View style={group.group}>
            <View style={group.labelBox}>
              <Text style={group.label}>Platform</Text>
            </View>
            <View style={group.content}>
              <View style={menuStyle()}>
                {NAV.map((row) => {
                  const rowLook = sidebarMenuButtonLook({
                    ...AXES,
                    open,
                    isMobile: mobile,
                    size: () => "default",
                    active: () => !!row.active,
                  });
                  const sub = sidebarMenuSubLook({ ...AXES, open, isMobile: mobile });
                  const subButton = sidebarMenuSubButtonLook({ ...AXES, open, isMobile: mobile });
                  return (
                    <View style={{ position: "relative" }}>
                      <Collapsible
                        open={isOpen(row.title)}
                        reveal
                        style={{ gap: 2 }}
                        content={
                          <If when={!folded()}>
                            <View style={sub.sub}>
                              {row.items.map((item) => (
                                <View style={sub.item}>
                                  <View style={subButton.style}>
                                    <Text style={subButton.label}>{item}</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </If>
                        }
                      >
                        <View style={rowLook.style}>
                          <Icon
                            icon={row.icon}
                            size={rowLook.glyph.size}
                            tint={rowLook.glyph.tint}
                          />
                          <Text style={rowLook.label}>{row.title}</Text>
                          <View
                            style={{
                              marginLeft: "auto",
                              rotate: isOpen(row.title) ? "90deg" : "0deg",
                            }}
                          >
                            <Icon icon={ChevronRight} size={14} tint={ui().muted} />
                          </View>
                        </View>
                      </Collapsible>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={group.group}>
            <View style={group.labelBox}>
              <Text style={group.label}>Projects</Text>
            </View>
            <If when={!folded()}>
              <View style={group.action}>
                <Icon icon={Plus} size={14} tint={ui().muted} />
              </View>
            </If>
            <View style={group.content}>
              <View style={menuStyle()}>
                {PROJECTS.map((project) => {
                  const rowLook = sidebarMenuButtonLook({
                    ...AXES,
                    open,
                    isMobile: mobile,
                    size: () => "sm",
                    trailing: () => (project.badge === undefined ? "action" : "both"),
                  });
                  const badge = sidebarMenuBadgeLook({ ...AXES, open, isMobile: mobile });
                  const action = sidebarMenuActionLook({
                    ...AXES,
                    open,
                    isMobile: mobile,
                    trailing: () => (project.badge === undefined ? "action" : "both"),
                  });
                  return (
                    <View style={{ position: "relative" }}>
                      <View style={rowLook.style}>
                        <Icon
                          icon={project.icon}
                          size={rowLook.glyph.size}
                          tint={rowLook.glyph.tint}
                        />
                        <Text style={rowLook.label}>{project.name}</Text>
                      </View>
                      {project.badge === undefined ? null : (
                        <If when={!folded()}>
                          <View style={badge.style}>
                            <Text style={badge.text}>{project.badge}</Text>
                          </View>
                        </If>
                      )}
                      <If when={!folded()}>
                        <View style={action.style}>
                          <Icon icon={Ellipsis} size={14} tint={ui().muted} />
                        </View>
                      </If>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={group.group}>
            <View style={group.labelBox}>
              <Text style={group.label}>Loading</Text>
            </View>
            <View style={group.content}>
              <View style={menuStyle()}>
                <View style={{ position: "relative" }}>
                  <View style={skeleton.row}>
                    <Skeleton style={skeleton.icon} />
                    <Skeleton style={[skeleton.text, { maxWidth: "70%" }]} />
                  </View>
                </View>
                <View style={{ position: "relative" }}>
                  <View style={skeleton.row}>
                    <Skeleton style={[skeleton.text, { maxWidth: "55%" }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Scroll>
      <View style={look.footer}>
        <View style={menuStyle()}>
          <View style={{ position: "relative" }}>
            <View
              style={
                sidebarMenuButtonLook({ ...AXES, open, isMobile: mobile, size: () => "lg" }).style
              }
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: ui().inset.backgroundColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: ui().text }}>CN</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: ui().text, numberOfLines: 1 }}
                >
                  shadcn
                </Text>
                <Text style={{ fontSize: 11, color: ui().muted, numberOfLines: 1 }}>
                  m@example.com
                </Text>
              </View>
              <Icon icon={Ellipsis} size={14} tint={ui().muted} />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

function App() {
  const open = signal(true);
  const sheet = signal(false);
  const expanded = signal<string[]>(["Playground"]);
  const lines = signal<string[]>([]);
  const note = (line: string) => lines.set([line, ...lines()].slice(0, 3));
  const toggleRow = (title: string) =>
    expanded.set(
      expanded().includes(title)
        ? expanded().filter((name) => name !== title)
        : [...expanded(), title],
    );
  const state = () =>
    open()
      ? "expanded"
      : NAV.some((row) => expanded().includes(row.title))
        ? "expanded · open rows kept"
        : "collapsed";
  // The column's fold, reported the way the provider reports it: the line the demo's log keeps.
  const toggle = (reason: string) => {
    const next = !open();
    open.set(next);
    note(\`\${next ? "opened" : "closed"} — \${reason}\`);
  };
  const look = sidebarLook({ ...COLUMN_AXES, open, isMobile: mobile });

  return (
    <DemoPage title="Sidebar" note={() => lines()[0] ?? "Click the trigger, or press ⌘B."}>
      <Split
        width={600}
        inspector={
          <>
            <Panel title="state">
              <Text style={{ fontSize: 12, color: ui().text }}>column — {state()}</Text>
              <Text style={{ fontSize: 12, color: ui().text }}>
                rows — {expanded().length > 0 ? expanded().join(", ") : "none"}
              </Text>
            </Panel>
            <Log title="onOpenChange" lines={lines()} />
          </>
        }
      >
        {/* Square corners, as the demo's: see the note there. */}
        <DemoCard padded={false} style={{ height: 460, overflow: "hidden", borderRadius: 0 }}>
          <View style={[look.root, { flex: 1, backgroundColor: undefined }]}>
            {/* A narrow window: the column is the page's sheet, as \`Sidebar\` draws it. */}
            <If when={mobile()}>
              <Sheet open={sheet()} onOpenChange={({ open: next }) => sheet.set(next)}>
                <SheetContent
                  side="left"
                  popupStyle={[
                    {
                      boxSizing: "border-box",
                      width: Math.min(sidebarSize.mobile, windowSize().width - 48),
                      height: "100%",
                      paddingHorizontal: 0,
                      paddingTop: safeArea().top,
                      paddingBottom: safeArea().bottom,
                      gap: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[look.column, { flex: 1 }]}>
                    <Column open={open} expanded={expanded} />
                  </View>
                </SheetContent>
              </Sheet>
            </If>

            {/* A wide window: the column stands beside its page in a frame of its own, and folds
                to its icons — the rail down its inner edge, or the trigger in the page's header. */}
            <If when={!mobile()}>
              <View style={look.frame}>
                <View style={look.column}>
                  <Column open={open} expanded={expanded} />
                </View>
                <View
                  accessible
                  role="group"
                  accessibilityLabel="Toggle Sidebar"
                  focusable={false}
                  hitSlop={{ left: sidebarSize.rail, right: sidebarSize.rail }}
                  onPress={() => toggle("the rail")}
                  style={look.rail}
                >
                  <View style={[look.railLine, { opacity: 0 }]} />
                </View>
              </View>
            </If>

            <View style={look.inset}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: ui().line,
                }}
              >
                <IconButton
                  accessibilityLabel="Toggle Sidebar"
                  onPress={() => {
                    note("trigger");
                    if (mobile()) sheet.set(true);
                    else toggle("the trigger");
                  }}
                >
                  <IconLabel label="Menu" icon={PanelLeft} {...iconButtonGlyph()} />
                </IconButton>
                <Separator orientation="vertical" style={{ height: 16 }} />
                <Text style={{ fontSize: 13, color: ui().text }}>Documents</Text>
              </View>
              <View style={{ flex: 1, minHeight: 0, padding: 12, gap: 10 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {FIGURES.map((figure) => (
                    <View
                      style={{
                        ...insetSurface(),
                        flexGrow: 1,
                        flexBasis: 120,
                        minWidth: 120,
                        padding: 10,
                        gap: 2,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: ui().muted }}>{figure.title}</Text>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: ui().text }}>
                        {figure.value}
                      </Text>
                      <Text style={{ fontSize: 11, color: ui().muted }}>{figure.hint}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 12, lineHeight: 17, color: ui().muted }}>
                  The page beside the column: a header with the trigger, a separator and where you
                  are, then the page itself. A narrow window keeps the same page and opens the
                  column as a sheet over it.
                </Text>
              </View>
            </View>
          </View>
        </DemoCard>
      </Split>

      <If when={wide()}>
        <DemoSection title="Variants">
          <Mini label="sidebar" variant="sidebar" collapsible="icon" />
          <Mini label="floating" variant="floating" collapsible="offcanvas" />
          <Mini label="inset" variant="inset" collapsible="none" />
        </DemoSection>
        <DemoSection title="Collapsible">
          <Mini label="offcanvas — closed" variant="sidebar" collapsible="offcanvas" open={false} />
          <Mini label="icon — closed" variant="sidebar" collapsible="icon" open={false} />
          <Mini label="none — never closes" variant="sidebar" collapsible="none" />
        </DemoSection>
      </If>
    </DemoPage>
  );
}

/**
 * One frame of the axes below the page: a column and a page in a card 420 by 160, wide enough that
 * an inset page, set in from the column and the card, keeps its line on one row.
 */
function Mini(props: {
  label: string;
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  open?: boolean;
}) {
  const open = () => props.open ?? true;
  const look = sidebarLook({
    variant: () => props.variant,
    collapsible: () => props.collapsible,
    open,
    side: () => "left",
  });
  const group = sidebarGroupLook({ collapsible: () => props.collapsible, open });
  const row = sidebarMenuButtonLook({
    size: () => "sm",
    open,
    collapsible: () => props.collapsible,
  });
  const active = sidebarMenuButtonLook({
    size: () => "sm",
    open,
    collapsible: () => props.collapsible,
    active: () => true,
  });
  const home = sidebarMenuButtonLook({
    open,
    size: () => "sm",
    variant: () => "outline",
    collapsible: () => props.collapsible,
  });
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, color: ui().muted }}>{props.label}</Text>
      <View
        style={{
          width: 420,
          height: 160,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: ui().line,
          overflow: "hidden",
        }}
      >
        <View style={[look.root, { flex: 1 }]}>
          <View style={look.frame}>
            <View style={look.column}>
              <View style={look.header}>
                <View style={menuStyle()}>
                  <View style={{ position: "relative" }}>
                    <View style={home.style}>
                      <Icon icon={GalleryVerticalEnd} size={14} tint={ui().muted} />
                      <Text style={home.label}>Home</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Scroll style={look.content}>
                <View style={look.contentRows}>
                  <View style={group.group}>
                    <View style={group.labelBox}>
                      <Text style={group.label}>Menu</Text>
                    </View>
                    <View style={group.content}>
                      <View style={menuStyle()}>
                        <View style={{ position: "relative" }}>
                          <View style={row.style}>
                            <Text style={row.label}>Inbox</Text>
                          </View>
                        </View>
                        <View style={{ position: "relative" }}>
                          <View style={active.style}>
                            <Text style={active.label}>Today</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Scroll>
            </View>
          </View>
          <View style={look.inset}>
            <View style={{ flex: 1, padding: 8 }}>
              <Text style={{ fontSize: 11, color: ui().muted }}>The page</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

mount(App);
`;export{e as default};