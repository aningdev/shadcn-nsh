// The Data group: what shows the app's material — people, progress, tables, charts, diffs.
import { Activity, ChartLine, CircleUser, FileDiff, Table } from "lucide";

import { notBuilt, type DemoEntry } from "./entry";

/** The Data demos, in the index's order. */
export const data: DemoEntry[] = [
  {
    name: "Avatar",
    detail:
      "A team with presence dots, a stacked group and its overflow, a comment thread, a profile, pictures that fail or load slowly",
    icon: CircleUser,
    screen: notBuilt({
      name: "Avatar",
      detail:
        "A team with presence dots, a stacked group and its overflow, a comment thread, a profile, pictures that fail or load slowly",
    }),
  },
  {
    name: "Progress",
    detail: "A transfer the app drives, and one of unknown size",
    icon: Activity,
    screen: notBuilt({
      name: "Progress",
      detail: "A transfer the app drives, and one of unknown size",
    }),
  },
  {
    name: "DataTable",
    detail:
      "A million stocks of sixty columns, their quotes ticking every 33 ms, fixed columns, sorting, selection, resized and moved columns",
    icon: Table,
    screen: notBuilt({
      name: "DataTable",
      detail:
        "A million stocks of sixty columns, their quotes ticking every 33 ms, fixed columns, sorting, selection, resized and moved columns",
    }),
  },
  {
    name: "Plot",
    detail:
      "A live price, an order book's depth, a drawdown, capacity rings, a donut, bars, a profit bridge, a funnel, candles, risk-return bubbles, price targets, dual-axis charts and treemaps",
    icon: ChartLine,
    screen: notBuilt({
      name: "Plot",
      detail:
        "A live price, an order book's depth, a drawdown, capacity rings, a donut, bars, a profit bridge, a funnel, candles, risk-return bubbles, price targets, dual-axis charts and treemaps",
    }),
  },
  {
    name: "DiffView",
    detail: "Two texts side by side or unified, changes navigated, reverted and kept, a patch",
    icon: FileDiff,
    screen: notBuilt({
      name: "DiffView",
      detail: "Two texts side by side or unified, changes navigated, reverted and kept, a patch",
    }),
  },
];
