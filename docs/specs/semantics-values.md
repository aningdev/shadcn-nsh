# 每套主题解析后的值

> 本页由 `bun run docs:semantics` 生成，请勿手改：改 `packages/theme/tokens/` 的源码或生成器 `scripts/theme/semantics-table.ts` 之后重新运行它。`bun run check` 里的 `docs:semantics --check` 会拦下没重建的提交。

本页列五套主题编译后的每一个字段：`theme.json` 的颜色角色，以及 `semantics.json` 的八组语义值。它是**值**的表，不是规则：每个角色、每个 finish 的含义与读者见 [`theme-roles.md`](theme-roles.md)，要决定什么见 [`../theme-design.md`](../theme-design.md)，一套值为什么这么定见 [`native-themes.md`](native-themes.md)。

- 一行是一个字段：`字段` 列是编译产物里的路径（`theme.json` 的 `cssVars.light` / `cssVars.dark` / `cssVars.theme`，或 `semantics.json` 的同名路径）。行取五套主题的并集：只有一套主题写了的字段照样一行，其余四格是 `—`。
- 五列是五套主题，`default` 一列写 NSH Gallery，其余按平台名。`solid-glass` 不在本页：它是玻璃的示例主题，不是本库要对齐的五套基线。
- 行序取五套主题第一次写出这个字段的顺序：某套主题独有的字段排在后面。
- 一格写 `a / b`，表示两种取值不同：颜色表与 `elevation` 是 light / dark，`typography`、`dimension` 是指针 / 触屏两档。只有一种取值时写一个。
- 写 `—` 是这套主题不用这个字段（没有这个字段，或值为 `null`）；五套主题都不用的字段不列。反引号里的 `none` 是真正的 CSS 值。数字与布尔照写，字符串在反引号里，数组与对象写成紧凑 JSON。

## 1 颜色角色（`theme.json`）

`theme.json` 的 `cssVars`：`light` 与 `dark` 里的 A、B 两层颜色各写一份，两种外观共用的三个 C 层颜色（`scrim`、`media`、`on-media`）在表末。格子里是编译产物存的值：设了值的写 oklch，引用其他角色的写 `var(--…)`，叠色写 `color-mix(…)`。

