// nsh/updater: asks the source in nsh.json's "updater" for a newer version, then downloads it and
// replaces the app, or sends the user to its link where the app cannot replace itself. The
// showcase names no source, so here the check answers that there is nothing to install.
import { colors } from "@shadcn-nsh/theme";
import { signal } from "nsh";
import { Text } from "nsh";
import { openUrl } from "nsh";
import { checkForUpdate, downloadUpdate, installAndRestart, type AppUpdate } from "nsh/updater";

import { Button } from "@/packages/ui/button";

import { DemoPage } from "../kit";
import { Card, Note } from "./platform-shared";

/** `nsh/updater`'s check, download and replacement, with what each step reported. */
export function UpdaterDemo() {
  const status = signal("Not checked yet");
  const update = signal<AppUpdate | null>(null);
  const checking = signal(false);

  const check = async () => {
    checking.set(true);
    status.set("Checking…");
    update.set(null);
    try {
      const found = await checkForUpdate();
      update.set(found);
      status.set(found ? `Version ${found.version} is available` : "No update available");
    } catch (error) {
      status.set(`Check failed: ${(error as Error).message}`);
    } finally {
      checking.set(false);
    }
  };

  const install = async () => {
    const found = update();
    if (!found) return;
    if (!found.canInstall) {
      await openUrl(found.url);
      return;
    }
    try {
      await downloadUpdate(({ received, total }) =>
        status.set(
          total
            ? `Downloading ${Math.round((received / total) * 100)}%`
            : `Downloading ${received} bytes`,
        ),
      );
      status.set("Installing…");
      await installAndRestart();
    } catch (error) {
      status.set(`Update failed: ${(error as Error).message}`);
    }
  };

  return (
    <DemoPage title="Updater">
      <Card title="App update" subtitle="From GitHub Releases or a host of your own">
        <Text style={{ fontSize: 14, color: colors.foreground }}>{status()}</Text>
        <Button busy={checking()} onPress={() => void check()}>
          Check for updates
        </Button>
        <If when={update()}>
          <Button onPress={() => void install()}>Install</Button>
        </If>
        <Note>
          This package names no updater source, so the check reports no update; a release app checks
          the source in its nsh.json.
        </Note>
      </Card>
    </DemoPage>
  );
}
