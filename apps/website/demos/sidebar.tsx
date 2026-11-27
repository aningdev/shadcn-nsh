// The sidebar's page, after shadcn's `sidebar-07`: a team's row and a search field in the header,
// a "Platform" group whose rows open a sub menu, a "Projects" group whose rows carry an action and
// a badge, two rows still loading, the user's row in the footer — beside a page of cards — with the
// open state and every change reported beside it. A wide window also shows the three variants and
// the three collapsibles in frames of their own.
//
// A narrow window (and a touch screen) gets the column as a sheet: the trigger opens it. A wide one
// keeps the column beside the page and folds it to its icons — the rail down its inner edge or the
// trigger does that — so each window shows the shape it gives the column.
//
// The rows are drawn by hand on the look's words (`sidebarMenuButtonLook().label` and `.glyph`),
// which is how an app puts an icon and a name in a row: a string child is styled by the component,
// an element child is the app's own.
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
  Plus,
  Settings2,
  SquareTerminal,
} from "lucide";
import { mount, signal, Text, View } from "nsh";
import { Collapsible } from "nsh/base";

import { Icon } from "@/packages/ui/lib/icons";
import { insetSurface } from "@/packages/ui/lib/surface";
import { Separator } from "@/packages/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  sidebarMenuButtonLook,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  type SidebarCollapsible,
  type SidebarVariant,
} from "@/packages/ui/sidebar";

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

/** The reason a change came from, said the way the log reads. */
const REASONS: Record<string, string> = {
  triggerPress: "the trigger",
  railPress: "the rail",
  shortcut: "⌘B",
};

