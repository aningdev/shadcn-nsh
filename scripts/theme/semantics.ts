/**
 * The values the five platform themes resolve to, as a page: `docs/theme-values.md`.
 *
 *   bun run docs:semantics           # write the page
 *   bun run docs:semantics --check   # exit 1 when the page is stale
 *
 * Reads the compiled Theme v5 objects directly from `packages/theme/themes` (`docs/theme.md`):
 * 1. colours   (`theme.json` `cssVars`)
 * 2. shape     (`tokens.radius`)
 * 3. typography (`metrics.typography`)
 * 4. metrics   (`metrics` dimensions, split by pointer/touch)
 * 5. feedback  (`feedback` hover/press/focus/disabled/passive)
 * 6. motion    (`motion` timings, spring, and presets)
 * 7. surfaces  (11 surface roles, light/dark folded)
 * 8. elevation (`elevation` shadow scales, light/dark folded)
 * 9. controls  (13 sparse control recipes)
 */
import fs from "node:fs";
import path from "node:path";

import type { AppTheme, SurfaceSpec } from "../../packages/theme/schema";
import { ALL_THEMES } from "../../packages/theme/themes";

const ROOT = path.resolve(import.meta.dir, "../..");

/** The page this script writes, relative to the repo root. */
export const PAGE = "docs/theme-values.md";

/** A field no theme states, and the placeholder a table writes for it. */
export const MISSING = "—";

/**
 * The five platform themes in column order. `solid-glass` stays out on purpose: it is the glass
 * example theme, not one of the baseline platforms.
 */
export const COLUMNS = [
  { id: "nsh-gallery", label: "NSH Gallery" },
  { id: "shadcn", label: "shadcn/ui" },
  { id: "apple", label: "Apple" },
  { id: "material", label: "Material" },
  { id: "winui", label: "WinUI" },
] as const;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Theme view consumed by `renderPage`. */
export interface Theme {
  id: string;
  label: string;
  colours: Json;
  spec: AppTheme["spec"];
}

const COLOUR = /^(?:oklch|rgba?|hsla?|hwb|lab|lch|color)\(|^#|^var\(--/;

export function isColour(value: unknown): value is string {
  return typeof value === "string" && COLOUR.test(value);
}

/** A value as a cell: numbers and booleans verbatim, strings in code spans, null/undefined as `—`. */
export function format(value: unknown): string {
  if (value === null || value === undefined) return MISSING;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return code(value);
  if (isObject(value)) {
    if (
      "color" in value &&
      typeof value.color === "string" &&
      Object.keys(value).every((k) => k === "color" || k === "alpha")
    ) {
      return code(
        "alpha" in value && value.alpha !== undefined
          ? `${value.color}/${Math.round(Number(value.alpha) * 100)}`
          : value.color,
      );
    }
    if ("tint" in value && typeof value.tint === "string") {
      return code(
        "alpha" in value && value.alpha !== undefined
          ? `tint(${value.tint},${Math.round(Number(value.alpha) * 100)}%)`
          : `tint(${value.tint})`,
      );
    }
    if (
      "surface" in value &&
      typeof value.surface === "string" &&
      Object.keys(value).length === 1
    ) {
      return code(`surface(${value.surface})`);
    }
  }
  return code(JSON.stringify(value));
}

const code = (text: string) => `\`${text.replaceAll("|", "\\|")}\``;

/** Fold two values into one cell (`a` if equal, `a / b` if different). */
export function fold(a: unknown, b: unknown): string {
  if (a === undefined) return b === undefined ? MISSING : format(b);
  if (b === undefined) return format(a);
  return JSON.stringify(a) === JSON.stringify(b) ? format(a) : `${format(a)} / ${format(b)}`;
}

const union = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])];
const keysOf = (a: Json, b: Json): string[] => union(Object.keys(a), Object.keys(b));

type Cells = Map<string, string>;

/** Read the five platform themes from `ALL_THEMES`. */
export function readThemes(): Theme[] {
  return COLUMNS.map(({ id, label }) => {
    const found = ALL_THEMES.find((t) => t.id === id);
    if (!found) throw new Error(`docs:semantics: missing theme ${id}`);
    return {
      id,
      label,
      colours: found.theme.cssVars as unknown as Json,
      spec: found.spec,
    };
  });
}

/** Colour roles in `theme.json` `cssVars`. */
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

