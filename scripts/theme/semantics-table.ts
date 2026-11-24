/**
 * The values the five themes resolve to, as a page: `docs/specs/semantics-values.md`.
 *
 *   bun run docs:semantics           # write the page
 *   bun run docs:semantics --check   # exit 1 when the page is stale
 *
 * One table per top-level group of `semantics.json` (typography, dimension, shape, state,
 * transition, motion, finishes, elevation), and one for the colour roles of `theme.json` before
 * them. A row is a field of the compiled values: the union across the five themes, so a field only
 * one theme states still has a row and the others show `—`.
 *
 * The compiled files split a value by appearance (`elevation`, colours) or by input tier
 * (`typography`, `dimension`), and `finishes` splits it into `shared` plus sparse per-appearance
 * overrides; a row therefore carries both sides, folded into one cell (`a / b`) when they differ.
 * Finishes are read through `mergeFinishes`, so a field stated in `shared` and one stated per
 * appearance list the same way.
 *
 * The `说明` column is Chinese and derived from the DTCG `$description`s in
 * `packages/theme/tokens/` and from `docs/specs/theme-roles.md`; `describe` holds those, and a
 * field it does not know is an error, so a new value cannot reach the page undescribed.
 */
import fs from "node:fs";
import path from "node:path";

import { mergeFinishes, type SplitFinishes } from "./tokens";

const ROOT = path.resolve(import.meta.dir, "../..");
const THEMES = path.join(ROOT, "packages/theme/themes");

/** The page this script writes, relative to the repo root. */
export const PAGE = "docs/specs/semantics-values.md";

/** A field no theme states, and the placeholder a table writes for it. */
export const MISSING = "—";

/**
 * The themes the page lists, in column order. `solid-glass` is out on purpose: it is the glass
 * example theme, not one of the platforms this library answers to.
 */
export const COLUMNS = [
  { id: "default", label: "NSH Gallery" },
  { id: "shadcn", label: "shadcn/ui" },
  { id: "apple", label: "Apple" },
  { id: "material", label: "Material" },
  { id: "winui", label: "WinUI" },
] as const;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A theme as the page reads it: its two compiled files. */
export type Theme = {
  /** The theme's id, as `packages/theme/themes/<id>/` names it. */
  id: string;
  /** The name its column carries. */
  label: string;
  /** `theme.json`'s `cssVars`: the colour roles, shared and per appearance. */
  colours: Json;
  /** `semantics.json`: the style groups, finishes and elevation. */
  semantics: Json;
};

/** A colour value: what `theme.json` stores for a colour role (`oklch(…)`, `var(--x)`, a mix). */
const COLOUR = /^(?:oklch|rgba?|hsla?|hwb|lab|lch|color)\(|^#|^var\(--/;

export function isColour(value: unknown): value is string {
  return typeof value === "string" && COLOUR.test(value);
}

/** A value as a cell: numbers and booleans as they are, strings in code spans, null as unset. */
export function format(value: unknown): string {
  if (value === null) return MISSING;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return code(value);
  return code(JSON.stringify(value));
}

/** A cell's text inside a code span; a pipe would end the table cell, so it is escaped. */
const code = (text: string) => `\`${text.replaceAll("|", "\\|")}\``;

/** One row's cell: the same value in both sides is written once, two values as `a / b`. */
export function fold(a: unknown, b: unknown): string {
  if (a === undefined) return b === undefined ? MISSING : format(b);
  if (b === undefined) return format(a);
  return JSON.stringify(a) === JSON.stringify(b) ? format(a) : `${format(a)} / ${format(b)}`;
}

const union = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])];

/** Every key of two objects, in the order the first one states them. */
const keysOf = (a: Json, b: Json): string[] => union(Object.keys(a), Object.keys(b));

/** A compiled value's fields, folded per appearance or tier, as `path → cell`. */
type Cells = Map<string, string>;

/** The five themes, `theme.json` and `semantics.json` read from the build. */
export function readThemes(): Theme[] {
  return COLUMNS.map(({ id, label }) => {
    const dir = path.join(THEMES, id);
    const colours = read(path.join(dir, "theme.json"), "cssVars");
    const semantics = read(path.join(dir, "semantics.json"));
    return { id, label, colours, semantics };
  });
}