function App() {
  // The app owns the state the provider writes nothing down for: `open` goes back in, and what
  // `onOpenChange` says is kept in the log (an app would keep it in its own storage).
  const open = signal(true);
  // The sub menus the app has open: the active row's at first, as shadcn's nav opens it.
  const expanded = signal<string[]>(["Playground"]);
  const lines = signal<string[]>([]);
  const note = (line: string) => lines.set([line, ...lines()].slice(0, 3));
  const isOpen = (title: string) => expanded().includes(title);
  const toggleRow = (title: string) =>
    expanded.set(
      isOpen(title) ? expanded().filter((name) => name !== title) : [...expanded(), title],
    );

  // What the looks need to fold as the column does: a row drawn by hand passes the same state the
  // column wears, or its name stays where a folded row has none.
  const fold = { open: () => open(), collapsible: () => "icon" as const };

  const state = () =>
    open()
      ? "expanded"
      : NAV.some((row) => isOpen(row.title))
        ? "expanded · open rows kept"
        : "collapsed";

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
        {/* Square corners: a rounded card's corner antialiasing lands a level apart between two
            page instances (24 pixels, 47/255 in dark), which a rounded shell turns into a diff to
            wave through on every run of the comparison. */}
        <DemoCard padded={false} style={{ height: 460, overflow: "hidden", borderRadius: 0 }}>
          <SidebarProvider
            open={open()}
            onOpenChange={(event) => {
              open.set(event.open);
              note(
                `${event.open ? "opened" : "closed"} — ${REASONS[event.reason] ?? event.reason}`,
              );
            }}
          >
            <Sidebar collapsible="icon">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {/* The team's row: shadcn opens a menu from it; here it only reports. */}
                    <SidebarMenuButton
                      size="lg"
                      tooltip="Acme Inc. · Enterprise"
                      onPress={() => note("team switcher")}
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
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: ui().text,
                            numberOfLines: 1,
                          }}
                        >
                          Acme Inc.
                        </Text>
                        <Text style={{ fontSize: 11, color: ui().muted, numberOfLines: 1 }}>
                          Enterprise
                        </Text>
                      </View>
                      <Icon icon={ChevronsUpDown} size={14} tint={ui().muted} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarInput placeholder="Search" />
              </SidebarHeader>
              <SidebarSeparator />

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Platform</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {NAV.map((row) => {
                        const look = sidebarMenuButtonLook({
                          ...fold,
                          size: () => "default",
                          active: () => !!row.active,
                        });
                        return (
                          <SidebarMenuItem>
                            {/* `nsh/base`'s collapsible: the row is the trigger, and the sub menu
                                is what it reveals under it. */}
                            <Collapsible
                              open={isOpen(row.title)}
                              reveal
                              style={{ gap: 2 }}
                              content={
                                <SidebarMenuSub>
                                  {row.items.map((item) => (
                                    <SidebarMenuSubItem>
                                      <SidebarMenuSubButton onPress={() => note(item)}>
                                        {item}
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              }
                            >
                              <SidebarMenuButton
                                isActive={row.active}
                                tooltip={row.title}
                                onPress={() => toggleRow(row.title)}
                              >
                                <Icon
                                  icon={row.icon}
                                  size={look.glyph.size}
                                  tint={look.glyph.tint}
                                />
                                <Text style={look.label}>{row.title}</Text>
                                <View
                                  style={{
                                    marginLeft: "auto",
                                    rotate: isOpen(row.title) ? "90deg" : "0deg",
                                  }}
                                >
                                  <Icon icon={ChevronRight} size={14} tint={ui().muted} />
                                </View>
                              </SidebarMenuButton>
                            </Collapsible>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Projects</SidebarGroupLabel>
                  <SidebarGroupAction
                    accessibilityLabel="Add a project"
                    onPress={() => note("add project")}
                  >
                    <Icon icon={Plus} size={14} tint={ui().muted} />
                  </SidebarGroupAction>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {PROJECTS.map((project) => {
                        const look = sidebarMenuButtonLook({ ...fold, size: () => "sm" });
                        return (
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              size="sm"
                              tooltip={project.name}
                              onPress={() => note(project.name)}
                            >
                              <Icon
                                icon={project.icon}
                                size={look.glyph.size}
                                tint={look.glyph.tint}
                              />
                              <Text style={look.label}>{project.name}</Text>
                            </SidebarMenuButton>
                            <If when={project.badge !== undefined}>
                              <SidebarMenuBadge>{project.badge}</SidebarMenuBadge>
                            </If>
                            <SidebarMenuAction
                              accessibilityLabel={`More about ${project.name}`}
                              onPress={() => note(`more — ${project.name}`)}
                            >
                              <Icon icon={Ellipsis} size={14} tint={ui().muted} />
                            </SidebarMenuAction>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Loading</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuSkeleton showIcon width={70} />
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuSkeleton width={55} />
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="lg"
                      tooltip="shadcn · m@example.com"
                      onPress={() => note("account")}
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
                        <Text style={{ fontSize: 12, fontWeight: "600", color: ui().text }}>
                          CN
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: ui().text,
                            numberOfLines: 1,
                          }}
                        >
                          shadcn
                        </Text>
                        <Text style={{ fontSize: 11, color: ui().muted, numberOfLines: 1 }}>
                          m@example.com
                        </Text>
                      </View>
                      <Icon icon={Ellipsis} size={14} tint={ui().muted} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>

            <SidebarInset>
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
                <SidebarTrigger onPress={() => note("trigger")} />
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
            </SidebarInset>
          </SidebarProvider>
        </DemoCard>
      </Split>

      {/* The axes the one scenario cannot show: a frame each, in a window wide enough for the
          column (a narrow one gives every frame a sheet instead). */}
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
        <SidebarProvider defaultOpen={props.open ?? true}>
          <Sidebar variant={props.variant} collapsible={props.collapsible}>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm" variant="outline" tooltip="Home">
                    <Icon icon={GalleryVerticalEnd} size={14} tint={ui().muted} />
                    <Text
                      style={
                        sidebarMenuButtonLook({
                          size: () => "sm",
                          open: () => props.open ?? true,
                          collapsible: () => props.collapsible,
                        }).label
                      }
                    >
                      Home
                    </Text>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="sm" tooltip="Inbox">
                        Inbox
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="sm" isActive tooltip="Today">
                        Today
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <View style={{ flex: 1, padding: 8 }}>
              <Text style={{ fontSize: 11, color: ui().muted }}>The page</Text>
            </View>
          </SidebarInset>
        </SidebarProvider>
      </View>
    </View>
  );
}

mount(App);