const isExprLeaf = (value: unknown): boolean =>
  isObject(value) &&
  (("color" in value &&
    typeof value.color === "string" &&
    Object.keys(value).every((k) => k === "color" || k === "alpha")) ||
    ("tint" in value && typeof value.tint === "string") ||
    ("surface" in value && typeof value.surface === "string" && Object.keys(value).length === 1));

const isModePair = (value: unknown): value is { light: unknown; dark: unknown } =>
  isObject(value) && "light" in value && "dark" in value && Object.keys(value).length === 2;

const isSurfaceSpec = (value: unknown): value is SurfaceSpec =>
  isObject(value) &&
  !("light" in value && Object.keys(value).length === 2 && "dark" in value) &&
  ("background" in value ||
    "foreground" in value ||
    "gradient" in value ||
    "border" in value ||
    "borderTop" in value ||
    "borderBottom" in value ||
    "shadow" in value ||
    "backdropFilter" in value ||
    "material" in value ||
    "effect" in value ||
    "elevation" in value ||
    ("light" in value && isObject(value.light)) ||
    ("dark" in value && isObject(value.dark)));

function resolveSurfaceSide(spec: SurfaceSpec, mode: "light" | "dark"): Json {
  const out: Json = {};
  for (const [k, v] of Object.entries(spec)) {
    if (k === "light" || k === "dark") continue;
    out[k] = v;
  }
  const override = spec[mode];
  if (isObject(override)) {
    for (const [k, v] of Object.entries(override)) {
      if (v !== undefined) out[k] = v;
    }
  }
  return out;
}

/** Walk a Theme v5 sub-object, folding `{ pointer, touch }`, `{ light, dark }`, and `SurfaceSpec`. */
export function walkCells(node: unknown, prefix: string, cells: Cells = new Map()): Cells {
  if (isObject(node)) {
    if (isExprLeaf(node)) {
      cells.set(prefix, format(node));
      return cells;
    }
    if ("pointer" in node && "touch" in node && Object.keys(node).length === 2) {
      foldTier(node, prefix, cells);
      return cells;
    }
    if (isModePair(node)) {
      pair(node.light, node.dark, prefix, cells);
      return cells;
    }
    if (isSurfaceSpec(node)) {
      const light = resolveSurfaceSide(node, "light");
      const dark = resolveSurfaceSide(node, "dark");
      for (const field of keysOf(light, dark)) {
        cells.set(`${prefix}.${field}`, fold(light[field], dark[field]));
      }
      return cells;
    }
    for (const [key, child] of Object.entries(node)) {
      if (child !== undefined) walkCells(child, `${prefix}.${key}`, cells);
    }
    return cells;
  }
  cells.set(prefix, format(node));
  return cells;
}

function foldTier(tier: Json, at: string, cells: Cells): void {
  const { pointer, touch } = tier;
  if (isObject(pointer) && isObject(touch)) {
    for (const key of keysOf(pointer, touch)) {
      cells.set(`${at}.${key}`, fold(pointer[key], touch[key]));
    }
    return;
  }
  cells.set(at, fold(pointer, touch));
}

function pair(a: unknown, b: unknown, at: string, cells: Cells): void {
  if ((isObject(a) && !isExprLeaf(a)) || (isObject(b) && !isExprLeaf(b))) {
    const left = isObject(a) ? a : {};
    const right = isObject(b) ? b : {};
    for (const key of keysOf(left, right)) pair(left[key], right[key], `${at}.${key}`, cells);
    return;
  }
  if (a === undefined && b === undefined) return;
  cells.set(at, fold(a, b));
}

export function surfaceCells(theme: Theme): Cells {
  const cells: Cells = new Map();
  for (const [role, spec] of Object.entries(theme.spec.surfaces)) {
    walkCells(spec, `surfaces.${role}`, cells);
  }
  return cells;
}

export function elevationCells(theme: Theme): Cells {
  const cells: Cells = new Map();
  pair(theme.spec.elevation.light, theme.spec.elevation.dark, "elevation", cells);
  return cells;
}

export function metricsCells(theme: Theme): Cells {
  const cells: Cells = new Map();
  const { typography: _typography, ...rest } = theme.spec.metrics;
  walkCells(rest, "metrics", cells);
  return cells;
}

export interface Section {
  id: string;
  title?: string;
  field: string;
  note: string;
  rows: (theme: Theme) => Cells;
}