| 角色 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `background` | 页面画布的底 | `oklch(0.97399 0.00397 286.326)` / `oklch(0.21297 0.01273 264.257)` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.96257 0.00665 286.274)` / `oklch(0 0 0)` | `oklch(0.98379 0.01284 321.894)` / `oklch(0.18738 0.01241 300.422)` | `oklch(0.96415 0 0)` / `oklch(0.24353 0 0)` |
| `foreground` | 页面上的正文与图标墨色 | `oklch(0.18636 0.01318 264.182)` / `oklch(0.95193 0.00289 264.542)` | `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | `oklch(0 0 0)` / `oklch(1 0 0)` | `oklch(0.22652 0.00999 303.714)` / `oklch(0.91401 0.01366 314.754)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `card` | 卡片的底，浮于页面一层 | `oklch(1 0 0)` / `oklch(0.25145 0.01219 264.328)` | `oklch(1 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` / `oklch(0.22728 0.00382 286.092)` | `oklch(0.96728 0.01181 313.217)` / `oklch(0.22652 0.00999 303.714)` | `oklch(0.98809 0 0)` / `oklch(0.28908 0 0)` |
| `card-foreground` | 卡片上的字与图标 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `popover` | 浮层的底：菜单、弹出层、提示 | `oklch(0.97997 0.00397 286.326)` / `oklch(0.25145 0.01219 264.328)` | `oklch(1 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` / `oklch(0.2939 0.00358 286.177)` | `oklch(0.95363 0.01471 312.243)` / `oklch(0.24451 0.01344 298.463)` | `oklch(0.98212 0 0)` / `oklch(0.29313 0 0)` |
| `popover-foreground` | 浮层上的字与图标 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `primary` | 主操作的强调色填充 | `oklch(0.89637 0.16627 124.031)` / `oklch(0.88837 0.16324 123.959)` | `oklch(0.205 0 0)` / `oklch(0.922 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.49552 0.13046 293.709)` / `oklch(0.83493 0.09457 298.018)` | `oklch(0.49147 0.15959 254.594)` / `oklch(0.80403 0.12199 230.822)` |
| `primary-foreground` | 主操作填充上的字与图标 | `oklch(0.19339 0.0197 121.819)` | `oklch(0.985 0 0)` / `oklch(0.205 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` / `oklch(0.3251 0.13529 291.152)` | `oklch(1 0 0)` / `oklch(0 0 0)` |
| `secondary` | 次操作控件的填充 | `var(--raised)` | `var(--raised)` | `var(--raised)` | `oklch(0.91633 0.03651 303.106)` / `oklch(0.40052 0.034 298.591)` | `oklch(0.98809 0 0)` / `oklch(0.29716 0 0)` |
| `secondary-foreground` | 次操作控件上的字与图标 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `oklch(0.40052 0.034 298.591)` / `oklch(0.91633 0.03651 303.106)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `muted` | 压下去的容器底与浅底 | `oklch(0.95222 0.00415 271.369)` / `oklch(0.29661 0.01168 264.381)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.95241 0.00133 286.375)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.91401 0.01366 314.754)` / `oklch(0.32979 0.01247 298.761)` | `oklch(0.94912 0 0)` / `oklch(0.22645 0 0)` |
| `muted-foreground` | 次要文字与图标 | `oklch(0.49859 0.01219 261.766)` / `oklch(0.69819 0.01118 261.782)` | `oklch(0.556 0 0)` / `oklch(0.708 0 0)` | `oklch(0.6347 0.0059 286.23)` / `oklch(0.68188 0.01016 286.127)` | `oklch(0.39805 0.01736 303.721)` / `oklch(0.82875 0.01776 308.223)` | `oklch(0.47478 0 0)` / `oklch(0.84522 0 0)` |
| `accent` | 悬停与选中项的浅高亮底 | `oklch(0.93609 0.00346 247.86)` / `oklch(0.32053 0.01145 264.401)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.96743 0.00133 286.375)` / `oklch(0.29471 0.00718 285.951)` | `oklch(0.91633 0.03651 303.106)` / `oklch(0.40052 0.034 298.591)` | `oklch(0.93705 0 0)` / `oklch(0.29716 0 0)` |
| `accent-foreground` | 高亮底上的字与图标 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `oklch(0.40052 0.034 298.591)` / `oklch(0.91633 0.03651 303.106)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `destructive` | 危险操作与错误的语义色 | `oklch(0.58301 0.18974 19.874)` / `oklch(0.70034 0.19197 18.007)` | `oklch(0.577 0.245 27.325)` / `oklch(0.704 0.191 22.216)` | `oklch(0.65421 0.23214 28.659)` / `oklch(0.6633 0.22361 28.292)` | `oklch(0.50128 0.17832 28.705)` / `oklch(0.83449 0.06771 22.012)` | `oklch(0.53615 0.19119 30.071)` / `oklch(0.79111 0.12251 13.299)` |
| `border` | 容器与控件的常规发丝线 | `oklch(0.84192 0.00298 264.54)` / `oklch(0.32447 0.01141 264.404)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.1)` | `oklch(0.89478 0.00135 286.373)` / `oklch(0.3301 0.00522 286.11)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.92191 0 0)` / `oklch(0.30919 0 0)` |
| `input` | 表单字段与控件边的线 | `oklch(0.81386 0.003 264.54)` / `oklch(0.3556 0.01115 264.424)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.15)` | `oklch(0.82715 0.00276 286.339)` / `oklch(0.36496 0.00509 286.145)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.62006 0 0)` / `oklch(0.68622 0 0)` |
| `ring` | 焦点环的线 | `oklch(0.7307 0.01549 264.473)` / `oklch(0.49837 0.01905 262.684)` | `oklch(0.708 0 0)` / `oklch(0.556 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.48593 0.03575 299.615)` / `oklch(0.83027 0.03743 303.029)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `chart-1` | 第 1 条图表系列色 | `oklch(0.75073 0.18465 126.794)` / `oklch(0.90469 0.16668 124.297)` | `oklch(0.87 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.49552 0.13046 293.709)` / `oklch(0.83493 0.09457 298.018)` | `oklch(0.49147 0.15959 254.594)` / `oklch(0.80403 0.12199 230.822)` |
| `chart-2` | 第 2 条图表系列色 | `oklch(0.35944 0.01112 264.426)` / `oklch(0.92503 0.00418 271.367)` | `oklch(0.556 0 0)` | `oklch(0.73032 0.19438 147.444)` / `oklch(0.75555 0.20825 146.984)` | `oklch(0.49039 0.06053 358.445)` / `oklch(0.8367 0.06656 359.427)` | `oklch(0.50725 0.16489 142.658)` / `oklch(0.75934 0.17155 141.348)` |
| `chart-3` | 第 3 条图表系列色 | `oklch(0.60539 0.01485 262.354)` / `oklch(0.71149 0.01246 264.489)` | `oklch(0.439 0 0)` | `oklch(0.76524 0.17521 62.574)` / `oklch(0.78237 0.17106 67.223)` | `oklch(0.48593 0.03575 299.615)` / `oklch(0.83027 0.03743 303.029)` | `oklch(0.53885 0.12069 65.216)` / `oklch(0.90397 0.18827 100.526)` |
| `chart-4` | 第 4 条图表系列色 | `oklch(0.78155 0.01087 261.785)` / `oklch(0.53054 0.01343 264.454)` | `oklch(0.371 0 0)` | `oklch(0.61489 0.21292 312.411)` / `oklch(0.65605 0.22741 312.416)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.53615 0.19119 30.071)` / `oklch(0.79111 0.12251 13.299)` |
| `chart-5` | 第 5 条图表系列色 | `oklch(0.90374 0.00421 271.366)` / `oklch(0.39359 0.01086 264.443)` | `oklch(0.269 0 0)` | `oklch(0.65421 0.23214 28.659)` / `oklch(0.6633 0.22361 28.292)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.62006 0 0)` / `oklch(0.68622 0 0)` |
| `sidebar` | 侧栏面板的底 | `oklch(0.94619 0.00416 271.368)` / `oklch(0.18636 0.01318 264.182)` | `oklch(0.985 0 0)` / `oklch(0.205 0 0)` | `oklch(0.96257 0.00665 286.274)` / `oklch(0.22728 0.00382 286.092)` | `var(--background)` | `var(--background)` |
| `sidebar-foreground` | 侧栏里的字与图标 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` |
| `sidebar-primary` | 侧栏里的主操作高亮 | `var(--primary)` | `var(--primary)` | `var(--primary)` | `var(--primary)` | `var(--primary)` |
| `sidebar-primary-foreground` | 侧栏主操作高亮上的字与图标 | `var(--primary-foreground)` | `var(--primary-foreground)` | `var(--primary-foreground)` | `var(--primary-foreground)` | `var(--primary-foreground)` |
| `sidebar-accent` | 侧栏选中行的底 | `var(--field)` / `oklch(0.27631 0.0119 264.36)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `var(--accent)` | `var(--accent)` | `var(--accent)` |
| `sidebar-accent-foreground` | 侧栏选中行上的字与图标 | `var(--accent-foreground)` | `var(--foreground)` | `var(--accent-foreground)` | `var(--accent-foreground)` | `var(--foreground)` |
| `sidebar-border` | 侧栏分隔与工具条的发丝线 | `oklch(0.90146 0.00405 286.318)` / `oklch(0.27221 0.01194 264.355)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.1)` | `var(--border)` | `var(--border)` | `var(--line)` |
| `sidebar-ring` | 侧栏里的焦点环 | `var(--ring)` | `var(--ring)` | `var(--ring)` | `var(--ring)` | `var(--ring)` |
| `inset` | 卡片里凹下去的一层（井） | `oklch(0.96124 0.00414 271.369)` / `oklch(0.23027 0.01247 264.293)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.96743 0.00133 286.375)` / `oklch(0.29471 0.00718 285.951)` | `oklch(0.95363 0.01471 312.243)` / `oklch(0.24451 0.01344 298.463)` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `raised` | 卡片上凸起的一层：按钮、字段、轨道 | `oklch(0.96724 0.00414 271.369)` / `oklch(0.32935 0.01092 271.072)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.95241 0.00133 286.375)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.96728 0.01181 313.217)` / `oklch(0.22652 0.00999 303.714)` | `oklch(0.98809 0 0)` / `oklch(0.29716 0 0)` |
| `glass-edge` | 玻璃、胶囊与浮层上的发丝线 | `var(--border)` | `var(--border)` | `var(--border)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.92191 0 0)` / `oklch(0.21779 0 0)` |
| `field` | 输入井：比卡片和 inset 更下一层 | `oklch(1 0 0)` / `oklch(0.21297 0.01273 264.257)` | `oklch(1 0 0)` / `oklch(1 0 0 / 0.045)` | `oklch(0.95241 0.00133 286.375)` / `oklch(0.31868 0.00703 285.994)` | `oklch(0.91401 0.01366 314.754)` / `oklch(0.32979 0.01247 298.761)` | `oklch(0.98809 0 0)` / `oklch(0.29716 0 0)` |
| `line` | 井里的发丝线（分隔、网格） | `oklch(0.91973 0.00403 286.32)` / `oklch(0.30863 0.01156 264.391)` | `oklch(0.922 0 0)` / `oklch(1 0 0 / 0.1)` | `oklch(0.89478 0.00135 286.373)` / `oklch(0.3301 0.00522 286.11)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.92191 0 0)` / `oklch(0.31714 0 0)` |
| `hover` | 指针停在可点项上的叠色 | `color-mix(in srgb, var(--foreground) 5%, transparent)` | `var(--accent)` | `color-mix(in srgb, var(--foreground) 6%, transparent)` | `color-mix(in srgb, var(--foreground) 8%, transparent)` | `oklch(0.97315 0 0)` / `oklch(0.31714 0 0)` |
| `ring-halo` | 焦点环外面的一圈晕 | `color-mix(in srgb, var(--ring) 14%, transparent)` | `color-mix(in srgb, var(--ring) 50%, transparent)` | `color-mix(in srgb, var(--ring) 30%, transparent)` | `color-mix(in srgb, var(--ring) 20%, transparent)` | `oklch(0.98809 0 0)` / `oklch(0.14479 0 0)` |
| `faint` | 更弱的字：占位、单位、次要标记 | `oklch(0.69542 0.00939 264.505)` / `oklch(0.54061 0.01194 261.771)` | `oklch(0.708 0 0)` | `oklch(0.82403 0.00276 286.339)` / `oklch(0.46933 0.00797 286.089)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.62006 0 0)` / `oklch(0.67312 0 0)` |
| `brand` | 强调色作前景：字、图标、线 | `oklch(0.5325 0.15368 133.676)` / `oklch(0.90469 0.16668 124.297)` | `oklch(0.205 0 0)` / `oklch(0.922 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `var(--primary)` | `oklch(0.38687 0.14996 259)` / `oklch(0.8943 0.08425 214.859)` |
| `brand-edge` | 强调色填充控件的发丝线 | `oklch(0.76556 0.16727 124.422)` / `oklch(0.32672 0.08497 127.611 / 0.55)` | `var(--border)` | `var(--border)` | `oklch(0.82875 0.01776 308.223)` / `oklch(0.39805 0.01736 303.721)` | `oklch(0.34485 0.10621 252.962)` / `oklch(0.7208 0.10826 230.667)` |
| `track` | 关着的开关、滑杆与进度条的底槽 | `oklch(0.93714 0.00417 271.368)` / `oklch(0.33232 0.01134 264.409)` | `oklch(0.97 0 0)` / `oklch(0.269 0 0)` | `oklch(0.93459 0.00268 286.348)` / `oklch(0.34609 0.00689 286.034)` | `oklch(0.91401 0.01366 314.754)` / `oklch(0.32979 0.01247 298.761)` | `oklch(0.94611 0 0)` / `oklch(0.23075 0 0)` |
| `knob` | 关着的开关圆点 | `oklch(1 0 0)` / `oklch(0.92199 0.00419 271.367)` | `oklch(1 0 0)` / `oklch(0.985 0 0)` | `oklch(1 0 0)` | `oklch(0.56675 0.01627 308.142)` / `oklch(0.65664 0.01531 304.011)` | `oklch(0.47478 0 0)` / `oklch(0.84522 0 0)` |
| `info` | 提示状态的语义色 | `oklch(0.53418 0.17531 266.181)` / `oklch(0.7377 0.13479 263.817)` | `oklch(0.556 0 0)` / `oklch(0.708 0 0)` | `oklch(0.60276 0.21771 257.424)` / `oklch(0.62425 0.20558 255.486)` | `oklch(0.49552 0.13046 293.709)` / `oklch(0.83493 0.09457 298.018)` | `oklch(0.56769 0.16654 251.313)` / `oklch(0.80403 0.12199 230.822)` |
| `warn` | 警告状态的语义色 | `oklch(0.5909 0.13245 65.117)` / `oklch(0.82449 0.14865 73.346)` | `oklch(0.439 0 0)` / `oklch(0.87 0 0)` | `oklch(0.76524 0.17521 62.574)` / `oklch(0.78237 0.17106 67.223)` | `oklch(0.5909 0.13245 65.117)` / `oklch(0.82449 0.14865 73.346)` | `oklch(0.53885 0.12069 65.216)` / `oklch(0.90397 0.18827 100.526)` |
| `up` | 增长（上涨）的语义色 | `oklch(0.56078 0.1232 159.355)` / `oklch(0.77932 0.14805 162.141)` | `oklch(0.371 0 0)` / `oklch(0.922 0 0)` | `oklch(0.73032 0.19438 147.444)` / `oklch(0.75555 0.20825 146.984)` | `oklch(0.56078 0.1232 159.355)` / `oklch(0.77932 0.14805 162.141)` | `oklch(0.50725 0.16489 142.658)` / `oklch(0.75934 0.17155 141.348)` |
| `brand-tint` | 选中行与气泡的强调色淡底 | `color-mix(in srgb, oklch(0.74395 0.18452 127.154) 16%, transparent)` / `color-mix(in srgb, var(--brand) 14%, transparent)` | `color-mix(in srgb, var(--brand) 10%, transparent)` | `color-mix(in srgb, var(--brand) 12%, transparent)` | `oklch(0.91633 0.03651 303.106)` / `oklch(0.40052 0.034 298.591)` | `oklch(0.91469 0.01564 247.999)` / `oklch(0.30508 0.01746 227.257)` |
| `inverse` | toast 与 tooltip 的反色面 | `var(--popover)` | `var(--card)` | `var(--popover)` | `oklch(0.31066 0.01135 308.056)` / `oklch(0.91401 0.01366 314.754)` | `oklch(0.98212 0 0)` / `oklch(0.27685 0 0)` |
| `inverse-foreground` | 反色面上的字 | `var(--foreground)` | `var(--foreground)` | `var(--foreground)` | `oklch(0.95906 0.01235 317.742)` / `oklch(0.31066 0.01135 308.056)` | `oklch(0.21779 0 0)` / `oklch(1 0 0)` |
| `inverse-brand` | 反色面上的强调色：toast 的操作 | `var(--primary-foreground)` | `var(--primary-foreground)` | `var(--primary-foreground)` | `oklch(0.83493 0.09457 298.018)` / `oklch(0.49552 0.13046 293.709)` | `oklch(1 0 0)` / `oklch(0 0 0)` |
| `info-tint` | 提示状态的淡底 | `color-mix(in srgb, var(--info) 10%, transparent)` / `color-mix(in srgb, var(--info) 16%, transparent)` | `color-mix(in srgb, var(--info) 10%, transparent)` | `color-mix(in srgb, var(--info) 12%, transparent)` | `color-mix(in srgb, var(--info) 12%, transparent)` | `oklch(0.97015 0 0)` / `oklch(0.27274 0 0)` |
| `warn-tint` | 警告状态的淡底 | `color-mix(in srgb, var(--warn) 11%, transparent)` / `color-mix(in srgb, var(--warn) 16%, transparent)` | `color-mix(in srgb, var(--warn) 10%, transparent)` | `color-mix(in srgb, var(--warn) 12%, transparent)` | `color-mix(in srgb, var(--warn) 12%, transparent)` | `oklch(0.96621 0.05066 93.747)` / `oklch(0.33731 0.04713 83.238)` |
| `destructive-tint` | 危险状态的淡底 | `color-mix(in srgb, var(--destructive) 10%, transparent)` / `color-mix(in srgb, var(--destructive) 16%, transparent)` | `color-mix(in srgb, var(--destructive) 10%, transparent)` | `color-mix(in srgb, var(--destructive) 12%, transparent)` | `oklch(0.92215 0.03006 22.785)` / `oklch(0.42005 0.14731 28.135)` | `oklch(0.9462 0.02418 11.286)` / `oklch(0.30954 0.04407 22.054)` |
| `up-tint` | 上涨的淡底 | `color-mix(in srgb, var(--up) 10%, transparent)` / `color-mix(in srgb, var(--up) 16%, transparent)` | `color-mix(in srgb, var(--up) 10%, transparent)` | `color-mix(in srgb, var(--up) 12%, transparent)` | `color-mix(in srgb, var(--up) 12%, transparent)` | `oklch(0.94958 0.04104 143.026)` / `oklch(0.34726 0.05298 114.732)` |
| `down-tint` | 下跌的淡底 | `color-mix(in srgb, var(--destructive) 10%, transparent)` / `color-mix(in srgb, var(--destructive) 16%, transparent)` | `color-mix(in srgb, var(--destructive) 10%, transparent)` | `color-mix(in srgb, var(--destructive) 12%, transparent)` | `color-mix(in srgb, var(--destructive) 12%, transparent)` | `oklch(0.9462 0.02418 11.286)` / `oklch(0.30954 0.04407 22.054)` |
| `violet` | 第三个数据色：图的一条线、链接 | `oklch(0.5339 0.1647 289.689)` / `oklch(0.76787 0.13219 294.446)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` | `oklch(0.61489 0.21292 312.411)` / `oklch(0.65605 0.22741 312.416)` | `oklch(0.49039 0.06053 358.445)` / `oklch(0.8367 0.06656 359.427)` | `oklch(0.5339 0.1647 289.689)` / `oklch(0.76787 0.13219 294.446)` |
| `scrim` | 模态与抽屉背后的遮罩 | `oklch(0 0 0 / 0.45)` | `oklch(0 0 0 / 0.5)` | `oklch(0 0 0 / 0.4)` | `oklch(0 0 0 / 0.32)` | `oklch(0 0 0 / 0.302)` |
| `media` | 照片与影片的底，不随外观翻转 | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` | `oklch(0.1869 0.0151 266.766)` |
| `on-media` | 照片与深色媒体面上的白字，不随外观翻转 | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` |

## 2 typography

7 个字阶角色的字号、行高、字重与字距；`fontSize` 与 `lineHeight` 分指针与触屏两档，`fontWeight` 与 `letterSpacing` 两档同值。行高是整数点数（源码里的倍率已在 `tokens:build` 时乘回）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `typography.caption.fontSize` | 小号说明与分段计数的字号 | 11 / 12 | 11 / 12 | 10 / 12 | 11 | 12 |
| `typography.caption.lineHeight` | 小号说明与分段计数的行高 | 16 | 16 | 13 / 16 | 16 | 16 |
| `typography.caption.fontWeight` | 小号说明与分段计数的字重 | 400 | 400 | 400 | 500 | 400 |
| `typography.caption.letterSpacing` | 小号说明与分段计数的字距 | 0 | 0 | 0 | 0.5 | 0 |
| `typography.detail.fontSize` | 侧栏分组名与计数的字号 | 12 / 13 | 12 / 13 | 11 / 13 | 12 | 12 |
| `typography.detail.lineHeight` | 侧栏分组名与计数的行高 | 16 / 20 | 16 / 20 | 14 / 18 | 16 | 16 |
| `typography.detail.fontWeight` | 侧栏分组名与计数的字重 | 400 | 400 | 400 | 400 | 400 |
| `typography.detail.letterSpacing` | 侧栏分组名与计数的字距 | 0 | 0 | 0 | 0.4 | 0 |
| `typography.body.fontSize` | 正文的字号 | 13 / 15 | 13 / 15 | 13 / 17 | 14 | 14 |
| `typography.body.lineHeight` | 正文的行高 | 20 | 20 | 16 / 22 | 20 | 20 |
| `typography.body.fontWeight` | 正文的字重 | 400 | 400 | 400 | 400 | 400 |
| `typography.body.letterSpacing` | 正文的字距 | 0 | 0 | 0 | 0.25 | 0 |
| `typography.label.fontSize` | 控件与表单的标签的字号 | 14 / 15 | 14 / 15 | 13 / 17 | 14 | 14 |
| `typography.label.lineHeight` | 控件与表单的标签的行高 | 20 | 20 | 16 / 22 | 20 | 20 |
| `typography.label.fontWeight` | 控件与表单的标签的字重 | 500 | 500 | 500 | 500 | 400 |
| `typography.label.letterSpacing` | 控件与表单的标签的字距 | 0 | 0 | 0 | 0.1 | 0 |
| `typography.title.fontSize` | 卡片与区块标题的字号 | 16 | 16 | 13 / 17 | 16 | 14 |
| `typography.title.lineHeight` | 卡片与区块标题的行高 | 24 | 24 | 16 / 22 | 24 | 20 |
| `typography.title.fontWeight` | 卡片与区块标题的字重 | 600 | 600 | 600 | 500 | 600 |
| `typography.title.letterSpacing` | 卡片与区块标题的字距 | 0 | 0 | 0 | 0.15 | 0 |
| `typography.headline.fontSize` | 页面标题的字号 | 20 / 22 | 20 / 22 | 22 | 24 | 20 |
| `typography.headline.lineHeight` | 页面标题的行高 | 28 | 28 | 26 / 28 | 32 | 28 |
| `typography.headline.fontWeight` | 页面标题的字重 | 600 | 600 | 600 | 400 | 600 |
| `typography.headline.letterSpacing` | 页面标题的字距 | 0 | 0 | 0 | 0 | 0 |
| `typography.display.fontSize` | 大号数字与主视觉标题的字号 | 26 / 28 | 26 / 28 | 26 / 34 | 36 | 28 |
| `typography.display.lineHeight` | 大号数字与主视觉标题的行高 | 32 / 36 | 32 / 36 | 32 / 41 | 44 | 36 |
| `typography.display.fontWeight` | 大号数字与主视觉标题的字重 | 600 | 600 | 600 | 400 | 600 |
| `typography.display.letterSpacing` | 大号数字与主视觉标题的字距 | 0 | 0 | 0 | 0 | 0 |

## 3 dimension

`shape` 的 3 个层圆角以 `{radius-…}` 引用 `theme.json` 的圆角 token；`size.hit`、`size.density`、`size.item`、`size.control`、`size.height`、`icon` 分指针与触屏两档；`stroke`、`focus` 与 `control` 的六个控件维度不随档位变。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `dimension.shape.control` | 页内元素的圆角：输入框、行、徽标、标签、井、色区、kbd | `{radius-control}` | `{radius-control}` | `{radius-control}` | `{radius-control}` | `{radius-control}` |
| `dimension.shape.container` | 容器与浮层的圆角：卡片、菜单、弹出层、提示、列表面板、toast | `{radius-container}` | `{radius-container}` | `{radius-container}` | `{radius-container}` | `{radius-container}` |
| `dimension.shape.modal` | 模态面的圆角：对话框、抽屉、底部面板 | `{radius-modal}` | `{radius-modal}` | `{radius-modal}` | `{radius-modal}` | `{radius-modal}` |
| `dimension.size.hit` | 触控目标的最小边长，0 表示不补点按范围 | 0 / 44 | 0 / 44 | 0 / 44 | 0 / 48 | 0 / 40 |
| `dimension.size.density.pad` | 页面级的页边距 | 12 | 12 | 16 | 16 | 12 |
| `dimension.size.density.gap` | 页面级的间隙 | 12 | 12 | 12 | 12 | 8 |
| `dimension.size.item.inset` | 列表行到容器边的距离：行的填充往里缩多少 | 4 / 8 | 4 / 8 | 4 / 0 | 0 | 4 |
| `dimension.size.item.pad` | 行填充边到文字的间距 | 8 | 8 | 8 / 16 | 12 | 11 |
| `dimension.size.control.padding` | 控件内部的留白 | 8 | 8 | 8 | 8 | 6 |
| `dimension.size.control.gap` | 控件内图标与字的间距 | 8 | 8 | 8 | 8 | 8 |
| `dimension.size.control.dot` | 指示点的直径：开关的点、选择器的点 | 6 / 8 | 6 / 8 | 6 / 8 | 10 | 12 |
| `dimension.size.control.switch` | 开关的钮取哪一档 | `small` / `regular` | `small` / `regular` | `regular` | `regular` | `regular` |
| `dimension.size.height.sm` | 控件高度的小档 | 24 / 32 | 24 / 32 | 24 / 32 | 24 / 32 | 24 / 32 |
| `dimension.size.height.md` | 控件高度的中档 | 28 / 40 | 28 / 40 | 28 / 44 | 32 / 40 | 32 / 40 |
| `dimension.size.height.lg` | 控件高度的大档（也是列表行、标签页的高度） | 32 / 48 | 32 / 48 | 32 / 56 | 40 / 56 | 40 / 48 |
| `dimension.stroke.hairline` | 发丝线宽：分隔、表面边、描边变体 | 1 | 1 | 0.5 | 1 | 1 |
| `dimension.stroke.control` | 可点控件的描边宽 | 1 | 1 | 1 | 1 | 1 |
| `dimension.focus.style` | 焦点环的画法：晕、外框还是双线 | `halo` | `halo` | `halo` | `outline` | `double` |
| `dimension.focus.width` | 焦点环的线宽 | 3 | 3 | 3 | 3 | 2 |
| `dimension.focus.offset` | 焦点环从控件边界向外的偏移 | 0 | 0 | 0 | 2 | 0 |
| `dimension.icon.sm` | 图标的小档 | 12 / 16 | 12 / 16 | 12 / 16 | 12 / 16 | 12 / 16 |
| `dimension.icon.md` | 图标的中档 | 16 / 20 | 16 / 20 | 16 / 20 | 16 / 20 | 16 / 20 |
| `dimension.icon.lg` | 图标的大档 | 20 / 24 | 20 / 24 | 20 / 24 | 20 / 24 | 20 / 24 |
| `dimension.control.selection` | 选中项的记号画成什么、覆盖多宽 | `pill` | `plate` | `plate` | `underline` | `bar` |
| `dimension.control.field` | 输入井的框：四条边、只下边，还是框加下边 | `box` | `box` | `box` | `underline` | `box-underline` |
| `dimension.control.choice` | 选择框静止时的面 | `well` | `well` | `well` | `outline` | `inset` |
| `dimension.control.track` | 轨道：凹槽、色带，还是一条细线 | `sunk` | `sunk` | `sunk` | `tint` | `hairline` |
| `dimension.control.handle` | 手柄：圆钮、竖条，还是环 | `circle` | `circle` | `circle` | `circle` | `ring` |
| `dimension.control.group` | 一组互斥按钮的分组形状 | `track` | `track` | `capsule` | `cells` | `track` |

## 4 shape

非尺寸的圆角决定：曲率，以及按钮的角取圆角刻度还是胶囊。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `shape.curve` | 圆角的曲率：连续曲线（Apple）还是圆弧 | `continuous` | `continuous` | `continuous` | `circular` | `circular` |
| `shape.corners.button` | 按钮的角：取圆角刻度，还是胶囊 | `radius` | `radius` | `full` | `full` | `radius` |

## 5 state

交互状态的透明度、按下缩放、叠色与水波开关。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `state.press-scale` | 按下时的缩放倍数（1 为不缩放） | 0.97 | 1 | 1 | 1 | 1 |
| `state.overlay.hover` | 指针悬停的叠色透明度（0 为不叠色） | 0 | 0 | 0 | 0.08 | 0 |
| `state.overlay.focus` | 获得焦点的叠色透明度 | 0 | 0 | 0 | 0.1 | 0 |
| `state.overlay.pressed` | 按下的叠色透明度 | 0 | 0 | 0 | 0.1 | 0 |
| `state.overlay.dragged` | 拖动的叠色透明度 | 0 | 0 | 0 | 0.16 | 0 |
| `state.ripple` | 按下时是否画水波 | false | false | false | true | false |
| `state.pressed-opacity` | 按下时内容的透明度 | 0.7 | 0.7 | 0.7 | 1 | 1 |
| `state.rest-opacity` | 指示器静止时的透明度（滚动条滑块） | 0.5 | 0.5 | 0.5 | 0.38 | 0.5 |
| `state.disabled.content` | 禁用时内容的透明度 | 0.5 | 0.5 | 0.3 | 0.38 | 0.36 |
| `state.disabled.fill` | 禁用时容器是否改画专用的禁用底，否则沿用统一透明度 | false | false | false | true | true |

## 6 transition

表面进场动画的时长与曲线（曲线名引用 `cubicBezier` 组）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `transition.enter.duration` | 表面进场的时长（ms） | 420 | 420 | 420 | 500 | 250 |
| `transition.enter.timingFunction` | 表面进场的曲线（`cubicBezier` 组里的名字） | `out-cubic` | `out-cubic` | `out-cubic` | `emphasized-decelerate` | `decelerate` |

## 7 motion

三档弹簧与状态淡变。一套主题对一档要么写弹簧（`stiffness` / `damping`），要么写时间（`duration` / `timingFunction`），另一种参数化的那一格是 `—`。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `motion.fast.stiffness` | 小控件开关的弹簧刚度 | 1218 | 1218 | 1218 | 800 | — |
| `motion.fast.damping` | 小控件开关的阻尼 | 70 | 70 | 70 | 33.94 | — |
| `motion.default.stiffness` | 日常反馈的弹簧刚度 | 520 | 520 | 520 | 380 | — |
| `motion.default.damping` | 日常反馈的阻尼 | 34 | 34 | 34 | 31.19 | — |
| `motion.slow.stiffness` | 大表面移动的弹簧刚度 | 320 | 320 | 320 | 200 | — |
| `motion.slow.damping` | 大表面移动的阻尼 | 30 | 30 | 30 | 22.63 | — |
| `motion.state.duration` | 状态淡变的时长（ms） | 120 | 120 | 120 | 100 | 83 |
| `motion.state.timingFunction` | 状态淡变的曲线 | `out-cubic` | `out-cubic` | `out-cubic` | `standard` | `decelerate` |
| `motion.fast.duration` | 小控件开关的时长（ms） | — | — | — | — | 83 |
| `motion.fast.timingFunction` | 小控件开关的曲线 | — | — | — | — | `decelerate` |
| `motion.default.duration` | 日常反馈的时长（ms） | — | — | — | — | 167 |
| `motion.default.timingFunction` | 日常反馈的曲线 | — | — | — | — | `decelerate` |
| `motion.slow.duration` | 大表面移动的时长（ms） | — | — | — | — | 250 |
| `motion.slow.timingFunction` | 大表面移动的曲线 | — | — | — | — | `decelerate` |

## 8 finishes

14 个 finish 角色，字段共 13 种（一个角色只用到其中几种）。编译产物把它分成 `shared` 与稀疏的 `light` / `dark`，本表列的是两者合并后的值，于是只有一种外观写了的字段也照样是一行。`{token}` 是对 `theme.json` 的引用，`null` 是该字段的中性值（见 `theme-roles.md` §2）。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `finishes.card.background` | 卡片与区块的底 | `{card}` | `{card}` | `{card}` | `{card}` | `{card}` |
| `finishes.card.foreground` | 卡片与区块的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.card.border-color` | 卡片与区块的边 | `{border}` | `{border}` | `{border}` | `transparent` | `oklch(0.92191 0 0)` / `oklch(0.23075 0 0)` |
| `finishes.card.backdropFilter` | 卡片与区块的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.card.elevation` | 卡片与区块的平台自己的高度（dp） | — | — | — | 1 | — |
| `finishes.card.shadow` | 卡片与区块的影子 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04)` / `0 1px 0 oklch(0 0 0 / 0.35)` | `0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)` | `none` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `0 0 2px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.14)` / `0 0 2px oklch(0 0 0 / 0.24), 0 4px 8px oklch(0 0 0 / 0.28)` |
| `finishes.inset.foreground` | 井的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.inset.backdropFilter` | 井的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.inset.shadow` | 井的影子 | `inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.06)` / `inset 0 1px 1px oklch(0 0 0 / 0.2)` | `none` | `none` | `none` | `none` |
| `finishes.channel.background` | 分段轨道的底 | `{inset}` | `{inset}` | `{card}` | `{inset}` | `{inset}` |
| `finishes.channel.foreground` | 分段轨道的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.channel.border-color` | 分段轨道的边 | `{border}` | `{border}` | `{border}` | `{border}` | `{border}` |
| `finishes.channel.backdropFilter` | 分段轨道的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.channel.shadow` | 分段轨道的影子 | `inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.06)` / `inset 0 1px 1px oklch(0 0 0 / 0.2)` | `none` | `0 1px 3px oklch(0 0 0 / 0.2)` | `none` | `none` |
| `finishes.raised.background` | 按钮与胶囊的底 | `{raised}` | `{raised}` | `oklch(from {raised} l c h / 0.72)` | `{raised}` | `{raised}` |
| `finishes.raised.foreground` | 按钮与胶囊的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.raised.backdropFilter` | 按钮与胶囊的背景模糊 | `none` | `none` | `blur(30px)` | `none` | `none` |
| `finishes.raised.material` | 按钮与胶囊的材质 | — | — | `glass` | — | — |
| `finishes.raised.shadow` | 按钮与胶囊的影子 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6), 0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08), 0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 3px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |
| `finishes.raised.border-color` | 按钮与胶囊的边 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` |
| `finishes.raised.border-top-color` | 按钮与胶囊的上边色 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` / `oklch(0.32897 0 0)` |
| `finishes.raised.border-bottom-color` | 按钮与胶囊的下边色 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0.84522 0 0)` / `{border}` |
| `finishes.plate.foreground` | 井里选中的一块的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.plate.backdropFilter` | 井里选中的一块的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.plate.elevation` | 井里选中的一块的平台自己的高度（dp） | — | — | — | 1 | — |
| `finishes.plate.background` | 井里选中的一块的底 | `{card}` / `{raised}` | `{field}` | `{card}` / `{raised}` | `{secondary}` | `{card}` |
| `finishes.plate.shadow` | 井里选中的一块的影子 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6), 0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08), 0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 3px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |
| `finishes.plate.border-color` | 井里选中的一块的边 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` / `{input}` | `transparent` | `transparent` | `{border}` |
| `finishes.plate.border-top-color` | 井里选中的一块的上边色 | `{border}` / `oklch(0 0 0 / 0.5)` | — | — | — | — |
| `finishes.plate.border-bottom-color` | 井里选中的一块的下边色 | `{border}` / `oklch(0 0 0 / 0.5)` | — | — | — | — |
| `finishes.overlay.background` | 菜单与 toast的底 | `{popover}` | `{card}` | `oklch(from {popover} l c h / 0.72)` | `{popover}` | `oklch(from {popover} l c h / 0.85)` / `oklch(from {popover} l c h / 0.96)` |
| `finishes.overlay.foreground` | 菜单与 toast的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.overlay.border-color` | 菜单与 toast的边 | `{border}` | `{border}` | `transparent` | `transparent` | `{glass-edge}` |
| `finishes.overlay.backdropFilter` | 菜单与 toast的背景模糊 | `none` | `none` | `blur(30px)` | `none` | `none` |
| `finishes.overlay.material` | 菜单与 toast的材质 | — | — | `glass` | — | `acrylic` |
| `finishes.overlay.elevation` | 菜单与 toast的平台自己的高度（dp） | — | — | — | 3 | — |
| `finishes.overlay.shadow` | 菜单与 toast的影子 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 30px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 30px oklch(0 0 0 / 0.4)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 2px 6px 2px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.2), 0 16px 32px oklch(0 0 0 / 0.24)` / `0 0 8px oklch(0 0 0 / 0.4), 0 16px 32px oklch(0 0 0 / 0.48)` |
| `finishes.modal.background` | 对话框与抽屉的底 | `{card}` | `{card}` | `{card}` | `oklch(0.93251 0.01479 312.24)` / `oklch(0.2859 0.01293 298.633)` | `{background}` |
| `finishes.modal.foreground` | 对话框与抽屉的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.modal.border-color` | 对话框与抽屉的边 | `{border}` | `{border}` | `{border}` | `transparent` | `oklch(0.81093 0 0)` / `oklch(0.37909 0 0)` |
| `finishes.modal.backdropFilter` | 对话框与抽屉的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.modal.elevation` | 对话框与抽屉的平台自己的高度（dp） | — | — | — | 6 | — |
| `finishes.modal.shadow` | 对话框与抽屉的影子 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 30px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 30px oklch(0 0 0 / 0.4)` | `0 1px 3px oklch(0 0 0 / 0.3), 0 4px 8px 3px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.2), 0 64px 128px oklch(0 0 0 / 0.24)` / `0 0 8px oklch(0 0 0 / 0.4), 0 64px 128px oklch(0 0 0 / 0.48)` |
| `finishes.inverse.background` | 反色面的底 | `{inverse}` | `{inverse}` | `oklch(from {inverse} l c h / 0.72)` | `{inverse}` | `{inverse}` |
| `finishes.inverse.foreground` | 反色面的字与图标 | `{inverse-foreground}` | `{inverse-foreground}` | `{inverse-foreground}` | `{inverse-foreground}` | `{inverse-foreground}` |
| `finishes.inverse.border-color` | 反色面的边 | `{border}` | `{border}` | `transparent` | `transparent` | `{glass-edge}` |
| `finishes.inverse.backdropFilter` | 反色面的背景模糊 | `none` | `none` | `blur(30px)` | `none` | `none` |
| `finishes.inverse.material` | 反色面的材质 | — | — | `glass` | — | — |
| `finishes.inverse.elevation` | 反色面的平台自己的高度（dp） | — | — | — | 6 | — |
| `finishes.inverse.shadow` | 反色面的影子 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 30px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 30px oklch(0 0 0 / 0.4)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 2px 6px 2px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.2), 0 16px 32px oklch(0 0 0 / 0.24)` / `0 0 8px oklch(0 0 0 / 0.4), 0 16px 32px oklch(0 0 0 / 0.48)` |
| `finishes.glass.foreground` | 玻璃面的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.glass.border-color` | 玻璃面的边 | `{border}` | `{border}` | `{border}` | `transparent` | `{glass-edge}` |
| `finishes.glass.backdropFilter` | 玻璃面的背景模糊 | `blur(20px)` | `blur(20px)` | `blur(30px)` | `none` | `blur(30px)` |
| `finishes.glass.material` | 玻璃面的材质 | — | — | `glass` | — | — |
| `finishes.glass.elevation` | 玻璃面的平台自己的高度（dp） | — | — | — | 3 | — |
| `finishes.glass.background` | 玻璃面的底 | `oklch(from {popover} l c h / 0.8)` / `oklch(from {card} l c h / 0.78)` | `oklch(from {card} l c h / 0.8)` | `oklch(from {popover} l c h / 0.72)` | `{popover}` | `oklch(from {popover} l c h / 0.85)` / `oklch(from {popover} l c h / 0.96)` |
| `finishes.glass.shadow` | 玻璃面的影子 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6), 0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08), 0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 3px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |
| `finishes.accent.background` | 强调面的底 | `{primary}` | `{primary}` | `{primary}` | `{primary}` | `{primary}` |
| `finishes.accent.foreground` | 强调面的字与图标 | `{primary-foreground}` | `{primary-foreground}` | `{primary-foreground}` | `{primary-foreground}` | `{primary-foreground}` |
| `finishes.accent.border-color` | 强调面的边 | `{brand-edge}` | `transparent` | `transparent` | `transparent` | `oklch(0.52768 0.14982 252.341)` / `oklch(0.81732 0.11439 230)` |
| `finishes.accent.border-top-color` | 强调面的上边色 | `{brand-edge}` | `transparent` | `transparent` | `transparent` | `oklch(0.52768 0.14982 252.341)` / `oklch(0.81732 0.11439 230)` |
| `finishes.accent.border-bottom-color` | 强调面的下边色 | `{brand-edge}` | `transparent` | `transparent` | `transparent` | `{brand-edge}` |
| `finishes.accent.pressed-opacity` | 强调面的按下时的不透明度（强调面上的字与图标） | 0.88 | 0.88 | 0.88 | 1 | 1 |
| `finishes.accent.pressed-background` | 强调面的按下时换的底色 | — | — | — | — | `oklch(0.5773 0.13223 250.006)` / `oklch(0.70029 0.10192 230.522)` |
| `finishes.accent.pressed-foreground` | 强调面的按下时换的字色 | — | — | — | — | `oklch(0.87245 0.03754 247.003)` / `oklch(0.42706 0.05878 229.834)` |
| `finishes.accent.backdropFilter` | 强调面的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.accent.shadow` | 强调面的影子 | `inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -1px 0 oklch(0.42761 0.11265 128.534 / 0.12), 0 1px 0 oklch(0.42761 0.11265 128.534 / 0.14)` / `inset 0 0 0 1px oklch(1 0 0 / 0.22), inset 0 1px 1px oklch(1 0 0 / 0.35), 0 1px 1px oklch(0 0 0 / 0.12)` | `none` | `none` | `none` | `none` |
| `finishes.knob.foreground` | 旋钮的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.knob.backdropFilter` | 旋钮的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.knob.background` | 旋钮的底 | `oklch(1 0 0)` / `{knob}` | `{knob}` | `{knob}` | `{knob}` | `{knob}` |
| `finishes.knob.gradient` | 旋钮的叠在底上的渐变 | `linear-gradient(180deg, oklch(1 0 0) 0%, {raised} 100%)` / `linear-gradient(180deg, {foreground} 0%, oklch(0.88185 0.00589 264.53) 100%)` | — | — | — | — |
| `finishes.knob.shadow` | 旋钮的影子 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |
| `finishes.knob.border-color` | 旋钮的边 | `{input}` / `oklch(0.8324 0.00597 264.528)` | `transparent` | `transparent` | `transparent` | `transparent` |
| `finishes.hover.foreground` | 悬停中的控件的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` |
| `finishes.hover.backdropFilter` | 悬停中的控件的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.hover.elevation` | 悬停中的控件的平台自己的高度（dp） | — | — | — | 1 | — |
| `finishes.hover.background` | 悬停中的控件的底 | `{popover}` / `{input}` | `{hover}` | `{hover}` | `{raised}` | `{hover}` |
| `finishes.hover.shadow` | 悬停中的控件的影子 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6), 0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08), 0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 3px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |
| `finishes.hover.border-color` | 悬停中的控件的边 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` |
| `finishes.hover.border-top-color` | 悬停中的控件的上边色 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` / `oklch(0.32897 0 0)` |
| `finishes.hover.border-bottom-color` | 悬停中的控件的下边色 | `{border}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `oklch(0.84522 0 0)` / `{border}` |
| `finishes.pressed.foreground` | 按下的控件的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `{foreground}` | `{muted-foreground}` |
| `finishes.pressed.backdropFilter` | 按下的控件的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.pressed.elevation` | 按下的控件的平台自己的高度（dp） | — | — | — | 1 | — |
| `finishes.pressed.background` | 按下的控件的底 | `{muted}` / `{line}` | `{border}` / `oklch(0.34846 0 0)` | `{muted}` | `{raised}` | `{muted}` |
| `finishes.pressed.shadow` | 按下的控件的影子 | `inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.06)` / `inset 0 1px 1px oklch(0 0 0 / 0.2)` | `none` | `none` | `none` | `none` |
| `finishes.pressed.border-color` | 按下的控件的边 | `{input}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` |
| `finishes.pressed.border-top-color` | 按下的控件的上边色 | `{input}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` |
| `finishes.pressed.border-bottom-color` | 按下的控件的下边色 | `{input}` / `oklch(0 0 0 / 0.5)` | `transparent` | `transparent` | `transparent` | `{border}` |
| `finishes.disabled.background` | 禁用的控件的底 | `{raised}` | `{raised}` | `{raised}` | `oklch(from {foreground} l c h / 0.1)` | `oklch(0.97015 0 0)` / `oklch(0.28502 0 0)` |
| `finishes.disabled.foreground` | 禁用的控件的字与图标 | `{foreground}` | `{foreground}` | `{foreground}` | `oklch(from {foreground} l c h / 0.38)` | `oklch(0.68949 0 0)` / `oklch(0.54863 0 0)` |
| `finishes.disabled.border-color` | 禁用的控件的边 | `{border}` | `{border}` | `{border}` | `transparent` | `{border}` |
| `finishes.disabled.backdropFilter` | 禁用的控件的背景模糊 | `none` | `none` | `none` | `none` | `none` |
| `finishes.disabled.shadow` | 禁用的控件的影子 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6), 0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08), 0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 1px 3px oklch(0 0 0 / 0.2)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `none` |

## 9 elevation

每个外观的影子刻度：五档高度与两条边。finish 的 `shadow` 字段点名这里的几部分，所以同一步影子的面长得一样。

| 字段 | 说明 | NSH Gallery | shadcn/ui | Apple | Material | WinUI |
| --- | --- | --- | --- | --- | --- | --- |
| `elevation.sm` | 控件的投影：落在它所在的那个面上 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.05)` / `0 1px 1px oklch(0 0 0 / 0.12)` | `0 1px 2px oklch(0 0 0 / 0.05)` | `0 1px 3px oklch(0 0 0 / 0.2)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | — |
| `elevation.md` | 卡片的投影：面离页面一步 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04)` / `0 1px 0 oklch(0 0 0 / 0.35)` | `0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)` | — | `0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px 1px oklch(0 0 0 / 0.15)` | `0 0 2px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.14)` / `0 0 2px oklch(0 0 0 / 0.24), 0 4px 8px oklch(0 0 0 / 0.28)` |
| `elevation.lg` | 浮层的投影：菜单浮在页面之上 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 30px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 30px oklch(0 0 0 / 0.4)` | `0 1px 2px oklch(0 0 0 / 0.3), 0 2px 6px 2px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.2), 0 16px 32px oklch(0 0 0 / 0.24)` / `0 0 8px oklch(0 0 0 / 0.4), 0 16px 32px oklch(0 0 0 / 0.48)` |
| `elevation.xl` | 对话框的投影：页面在它后面等 | `0 1px 0 oklch(0.1686 0.02256 263.693 / 0.04), 0 12px 28px -10px oklch(0.1686 0.02256 263.693 / 0.22)` / `0 1px 0 oklch(0 0 0 / 0.4), 0 16px 32px -10px oklch(0 0 0 / 0.6)` | `0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)` | `0 0 0 0.5px oklch(0 0 0 / 0.08), 0 8px 30px oklch(0 0 0 / 0.14)` / `0 0 0 0.5px oklch(1 0 0 / 0.1), 0 8px 30px oklch(0 0 0 / 0.4)` | `0 1px 3px oklch(0 0 0 / 0.3), 0 4px 8px 3px oklch(0 0 0 / 0.15)` | `0 0 8px oklch(0 0 0 / 0.2), 0 64px 128px oklch(0 0 0 / 0.24)` / `0 0 8px oklch(0 0 0 / 0.4), 0 64px 128px oklch(0 0 0 / 0.48)` |
| `elevation.inset` | 井的投影：光落进槽里 | `inset 0 1px 1px oklch(0.1686 0.02256 263.693 / 0.06)` / `inset 0 1px 1px oklch(0 0 0 / 0.2)` | — | — | — | — |
| `elevation.edge.surface` | 凸起表面的硬边：它的高光与发丝线 | `inset 0 1px 0 oklch(1 0 0), inset 0 2px 0 oklch(1 0 0 / 0.6)` / `inset 0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 1px oklch(1 0 0 / 0.08)` | — | `0 0 0 0.5px oklch(0 0 0 / 0.08)` / `0 0 0 0.5px oklch(1 0 0 / 0.1)` | — | — |
| `elevation.edge.accent` | 强调色填充的边：高光与自己的投影 | `inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -1px 0 oklch(0.42761 0.11265 128.534 / 0.12), 0 1px 0 oklch(0.42761 0.11265 128.534 / 0.14)` / `inset 0 0 0 1px oklch(1 0 0 / 0.22), inset 0 1px 1px oklch(1 0 0 / 0.35), 0 1px 1px oklch(0 0 0 / 0.12)` | — | — | — | — |
