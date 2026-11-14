# shadcn 默认主题实验

## 结论

把主题数据换掉，**16 个组件全部照常渲染，颜色、圆角、层次都跟着走了**：组件只经 `finish.*` 与 `theme.json` 的 token 取色，这一点成立。剩下的差异集中在**主题数据够不到的地方**：按下缩放（`pressSink`）、写死的焦点光环 rgba、组件里固定的 alpha、不在 token 里的圆角，以及 `finish.fill` 必须给渐变这一结构约束。逐条见[限制清单](#5-限制清单换数据换不掉的)。

看下来的观感：shadcn 的 neutral 是**单色**主题（唯一有彩的是 `destructive` 红），所以本库的"柠檬绿主操作 + 绿色 accent"全部退成灰阶；主按钮在浅色是近黑 `#171717`，在深色是浅灰 `#e5e5e5`。浅色下 `background` 与 `card` 都是纯白，面与面只靠 1px `#e5e5e5` 边和 `shadow-sm` 分开，所以整页比现在"平"得多，也更依赖边框。

|          | 默认主题（上游）           | shadcn neutral                           |
| -------- | -------------------------- | ---------------------------------------- |
| 主操作   | 柠檬绿渐变 + 内高光 + 投影 | `--primary` 近黑 / 浅灰，无渐变无阴影    |
| 凸起控件 | 渐变 + 内高光 + 硬投影     | `--secondary` 平涂 + `shadow-xs`，边透明 |
| 按下     | 内阴影 + 缩到 97%          | 只落回 `--input`（缩放还在，见限制 2）   |
| 输入井   | 纯白 + `input` 边          | 同色面 + `input` 边 + `shadow-xs`        |
| 选中段   | 白色滑块 + 软投影          | 白/`--input` 段 + `shadow-sm`            |
| 强调色   | 柠檬绿                     | 没有色相：`brand` 直接用 `--primary`     |

## 1 目的与做法

用户要看本库组件换成 **shadcn 默认主题**（new-york-v4、`neutral`、平面、轻阴影）是什么样子。这是一次**实验**：只出新主题数据与对比图，不改默认主题、不改组件、不做运行时切换、不进 registry。

做法分四件：主题数据 → 预览脚本 → 对照页 → 本文。验收口径：

- `packages/theme/themes/shadcn/{theme,finishes}.json` 的键集合与默认完全相同（`bun run test:unit` 的 `scripts/theme/themes.test.ts` 断言 theme/light/dark 三节与 finishes 两套角色）。
- 预览脚本跑完 `git status` 里 `packages/theme/theme.json`、`finishes.json` 无改动（脚本 `finally` 还原，并在还原后比对字节）。
- 16 个组件 × 亮/暗的对照页 + 一张总览；每张都人眼看过（第 4 节）。
- `vp check` 通过。

## 2 主题数据

### 2.1 来源与生成

真源都在只读参考里，**没有一处取色是凭感觉的**：

| 值                              | 出处                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| 颜色（oklch）                   | `references/shadcn-ui/apps/v4/registry/themes.ts` 的 `neutral`                |
| 圆角 `--radius: 0.625rem`、派生 | `references/shadcn-ui/apps/v4/app/globals.css:50-56,100`                      |
| 阴影 `shadow-xs/sm/md` 具体值   | Tailwind v4 的默认阴影（shadcn 类名 `shadow-xs` / `shadow-sm` / `shadow-md`） |
| 各 finish 的角色                | `references/shadcn-ui/apps/v4/registry/new-york-v4/ui/*`（下表逐个注明）      |

生成链（可复跑，产出就是仓库里那两个文件）：

```sh
bun scripts/theme/generate-shadcn.ts   # shadcn 的 oklch() 规范化后，按默认文件的键序写出 themes/shadcn/*
```

- `scripts/theme/oklch.ts`：OKLCH ⇄ sRGB（Ottosson 的 oklab 矩阵 + CSS Color 4 传递函数），hex / `rgb()` / `oklch()` 的解析与规范文本，以及 `over`（半透明合成）/ `mix`（两色中点）/ `withAlpha`。数值格式固定（L、C 五位小数，H 三位，alpha 三位），往返落在同一 8-bit 通道，所以文件里存的就是上面这一列 `oklch()`，下面的 sRGB 只是它读起来的样子。
- `scripts/theme/shadcn.ts`：引用上面的 oklch 值、把它们换算成本库要的 hex/rgba，再按**默认文件的键序**填值；缺一个键就抛错，所以键集合不会漂。
- `scripts/theme/oklch.test.ts`：换算落在 Tailwind 的灰阶上（`#0a0a0a` … `#fafafa`）、红 `#e7000b`、半透明 `rgba(255,255,255,0.1)`，以及三个辅助函数的边界。

注册表里 `neutral` 与站点自己的 `globals.css` 有一处不同：站点把 `--primary` 写成 `oklch(0% 0 0)`（纯黑），注册表（`shadcn init` 实际写进应用的那份）是 `oklch(0.205 0 0)` = `#171717`。**取注册表**，与站点只差主按钮一档亮度。

### 2.2 oklch → sRGB 换算表

16 个互异值，全部由上面脚本算出（左列是文件里存的形式，右列是它落到的 sRGB）：

| oklch                       | sRGB                     | 用途（shadcn token）                        |
| --------------------------- | ------------------------ | ------------------------------------------- |
| `oklch(1 0 0)`              | `#ffffff`                | 亮色 background/card/popover                |
| `oklch(0.985 0 0)`          | `#fafafa`                | primary-foreground（亮）、sidebar（亮）     |
| `oklch(0.97 0 0)`           | `#f5f5f5`                | secondary/muted/accent（亮）                |
| `oklch(0.922 0 0)`          | `#e5e5e5`                | border/input（亮）、primary（暗）           |
| `oklch(0.87 0 0)`           | `#d4d4d4`                | chart-1                                     |
| `oklch(0.708 0 0)`          | `#a1a1a1`                | ring（亮）、muted-foreground（暗）          |
| `oklch(0.556 0 0)`          | `#737373`                | muted-foreground（亮）、chart-2、ring（暗） |
| `oklch(0.439 0 0)`          | `#525252`                | chart-3                                     |
| `oklch(0.371 0 0)`          | `#404040`                | chart-4                                     |
| `oklch(0.269 0 0)`          | `#262626`                | secondary/muted/accent（暗）                |
| `oklch(0.205 0 0)`          | `#171717`                | primary（亮）、card（暗）                   |
| `oklch(0.145 0 0)`          | `#0a0a0a`                | foreground（亮）、background（暗）          |
| `oklch(0.577 0.245 27.325)` | `#e7000b`                | destructive（亮）                           |
| `oklch(0.704 0.191 22.216)` | `#ff6467`                | destructive（暗）                           |
| `oklch(1 0 0 / 10%)`        | `rgba(255,255,255,0.1)`  | border（暗）                                |
| `oklch(1 0 0 / 15%)`        | `rgba(255,255,255,0.15)` | input（暗）                                 |

再往下的值都是这几个的**机械派生**，本文与 `shadcn.ts` 里都写了算法，没有手调：

- 暗色按下/滑块：`--input` 合成到 `--card` 上 → `#3a3a3a`（`over("rgba(255,255,255,0.15)", "#171717")`）。
- 亮色按下、`on`、暗色段：`--input` / `chart-1` / `chart-3` 直接取用。
- 悬停：raised 与 pressed 的中点（`mix(..., 0.5)`）。
- 暗色输入井：`--input/30` → `rgba(255,255,255,0.045)`（`15% × 30%`）。

### 2.3 token 映射表

**theme 节**（与外观无关，可引用 `var(--x)`，nsh 会按当前外观解引用）：

| token                                  | 取值                                           | 说明                                                |
| -------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `radius` / `radius-control`            | `8px`                                          | `--radius-md` = 0.8 × 0.625rem                      |
| `radius-card`                          | `14px`                                         | `--radius-xl` = 1.4 ×                               |
| `brand-fill` / `on-brand`              | `var(--primary)` / `var(--primary-foreground)` | 主操作；用 var 才能随亮暗变                         |
| `scrim`                                | `rgba(0,0,0,0.5)`                              | dialog overlay 的 `bg-black/50`                     |
| `window-close` / `-minimize` / `-zoom` | `#e7000b` / `#a1a1a1` / `#404040`              | shadcn 无窗口按钮：close 取 destructive，其余走灰阶 |
| `window-control-ink` / `-edge`         | 保留默认                                       | 系统红绿灯的墨色与描边，不属于配色                  |

**light / dark 节**（`*` 表示 shadcn 没有，按灰阶/图表色映射）：

| 本库 token                 | shadcn 对应                                                                             | 亮 / 暗（hex）                                                |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `background`               | `--background`                                                                          | `#ffffff` / `#0a0a0a`                                         |
| `foreground`               | `--foreground`                                                                          | `#0a0a0a` / `#fafafa`                                         |
| `card` / `popover`         | `--card` / `--popover`（同值）                                                          | `#ffffff` / `#171717`                                         |
| `card-foreground` 等       | `var(--foreground)`                                                                     | —                                                             |
| `primary`                  | `--primary`（主操作填充）                                                               | `#171717` / `#e5e5e5`                                         |
| `primary-foreground`       | `--primary-foreground`                                                                  | `#fafafa` / `#171717`                                         |
| `raised`                   | `--secondary`（控件底色）                                                               | `#f5f5f5` / `#262626`                                         |
| `secondary`                | `var(--raised)`（默认主题就是这样接的）                                                 | —                                                             |
| `muted`                    | `--muted`                                                                               | `#f5f5f5` / `#262626`                                         |
| `muted-foreground`         | `--muted-foreground`                                                                    | `#737373` / `#a1a1a1`                                         |
| `accent`                   | `--accent`                                                                              | `#f5f5f5` / `#262626`                                         |
| `destructive` / `down`     | `--destructive`                                                                         | `#e7000b` / `#ff6467`                                         |
| `border` / `line`          | `--border`                                                                              | `#e5e5e5` / `rgba(255,255,255,0.1)`                           |
| `input`（= `fieldBorder`） | `--input`                                                                               | `#e5e5e5` / `rgba(255,255,255,0.15)`                          |
| `ring`                     | `--ring`                                                                                | `#a1a1a1` / `#737373`                                         |
| `chart-1` … `chart-5`      | `--chart-1` … `--chart-5`                                                               | `#d4d4d4` `#737373` `#525252` `#404040` `#262626`（两套相同） |
| `sidebar*`                 | `--sidebar*`；`sidebar-accent`=`--accent`、`sidebar-border`=`--border`                  | `#fafafa` / `#171717`                                         |
| `inset` `*`                | `--muted`（卡内凹面）                                                                   | `#f5f5f5` / `#262626`                                         |
| `field` `*`                | `--background`；暗色取 `dark:bg-input/30`                                               | `#ffffff` / `rgba(255,255,255,0.045)`                         |
| `track` `*`                | `--muted`（switch/slider 轨道）                                                         | `#f5f5f5` / `#262626`                                         |
| `knob` / `knobOn` `*`      | switch thumb `bg-background` / `dark:bg-foreground`；on 为 `dark:bg-primary-foreground` | `#ffffff`·`#ffffff` / `#fafafa`·`#171717`                     |
| `brand` `*`                | `--primary`（shadcn 没有色相，只能落到主色）                                            | `#171717` / `#e5e5e5`                                         |
| `faint` `*`                | 亮取 `--ring`，暗取 `--muted-foreground`                                                | `#a1a1a1` / `#a1a1a1`                                         |
| `info` `*`                 | `--muted-foreground`                                                                    | `#737373` / `#a1a1a1`                                         |
| `warn` `*`                 | 亮 `chart-3`、暗 `chart-1`（沿灰阶一档）                                                | `#525252` / `#d4d4d4`                                         |
| `up` `*`                   | 亮 `chart-4`、暗 `--primary`                                                            | `#404040` / `#e5e5e5`                                         |
| `violet` `*`               | 亮 `chart-5`、暗 `--foreground`                                                         | `#262626` / `#fafafa`                                         |
| `code` `*`                 | `--foreground`                                                                          | `#0a0a0a` / `#fafafa`                                         |
| `*-tint` `*`               | `color-mix(in srgb, var(--tone) 10%, transparent)`                                      | —                                                             |
| `hover` / `scrollbar-*`    | 保留默认公式（`foreground 5%` / `muted-foreground` 混 background）                      | —                                                             |
| `window-control-off`       | = `faint`                                                                               | `#a1a1a1` / `#a1a1a1`                                         |

**代价**：shadcn 的 neutral 没有第二个色相，所以 `info` / `warn` / `up` / `violet` 全落在灰阶上，只有 `danger`/`down` 保留红。图表、diff、状态点在视觉上会退化成深浅不同的灰（这不是 bug，是这个主题的性质）。

### 2.4 finishes 对照表

19 个角色，每个都是**一条 shadcn 外观**，全部平面化：没有渐变高光、没有内高光、没有内阴影。

| 角色      | shadcn 的样子                                                                  | 本主题的值（亮 / 暗）                                                                      |
| --------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `card`    | Card `rounded-xl border bg-card shadow-sm`                                     | `shadow-sm`，无渐变                                                                        |
| `inset`   | 无内阴影                                                                       | `boxShadow: none`                                                                          |
| `field`   | Input `border shadow-xs`                                                       | `shadow-xs`                                                                                |
| `raised`  | Button `secondary`：`bg-secondary text-secondary-foreground shadow-xs`（无边） | `#f5f5f5` / `#262626` + `shadow-xs` + 透明边                                               |
| `hover`   | `hover:bg-secondary/80`                                                        | `#ededed` / `#303030`（raised 与 pressed 的中点）                                          |
| `pressed` | shadcn 没有按下态；取 `--input` 一档                                           | `#e5e5e5` / `#3a3a3a`，**去掉投影**（这是平面主题唯一的按下线索）                          |
| `light`   | Button `default`：`bg-primary text-primary-foreground`（无阴影）               | `#171717` / `#e5e5e5`，无阴影                                                              |
| `accent`  | 同上（本库的 accent 填充就是主操作色）                                         | `#171717` / `#e5e5e5`                                                                      |
| `track`   | Switch `bg-input`、Slider `bg-muted`                                           | `#f5f5f5` / `#262626`，边 `--border`，`boxShadow: inset 0 0 0 1px transparent`（见限制 6） |
| `fill`    | Slider range / Progress `bg-primary`                                           | `#171717` / `#e5e5e5`，**用同色双停渐变承载**（见限制 5）                                  |
| `knob`    | Switch thumb `bg-background`（暗 `dark:bg-foreground`）+ `shadow-sm`           | `#ffffff` / `#fafafa` + `shadow-sm`，无边                                                  |
| `knobOn`  | 同上的 checked 态（暗 `bg-primary-foreground`）                                | `#ffffff` / `#171717` + `shadow-sm`                                                        |
| `pill`    | 同 `raised`（shadcn 的 `secondary` 胶囊）                                      | `#f5f5f5` / `#262626` + `shadow-xs`                                                        |
| `thumb`   | Tabs `data-[state=active]:bg-background shadow-sm`（暗 `bg-input/30`）         | `#ffffff` / `#212121` + `shadow-sm`                                                        |
| `on`      | shadcn 的 `data-[state=on]:bg-accent` 对凸起控件来说太浅；沿灰阶取更远一档     | `#d4d4d4`（chart-1）/ `#525252`（chart-3），无阴影                                         |
| `chip`    | 无（shadcn 的 chip 只靠底色）                                                  | `boxShadow: none`                                                                          |
| `glass`   | 站点头部那类 `bg-background/80 backdrop-blur`                                  | `rgba(255,255,255,0.8)` / `rgba(23,23,23,0.8)` + `blur(20px)`，无高光无投影                |
| `menu`    | DropdownMenu `border bg-popover shadow-md`                                     | `#ffffff` / `#171717` + `shadow-md` + `--border`                                           |
| `groove`  | 无（shadcn 的菜单分隔线是 1px `bg-border`）                                    | `boxShadow: none`                                                                          |

## 3 预览工具

```sh
bun scripts/theme-preview.ts <name|default> [--only id,id] [--appearance light,dark]
bun scripts/theme-sheets.ts   [id,id]        # 对照页
```

`theme-preview.ts`：

1. 把 `packages/theme/themes/<name>/{theme,finishes}.json` 拷到 `packages/theme/`（`default` 不拷）；
2. `bun scripts/audit/audit.ts build --force --only …`（每个组件 demo / ref / official 三个包）；
3. 每个外观一次 `shots --only … --theme light|dark`（本次为 `scripts/audit/audit.ts` 与 `chrome.ts` 新增 `--theme`：CDP 的 `prefers-color-scheme` + 打包页的 `?theme=`）；
4. 把 `<id>-<kind>-<layout>.png` 改名为 `theme/<id>-<name>-<kind>-<layout>-<appearance>.png`；
5. **`finally` 无条件写回原文件**，并比对字节，不一致就非零退出。

一份 16 组件、两个外观的账：47 个包 ≈ 4 分半（这台机器，`--force`）。两套主题共约 9 分钟。

## 4 对比截图

都在 `apps/docs/demos/shots-audit/theme/`（该目录被 `.gitignore` 的 `**/demos/shots-audit/` 覆盖，**不提交**，用上面的脚本重跑即可）：

| 内容                    | 路径                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| 每组件对照页（16 张）   | `apps/docs/demos/shots-audit/theme/sheet-<id>.png`                                           |
| 总览（16 行，亮色桌面） | `apps/docs/demos/shots-audit/theme/sheet-overview.png`                                       |
| 单张（376 张）          | `apps/docs/demos/shots-audit/theme/<id>-<default\|shadcn>-<kind>-<layout>-<light\|dark>.png` |

对照页的版式：两列 `default | shadcn`，四行 = 亮色手机、亮色桌面、暗色手机、暗色桌面（390×844 / 1024×640，`<id>.tsx` 演示页）。16 个组件：button、toggle、switch、checkbox、radio-group、slider、input、select、tabs、segmented、dialog、menu、accordion、data-table、date-picker、toast。

看的时候注意：

- **dialog / menu / toast** 的演示是初始态（只显示触发器），它们的**浮层表面**（`menu` / `card` / `glass` 三个 finish）在截图里看不到——要看浮层得跑 `port:render` 的 `steps`（本次按任务边界没跑）。
- select 的触发器在亮色下几乎"无边"：shadcn 的 `border-input` + `bg-transparent` 就是这样，触发器与卡片同色，只剩一条 `#e5e5e5` 边。
- slider 的轨道在亮色下非常淡（`--muted` `#f5f5f5` 落在白卡上），比默认主题的凹槽弱很多。
- 暗色下 tabs/segmented 的选中段（`#212121`）比轨道（`#262626`）略**深**，是 shadcn `dark:bg-input/30` 的本来样子，但本库的段更大，所以更明显。

## 5 限制清单（换数据换不掉的）

按影响排序。`// @port` 区域里的改动都要在 `port-map.json` 的 `replace` 里登记并写 `why`（规则 P3），下面注明"要不要动 port 区"。

| #   | 位置                                                                                                                                                                                                      | 现象 / 影响                                                                                                                                                                                               | 怎么去掉                                                                                                 | 动 port 区？     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | `apps/docs/demos/nsh.json:7`、`packages/theme/theme.ts:15`                                                                                                                                                | 主题是**构建输入**：`nsh.json` 指一个 `theme.json`，`finishes.json` 是 `theme.ts` 的模块 import。所以换主题 = 重新打包，`nsh` 的 `setTheme()` 也换不掉 finishes                                           | 要多主题：`finishes` 改成 token（或由 `theme.ts` 经信号读），并把主题文件变成 registry 条目（见第 6 节） | 是（`theme.ts`） |
| 2   | `packages/ui/lib/press.ts:28`（`pressSink`），用在 `button.tsx:103,187,285,342`、`toggle.tsx:71,133`、`carousel.tsx:79`、`radio-group.tsx:107`、`toast.tsx:83`                                            | 每次按下缩到 90–97%。shadcn 完全没有按下缩放，平面主题里这个动作显得最"不像 shadcn"                                                                                                                       | 加一个 look 级开关（`sink?: boolean`）或在 flats 主题下置 0 —— 都在 port 区里                            | 是               |
| 3   | `packages/theme/theme.ts:350-355`（`focusRing`）                                                                                                                                                          | 焦点光环 `outlineColor` 是**写死的两组蓝灰 rgba**（`rgba(160,170,190,0.14)` / `rgba(100,110,130,0.14)`），不跟 token；shadcn 是 `ring-ring/50` + `border-ring`                                            | 改成 `alpha(colors.ring, 0.5)`（或新增 `ring-halo` token）。port 区，需 `replace` + `why`                | 是               |
| 4   | `packages/theme/theme.ts:335`（`hovered`）                                                                                                                                                                | 悬停是 `alpha(text, 5%)` 的墨色，而不是 shadcn 的 `bg-accent`。浅色 ≈`#f2f2f2`（accent 是 `#f5f5f5`）、暗色 ≈`#232323`（accent 是 `#262626`），差一档，且不可能带色相                                     | 改成 `colors.accent`，或加一个 `hoverFill` token。port 区                                                | 是               |
| 5   | `packages/ui/slider.tsx:81-82`、`packages/ui/progress.tsx:48`                                                                                                                                             | 只读 `finish.fill.backgroundImage`，不读 `backgroundColor`：数据层**无法表达"纯色填充"**，本主题只能写成同色双停渐变                                                                                      | 让这两处回落到 `backgroundColor`（`style` 里先铺 `backgroundColor`，有渐变再叠）。port 区                | 是               |
| 6   | `packages/ui/slider.tsx:58`、`progress.tsx:37`                                                                                                                                                            | `boxShadow: \`inset 0 0 0 1px ${finish.track.borderColor}, ${finish.track.boxShadow}\``—— 数据写`none` 会把整条声明作废（连那 1px 也不画）                                                                | 本主题改成 `inset 0 0 0 1px transparent` 绕过；正解是拼接前判空。port 区                                 | 是               |
| 7   | `packages/ui/button.tsx:124,126,176,185,284,411,419,422,435`                                                                                                                                              | danger / ghost / split 的透明色是**固定 alpha**：`danger 0.16/0.2/0.22/0.32`、`text 0.06/0.1/0.12/0.22`。跟随主题色相，但强度不可调；换到单色主题后 danger 的红边/红底比 shadcn 的 `bg-destructive/90` 浅 | 把这些 alpha 收进 token（如 `danger-tint-strong`、`pressed-ink`）                                        | 是               |
| 8   | `packages/ui/menu.tsx:53`、`toast.tsx:83`、`checkbox.tsx:46-48`、`calendar.tsx:325,380`、`carousel.tsx:150`、`link.tsx:89`、`slider.tsx:25`、`plot.tsx:61,74,92`、`diff-view.tsx:75,78`、`spinner.tsx:17` | 同上：0.1 / 0.2 / 0.24 / 0.25 / 0.28 / 0.3 / 0.35 / 0.4 / 0.6 的固定 alpha。shadcn 对应位置用 `bg-accent`、`bg-destructive/10`、`border-input` 这类**离散 token**，不是叠透明度                           | 同上，或逐处改成 `tints.*`                                                                               | 是               |
| 9   | `packages/ui/dialog.tsx:32`、`toast.tsx:76`、`toolbar.tsx:36`、`badge.tsx:20`、`plot.tsx:108`、`lib/popup.tsx:23-24`、`tabs.tsx:221`、`segmented.tsx:66,80-90`、`combobox.tsx:141`                        | **圆角写死**（16 / 12 / 10 / 8 / 6 …），不吃 `radius.*`。把 `--radius` 换成 shadcn 的 8/14 后，这些面仍是旧主题的圆角，整体圆角语言不统一                                                                 | 换 `radius.inset` / `radius.card` / `radius.control`；弹层可加一个 `radius-popover` token                | 是               |
| 10  | `packages/ui/button.tsx:162,266,332,392`、`toggle.tsx:117`、`input.tsx:99` 等                                                                                                                             | 边框恒为 1px：shadcn 的 primary / secondary 按钮**没有边**，本库画的是透明边 → 内容盒比 shadcn 窄 2px（视觉几乎看不出，量尺寸会差）                                                                       | 数据层能表达（`borderColor: transparent` 已这么做）；要精确需要按 finish 决定 `borderWidth`              | 是（可选）       |
| 11  | `packages/ui/button.tsx:122`、`339`                                                                                                                                                                       | 填充按钮的悬停/选中用 `opacity 0.94 / 0.88` 而不是 `hover:bg-primary/90`：透明度会让底下的面透出来，在与卡片不同色的容器上有细微差别                                                                      | 改成 `alpha()` 或 token 的 90% 档                                                                        | 是               |
| 12  | `packages/ui/switch.tsx:101` 与 `slider.tsx:68`                                                                                                                                                           | `finish.knob` 同时服务 switch 的圆钮和 slider 的滑块；shadcn 两者不同（slider 的 thumb 有 `border-primary`），一个角色的数据表达不了两种                                                                  | 拆成 `knob`（switch）/ `thumb`（slider 圆点），或给 slider thumb 单独裹一层边框                          | 是               |
| 13  | `packages/ui/segmented.tsx:53-56`、`tabs.tsx:56`                                                                                                                                                          | look 里的注释与几何按"白滑块 + 软投影"写死（`corner 6/7`、`inset 2`），换主题不会改几何 —— 这是设计不是配色，属预期                                                                                       | 无需改；若真要贴合 shadcn 的 `p-[3px]` / 段内 `rounded-md`，那是另一件事                                 | 否               |
| 14  | `packages/ui/plot.tsx:43,48`、`link.tsx:43`                                                                                                                                                               | 颜色轴里有 `warn`、`violet`、`brand`：单色主题下这三支都成了灰，图表/已访问链接失去区分度                                                                                                                 | 数据层已尽量错开（`#525252` / `#262626` / `#171717`）；要恢复得给主题加一组"系列色"token                 | 否（数据）       |

不属于限制、但值得记一笔：**禁用态**（`disabledStyle: { opacity: 0.5 }`，`button.tsx:192` 等）与 shadcn 的 `disabled:opacity-50` 完全一致，换主题不用动。

## 6 建议的下一步（若要正式支持多主题）

1. **先把"外观"从两处搬到一处。** 现在配色在 `theme.json`，阴影/渐变在 `finishes.json`，而 `finishes.json` 是 `theme.ts` 的 import，`setTheme()` 换不掉。建议把 19 个 finish 表达为 token（`--shadow-raised`、`--raised-fill`、`--raised-gradient`…），`theme.ts` 只做角色到 token 的映射——这样一套主题就真的只是"一份 JSON"，也才可能有运行时切换。
2. **registry 形态**：`theme` 条目现在给的是 `theme.json` + `lib/finishes.json` + `lib/theme.ts`（一个主题）。多主题的最小改法是多出 `registry:theme` 条目（`shadcn-nsh add theme-shadcn` 写 `themes/shadcn/*.json`，并把 `nsh.json` 的 `theme` 指过去），组件条目不动；**不要**给旧 id 起别名（AGENTS.md 的边界）。
3. **文档站**：`apps/docs` 的播放器已经有 `?theme=light|dark`（`player-options.ts`），多主题只需再加一个 `?skin=`/`?palette=`，由构建时生成多份 demo 包（当前 `docs:demos` 只按一个 `nsh.json` 主题打包）。演示页加一个主题切换，和 `Port Map` 无关。
4. **`port:render` 的基线**：现在的基线是"一个主题 + 亮暗两套"（`apps/docs/demos/baseline/`）。多主题要么按主题出基线（目录变 `<theme>/<page>.png`，比较表按主题分），要么只对**默认主题**保持字节基线、其它主题只做"能渲染 + 与 ref 一致"的门（P4 的一半）。倾向前者做门、后者做慢检查，代价是基线体积翻倍。
5. **限制清单 1–8 是一个 PR 的量**：都是 `// @port` 区域里的小改（判空、token 化、去掉固定 alpha），但每一处都要在 `port-map.json` 的 `replace` 里登记 `why`，并同步上游或接受下次 `port:vendor` 会覆盖的风险。建议按家族分批：先 5/6（结构性 bug），再 2/3/4（交互与焦点），最后 7/8（alpha 清单）。
6. 如果只是想让用户"看一眼换主题的样子"，本实验的产物已经够用：`themes/shadcn/` 两个文件 + 两个脚本，随时可删（不碰默认主题、不进 registry）。