export const SECTIONS: Section[] = [
  {
    id: "colours",
    title: "颜色角色（`theme.json`）",
    field: "角色",
    note: "`theme.json` 的 `cssVars`：21 个亮暗角色与 3 个外观无关角色（`scrim`、`media`、`on-media`）。省略的 `brand` 在导出层设为 `var(--primary)`。",
    rows: colourCells,
  },
  {
    id: "shape",
    field: "字段",
    note: "圆角刻度与圆角曲率（`continuous` 或 `circular`）。",
    rows: (t) => walkCells(t.spec.tokens.radius, "shape"),
  },
  {
    id: "typography",
    field: "字段",
    note: "7 个字阶角色的字重与字距（字号与行高共享于 `SHARED_TYPE_SCALE`）。",
    rows: (t) => walkCells(t.spec.metrics.typography, "typography"),
  },
  {
    id: "metrics",
    field: "字段",
    note: "指针（左）与触屏（右）两档的尺寸、密度、命中范围、图标与线宽。",
    rows: metricsCells,
  },
  {
    id: "feedback",
    field: "字段",
    note: "统一的交互反馈原语：hover、press、focus、disabled、passive。",
    rows: (t) => walkCells(t.spec.feedback, "feedback"),
  },
  {
    id: "motion",
    field: "字段",
    note: "过渡时长与缓动、默认弹簧与 snappy / smooth / bouncy 分档，以及入场、指示器、展开和按压预设。",
    rows: (t) => walkCells(t.spec.motion, "motion"),
  },
  {
    id: "surfaces",
    field: "字段",
    note: "11 个纯结构表面角色（`card`、`raised`、`inset`、`channel`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`accent`、`fill`），亮暗差异折在一格。",
    rows: surfaceCells,
  },
  {
    id: "elevation",
    field: "字段",
    note: "亮暗两套投影刻度与硬边高光。",
    rows: elevationCells,
  },
  {
    id: "controls",
    field: "字段",
    note: "13 个控件组的稀疏配方，消除了布尔特征分支；零星保留项通过数值退化实现（如 `switch.knob.on` 与 `slider.mark`）。",
    rows: (t) => walkCells(t.spec.controls, "controls"),
  },
];

