// The Apps group: The apps built on NSH, with this library's components.
import { ChartCandlestick, Images, MessagesSquare, PenLine } from "lucide";

import { lazy, notBuilt, type DemoEntry } from "./entry";

/** The Apps demos, in the official gallery's order. */
export const apps: DemoEntry[] = [
  {
    name: "Stocks",
    detail: "A live watchlist and a stock: candles, depth, the tape, a tick every 50 ms",
    icon: ChartCandlestick,
    screen: lazy(() => import("../demos/stocks").then((m) => m.StocksDemo)),
  },
  {
    name: "AI Chat",
    detail: "Local Claude / Codex, streaming replies, web simulation",
    icon: MessagesSquare,
    screen: lazy(() => import("../demos/chat").then((m) => m.ChatDemo)),
  },
  {
    name: "Photos",
    detail: "A long recycled list: images, pull to refresh, paging",
    icon: Images,
    screen: notBuilt({
      name: "Photos",
      detail: "A long recycled list: images, pull to refresh, paging",
    }),
  },
  {
    name: "Block editor",
    detail:
      "A Notion-style document: a / menu of blocks, a handle on each block to add, drag and turn it into another, a toolbar over the selection",
    icon: PenLine,
    screen: notBuilt({
      name: "Block editor",
      detail:
        "A Notion-style document: a / menu of blocks, a handle on each block to add, drag and turn it into another, a toolbar over the selection",
    }),
  },
];
