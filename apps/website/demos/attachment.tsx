// shadcn/ui's attachment page has no example in this repo, so this page is the library's own: files
// under a message, every state an upload goes through, the three sizes, a strip of pictures, and a
// frame that opens when pressed. Pressing anything writes to the log beside it.
import { FileArchive, FileImage, FileText, RotateCcw, X } from "lucide";
import { mount, signal, Text, View } from "nsh";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { iconButtonGlyph, IconButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

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
                <AttachmentGroup>
                  <Attachment>
                    <AttachmentMedia>
                      <Icon
                        icon={FileText}
                        size={attachmentGlyph("default", "horizontal")}
                        tint={ui().muted}
                      />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>build.log</AttachmentTitle>
                      <AttachmentDescription>124 KB · 2 min ago</AttachmentDescription>
                    </AttachmentContent>
                  </Attachment>
                  <Attachment>
                    <AttachmentMedia>
                      <Icon
                        icon={FileImage}
                        size={attachmentGlyph("default", "horizontal")}
                        tint={ui().muted}
                      />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>screenshot.png</AttachmentTitle>
                      <AttachmentDescription>1.2 MB · 2 min ago</AttachmentDescription>
                    </AttachmentContent>
                  </Attachment>
                </AttachmentGroup>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="States" axis="block">
            <Attachment state="idle">
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>notes.md</AttachmentTitle>
                <AttachmentDescription>Waiting to send</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment state="uploading">
              <AttachmentMedia>
                <Spinner side={attachmentGlyph("default", "horizontal")} tint={ui().muted} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>registry.zip</AttachmentTitle>
                <AttachmentDescription>Uploading · 42%</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment state="processing">
              <AttachmentMedia>
                <Icon
                  icon={FileArchive}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>registry.zip</AttachmentTitle>
                <AttachmentDescription>Scanning for anything executable</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment state="error">
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().danger}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>build.log</AttachmentTitle>
                <AttachmentDescription>Upload failed</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction accessibilityLabel="Retry" onPress={() => log("Retry")}>
                  Retry
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            <Attachment state="done">
              <AttachmentMedia variant="icon">
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>build.log</AttachmentTitle>
                <AttachmentDescription>124 KB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <IconButton
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Remove"
                  onPress={() => log("Remove")}
                  icon={X}
                />
              </AttachmentActions>
            </Attachment>
          </DemoSection>

          <DemoSection title="Sizes" axis="block">
            <Attachment size="default" state="done">
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>changelog.md</AttachmentTitle>
                <AttachmentDescription>8 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment size="sm" state="done">
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("sm", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>changelog.md</AttachmentTitle>
                <AttachmentDescription>8 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <Attachment size="xs" state="done">
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("xs", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>changelog.md</AttachmentTitle>
                <AttachmentDescription>8 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </DemoSection>

          {/* A strip that scrolls sideways when the card is narrower than it (`AttachmentGroup`). */}
          <DemoSection title="Pictures in a strip" axis="block">
            <AttachmentGroup>
              <Attachment orientation="vertical">
                <AttachmentMedia variant="image">
                  <Icon
                    icon={FileImage}
                    size={attachmentGlyph("default", "vertical")}
                    tint={ui().muted}
                  />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>dark mode.png</AttachmentTitle>
                  <AttachmentDescription>PNG · 840 KB</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Remove dark mode.png"
                    onPress={() => log("Remove dark mode.png")}
                    icon={X}
                  />
                </AttachmentActions>
              </Attachment>
              <Attachment orientation="vertical" state="uploading">
                <AttachmentMedia variant="image">
                  <Icon
                    icon={FileImage}
                    size={attachmentGlyph("default", "vertical")}
                    tint={ui().muted}
                  />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>light mode.png</AttachmentTitle>
                  <AttachmentDescription>Uploading · 18%</AttachmentDescription>
                </AttachmentContent>
              </Attachment>
            </AttachmentGroup>
          </DemoSection>

          <DemoSection title="A frame that opens" axis="block">
            <Attachment>
              <AttachmentMedia>
                <Icon
                  icon={FileText}
                  size={attachmentGlyph("default", "horizontal")}
                  tint={ui().muted}
                />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>README.md</AttachmentTitle>
                <AttachmentDescription>Open the file</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <IconButton
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Retry"
                  onPress={() => log("Retry")}
                  icon={RotateCcw}
                />
              </AttachmentActions>
              <AttachmentTrigger
                accessibilityLabel="Open README.md"
                onPress={() => log("Open README.md")}
              />
            </Attachment>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