const DESCRIPTIONS: Record<string, string> = {
  // theme.json 21+3 colour roles
  background: "页面画布的底",
  card: "卡片与面板的底",
  popover: "浮层与菜单的底",
  muted: "弱化容器的底与浅底",
  surface: "卡片上凸起的控件面底",
  foreground: "页面与各类面上的默认正文及图标墨色",
  "muted-foreground": "次要文字与图标",
  faint: "更弱的字：占位、单位、次要标记",
  primary: "主操作的强调色填充",
  "primary-foreground": "主操作填充上的字与图标",
  secondary: "次操作控件的填充",
  accent: "悬停与选中项的浅高亮底",
  brand: "强调色作前景：链接、指示条、选中标记",
  border: "容器与控件的常规发丝线",
  line: "井内与内容区的分隔发丝线",
  input: "表单字段与控件边的线",
  ring: "焦点环的线",
  info: "提示状态的语义色",
  success: "成功与增长（上涨）的语义色",
  warning: "警告状态的语义色",
  destructive: "危险操作与错误的语义色",
  scrim: "模态与抽屉背后的遮罩",
  media: "照片与媒体的底，不随外观翻转",
  "on-media": "媒体面上的浅色字，不随外观翻转",

  // shape
  "shape.control": "常规控件圆角",
  "shape.container": "卡片与面板容器圆角",
  "shape.modal": "浮层与模态框圆角",
  "shape.curve": "圆角曲率：连续曲线（Apple）还是圆弧",

  // metrics
  "metrics.height.sm": "小档控件高度",
  "metrics.height.md": "中档控件高度",
  "metrics.height.lg": "大档控件与行高",
  "metrics.icon.sm": "小档图标尺寸",
  "metrics.icon.md": "中档图标尺寸",
  "metrics.icon.lg": "大档图标尺寸",
  "metrics.density.pad": "页面内边距",
  "metrics.density.gap": "页面区块间距",
  "metrics.control.padding": "控件水平内边距",
  "metrics.control.gap": "控件内图标与文字间距",
  "metrics.item.inset": "列表选中行相对容器边的缩进",
  "metrics.item.pad": "列表行内边距",
  "metrics.hit": "触控目标最小边长（0 表示不补范围）",
  "metrics.stroke.hairline": "发丝线宽",
  "metrics.stroke.control": "控件描边线宽",

  // feedback
  "feedback.hover.overlay": "悬停状态的墨色叠层透明度（0 不叠层）",
  "feedback.hover.fill": "通用悬停底色",
  "feedback.press.scale": "按下缩放倍数（1 不缩放）",
  "feedback.press.translateY": "按下垂直位移（pt）",
  "feedback.press.overlay": "按下状态的墨色叠层透明度",
  "feedback.press.accent.opacity": "强调面按下时的不透明度",
  "feedback.press.accent.background": "强调面按下时换的底色",
  "feedback.press.accent.foreground": "强调面按下时换的前景色",
  "feedback.focus.style": "焦点环画法：halo / outline / double",
  "feedback.focus.width": "焦点环线宽",
  "feedback.focus.offset": "焦点环外扩偏移",
  "feedback.focus.innerColor": "double 焦点环的内分隔线颜色",
  "feedback.disabled.contentOpacity": "禁用态内容透明度",
  "feedback.disabled.replaceFace": "禁用时是否整面替换为 disabled.surface",
  "feedback.passive.restOpacity": "非交互指示器（如滚动条滑块）静止透明度",
  "feedback.passive.pressedOpacity": "非交互指示器按下透明度",

  // motion
  "motion.spring.stiffness": "物理弹性刚度",
  "motion.spring.damping": "物理弹性阻尼",
  "motion.spring.mass": "物理弹性质量",
  "motion.springs.snappy.stiffness": "灵敏弹簧刚度",
  "motion.springs.snappy.damping": "灵敏弹簧阻尼",
  "motion.springs.snappy.mass": "灵敏弹簧质量",
  "motion.springs.smooth.stiffness": "顺滑弹簧刚度",
  "motion.springs.smooth.damping": "顺滑弹簧阻尼",
  "motion.springs.smooth.mass": "顺滑弹簧质量",
  "motion.springs.bouncy.stiffness": "回弹弹簧刚度",
  "motion.springs.bouncy.damping": "回弹弹簧阻尼",
  "motion.springs.bouncy.mass": "回弹弹簧质量",
  "motion.presets.popoverEnter.fromScale": "弹出层入场初始缩放",
  "motion.presets.popoverEnter.fromY": "弹出层入场初始 Y 偏移",
  "motion.presets.popoverEnter.timing": "弹出层入场使用的时序档位",
  "motion.presets.popoverEnter.spring":
    "弹出层入场弹簧：true 用默认弹簧，或 snappy / smooth / bouncy",
  "motion.presets.dialogEnter.fromScale": "对话框入场初始缩放",
  "motion.presets.dialogEnter.fromY": "对话框入场初始 Y 偏移",
  "motion.presets.dialogEnter.timing": "对话框入场使用的时序档位",
  "motion.presets.dialogEnter.spring":
    "对话框入场弹簧：true 用默认弹簧，或 snappy / smooth / bouncy",
  "motion.presets.indicatorGlide.timing": "指示器/滑块滑动使用的时序档位",
  "motion.presets.indicatorGlide.spring":
    "指示器滑动弹簧：true 用默认弹簧，或 snappy / smooth / bouncy",
  "motion.presets.reveal.spring": "展开面板的弹簧：true 用默认弹簧，或 snappy / smooth / bouncy",
  "motion.presets.press.spring": "按压过渡的弹簧：true 用默认弹簧，或 snappy / smooth / bouncy",
  "motion.presets.themeSwitch.kind": "运行时切换主题的屏幕过渡方式",
  "motion.presets.themeSwitch.duration": "运行时切换主题过渡时长",

  // elevation
  "elevation.sm": "控件投影",
  "elevation.md": "卡片投影",
  "elevation.lg": "浮层投影",
  "elevation.xl": "模态框投影",
  "elevation.inset": "凹槽内阴影",
  "elevation.edgeSurface": "凸起表面的高光硬边",
  "elevation.edgeAccent": "强调面的高光与投影边",

  // controls
  "controls.button.corner.sm": "小号按钮圆角策略",
  "controls.button.corner.md": "中号按钮圆角策略",
  "controls.button.corner.lg": "大号按钮圆角策略",
  "controls.button.selected.face": "选中按钮的底面",
  "controls.button.selected.ink": "选中按钮的前景色",
  "controls.button.secondary.face": "次要按钮的底面",
  "controls.button.secondary.edge": "次要按钮的描边",
  "controls.button.outline.edge": "描边按钮的边",
  "controls.button.destructive.edge": "危险按钮的边",
  "controls.button.shade": "按钮使用的表面角色",
  "controls.badge.corner": "徽章圆角策略",
  "controls.field.ground": "输入框底色",
  "controls.field.shade": "输入框表面角色",
  "controls.field.edge.sides": "输入框是否绘制左右与上边框",
  "controls.field.edge.color": "输入框四周边框色",
  "controls.field.edge.bottom": "输入框底边颜色",
  "controls.field.focus.line": "输入框获焦时是否加粗底线",
  "controls.field.focus.width": "输入框获焦线宽",
  "controls.field.focus.color": "输入框获焦高亮角色",
  "controls.choice.size": "选择控件命中或视觉方框外尺寸",
  "controls.choice.box": "选择控件框体尺寸",
  "controls.choice.corner": "复选框圆角策略",
  "controls.choice.face": "未选中选择框底色",
  "controls.choice.shade": "选择框表面角色",
  "controls.choice.edge.width": "选择框描边宽",
  "controls.choice.edge.color": "选择框默认描边色",
  "controls.choice.edge.disabled": "选择框禁用态描边色",
  "controls.choice.checked.face": "复选框选中底面",
  "controls.choice.radioChecked.face": "单选框选中面",
  "controls.choice.mark": "单选框内圆点尺寸",
  "controls.switch.track": "默认开关轨道宽高 `[w, h]`",
  "controls.switch.trackOffFace": "开关关闭态轨道底色",
  "controls.switch.small.track": "小号开关轨道宽高 `[w, h]`",
  "controls.switch.small.knob": "小号开关滑块尺寸",
  "controls.switch.edge.off": "开关关闭态边框宽",
  "controls.switch.edge.on": "开关打开态边框宽",
  "controls.switch.edge.color": "开关边框色",
  "controls.switch.knob.size": "开关滑块常态尺寸",
  "controls.switch.knob.on": "开关滑块打开态尺寸（`same` 表示不变，Material 为放大）",
  "controls.switch.knob.pressed": "开关滑块按下态尺寸",
  "controls.switch.knob.background": "开关滑块常态底色",
  "controls.switch.knob.gradient": "开关滑块常态渐变",
  "controls.switch.knob.border": "开关滑块常态边色",
  "controls.switch.knob.shadow": "开关滑块投影",
  "controls.switch.knob.checkedBackground": "开关滑块打开态底色",
  "controls.switch.knob.checkedBorder": "开关滑块打开态边色",
  "controls.switch.knob.checkedGradient": "开关滑块打开态渐变",
  "controls.slider.rail": "滑杆轨道粗细",
  "controls.slider.band": "滑杆容器高度",
  "controls.slider.face": "滑杆未选轨道底色",
  "controls.slider.shade": "滑杆轨道表面角色",
  "controls.slider.edge.color": "滑杆轨道边色",
  "controls.slider.edge.width": "滑杆轨道边宽",
  "controls.slider.knob.size": "滑杆手柄尺寸",
  "controls.slider.knob.pressed": "滑杆手柄按下尺寸",
  "controls.slider.knob.background": "滑杆手柄底色",
  "controls.slider.knob.gradient": "滑杆手柄渐变",
  "controls.slider.knob.border": "滑杆手柄边色",
  "controls.slider.knob.shadow": "滑杆手柄投影",
  "controls.slider.mark": "滑杆手柄中心色点直径（WinUI 专用，其余为 0）",
  "controls.progress.height": "进度条高度",
  "controls.progress.face": "进度条未填轨道底色",
  "controls.progress.shade": "进度条轨道表面角色",
  "controls.progress.edge.color": "进度条轨道边色",
  "controls.progress.edge.width": "进度条轨道边宽",
  "controls.spinner.trackOpacity": "环形加载器底环透明度",
  "controls.popup.corner": "弹出层圆角策略",
  "controls.list.item.highlight": "列表选中/聚焦项高亮底色",
  "controls.list.item.edge": "列表高亮项描边色",
  "controls.tabs.track.face": "标签栏轨道底色",
  "controls.tabs.track.edge": "标签栏轨道边色",
  "controls.tabs.track.corner": "标签栏轨道圆角策略",
  "controls.menubar.bar": "菜单栏底面样式",
  "controls.well.edge": "输入井（Well）边框色",
};

