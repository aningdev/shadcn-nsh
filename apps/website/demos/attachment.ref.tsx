// The reference of `attachment.tsx`: the same page, the look spread on `nsh`'s own View and Text
// instead of worn by the components. The render check requires the two to draw the same pixels.
import { alpha, colors, focusRing } from "@shadcn-nsh/theme";
import { FileArchive, FileImage, FileText, RotateCcw, X } from "lucide";
import { mount, signal, Scroll, Text, View } from "nsh";

import {
  attachmentGlyph,
  attachmentLook,
  type AttachmentMediaVariant,
  type AttachmentOrientation,
  type AttachmentSize,
  type AttachmentState,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { Button, iconButtonGlyph, IconButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

const look = attachmentLook();
const frame = (state: AttachmentState, size: AttachmentSize, orientation: AttachmentOrientation) =>
  look.root(state, size, orientation);
const media = (
  state: AttachmentState,
  size: AttachmentSize,
  orientation: AttachmentOrientation,
  variant: AttachmentMediaVariant = "icon",
) => look.media(size, orientation, variant, state);

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  return (
    <DemoPage title="Attachment">
      <Text style={{ color: ui().muted }}>
        {
          "A file or a picture carried by a message: its media, what it is called, how it is doing, and what you can do to it."
        }
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="Under a message" axis="block">
            <Message>
              <MessageAvatar name="Mia Chen" />
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>Found the log and the screenshot.</BubbleContent>
                </Bubble>
                <Scroll
                  horizontal
                  scrollbar={false}
                  style={look.group}
                  contentStyle={look.groupContent}
                >
                  <View style={frame("done", "default", "horizontal")}>
                    <View style={media("done", "default", "horizontal")}>
                      <Icon
                        icon={FileText}
                        size={attachmentGlyph("default", "horizontal")}
                        tint={colors.mutedForeground}
                      />
                    </View>
                    <View style={look.content("horizontal")}>
                      <Text style={look.title("default")}>build.log</Text>
                      <Text style={look.description("done")}>124 KB · 2 min ago</Text>
                    </View>
                  </View>
                  <View style={frame("done", "default", "horizontal")}>
                    <View style={media("done", "default", "horizontal")}>
                      <Icon
                        icon={FileImage}
                        size={attachmentGlyph("default", "horizontal")}
                        tint={colors.mutedForeground}
                      />
                    </View>
                    <View style={look.content("horizontal")}>
                      <Text style={look.title("default")}>screenshot.png</Text>
                      <Text style={look.description("done")}>1.2 MB · 2 min ago</Text>
                    </View>
                  </View>
                </Scroll>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="States" axis="block">
            <View style={frame("idle", "default", "horizontal")}>
              <View style={media("idle", "default", "horizontal")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>notes.md</Text>
                <Text style={look.description("idle")}>Waiting to send</Text>
              </View>
            </View>
            <View style={frame("uploading", "default", "horizontal")}>
              <View style={media("uploading", "default", "horizontal")}>
                <Spinner
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>registry.zip</Text>
                <Text style={look.description("uploading")}>Uploading · 42%</Text>
              </View>
            </View>
            <View style={frame("processing", "default", "horizontal")}>
              <View style={media("processing", "default", "horizontal")}>
                <Icon
                  icon={FileArchive}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>registry.zip</Text>
                <Text style={look.description("processing")}>Scanning for anything executable</Text>
              </View>
            </View>
            <View style={frame("error", "default", "horizontal")}>
              <View style={media("error", "default", "horizontal")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.destructive}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>build.log</Text>
                <Text style={look.description("error")}>Upload failed</Text>
              </View>
              <View style={look.actions("horizontal")}>
                <Button
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Retry"
                  onPress={() => log("Retry")}
                >
                  Retry
                </Button>
              </View>
            </View>
            <View style={frame("done", "default", "horizontal")}>
              <View style={media("done", "default", "horizontal", "icon")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>build.log</Text>
                <Text style={look.description("done")}>124 KB</Text>
              </View>
              <View style={look.actions("horizontal")}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Remove"
                  onPress={() => log("Remove")}
                >
                  <Icon icon={X} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
                </IconButton>
              </View>
            </View>
          </DemoSection>

          <DemoSection title="Sizes" axis="block">
            <View style={frame("done", "default", "horizontal")}>
              <View style={media("done", "default", "horizontal", "icon")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>changelog.md</Text>
                <Text style={look.description("done")}>8 KB</Text>
              </View>
            </View>
            <View style={frame("done", "sm", "horizontal")}>
              <View style={media("done", "sm", "horizontal")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("sm", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("sm")}>changelog.md</Text>
                <Text style={look.description("done")}>8 KB</Text>
              </View>
            </View>
            <View style={frame("done", "xs", "horizontal")}>
              <View style={media("done", "xs", "horizontal")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("xs", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("xs")}>changelog.md</Text>
                <Text style={look.description("done")}>8 KB</Text>
              </View>
            </View>
          </DemoSection>

          {/* The strip scrolls sideways when the card is narrower than it, as `AttachmentGroup` does. */}
          <DemoSection title="Pictures in a strip" axis="block">
            <Scroll
              horizontal
              scrollbar={false}
              style={look.group}
              contentStyle={look.groupContent}
            >
              <View style={frame("done", "default", "vertical")}>
                <View style={media("done", "default", "vertical", "image")}>
                  <Icon
                    icon={FileImage}
                    size={attachmentGlyph("default", "vertical")}
                    tint={colors.mutedForeground}
                  />
                </View>
                <View style={look.content("vertical")}>
                  <Text style={look.title("default")}>dark mode.png</Text>
                  <Text style={look.description("done")}>PNG · 840 KB</Text>
                </View>
                <View style={look.actions("vertical")}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Remove dark mode.png"
                    onPress={() => log("Remove dark mode.png")}
                  >
                    <Icon icon={X} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
                  </IconButton>
                </View>
              </View>
              <View style={frame("uploading", "default", "vertical")}>
                <View style={media("uploading", "default", "vertical", "image")}>
                  <Icon
                    icon={FileImage}
                    size={attachmentGlyph("default", "vertical")}
                    tint={colors.mutedForeground}
                  />
                </View>
                <View style={look.content("vertical")}>
                  <Text style={look.title("default")}>light mode.png</Text>
                  <Text style={look.description("uploading")}>Uploading · 18%</Text>
                </View>
              </View>
            </Scroll>
          </DemoSection>

          <DemoSection title="A frame that opens" axis="block">
            <View style={frame("done", "default", "horizontal")}>
              <View style={media("done", "default", "horizontal", "icon")}>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={colors.mutedForeground}
                />
              </View>
              <View style={look.content("horizontal")}>
                <Text style={look.title("default")}>README.md</Text>
                <Text style={look.description("done")}>Open the file</Text>
              </View>
              <View style={look.actions("horizontal")}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Retry"
                  onPress={() => log("Retry")}
                >
                  <Icon icon={RotateCcw} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
                </IconButton>
              </View>
              <View
                role="button"
                accessibilityLabel="Open README.md"
                onPress={() => log("Open README.md")}
                style={look.trigger}
                hoverStyle={{ backgroundColor: alpha(colors.foreground, 0.04) }}
                focusVisibleStyle={focusRing()}
              />
            </View>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
