import { colors, finish, isDark, shape } from "@shadcn-nsh/theme";
import { ChevronLeft, ChevronRight } from "lucide";
// Web view: the official gallery's Media scene
// (`references/nsh/examples/gallery/demos/Media.tsx`) — inline HTML that messages the app both
// ways, and a web site with its navigation. `WebView` is `nsh`'s; the buttons, badges, icons and
// cards are this library's.
import { signal, Text, View, WebView, type WebViewNavigation, type WebViewRef } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button, IconButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";

import { Caption, DemoCard, DemoPage } from "../kit";
import { Choice } from "./primitives-shared";

/** An inline page in the theme's colors (for the appearance shown: the page reloads when it changes). */
const page =
  () => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; padding: 16px; background: ${colors.inset}; color: ${colors.foreground}; font-family: -apple-system, system-ui, sans-serif; font-size: 15px; line-height: 1.4; }
  h3 { margin: 0 0 4px; font-size: 17px; font-weight: 600; }
  p { margin: 0 0 12px; color: ${colors.mutedForeground}; font-size: 15px; }
  button { height: 44px; padding: 0 18px; border: 0; border-radius: 10px; background: ${finish.accent.backgroundImage}; color: ${colors.primaryForeground}; font-family: inherit; font-size: 15px; font-weight: 600; box-shadow: inset 0 1px 0 rgba(255,255,255,${isDark() ? 0.45 : 0.6}); }
  #got { margin-top: 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid ${colors.border}; color: ${colors.mutedForeground}; font-size: 15px; }
</style></head>
<body>
<h3>An inline page</h3>
<p>HTML from a string. It sends messages to the app and receives them.</p>
<button onclick="window.nsh.postMessage('hello from the page')">Post to the app</button>
<div id="got">No message from the app yet.</div>
<script>window.addEventListener('message', (e) => { document.getElementById('got').textContent = 'From the app: ' + e.data; });</script>
</body></html>`;

const frame = () =>
  ({
    borderRadius: shape.control,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  }) as const;

/** Inline HTML, and messages both ways. */
function Messaging() {
  const message = signal("");
  const sent = signal(0);
  const web = signal<WebViewRef | null>(null);
  return (
    <View style={{ gap: 10 }}>
      <WebView
        ref={(node) => web.set(node)}
        html={page()}
        style={{ height: 360, backgroundColor: colors.inset, ...frame() }}
        onMessage={(e) => message.set(e.data)}
      />
      <Caption>{`From the page: ${message() || "—"}`}</Caption>
      <Caption>{`To the page: ${sent() ? `hi #${sent()}` : "—"}`}</Caption>
      <Button
        onPress={() => {
          sent.set(Math.round(performance.now()) % 1000);
          web()?.postMessage(`hi #${sent()}`);
        }}
      >
        Post to the page
      </Button>
    </View>
  );
}

/** A scoreboard: a web site, its navigation state, back / forward / reload. */
function Site() {
  const state = signal<WebViewNavigation | null>(null);
  const site = signal<WebViewRef | null>(null);
  const host = () => {
    const url = state()?.url ?? "";
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "…";
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          {state()?.title || "Navigation state, back and forward"}
        </Text>
        <Badge tone={state()?.loading ? "warn" : "up"}>
          {state()?.loading ? "Loading" : "Loaded"}
        </Badge>
      </View>
      <View
        style={{
          height: 40,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 14,
          borderRadius: 20,
          backgroundColor: colors.inset,
          ...finish.track,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: state()?.loading ? colors.warn : colors.up,
          }}
        />
        <Text
          style={{
            numberOfLines: 1,
            textOverflow: "ellipsis-middle",
            flex: 1,
            fontSize: 15,
            color: colors.mutedForeground,
          }}
        >
          {host()}
        </Text>
      </View>
      <WebView
        ref={(node) => site.set(node)}
        src="https://nsh.dev"
        style={{
          height: 560,
          backgroundColor: colors.inset,
          ...frame(),
        }}
        onNavigationStateChange={(v) => state.set(v)}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconButton
          variant="secondary"
          accessibilityLabel="Back"
          disabled={!state()?.canGoBack}
          onPress={() => site()?.goBack()}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        >
          <Icon icon={ChevronLeft} size={18} tint={colors.foreground} />
        </IconButton>
        <IconButton
          variant="secondary"
          accessibilityLabel="Forward"
          disabled={!state()?.canGoForward}
          onPress={() => site()?.goForward()}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        >
          <Icon icon={ChevronRight} size={18} tint={colors.foreground} />
        </IconButton>
        <View style={{ flex: 1 }} />
        <Button variant="secondary" onPress={() => site()?.reload()}>
          Reload
        </Button>
      </View>
    </View>
  );
}

export function WebViewDemo() {
  const tab = signal<"page" | "site">("page");
  return (
    <DemoPage title="Web view">
      <DemoCard
        title="Web views"
        subtitle="Inline HTML with messages both ways, a web site and its navigation"
      >
        <Choice
          options={[
            { value: "page", label: "Inline page" },
            { value: "site", label: "Web site" },
          ]}
          value={tab()}
          onChange={(v) => tab.set(v)}
        />
        <If when={tab() === "page"}>
          <Messaging />
        </If>
        <If when={tab() === "site"}>
          <Site />
        </If>
      </DemoCard>
    </DemoPage>
  );
}