const NOUNS: Record<string, string> = {
  caption: "小号说明",
  detail: "分组标题",
  body: "正文",
  label: "控件标签",
  title: "区块标题",
  headline: "页面标题",
  display: "大号标题",
  fast: "微交互",
  default: "日常反馈",
  slow: "大面过渡",
  state: "状态淡变",
  card: "卡片面",
  raised: "凸起控件面",
  inset: "凹槽井面",
  channel: "分段轨道面",
  plate: "井内选中滑块面",
  overlay: "菜单与浮层面",
  modal: "对话框与抽屉面",
  inverse: "反色面",
  glass: "玻璃面",
  accent: "强调填充面",
  fill: "进度与选中填充面",
};

const FIELD_NOUNS: Record<string, Record<string, string>> = {
  typography: { fontWeight: "字重", letterSpacing: "字距" },
  motion: { duration: "时长（ms）", easing: "缓动曲线" },
  surfaces: {
    background: "底",
    foreground: "前景色",
    gradient: "渐变",
    border: "边",
    borderTop: "上边",
    borderBottom: "下边",
    shadow: "投影",
    backdropFilter: "背景模糊",
    material: "材质",
    effect: "GPU 表面着色",
    elevation: "平台阴影高度（dp）",
  },
};

const FEEDBACK_SURFACE_NOUNS: Record<string, string> = {
  hover: "悬停表面",
  press: "按下表面",
  disabled: "禁用表面",
};

