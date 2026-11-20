import { colors } from "@shadcn-nsh/theme";
// The index's one entry shape, the lazy screens the built demos are, and the placeholder a demo
// still waiting for its batch shows. Every group file (`groups/<group>.ts`) exports its
// `DemoEntry[]` in these terms, so later batches edit one group file each and nothing else.
import type { IconNode } from "lucide";
import type { JSX } from "nsh";
import { signal, Text, View } from "nsh";

import { Placeholder } from "../demos/placeholder";

/** A demo of the index: its name, one line of what it shows, its icon and its screen. */
export interface DemoEntry {
  /** The demo's name, as the index and the page header show it. */
  name: string;
  /** One line of what it shows, as the official gallery's index says it. */
  detail: string;
  /** Its icon, as lucide exports it. */
  icon: IconNode;
  /** The screen the demo is, drawn when it is the one shown. */
  screen: () => JSX.Element;
}

/**
 * A screen whose module loads the first time it is shown: `load` is an `import()` of it. Native
 * bundles hold every module (the import resolves at once); on the web each demo is a chunk of its
 * own, downloaded when opened, so the first load fetches only the index and the demo shown.
 */
export function lazy(load: () => Promise<() => JSX.Element>): () => JSX.Element {
  let screen: (() => JSX.Element) | undefined;
  let loading: Promise<void> | undefined;
  const ready = signal(false);
  const failed = signal("");
  const start = () =>
    (loading ??= load().then(
      (loaded) => {
        screen = loaded;
        ready.set(true);
      },
      (error) => {
        // The next showing tries again.
        loading = undefined;
        failed.set(String(error));
      },
    ));
  function Loaded() {
    const Screen = screen!;
    return <Screen />;
  }
  return function Lazy() {
    void start();
    return (
      <If when={ready()} else={<Loading failed={failed()} />}>
        <Loaded />
      </If>
    );
  };
}

/** What a screen that is still loading draws: quiet, in the theme's colors. */
function Loading(props: { failed: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {props.failed ? `The demo could not load: ${props.failed}` : "Loading…"}
      </Text>
    </View>
  );
}

/**
 * The screen of a demo not built yet: the one shared placeholder (`demos/placeholder.tsx`),
 * named for the entry that points at it.
 */
export function notBuilt(entry: { name: string; detail: string }): () => JSX.Element {
  return () => <Placeholder name={entry.name} detail={entry.detail} />;
}
