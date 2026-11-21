// Photos: the official gallery's recycled photo stream (`gallery/demos/Photos.tsx`) — rows on a
// phone, a grid on a desktop — rebuilt with this library's Button, Badge and Stat over `nsh`'s List.
// The picture data, pull to refresh, native scrolling and the compact bar belong to the scene.
import {
  colors,
  finish,
  focusRing,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  toneColor,
  type Tone,
  shape,
} from "@shadcn-nsh/theme";
import { ArrowDown } from "lucide";
import {
  computed,
  createAnimatedValue,
  Image,
  keymap,
  List,
  platform,
  signal,
  Text,
  untracked,
  View,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { pressSink } from "@/packages/ui/lib/press";
import { scrollbarTheme } from "@/packages/ui/scrollbar";
import { Stat } from "@/packages/ui/stat";

import logo from "../assets/logo@2x.png";
import { desktop, paneWidth } from "./apps-shared";
import { columnsFor, photoNames, photoUrl } from "./graphics-shared";

/** The gallery's scroll bar, starting below the compact bar laid over the list's top. */
const belowBar = {
  ...scrollbarTheme,
  vertical: {
    ...scrollbarTheme.vertical,
    class: scrollbarTheme.vertical?.class?.replace("inset-y-0", "top-11 bottom-0"),
  },
};

type Photo = { id: number; title: string; author: string; tone: Tone; views: number };

const authors = ["Ada", "Linus", "Grace", "Ken", "Barbara"];
const tones: Tone[] = ["accent", "info", "warn", "up", "destructive"];
const places = [
  "Harbor",
  "Ridge",
  "Old town",
  "Dunes",
  "Canal",
  "Orchard",
  "Quarry",
  "Pier",
  "Meadow",
];
const PAGE = 200;

function makePhotos(from: number, count: number): Photo[] {
  return Array.from({ length: count }, (_, index) => {
    const id = from + index;
    return {
      id,
      title: `${places[id % places.length]} ${String(id).padStart(4, "0")}`,
      author: authors[id % authors.length],
      tone: tones[id % tones.length],
      views: ((id * 7919) % 9800) + 120,
    };
  });
}

/** 1234 → "1,234" (no Intl in the runtime). */
const grouped = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const compact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

function PhotoRow(props: { photo: Photo }) {
  return (
    <View
      onPress={() => {}}
      role="button"
      accessibilityLabel={props.photo.title}
      hoverStyle={{ opacity: 0.86 }}
      activeStyle={pressSink(0.985).activeStyle}
      focusVisibleStyle={focusRing()}
      style={{
        height: 76,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
      }}
    >
      <Image
        src={photoUrl(photoNames[props.photo.id % photoNames.length], "360x360")}
        style={{
          width: 56,
          height: 56,
          borderRadius: shape.inset,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.raised,
          ...finish.raised,
        }}
      />
      <View
        style={{
          flex: 1,
          gap: 4,
          alignSelf: "stretch",
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
        }}
      >
        <Text
          style={{ numberOfLines: 1, fontSize: 15, fontWeight: "600", color: colors.foreground }}
        >
          {props.photo.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: toneColor(props.photo.tone),
            }}
          />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.photo.author}</Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.faint,
              fontVariant: ["tabular-nums"],
            }}
          >
            · {compact(props.photo.views)} views
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}>
        #{props.photo.id}
      </Text>
    </View>
  );
}