/** Resolve Chinese description for a row path, throwing on unknown keys. */
export function meaning(at: string): string {
  const known = DESCRIPTIONS[at] ?? composed(at);
  if (known === undefined || known === "") {
    throw new Error(`docs:semantics: no description for \`${at}\`; add one to DESCRIPTIONS`);
  }
  return known;
}

function composed(at: string): string | undefined {
  const parts = at.split(".");
  if (parts[0] === "feedback" && parts[2] === "surface" && parts.length === 4) {
    const owner = FEEDBACK_SURFACE_NOUNS[parts[1]!];
    const leaf = FIELD_NOUNS.surfaces?.[parts[3]!];
    if (owner && leaf) return `${owner}的${leaf}`;
  }
  const [group, noun, field] = parts;
  if (group === undefined || noun === undefined || field === undefined || parts.length !== 3) {
    return undefined;
  }
  const owner = NOUNS[noun];
  const leaf = FIELD_NOUNS[group]?.[field];
  if (owner === undefined || leaf === undefined) return undefined;
  return `${owner}的${leaf}`;
}

const INTRO = `# 每套主题解析后的值

> 本页由 \`bun run docs:semantics\` 生成，请勿手改：修改 \`packages/theme/themes/\` 源码或生成器 \`scripts/theme/semantics.ts\` 后重新生成。\`bun run check:theme\` 会校验一致性。

本页列出 Theme v5 下五套基准主题（NSH Gallery、shadcn/ui、Apple、Material、WinUI 3）解析后的语义字段。架构与角色见 [\`theme.md\`](theme.md)，组件怎么读这些值见 [\`component-authoring.md\`](component-authoring.md)。

- **两值折叠**：\`a / b\` 表示两组取值不同（颜色与 \`surfaces\`/\`elevation\` 为 \`light / dark\`，\`metrics\` 为 \`pointer / touch\`）；一致时仅写一项。
- **缺省标记**：\`—\` 表示该字段未设置或为 \`null\`。
`;

export function renderPage(themes: Theme[] = readThemes()): string {
  const parts = [INTRO];
  SECTIONS.forEach((section, index) => {
    const perTheme = themes.map((theme) => section.rows(theme));
    const rows = merged(perTheme);
    parts.push(renderSection(section, index + 1, themes, rows));
  });
  return parts.join("\n");
}

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

export function rowCount(themes: Theme[] = readThemes()): number {
  return SECTIONS.reduce((total, section) => total + merged(themes.map(section.rows)).size, 0);
}

/** Verify `docs/theme-values.md` matches the rendered semantics table. */
export function checkSemantics(repoRoot = ROOT): { rowTotal: number; error: string | null } {
  const page = path.join(repoRoot, PAGE);
  const rendered = renderPage();
  const current = fs.existsSync(page) ? fs.readFileSync(page, "utf8") : "";
  const rowTotal = rowCount();
  if (current !== rendered) {
    return { rowTotal, error: `docs:semantics: ${PAGE} is stale; run \`bun run docs:semantics\`` };
  }
  return { rowTotal, error: null };
}

if (import.meta.main) {
  const page = path.join(ROOT, PAGE);
  if (process.argv.includes("--check")) {
    const { rowTotal, error } = checkSemantics(ROOT);
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`docs:semantics: ${PAGE} is current (${rowTotal} rows).`);
  } else {
    fs.writeFileSync(page, renderPage());
    console.log(`docs:semantics: wrote ${PAGE} (${rowCount()} rows).`);
  }
}
