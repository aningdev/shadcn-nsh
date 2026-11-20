// The turn the trace page plays, shared by the demo and its reference page so both draw the same
// states. Demo content: it does not ship in the registry.
import { signal } from "nsh";

/** Where the streaming turn is: counting, reasoned, a call queued, running, done. */
export type TurnPhase = "thinking" | "thought" | "queued" | "running" | "done";

/** What the reasoning line says when it is opened. */
export const reasoning =
  "The harbor closes at dusk, so the tide table is what matters. I will look up today's tides, then work out the last safe crossing from the low water.";

/** The code the tool ran, and what it printed. */
export const toolCode = `tides = load("harbor.json")
low = min(tides, key=lambda t: t.height)
print(low.time)`;

/** What the failed call printed. */
export const failure = `Traceback (most recent call last):
  File "main.py", line 1, in <module>
    tides = load("harbor.json")
FileNotFoundError: harbor.json`;

/** The pages the answer drew on. */
export const sources = [
  { title: "Harbor tide tables", site: "harbor.dev" },
  { title: "Crossing times at low water", site: "tides.example.org" },
  { title: "Reading a tide chart", site: "sailing.example.com" },
];

/** How long each beat of the turn lasts, in milliseconds. */
const BEAT = { second: 700, pause: 900, queued: 900, running: 1500 };

/**
 * A turn that plays on demand: the reasoning counts to 3 s and opens, a tool call goes from queued
 * to running to done and opens onto its code. It starts finished.
 */
export function createTurn() {
  const phase = signal<TurnPhase>("done");
  const seconds = signal(3);
  const reasoningOpen = signal(true);
  const toolOpen = signal(true);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const later = (ms: number, next: () => void) => {
    clearTimeout(timer);
    timer = setTimeout(next, ms);
  };
  const count = () => {
    if (seconds() < 3) {
      seconds.set(seconds() + 1);
      later(BEAT.second, count);
      return;
    }
    phase.set("thought");
    reasoningOpen.set(true);
    later(BEAT.pause, () => {
      phase.set("queued");
      later(BEAT.queued, () => {
        phase.set("running");
        later(BEAT.running, () => {
          phase.set("done");
          toolOpen.set(true);
        });
      });
    });
  };
  return {
    phase: () => phase(),
    seconds: () => seconds(),
    reasoningOpen: () => reasoningOpen(),
    setReasoningOpen: (next: boolean) => reasoningOpen.set(next),
    toolOpen: () => toolOpen(),
    setToolOpen: (next: boolean) => toolOpen.set(next),
    /** Play the turn from the start. */
    replay() {
      phase.set("thinking");
      seconds.set(0);
      reasoningOpen.set(false);
      toolOpen.set(false);
      later(BEAT.second, count);
    },
  };
}
