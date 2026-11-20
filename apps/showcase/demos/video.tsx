import { colors, shape } from "@shadcn-nsh/theme";
import { Pause, Play } from "lucide";
// Video: the official gallery's player scene
// (`references/nsh/examples/gallery/demos/Media.tsx`) — a paused, muted, looping clip with the
// app's own controls or the system's, and what it reports. `Video` is `nsh`'s; the round button,
// meter, badge and segmented control are this library's.
import { signal, Text, Video, type VideoRef, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button, RoundButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";

import { Caption, DemoCard, DemoPage } from "../kit";
import { Choice, Meter } from "./primitives-shared";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function VideoDemo() {
  const controls = signal<"own" | "system">("own");
  const paused = signal(true);
  const time = signal(0);
  const duration = signal(0);
  const buffering = signal(false);
  const failed = signal(false);
  const video = signal<VideoRef | null>(null);
  return (
    <DemoPage title="Video">
      <DemoCard title="Video" subtitle="AVPlayer / MediaPlayer">
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <Caption>Play, seek, volume and what it reports</Caption>
          <Badge
            tone={failed() ? "destructive" : buffering() ? "warn" : paused() ? "neutral" : "accent"}
          >
            {failed() ? "Error" : buffering() ? "Buffering" : paused() ? "Paused" : "Playing"}
          </Badge>
        </View>
        <Video
          ref={(node) => video.set(node)}
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          paused={paused()}
          muted
          repeat
          controls={controls() === "system"}
          style={{
            width: "100%",
            aspectRatio: 16 / 9,
            backgroundColor: colors.background,
            borderRadius: shape.control,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onLoad={(e) => duration.set(e.duration)}
          onError={() => failed.set(true)}
          onBuffer={(e) => buffering.set(e.isBuffering)}
          onProgress={(e) => {
            time.set(e.currentTime);
            duration.set(e.duration);
          }}
        />
        <If when={controls() === "own"}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <RoundButton
              accessibilityLabel={paused() ? "Play" : "Pause"}
              onPress={() => paused.set(!paused())}
            >
              <Icon
                icon={paused() ? Play : Pause}
                size={16}
                tint={colors.primaryForeground}
                fill={paused()}
              />
            </RoundButton>
            <View style={{ flex: 1, gap: 8 }}>
              <Meter value={duration() > 0 ? time() / duration() : 0} />
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {fmt(time())}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {fmt(duration())}
                </Text>
              </View>
            </View>
            <Button variant="secondary" onPress={() => video()?.seek(0)}>
              Restart
            </Button>
          </View>
        </If>
        <Choice
          options={[
            { value: "own", label: "Own controls" },
            { value: "system", label: "System controls" },
          ]}
          value={controls()}
          onChange={(v) => controls.set(v)}
        />
      </DemoCard>
    </DemoPage>
  );
}
