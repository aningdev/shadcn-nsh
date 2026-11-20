// A pressable's scenes with this library's parts: a whole row of `Item` parts, a photograph and a
// paragraph, each a region that takes presses and adds only the press's feedback — the hover, the
// sink, the keyboard's ring. The inspector says what was pressed and logs the presses.
//
// The photograph comes from the gallery's URLs (`photos.ts`); the page marks itself
// `images-ready` once it has loaded (or failed), and the render check waits for that before the
// screenshot, so a demo, its reference page and the baseline draw the same picture at every run.
import { Bell } from "lucide";
import { Image, mount, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { Pressable } from "@/packages/ui/pressable";

import { DemoCard, DemoPage } from "./kit";
import { photoUrl } from "./photos";
import { desktop, Log, Panel, Split, ui } from "./stage";

const PHOTO = "sunrise";

/** The one photograph, fetched before the page draws it (and once more if that failed). */
const warmed = signal(false);
Promise.allSettled([Image.prefetch(photoUrl(PHOTO))]).then(() => warmed.set(true));

function App() {
  const last = signal("—");
  const events = signal<string[]>([]);
  const loaded = signal(0);
  const ready = () => loaded() >= 1;
  const press = (name: string) => {
    last.set(name);
    events.set([`${name} pressed`, ...events()].slice(0, 4));
  };

  return (
    <DemoPage title="Pressable">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click, hover, or Tab to a region and press Space"
          : "Tap a region; a long press is the platform's"}
      </Text>

      <Split
        width={340}
        gap={16}
        inspector={
          <>
            <Panel title="last press">
              <Text style={{ fontSize: 13, color: ui().text }}>{last()}</Text>
            </Panel>
            <Log title="pressed" lines={events()} />
          </>
        }
      >
        <View style={{ gap: 12 }}>
          {/* A whole row: what it holds is `Item`'s parts, the region is the pressable. */}
          <Pressable
            accessibilityLabel="Comment from Ada"
            onPress={() => press("The row")}
            style={{ ...ui().card, padding: 10 }}
          >
            <Item>
              <ItemMedia variant="icon">
                <Icon icon={Bell} size={18} tint={ui().muted} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>New comment</ItemTitle>
                <ItemDescription>Ada replied to your post in #design.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge tone="info">New</Badge>
              </ItemActions>
            </Item>
          </Pressable>

          {/* A picture: the image is the region's content, the pressable its frame. */}
          <Pressable
            accessibilityLabel="Photo of the launch site"
            onPress={() => press("The photo")}
            style={{ borderRadius: 10, borderCurve: "continuous", overflow: "hidden" }}
          >
            <Image
              src={warmed() ? photoUrl(PHOTO) : undefined}
              // Drawn at once: a fade caught halfway would differ between two runs.
              fadeDuration={0}
              style={{ width: "100%", height: 132, objectFit: "cover" }}
              onLoadEnd={() => loaded.update((n) => n + 1)}
            />
          </Pressable>

          {/* A dot that gives: the press sinks it to 80% instead of the theme's press scale. */}
          <Pressable
            scale={0.8}
            accessibilityLabel="Dismiss the notice"
            onPress={() => press("The dot")}
            style={{ ...ui().card, padding: 10 }}
          >
            <Text style={{ color: ui().text }}>Dismiss the notice</Text>
          </Pressable>

          {/* A stretch of text: a string child is the region's name for screen readers too. */}
          <Pressable onPress={() => press("The paragraph")}>
            A region can be a paragraph of its own: the text keeps the page's type, and the
            pressable adds only what a press looks like.
          </Pressable>
        </View>
      </Split>

      <DemoCard>
        <Text style={{ fontSize: 12, color: ui().muted }}>
          Nothing here has a fill, a padding or a height of its own: each region is what its content
          draws, and the hover, the sink and the ring are the whole of its look. `scale` is how far
          a press sinks it: the theme's press scale unless it says otherwise.
        </Text>
      </DemoCard>

      {/* The render check's cue: the photograph has loaded (or failed), so two pages draw the same. */}
      {() =>
        ready() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
