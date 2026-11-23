// shadcn/ui's marker page has no example of its own here, so this page is the library's own: a
// run's lines, the status lines of one that is still going, the separators between turns, and
// bordered rows. Pressing the marker that acts writes to the log beside it.
import { ExternalLink, FileText, GitBranch, Search } from "lucide";
import { mount, signal, Text } from "nsh";

import { Marker, MarkerContent, MarkerIcon } from "@/packages/ui/marker";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  return (
    <DemoPage title="Marker">
      <Text style={{ color: ui().muted }}>
        {"A line in a conversation that is not a message: a status, a note, one step of a run."}
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A run" axis="block">
            <Marker variant="default">
              <MarkerIcon icon={Search} />
              <MarkerContent>Explored 4 files</MarkerContent>
            </Marker>
            <Marker>
              <MarkerIcon icon={GitBranch} />
              <MarkerContent>Switched to a new branch</MarkerContent>
            </Marker>
            <Marker>
              <MarkerIcon icon={FileText} />
              <MarkerContent>Opened implementation notes</MarkerContent>
            </Marker>
            <Marker role="button" onPress={() => log("View the pull request")}>
              <MarkerIcon icon={ExternalLink} />
              <MarkerContent>View the pull request</MarkerContent>
            </Marker>
          </DemoSection>

          <DemoSection title="Status" axis="block">
            <Marker role="alert">
              <MarkerIcon>
                <Spinner size="sm" tint={ui().muted} />
              </MarkerIcon>
              <MarkerContent>Thinking…</MarkerContent>
            </Marker>
            <Marker variant="separator" role="alert">
              <MarkerIcon>
                <Spinner size="sm" tint={ui().muted} />
              </MarkerIcon>
              <MarkerContent>Running tests</MarkerContent>
            </Marker>
          </DemoSection>

          <DemoSection title="Separator" axis="block">
            <Marker variant="separator">
              <MarkerContent>Today</MarkerContent>
            </Marker>
            <Marker variant="separator">
              <MarkerContent>Worked for 42s</MarkerContent>
            </Marker>
            <Marker variant="separator">
              <MarkerContent>Conversation compacted</MarkerContent>
            </Marker>
          </DemoSection>

          <DemoSection title="Border" axis="block">
            <Marker variant="border">
              <MarkerIcon icon={GitBranch} />
              <MarkerContent>Switched to release-candidate</MarkerContent>
            </Marker>
            <Marker variant="border">
              <MarkerIcon icon={Search} />
              <MarkerContent>Reviewed 8 related files</MarkerContent>
            </Marker>
            <Marker variant="border">
              <MarkerIcon icon={FileText} />
              <MarkerContent>Opened implementation notes</MarkerContent>
            </Marker>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
