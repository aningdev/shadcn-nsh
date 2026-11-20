// `UrlScheme` of nsh: the links of the app's scheme (`shadcn-nsh`, in nsh.json `schemes`) that open
// the app, from a browser, another app or the button here.
import { cleanup, openUrl, signal } from "nsh";
import { UrlScheme } from "nsh";

import { Button } from "@/packages/ui/button";

import { DemoPage } from "../kit";
import { Caption, Card, Row } from "./platform-shared";

/** The link's timestamp, read through a function so no press calls the clock itself. */
function stamp(): number {
  return Date.now();
}

/** `shadcn-nsh://` links, the last five the app was handed. */
export function UrlSchemeDemo() {
  const urls = signal<string[]>([]);
  const refused = signal<string | null>(null);
  try {
    cleanup(UrlScheme.on("open", ({ url }) => urls.set([url, ...urls()].slice(0, 5))));
  } catch (error) {
    refused.set(error instanceof Error ? error.message : String(error));
  }
  return (
    <DemoPage title="URL scheme">
      <Card title="Links" subtitle="shadcn-nsh:// links open the app">
        <Row first>
          <Button
            onPress={() =>
              void openUrl(`shadcn-nsh://demo/linking?at=${stamp()}`).catch((error: unknown) =>
                refused.set(error instanceof Error ? error.message : String(error)),
              )
            }
          >
            Open a link
          </Button>
        </Row>
        <Caption
          label={urls()[0] ?? "No link yet"}
          note={urls().length > 1 ? `${urls().length} links` : (refused() ?? undefined)}
        />
      </Card>
    </DemoPage>
  );
}