/** A photo in the desktop layout's grid: the picture over its title and author. */
function PhotoTile(props: { photo: Photo }) {
  return (
    <View
      onPress={() => {}}
      role="button"
      accessibilityLabel={props.photo.title}
      hoverStyle={{ backgroundColor: colors.card }}
      activeStyle={pressSink(0.97).activeStyle}
      focusVisibleStyle={focusRing()}
      style={{
        padding: 6,
        gap: 8,
        borderRadius: shape.card,
        borderCurve: "continuous",
      }}
    >
      <Image
        src={photoUrl(photoNames[props.photo.id % photoNames.length], "small")}
        style={{
          width: "100%",
          aspectRatio: 4 / 3,
          borderRadius: shape.inset,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.raised,
          ...finish.raised,
        }}
      />
      <View style={{ gap: 3, paddingHorizontal: 4, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text
            style={{
              numberOfLines: 1,
              flex: 1,
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {props.photo.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
            #{props.photo.id}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: toneColor(props.photo.tone),
            }}
          />
          <Text style={{ numberOfLines: 1, fontSize: 12, color: colors.mutedForeground }}>
            {props.photo.author} · {compact(props.photo.views)} views
          </Text>
        </View>
      </View>
    </View>
  );
}

function Hero(props: {
  photos: number;
  refreshes: number;
  refreshing: boolean;
  refresh: () => void;
  refreshKey: string | null;
  scrollY: ReturnType<typeof createAnimatedValue>;
}) {
  return (
    <View
      style={{
        paddingHorizontal: desktop() ? 0 : 16,
        paddingTop: desktop() ? 0 : 8,
        paddingBottom: 16,
        opacity: props.scrollY.interpolate({ inputRange: [0, 150], outputRange: [1, 0] }),
        translate: [
          0,
          props.scrollY.interpolate({ inputRange: [-200, 0, 300], outputRange: [0, 0, 150] }),
        ],
      }}
    >
      <View
        style={
          terminal
            ? {
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: TERMINAL_ROW - 1,
                paddingHorizontal: 2 * TERMINAL_COLUMN - 1,
              }
            : {
                backgroundColor: colors.card,
                borderRadius: shape.card,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                gap: 12,
                ...finish.card,
              }
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              borderCurve: "continuous",
              backgroundColor: colors.raised,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              ...finish.raised,
            }}
          >
            <Image src={logo} style={{ width: 24, height: 24 }} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.foreground }}>
              Photo stream
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              A recycled list of remote images
            </Text>
          </View>
          <Badge tone="info">Remote</Badge>
        </View>
        <Text
          style={{
            fontSize: 40,
            fontWeight: "600",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
            letterSpacing: -1,
          }}
        >
          {grouped(props.photos)}
          <Text style={{ fontSize: 15, fontWeight: "500", color: colors.mutedForeground }}>
            {" photos"}
          </Text>
        </Text>
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingTop: 10,
          }}
        >
          <Stat width="33%" label="Pages" value={String(Math.ceil(props.photos / PAGE))} />
          <Stat width="33%" label="Per page" value={String(PAGE)} />
          <Stat
            width="33%"
            label="Refreshes"
            value={String(props.refreshes)}
            tone={props.refreshes ? "accent" : undefined}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12 }}>
        <Icon icon={ArrowDown} size={14} tint={colors.faint} />
        <Text style={{ flex: 1, fontSize: 13, color: colors.faint }}>
          {platform.desktop
            ? `${props.refreshKey ? `${props.refreshKey} refreshes. ` : ""}Scrolling to the end loads ${PAGE} more.`
            : `Pull to refresh. Scrolling to the end loads ${PAGE} more.`}
        </Text>
        <If when={platform.desktop}>
          <Button
            accessibilityLabel="Refresh"
            size="sm"
            variant="secondary"
            disabled={props.refreshing}
            onPress={props.refresh}
          >
            {props.refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </If>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <Text
      style={{
        textAlign: "center",
        fontSize: 13,
        color: colors.faint,
        padding: 16,
      }}
    >
      Loading {PAGE} more…
    </Text>
  );
}

/** Desktops refresh with ⌘R / Ctrl+R: the mouse cannot pull a scroll view down. */
function bindRefresh(refresh: () => void): string | null {
  if (!platform.desktop || platform.os === "web") return null;
  keymap.bind("mod+r", refresh);
  return keymap.label("mod+r");
}

export function PhotosDemo() {
  const columns = computed(() => (desktop() ? columnsFor(200, 8, 16) : 1));
  const photos = signal(makePhotos(1, 1000));
  const refreshing = signal(false);
  const refreshes = signal(0);
  const scrollY = createAnimatedValue(0);

  const refresh = () => {
    refreshing.set(true);
    setTimeout(() => {
      photos.set(makePhotos(1, 1000));
      refreshes.set(refreshes() + 1);
      refreshing.set(false);
    }, 800);
  };
  const refreshKey = bindRefresh(refresh);
  const loadMore = () => {
    const current = photos();
    photos.set([...current, ...makePhotos(current.length + 1, PAGE)]);
  };
  const hero = () => (
    <Hero
      photos={photos().length}
      refreshes={refreshes()}
      refreshing={refreshing()}
      refresh={refresh}
      refreshKey={refreshKey}
      scrollY={scrollY}
    />
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <If
        when={desktop()}
        else={
          <List
            testID="photos"
            each={photos()}
            estimatedItemSize={76}
            style={{ flex: 1 }}
            contentStyle={{ paddingBottom: 24 }}
            scrollValue={scrollY}
            refreshing={refreshing()}
            onRefresh={refresh}
            onLoadMore={loadMore}
            header={hero()}
            footer={<Footer />}
          >
            {(photo) => <PhotoRow photo={photo()} />}
          </List>
        }
      >
        {(() => {
          const count = columns();
          const tile = untracked(() => ((paneWidth() - 48) / count) * 0.75 + 60);
          return (
            <List
              testID="photos"
              each={photos()}
              numColumns={count}
              estimatedItemSize={tile}
              style={{ flex: 1 }}
              contentStyle={{ padding: 24, rowGap: 16, columnGap: terminal ? 24 : 16 }}
              scrollValue={scrollY}
              refreshing={refreshing()}
              onRefresh={refresh}
              onLoadMore={loadMore}
              header={hero()}
              footer={<Footer />}
              scrollbar={belowBar}
            >
              {(photo) => <PhotoTile photo={photo()} />}
            </List>
          );
        })()}
      </If>
      <View
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          opacity: scrollY.interpolate({ inputRange: [140, 190], outputRange: [0, 1] }),
          translate: [0, scrollY.interpolate({ inputRange: [140, 190], outputRange: [-8, 0] })],
        }}
      >
        <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          Photo stream
        </Text>
        <Text
          style={{ fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
        >
          {grouped(photos().length)} photos
        </Text>
      </View>
    </View>
  );
}