function read(file: string, key?: string): Json {
  let value: unknown;
  try {
    value = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(ROOT, file)}: not JSON`, { cause: error });
  }
  if (key !== undefined) value = isObject(value) ? value[key] : undefined;
  if (!isObject(value))
    throw new Error(`${path.relative(ROOT, file)}: ${key ?? "the file"} is not an object`);
  return value as Json;
}

/**
 * The colour roles of one theme: `light`/`dark` first, in the order the file states them, then the
 * colours both appearances share (`cssVars.theme`'s `scrim`, `media`, `on-media`). A token that is
 * not a colour (a radius, a font family) is not a role and stays out.
 */
export function colourCells(theme: Theme): Cells {
  const vars = theme.colours;
  const light = isObject(vars.light) ? vars.light : {};
  const dark = isObject(vars.dark) ? vars.dark : {};
  const shared = isObject(vars.theme) ? vars.theme : {};
  const cells: Cells = new Map();
  for (const role of union(Object.keys(light), Object.keys(dark))) {
    cells.set(role, fold(light[role], dark[role]));
  }
  for (const [name, value] of Object.entries(shared)) {
    if (isColour(value)) cells.set(name, fold(value, value));
  }
  return cells;
}

/**
 * The fields of one `semantics.json` style group, its input tiers folded: a node that states
 * `pointer` and `touch` is one field whose cell reads `<pointer> / <touch>`.
 */
export function styleCells(group: string, theme: Theme): Cells {
  const node = theme.semantics[group];
  const cells: Cells = new Map();
  if (isObject(node)) walk(node, group, cells);
  return cells;
}

function walk(value: unknown, at: string, cells: Cells): void {
  if (isObject(value)) {
    if ("pointer" in value && "touch" in value) {
      foldTier(value, at, cells);
      return;
    }
    for (const [key, child] of Object.entries(value)) walk(child, `${at}.${key}`, cells);
    return;
  }
  cells.set(at, format(value));
}

/** One tier-split node at `at`: a single value (`size.hit`) or fields under it (`size.height`). */
function foldTier(tier: Json, at: string, cells: Cells): void {
  const pointer = tier.pointer;
  const touch = tier.touch;
  if (isObject(pointer) && isObject(touch)) {
    for (const key of keysOf(pointer, touch))
      cells.set(`${at}.${key}`, fold(pointer[key], touch[key]));
    return;
  }
  cells.set(at, fold(pointer, touch));
}

/** A finish's fields, each appearance merged with `shared`, folded into one cell. */
export function finishCells(theme: Theme): Cells {
  const finishes = theme.semantics.finishes;
  const cells: Cells = new Map();
  if (!isObject(finishes)) return cells;
  const split: SplitFinishes = {
    shared: blocks(finishes.shared),
    light: blocks(finishes.light),
    dark: blocks(finishes.dark),
  };
  const light = mergeFinishes(split, "light");
  const dark = mergeFinishes(split, "dark");
  for (const role of union(Object.keys(light), Object.keys(dark))) {
    const fields = keysOf(light[role] ?? {}, dark[role] ?? {});
    for (const field of fields) {
      cells.set(`finishes.${role}.${field}`, fold(light[role]?.[field], dark[role]?.[field]));
    }
  }
  return cells;
}

/** The role → fields blocks of a compiled `finishes`; an entry that is not an object is dropped. */
function blocks(value: unknown): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [role, fields] of Object.entries(isObject(value) ? value : {})) {
    if (isObject(fields)) out[role] = fields;
  }
  return out;
}

/** The shadow scale's fields, its two appearances folded into one cell. */
export function elevationCells(theme: Theme): Cells {
  const elevation = theme.semantics.elevation;
  const cells: Cells = new Map();
  if (!isObject(elevation)) return cells;
  pair(elevation.light, elevation.dark, "elevation", cells);
  return cells;
}

function pair(a: unknown, b: unknown, at: string, cells: Cells): void {
  if (isObject(a) || isObject(b)) {
    const left = isObject(a) ? a : {};
    const right = isObject(b) ? b : {};
    for (const key of keysOf(left, right)) pair(left[key], right[key], `${at}.${key}`, cells);
    return;
  }
  if (a === undefined && b === undefined) return;
  cells.set(at, fold(a, b));
}

/** One table: the shape of its rows and how a theme states them. */
export type Section = {
  /** The `semantics.json` group, or `colours` for the table read from `theme.json`. */
  id: string;
  /** The heading's text when the id alone does not say it (`colours`). */
  title?: string;
  /** The first column's heading: 角色 for colours, 字段 for a path. */
  field: string;
  /** A paragraph under the heading: what a row is and what `a / b` means. */
  note: string;
  /** One theme's rows, in the order that theme states them. */
  rows: (theme: Theme) => Cells;
};

const styleSection = (id: string, field: string, note: string): Section => ({
  id,
  field,
  note,
  rows: (theme) => styleCells(id, theme),
});

/** The tables, in the order the page writes them: colours first, then the groups of the file. */
export const SECTIONS: Section[] = [
  {
    id: "colours",
    title: "颜色角色（`theme.json`）",
    field: "角色",
    note: "`theme.json` 的 `cssVars`：`light` 与 `dark` 里的 A、B 两层颜色各写一份，两种外观共用的三个 C 层颜色（`scrim`、`media`、`on-media`）在表末。格子里是编译产物存的值：设了值的写 oklch，引用其他角色的写 `var(--…)`，叠色写 `color-mix(…)`。",
    rows: colourCells,
  },
  styleSection(
    "typography",
    "字段",
    "7 个字阶角色的字号、行高、字重与字距；`fontSize` 与 `lineHeight` 分指针与触屏两档，`fontWeight` 与 `letterSpacing` 两档同值。行高是整数点数（源码里的倍率已在 `tokens:build` 时乘回）。",
  ),
  styleSection(
    "dimension",
    "字段",
    "`shape` 的 3 个层圆角以 `{radius-…}` 引用 `theme.json` 的圆角 token；`size.hit`、`size.density`、`size.item`、`size.control`、`size.height`、`icon` 分指针与触屏两档；`stroke`、`focus` 与 `control` 的六个控件维度不随档位变。",
  ),
  styleSection("shape", "字段", "非尺寸的圆角决定：曲率，以及按钮的角取圆角刻度还是胶囊。"),
  styleSection("state", "字段", "交互状态的透明度、按下缩放、叠色与水波开关。"),
  styleSection("transition", "字段", "表面进场动画的时长与曲线（曲线名引用 `cubicBezier` 组）。"),
  styleSection(
    "motion",
    "字段",
    "三档弹簧与状态淡变。一套主题对一档要么写弹簧（`stiffness` / `damping`），要么写时间（`duration` / `timingFunction`），另一种参数化的那一格是 `—`。",
  ),
  {
    id: "finishes",
    field: "字段",
    note: "14 个 finish 角色，字段共 13 种（一个角色只用到其中几种）。编译产物把它分成 `shared` 与稀疏的 `light` / `dark`，本表列的是两者合并后的值，于是只有一种外观写了的字段也照样是一行。`{token}` 是对 `theme.json` 的引用，`null` 是该字段的中性值（见 `theme-roles.md` §2）。",
    rows: finishCells,
  },
  {
    id: "elevation",
    field: "字段",
    note: "每个外观的影子刻度：五档高度与两条边。finish 的 `shadow` 字段点名这里的几部分，所以同一步影子的面长得一样。",
    rows: elevationCells,
  },
];

/**
 * The `说明` of one row, keyed by its path. The `$description`s of the DTCG sources
 * (`packages/theme/tokens/base/*.tokens.json`, `themes/<id>/*.tokens.json`) and
 * `docs/specs/theme-roles.md` are what these say, in one Chinese line each.
 */
const DESCRIPTIONS: Record<string, string> = {
  // theme.json: the colour roles.
  background: "页面画布的底",
  foreground: "页面上的正文与图标墨色",
  card: "卡片的底，浮于页面一层",
  "card-foreground": "卡片上的字与图标",
  popover: "浮层的底：菜单、弹出层、提示",
  "popover-foreground": "浮层上的字与图标",
  primary: "主操作的强调色填充",
  "primary-foreground": "主操作填充上的字与图标",
  secondary: "次操作控件的填充",
  "secondary-foreground": "次操作控件上的字与图标",
  muted: "压下去的容器底与浅底",
  "muted-foreground": "次要文字与图标",
  accent: "悬停与选中项的浅高亮底",
  "accent-foreground": "高亮底上的字与图标",
  destructive: "危险操作与错误的语义色",
  border: "容器与控件的常规发丝线",
  input: "表单字段与控件边的线",
  ring: "焦点环的线",
  "chart-1": "第 1 条图表系列色",
  "chart-2": "第 2 条图表系列色",
  "chart-3": "第 3 条图表系列色",
  "chart-4": "第 4 条图表系列色",
  "chart-5": "第 5 条图表系列色",
  sidebar: "侧栏面板的底",
  "sidebar-foreground": "侧栏里的字与图标",
  "sidebar-primary": "侧栏里的主操作高亮",
  "sidebar-primary-foreground": "侧栏主操作高亮上的字与图标",
  "sidebar-accent": "侧栏选中行的底",
  "sidebar-accent-foreground": "侧栏选中行上的字与图标",
  "sidebar-border": "侧栏分隔与工具条的发丝线",
  "sidebar-ring": "侧栏里的焦点环",
  inset: "卡片里凹下去的一层（井）",
  raised: "卡片上凸起的一层：按钮、字段、轨道",
  field: "输入井：比卡片和 inset 更下一层",
  line: "井里的发丝线（分隔、网格）",
  hover: "指针停在可点项上的叠色",
  faint: "更弱的字：占位、单位、次要标记",
  brand: "强调色作前景：字、图标、线",
  "brand-edge": "强调色填充控件的发丝线",
  track: "关着的开关、滑杆与进度条的底槽",
  knob: "关着的开关圆点",
  info: "提示状态的语义色",
  warn: "警告状态的语义色",
  up: "增长（上涨）的语义色",
  "brand-tint": "选中行与气泡的强调色淡底",
  inverse: "toast 与 tooltip 的反色面",
  "inverse-foreground": "反色面上的字",
  "inverse-brand": "反色面上的强调色：toast 的操作",
  "info-tint": "提示状态的淡底",
  "warn-tint": "警告状态的淡底",
  "destructive-tint": "危险状态的淡底",
  "up-tint": "上涨的淡底",
  "down-tint": "下跌的淡底",
  scrim: "模态与抽屉背后的遮罩",
  media: "照片与影片的底，不随外观翻转",
  "on-media": "照片与深色媒体面上的白字，不随外观翻转",

  // dimension: the group descriptions, then the fields they do not cover one by one.
  "dimension.shape.control": "页内元素的圆角：输入框、行、徽标、标签、井、色区、kbd",
  "dimension.shape.container": "容器与浮层的圆角：卡片、菜单、弹出层、提示、列表面板、toast",
  "dimension.shape.modal": "模态面的圆角：对话框、抽屉、底部面板",
  "dimension.size.hit": "触控目标的最小边长，0 表示不补点按范围",
  "dimension.size.density.pad": "页面级的页边距",
  "dimension.size.density.gap": "页面级的间隙",
  "dimension.size.item.inset": "列表行到容器边的距离：行的填充往里缩多少",
  "dimension.size.item.pad": "行填充边到文字的间距",
  "dimension.size.control.padding": "控件内部的留白",
  "dimension.size.control.gap": "控件内图标与字的间距",
  "dimension.size.control.dot": "指示点的直径：开关的点、选择器的点",
  "dimension.size.control.switch": "开关的钮取哪一档",
  "dimension.size.height.sm": "控件高度的小档",
  "dimension.size.height.md": "控件高度的中档",
  "dimension.size.height.lg": "控件高度的大档（也是列表行、标签页的高度）",
  "dimension.icon.sm": "图标的小档",
  "dimension.icon.md": "图标的中档",
  "dimension.icon.lg": "图标的大档",
  "dimension.stroke.hairline": "发丝线宽：分隔、表面边、描边变体",
  "dimension.stroke.control": "可点控件的描边宽",
  "dimension.focus.style": "焦点环的画法：晕、外框还是双线",
  "dimension.focus.width": "焦点环的线宽",
  "dimension.focus.offset": "焦点环从控件边界向外的偏移",
  "dimension.control.field": "输入井的框：四条边、只下边，还是框加下边",
  "dimension.control.choice": "选择框静止时的面",
  "dimension.control.track": "轨道：凹槽、色带，还是一条细线",
  "dimension.control.handle": "手柄：圆钮、竖条，还是环",

  // shape: what a theme decides about corners, off the size scales.
  "shape.curve": "圆角的曲率：连续曲线（Apple）还是圆弧",
  "shape.corners.button": "按钮的角：取圆角刻度，还是胶囊",

  // state: the interaction numbers.
  "state.press-scale": "按下时的缩放倍数（1 为不缩放）",
  "state.overlay.hover": "指针悬停的叠色透明度（0 为不叠色）",
  "state.overlay.focus": "获得焦点的叠色透明度",
  "state.overlay.pressed": "按下的叠色透明度",
  "state.overlay.dragged": "拖动的叠色透明度",
  "state.ripple": "按下时是否画水波",
  "state.pressed-opacity": "按下时内容的透明度",
  "state.rest-opacity": "指示器静止时的透明度（滚动条滑块）",
  "state.disabled.content": "禁用时内容的透明度",
  "state.disabled.fill": "禁用时容器是否改画专用的禁用底，否则沿用统一透明度",

  // transition: the one named preset.
  "transition.enter.duration": "表面进场的时长（ms）",
  "transition.enter.timingFunction": "表面进场的曲线（`cubicBezier` 组里的名字）",

  // elevation: the shadow scale, one row per level and edge.
  "elevation.sm": "控件的投影：落在它所在的那个面上",
  "elevation.md": "卡片的投影：面离页面一步",
  "elevation.lg": "浮层的投影：菜单浮在页面之上",
  "elevation.xl": "对话框的投影：页面在它后面等",
  "elevation.inset": "井的投影：光落进槽里",
  "elevation.edge.surface": "凸起表面的硬边：它的高光与发丝线",
  "elevation.edge.accent": "强调色填充的边：高光与自己的投影",
};

/** The noun a section's rows are about, so a row reads `<noun>的<field>`. */
const NOUNS: Record<string, string> = {
  caption: "小号说明与分段计数",
  detail: "侧栏分组名与计数",
  body: "正文",
  label: "控件与表单的标签",
  title: "卡片与区块标题",
  headline: "页面标题",
  display: "大号数字与主视觉标题",
  fast: "小控件开关",
  default: "日常反馈",
  slow: "大表面移动",
  state: "状态淡变",
  card: "卡片与区块",
  inset: "井",
  channel: "分段轨道",
  raised: "按钮与胶囊",
  plate: "井里选中的一块",
  overlay: "菜单与 toast",
  modal: "对话框与抽屉",
  inverse: "反色面",
  glass: "玻璃面",
  accent: "强调面",
  fill: "进度条、滑杆与开关选中的那段",
  knob: "旋钮",
  hover: "悬停中的控件",
  pressed: "按下的控件",
  disabled: "禁用的控件",
};

/** The field's noun per section, so `caption` + `fontSize` reads `小号说明与分段计数的字号`. */
const FIELD_NOUNS: Record<string, Record<string, string>> = {
  typography: { fontSize: "字号", lineHeight: "行高", fontWeight: "字重", letterSpacing: "字距" },
  motion: {
    stiffness: "弹簧刚度",
    damping: "阻尼",
    duration: "时长（ms）",
    timingFunction: "曲线",
  },
  finishes: {
    background: "底",
    gradient: "叠在底上的渐变",
    shadow: "影子",
    foreground: "字与图标",
    "pressed-background": "按下时换的底色",
    "pressed-foreground": "按下时换的字色",
    "pressed-opacity": "按下时的不透明度（强调面上的字与图标）",
    "border-color": "边",
    "border-top-color": "上边色",
    "border-bottom-color": "下边色",
    backdropFilter: "背景模糊",
    "checked-background": "打开时的底",
    "checked-border-color": "打开时的边",
    "checked-gradient": "打开时叠在底上的渐变",
    material: "材质",
    elevation: "平台自己的高度（dp）",
  },
};

/** A row's `说明`, or an error naming the field no source describes. */
export function meaning(at: string): string {
  const known = DESCRIPTIONS[at] ?? composed(at);
  if (known === undefined || known === "") {
    throw new Error(`docs:semantics: no description for \`${at}\`; add one to DESCRIPTIONS`);
  }
  return known;
}

/**
 * `<group>.<noun>.<field>`, for the three groups whose rows all read that way
 * (`typography.body.fontSize`, `motion.default.damping`, `finishes.card.background`).
 */
function composed(at: string): string | undefined {
  const [group, noun, field] = at.split(".");
  if (group === undefined || noun === undefined || field === undefined) return undefined;
  const owner = NOUNS[noun];
  const leaf = FIELD_NOUNS[group]?.[field];
  if (owner === undefined || leaf === undefined) return undefined;
  return `${owner}的${leaf}`;
}

/** The page's heading and the paragraph that says how to read it. */
const INTRO = `# 每套主题解析后的值

> 本页由 \`bun run docs:semantics\` 生成，请勿手改：改 \`packages/theme/tokens/\` 的源码或生成器 \`scripts/theme/semantics-table.ts\` 之后重新运行它。\`bun run check\` 里的 \`docs:semantics --check\` 会拦下没重建的提交。

本页列五套主题编译后的每一个字段：\`theme.json\` 的颜色角色，以及 \`semantics.json\` 的八组语义值。它是**值**的表，不是规则：每个角色、每个 finish 的含义与读者见 [\`theme-roles.md\`](theme-roles.md)，要决定什么见 [\`../theme-design.md\`](../theme-design.md)，一套值为什么这么定见 [\`native-themes.md\`](native-themes.md)。

- 一行是一个字段：\`字段\` 列是编译产物里的路径（\`theme.json\` 的 \`cssVars.light\` / \`cssVars.dark\` / \`cssVars.theme\`，或 \`semantics.json\` 的同名路径）。行取五套主题的并集：只有一套主题写了的字段照样一行，其余四格是 \`—\`。
- 五列是五套主题，\`default\` 一列写 NSH Gallery，其余按平台名。\`solid-glass\` 不在本页：它是玻璃的示例主题，不是本库要对齐的五套基线。
- 行序取五套主题第一次写出这个字段的顺序：某套主题独有的字段排在后面。
- 一格写 \`a / b\`，表示两种取值不同：颜色表与 \`elevation\` 是 light / dark，\`typography\`、\`dimension\` 是指针 / 触屏两档。只有一种取值时写一个。
- 写 \`—\` 是这套主题不用这个字段（没有这个字段，或值为 \`null\`）；五套主题都不用的字段不列。反引号里的 \`none\` 是真正的 CSS 值。数字与布尔照写，字符串在反引号里，数组与对象写成紧凑 JSON。
`;

/** The page's markdown, built from the compiled themes. */
export function renderPage(themes: Theme[] = readThemes()): string {
  const parts = [INTRO];
  SECTIONS.forEach((section, index) => {
    const perTheme = themes.map((theme) => section.rows(theme));
    const rows = merged(perTheme);
    parts.push(renderSection(section, index + 1, themes, rows));
  });
  return parts.join("\n");
}

/**
 * Every row of a section, one cell per theme, in the order the first theme states them. A row no
 * theme sets (every cell unset) is left out: the field is in the contract but nothing uses it.
 */
function merged(perTheme: Cells[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  perTheme.forEach((cellsOfTheme, column) => {
    for (const [at, cell] of cellsOfTheme) {
      const row = out.get(at) ?? perTheme.map(() => MISSING);
      row[column] = cell;
      out.set(at, row);
    }
  });
  for (const [at, row] of out) if (row.every((cell) => cell === MISSING)) out.delete(at);
  return out;
}

function renderSection(
  section: Section,
  number: number,
  themes: Theme[],
  rows: Map<string, string[]>,
): string {
  const head = `| ${section.field} | 说明 | ${themes.map((theme) => theme.label).join(" | ")} |`;
  const rule = `| --- | --- | ${themes.map(() => "---").join(" | ")} |`;
  const body = [...rows].map(
    ([at, cells]) => `| ${code(at)} | ${meaning(at)} | ${cells.join(" | ")} |`,
  );
  return `## ${number} ${section.title ?? section.id}\n\n${section.note}\n\n${[head, rule, ...body].join("\n")}\n`;
}

/** How many rows the page has, for the script's report. */
export function rowCount(themes: Theme[] = readThemes()): number {
  return SECTIONS.reduce((total, section) => total + merged(themes.map(section.rows)).size, 0);
}

if (import.meta.main) {
  const page = path.join(ROOT, PAGE);
  const rendered = renderPage();
  const current = fs.existsSync(page) ? fs.readFileSync(page, "utf8") : "";
  if (process.argv.includes("--check")) {
    if (current !== rendered) {
      console.error(`docs:semantics: ${PAGE} is stale; run \`bun run docs:semantics\``);
      process.exit(1);
    }
    console.log(`docs:semantics: ${PAGE} is current (${rowCount()} rows).`);
  } else {
    fs.writeFileSync(page, rendered);
    console.log(`docs:semantics: wrote ${PAGE} (${rowCount()} rows).`);
  }
}
