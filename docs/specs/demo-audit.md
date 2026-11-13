# 演示诊断

[`demo-parity.md`](demo-parity.md) 任务 1：52 个组件的演示，在 Phone（390）与 Desktop（1024）两种画布下，和 `references/nsh/website/demos` 的官方示例对照，判断问题在**画布 / 套件 / 外壳 / look / 演示写法**的哪一层。本文件只诊断，不改组件、演示或文档站。

## 结论

**不是组件（外壳、look）的问题。** 52 个组件的 `<id>.tsx` 与 `<id>.ref.tsx` 在 390×844 与 1024×640 下逐字节相同（`shasum` 全等），说明外壳在两种尺寸下与"look 展开在 `nsh/base` 上"的参照页没有偏离；六个已知问题在参照页上同样出现，因此不在外壳。这批 390×844 / desktop-idiom 截图里，48 张与 `apps/docs/demos/baseline/` 的既有基线逐字节相同（另 4 张是 dialog / alert-dialog——基线按 `steps` 打开了弹窗——与 calendar / date-picker——基线把"今天"钉在 2026-11-12），所以基线本身就是"文档站 Phone 画布"的样子。

问题落在两处：

1. **套件**（`apps/docs/demos/kit.tsx`）：`DemoSection` 把每个小节做成 `flexDirection: "row"` + `alignItems: "center"` 的换行行。行不给子项**宽度**（`alignSelf: "stretch"` 在行里是交叉轴、也就是高度），整宽控件（accordion、collapsible、data-table、color-picker、emoji-picker、slider）于是缩成内容宽或 0 宽；`DemoPage` 又没有滚动容器，内容超过 iframe 高度就被裁掉。
2. **演示写法**：演示是"变体矩阵"页，不是官方示例的场景（Stage / Split / Inspector / Panel / Log / Segmented）；数据、检查器、事件日志普遍缺失，部分演示还把控件放在错误的容器里（plot 没有高度、dock 没有 `flex-1`、carousel 没有照片、editor 只有两行）。

**画布**是横向问题，不是单个组件的根因：文档站给演示的窗口与平台和官方网站播放器不一致（390 宽却是 desktop idiom；Desktop 只有 726×454 而不是 1024×640/900）。六个问题在官方尺寸的 390×844、phone idiom 下同样复现，所以它们不能归给画布；但任务 2、4 完成前，画布必须先修，否则官方场景的 `wide()`（≥700）与 `split`（≥900）在文档站里永远不成立。

| 归类         | 组件数 | 说明                                                                                       |
| ------------ | ------ | ------------------------------------------------------------------------------------------ |
| 套件         | 6      | accordion、collapsible、slider、data-table、color-picker、emoji-picker（同时也有演示写法） |
| 演示写法     | 52     | 全部演示都要改成官方场景或补检查器（任务 4）；其中 7 个无官方示例、无缺陷，只缺检查器      |
| 外壳         | 0      | 52 对 demo / ref 逐字节相同，无外壳偏离                                                    |
| look         | 0      | 上述六处在官方尺寸下由 look 正确绘制（对照官方示例），偏离来自宽度与场景                   |
| 画布（横向） | 52     | idiom、窗口尺寸、主题都不对；见第一节                                                      |

## 怎么看出来的（可复现）

工具在 `scripts/audit/`（不属于检查流水线）：

```sh
bun run build:docs                          # 演示打包 + 文档站构建（画布测量需要）
bun scripts/audit/audit.ts build            # 每个 demo/ref/官方示例 nsh package --target web（/tmp/nsh-audit）
bun scripts/audit/audit.ts shots            # 390×844 / 1024×640 各一张，落到 apps/docs/demos/shots/audit
bun scripts/audit/audit.ts canvas           # 量文档站两种布局真正给 iframe 的尺寸、平台（探针）
bun scripts/audit/audit.ts probe            # 探针在两种 idiom 下单独截图
bun scripts/audit/sheet.ts --out sheet.png --cols 3 a.png b.png c.png   # 拼对照页
```

- 截图**不提交**：`apps/docs/demos/shots/audit/` 在 `.gitignore` 的 `**/demos/shots/` 下（524 张、13 MB）。包在 `/tmp/nsh-audit/packages`（1.6 GB），同样不进仓库。
- 三列分别是 `demo`（`<id>.tsx`）、`ref`（`<id>.ref.tsx`）、`official`（`references/nsh/website/demos/el-<name>.tsx`，原地打包，不复制、不改）。
- 下文表格的证据用短名：`<id>-d-p` = `<id>-demo-phone.png`，`-r-` = `-ref-`，`-o-` = `-official-`，`p` = `-phone`，`k` = `-desktop`，`cp` = `-canvasphone`（390×844、desktop idiom，即文档站 Phone 画布），`ck` = `-canvasdesktop`（726×454，即文档站 Desktop 画布）；额外官方示例带后缀，如 `plot-official-phone-cells.png`。
- 截图是**初始状态**：dialog、alert-dialog、sheet、popover、tooltip、hover-card、menu、context-menu、date-picker、select、combobox 在演示里由 `open` / `defaultOpen` 钉住或只显示触发器；打开态由 `port:render` 的 `steps` 覆盖，这里不重复。
- 打包后的 release 模板不认 `?idiom=`（见下），所以 `scripts/audit/targets.ts` 在**自己的临时副本**里加回网站播放器的那一行 option，才能截 phone idiom；文档站自己的 iframe 没有这一行。

## 一、画布与套件

### 1.1 实测：文档站两种布局给演示什么

在文档站 `/shadcn-nsh/docs/components/accordion/` 上，用站点自己的 Phone / Desktop 按钮切换，然后把预览 iframe 指向一个打包成同样形态的探针应用（`scripts/audit/probe/probe.tsx`，打印 `windowSize()`、`platform.desktop`、`platform.idiom`）：

| 页面视口 | 布局    | iframe / `windowSize()` | `platform.desktop` | `platform.idiom` | 探针截图                                                |
| -------- | ------- | ----------------------- | ------------------ | ---------------- | ------------------------------------------------------- |
| 1440×900 | Phone   | 390 × 844               | **true**           | **desktop**      | `apps/docs/demos/shots/audit/canvas-mobile.png`         |
| 1440×900 | Desktop | **726 × 454**           | **true**           | **desktop**      | `apps/docs/demos/shots/audit/canvas-desktop.png`        |
| 1280×800 | Desktop | **678 × 424**           | true               | desktop          | `apps/docs/demos/shots/audit/canvas-desktop-laptop.png` |
| 560×900  | Desktop | **526 × 420**           | true               | desktop          | `apps/docs/demos/shots/audit/canvas-desktop-narrow.png` |
| 400×900  | Phone   | **350 × 757**           | true               | desktop          | `apps/docs/demos/shots/audit/canvas-mobile-small.png`   |

探针原文（Phone 画布，1440 视口）：`windowSize() 390 × 844`、`platform.desktop true`、`platform.idiom desktop`、`platform.os web`；Desktop 画布是 `windowSize() 726 × 454`，其余相同。也就是说：

- **Phone 画布只换了宽度，没换平台**：390 宽的窗口按桌面的规则排（40 pt 行高、hover 生效、按 desktop 的文案）。
- **Desktop 画布不是 1024×640**：宽度被文档列宽夹到 726，高度又按 1024:640 的比例缩成 454（1280 视口下 678×424，窄屏 526×420 触到 `MIN_HEIGHT` 420 下限）。`windowSize()` 因此是 726×454，`wide()`（≥700）勉强为真，`sideBySide()`（≥900）永远为假。
- 400 视口下 Phone 也被压到 350×757（比设计的 390 窄），应用看到的是另一个窗口。

实测的 JSON 在 `/tmp/nsh-audit/canvas.json`，由 `bun scripts/audit/audit.ts canvas` 重新生成。

### 1.2 为什么：代码链

- 文档站的 iframe：`apps/docs/src/lib/demo.js:17-20` 的 `LAYOUTS`（390×844 / 1024×640）；`:88-89` 的 `<iframe src=demoHref(name)>` **没有 `?idiom=`、没有 `?theme=`**。
- 包：`apps/docs/scripts/build-demos.ts:55-59` 用 `nsh package <id>.tsx --target web`，得到的是**发布模板**（`references/nsh/crates/nsh-cli/src/web/index.html:94-110`）；该模板的 `createPlayer` 选项里没有 `idiom`，也不读 `?theme=`（`grep -c idiom` = 0）。
- 平台：没有 `options.idiom` 时，`references/nsh/crates/nsh-platform-web/web/nsh.js:1602` 走 `measureIdiom()`，`:1850-1852` 在 `(pointer: fine) and (hover: hover)` 为真时返回 `"desktop"`——桌面浏览器里永远为真，**与 iframe 多宽无关**。`platform.desktop` 由 `references/nsh/crates/nsh-core/src/platform.rs:158-160` 的 `desktop_on()` 给出：web 上只有 desktop idiom 为 true。
- 尺寸：`apps/docs/src/lib/demo-client.ts:28-41` 的 `fit()` 把宽度夹到 `stage.clientWidth`，再把高度按 `width × (height/width)` 等比缩（`MIN_HEIGHT` 420，`:18`）。它按"缩放整机"写，不是按"应用以真实尺寸运行"写；注释 `:21` 自己也写着 "no NSH player idiom"。

### 1.3 官方网站播放器怎么做（文件:行）

| 事项        | 官方网站                                                                                                                                                                         | 文档站                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 两种布局    | `references/nsh/website/src/lib/demo.js:24-27`：mobile 390×844 **idiom phone**，desktop 1024×640 **idiom desktop**；`demo-client.ts:44-45` 的 desktop 上限是 1024×**900**        | `apps/docs/src/lib/demo.js:17-20`：只有宽高，没有 idiom         |
| iframe 地址 | `demo.js:111-112` `playerHref()` = `play/index.html?theme=dark&idiom=phone\|desktop#<name>`；`:133` 写进 `data-player-src`                                                       | `demo.js:89` 直接 `demos/<name>/index.html`，无参数             |
| 平台        | 播放器 `references/nsh/crates/nsh-platform-web/web/index.html:48-52` 读 `?idiom=` 传给 `createPlayer`                                                                            | 发布模板没有这个入口，见 1.2                                    |
| 主题        | 播放器 `index.html:46-47` 读 `?theme=`；`demo-client.ts:18-38` 的 `themeDemos()` 先改 URL、运行中 `postMessage({ theme })` 切换                                                  | 无主题参数；演示跟随浏览器 `prefers-color-scheme`，站点切换不到 |
| 尺寸        | `demo-client.ts:120-125`：宽 = min(布局宽, 列宽)，高 = min(布局高, max(420, 内容高 + 32))；`:75-108` 的 `contentHeight()` 量应用最低绘制点，`:150-158` 在加载后 800/2000 ms 再量 | `demo-client.ts:28-41`：高等比缩放                              |
| 切换布局    | `demo-client.ts:157-166` 改 `?idiom=` 并**重载** iframe（idiom 只在启动时定）                                                                                                    | 只改宽高属性，不重载                                            |
| 溢出的弹层  | 播放器 `dialogs: "viewport"`（`index.html:40`），弹层可越出应用框                                                                                                                | 发布模板同样 `dialogs: "viewport"`，但整页由 iframe 裁切        |

结论：官方网站播放器给应用的是"**真实尺寸的窗口 + 指定的 idiom + 与站点相同的主题**"；文档站给的是"**缩放到列宽的一个框 + 浏览器自己量的 idiom + 浏览器的主题**"。

### 1.4 套件：`DemoSection` 与 `DemoPage`

- `apps/docs/demos/kit.tsx:53-62`：`DemoSection` 的标题下是 `View { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }`（`:57`）。在行里，子项的 `alignSelf: "stretch"` 只决定**交叉轴**（高度），宽度仍是内容宽；`flexGrow` 才会分到主轴宽度，但多数演示没有给。
  - 后果：accordion / collapsible 的正文按一行排版、被卡片裁掉；data-table 的包装 `View style={{ height: 200, alignSelf: "stretch" }}` 只有 2 pt 宽（边框），表体 0 宽；slider 直接放在行里时宽 0，只剩值气泡；emoji-picker 的固定 342 pt 面板比卡片内容宽（318 pt）而出框；color-picker 的面板被拉满整行，`ColorSwatches` 的 `justifyContent: "space-between"` 把 4 个色板摊开。
  - 反例（同一套件下正确的写法）：badge、button 的小节各自套了 `flex: 1` 或固定宽容器；switch 用整行 `listRow`。
- `apps/docs/demos/kit.tsx:11-34`：`DemoPage` 是 `padding: 20` 的普通 `View`，没有 `Scroll`，也没有 `flex: 1` 的滚动区。iframe 只有 844（Phone）或 454（文档站 Desktop）高，内容更高的演示直接被裁：emoji-picker 的第二个面板、editor、dock-area、command 都撞到这条。
- Desktop 画布下 `DemoCard` 是 1024 宽（文档站 726），列表行、accordion 触发器横贯整行；官方示例把主体放进 `Stage`（`demo.ts:122-150`，`maxWidth` 默认 440），同样的控件看起来是居中的一块。演示没有这层，宽屏下比例与官方明显不同（`input-demo-desktop.png` 里 Name 拉满约 930 pt，Password 只有 187 pt）。

### 1.5 结论

- 六个已知问题里，**没有一个是画布直接造成**的：把演示放进 390×844、phone idiom 的官方画布，它们仍然出现（`accordion-demo-phone.png` 等）。画布的问题是**横向**的：idiom 不对、Desktop 尺寸不对、主题不跟站点。
- 任务 2 的顺序应该是：先让预览能按布局给 `?idiom=` / `?theme=`（用播放器或等价的发布模板注入），再把 Desktop 的宽高改成"1024 × 内容高（上限 900，下限 420）"，最后把官方的 `Stage / Split / Inspector / Panel / Log / Segmented` 搬进 `apps/docs/demos`（demo-parity 已决定），并让 `DemoSection` 有"行 / 列"两种轴向。否则任务 4 移植进来的官方场景在文档站里 `wide()` 与 `sideBySide()` 都不成立。

## 二、逐组件

图例：**证据**列是 `apps/docs/demos/shots/audit/` 下的文件名（`d` = demo，`r` = ref，`o` = official；`p` = phone 390×844，`k` = desktop 1024×640；`cp`/`ck` = 文档站实测尺寸 390×844 / 726×454）。`official` 缺失即"无官方示例"。

| #   | id           | 官方示例                        | 问题（Phone / Desktop）                                                                                                     | 归类                 | 证据                                                     |
| --- | ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------- |
| 1   | spinner      | 无                              | 无缺陷；无检查器 / 事件日志                                                                                                 | 演示写法（缺检查器） | `spinner-d-p`, `spinner-r-p`                             |
| 2   | badge        | 无                              | 无缺陷；无检查器                                                                                                            | 演示写法（缺检查器） | `badge-d-p`, `badge-r-p`                                 |
| 3   | button       | el-button                       | 正常；场景是变体矩阵，官方是"按钮 + 开关 + Toggle + 日志"                                                                   | 演示写法             | `button-{d,r,o}-p`                                       |
| 4   | switch       | el-switch                       | 正常；官方三行带 detail + 检查器，本库只有两行 + 两个孤立开关                                                               | 演示写法             | `switch-{d,r,o}-p`                                       |
| 5   | dialog       | el-dialog                       | 初始只有触发器；缺"作为 sheet 打开"、backdrop 开关、事件日志                                                                | 演示写法             | `dialog-{d,r,o}-p`；打开态见 `port:render` 的 `steps`    |
| 6   | toggle       | el-toggle                       | 正常；官方是工具栏式 Toggle + 说明卡 + 日志，本库是矩阵                                                                     | 演示写法             | `toggle-{d,r,o}-p`                                       |
| 7   | checkbox     | el-checkbox                     | **Scale / Round / States 的标签落在方框下方**（独立 Checkbox 没有行布局）；官方每行都是 `listRow`；"描述行红色虚线框"未复现 | 演示写法             | `checkbox-{d,r,o}-p`, `checkbox-d-k`, `checkbox-d-cp`    |
| 8   | radio-group  | el-radio                        | 同上的独立项标签在圆环下方；其余正常                                                                                        | 演示写法             | `radio-group-{d,r,o}-p`                                  |
| 9   | toggle-group | 无                              | 矩阵页，无缺陷；无检查器                                                                                                    | 演示写法（缺检查器） | `toggle-group-{d,r}-p`                                   |
| 10  | toolbar      | el-toolbar                      | 正常；官方多工具 + 说明卡 + 日志                                                                                            | 演示写法             | `toolbar-{d,r,o}-p`                                      |
| 11  | input        | el-input                        | 正常；Desktop 下 Name 拉满 900 pt、其余 187 pt，宽度不一致                                                                  | 演示写法             | `input-{d,r,o}-p`, `input-d-k`                           |
| 12  | number-input | el-number-input                 | 正常；官方 Tickets / Price / Temperature + 检查器                                                                           | 演示写法             | `number-input-{d,r,o}-p`                                 |
| 13  | otp-input    | el-otp-input                    | 正常；官方 Copy / Clear / masked / disabled + 日志                                                                          | 演示写法             | `otp-input-{d,r,o}-p`                                    |
| 14  | time-field   | 无                              | 两个字段，场景薄；无检查器                                                                                                  | 演示写法             | `time-field-{d,r}-p`                                     |
| 15  | tooltip      | el-tooltip                      | 常开（`open`）展示；官方 Pin、三种位置、日志                                                                                | 演示写法             | `tooltip-{d,r,o}-p`                                      |
| 16  | popover      | el-popover                      | 常开；官方 placement / offset / 计数 / 日志                                                                                 | 演示写法             | `popover-{d,r,o}-p`                                      |
| 17  | hover-card   | el-hover-card                   | 常开；官方延迟、位置、日志                                                                                                  | 演示写法             | `hover-card-{d,r,o}-p`                                   |
| 18  | sheet        | el-sheet                        | 常开底 sheet（背景全遮）；官方四边 + 事件日志                                                                               | 演示写法             | `sheet-{d,r,o}-p`                                        |
| 19  | toast        | el-toast                        | 两条静态 toast；官方 ToastManager 的打开 / 关闭 / 展开                                                                      | 演示写法             | `toast-{d,r,o}-p`                                        |
| 20  | alert-dialog | el-alert-dialog                 | 初始只有触发器；官方三种展示 + show 结果                                                                                    | 演示写法             | `alert-dialog-{d,r,o}-p`                                 |
| 21  | menu         | el-menu                         | 常开 sheet；官方两个菜单 + 上下文区 + 状态                                                                                  | 演示写法             | `menu-{d,r,o}-p`                                         |
| 22  | context-menu | 无                              | 常开 + 虚线投放区；无检查器                                                                                                 | 演示写法             | `context-menu-{d,r}-p`                                   |
| 23  | select       | el-select                       | 4 种语言（官方 13 种）+ region + disabled + 日志                                                                            | 演示写法             | `select-{d,r,o}-p`                                       |
| 24  | combobox     | el-combobox                     | 4 个框架（官方 labels / assignee 两组）+ 值 + 日志                                                                          | 演示写法             | `combobox-{d,r,o}-p`                                     |
| 25  | calendar     | 无（el-date-picker 内含）       | 单日历，无检查器                                                                                                            | 演示写法             | `calendar-{d,r}-p`                                       |
| 26  | date-picker  | el-date-picker                  | 只有 Due date；官方 due / stay 区间 / meeting + hourCycle                                                                   | 演示写法             | `date-picker-{d,r,o}-p`                                  |
| 27  | tabs         | el-tabs                         | 正常；官方带统计卡 + 计数 + 日志                                                                                            | 演示写法             | `tabs-{d,r,o}-p`                                         |
| 28  | segmented    | 无（仅在官方检查器里用）        | 矩阵页，无缺陷；无检查器                                                                                                    | 演示写法（缺检查器） | `segmented-{d,r}-p`                                      |
| 29  | accordion    | el-accordion                    | **Phone：正文一行被裁、chevron 在框外**；Desktop 正常；官方是 FAQ + Inspector                                               | 套件 + 演示写法      | `accordion-{d,r,o}-p`, `accordion-d-k`, `accordion-d-ck` |
| 30  | collapsible  | el-collapsible                  | **Phone：内容单行被裁、chevron 贴文字**；Desktop 正常                                                                       | 套件 + 演示写法      | `collapsible-{d,r,o}-p`, `collapsible-d-k`               |
| 31  | carousel     | el-carousel                     | 只有文字幻灯片（灰块 "Harbor"），官方是照片 + 渐变标题                                                                      | 演示写法             | `carousel-{d,r,o}-p`                                     |
| 32  | link         | el-link                         | 正常；官方面包屑 / 正文 / 外链 + 日志                                                                                       | 演示写法             | `link-{d,r,o}-p`                                         |
| 33  | pagination   | el-pagination                   | 正常；官方 page-size 切换 + 日志                                                                                            | 演示写法             | `pagination-{d,r,o}-p`                                   |
| 34  | progress     | el-progress                     | 正常；官方 determinate / unknown / library + Start / Reset + 日志                                                           | 演示写法             | `progress-{d,r,o}-p`                                     |
| 35  | meter        | 无                              | 正常；无检查器                                                                                                              | 演示写法（缺检查器） | `meter-{d,r}-p`                                          |
| 36  | stat         | 无                              | 正常；无检查器                                                                                                              | 演示写法（缺检查器） | `stat-{d,r}-p`                                           |
| 37  | status       | 无                              | 正常；无检查器                                                                                                              | 演示写法（缺检查器） | `status-{d,r}-p`                                         |
| 38  | slider       | el-slider                       | **"Value" 的 slider 直接放在 row 里，宽 0，只剩值气泡**；另两个小节包了 240 宽所以正常                                      | 套件 + 演示写法      | `slider-{d,r,o}-p`                                       |
| 39  | avatar       | el-avatar                       | 只有 initials；官方照片 / presence / 群组 / 状态日志                                                                        | 演示写法             | `avatar-{d,r,o}-p`                                       |
| 40  | data-table   | el-data-table                   | **两种尺寸都空白**（包装 View 2×200，表体 0×154）                                                                           | 套件 + 演示写法      | `data-table-{d,r,o}-p`, `data-table-{d,r}-k`             |
| 41  | table        | el-table                        | 正常；官方 4 行、本库 3 行                                                                                                  | 演示写法             | `table-{d,r,o}-p`                                        |
| 42  | tree         | el-tree                         | 只有 3 个文件；官方完整树 + 选中 / 展开 / 日志                                                                              | 演示写法             | `tree-{d,r,o}-p`                                         |
| 43  | command      | el-command                      | `maxHeight: 280` 在 "Settings" 处切断；4 项（官方 7 项）+ 高亮 / 查询 / 日志                                                | 演示写法             | `command-{d,r,o}-p`                                      |
| 44  | scrollbar    | el-scrollbar                    | 正常；官方 5 行 + mode / offset                                                                                             | 演示写法             | `scrollbar-{d,r,o}-p`                                    |
| 45  | plot         | el-plot（+ plot-cells 等 6 个） | **图表空白**：`<Plot>` 没有高度，父 View 的 180 用不上                                                                      | 演示写法             | `plot-{d,r,o}-p`, `plot-{d,r}-k`                         |
| 46  | resizable    | el-resizable                    | 两栏；官方三栏 + console 开关 + 尺寸                                                                                        | 演示写法             | `resizable-{d,r,o}-p`                                    |
| 47  | dock-area    | el-dock                         | **Tab 栏下内容空白**：`DockArea` 没有 `flex-1`，内容框 0 高                                                                 | 演示写法             | `dock-area-{d,r,o}-p`                                    |
| 48  | diff-view    | el-diff-view                    | 3 行统一视图；官方 7 行 + layout / inline / stats                                                                           | 演示写法             | `diff-view-{d,r,o}-p`                                    |
| 49  | text-view    | website/demos/text-view.tsx     | 两行 markdown；官方整篇文档（标题 / 列表 / 表格 / 代码 / callout）+ streaming                                               | 演示写法             | `text-view-{d,r,o}-p`                                    |
| 50  | emoji-picker | el-emoji-picker                 | **342 pt 固定宽在 390 卡内溢出**；"Chrome" 小节只有 2 个硬编码 emoji                                                        | 套件 + 演示写法      | `emoji-picker-{d,r,o}-p`, `emoji-picker-d-k`             |
| 51  | editor       | el-editor（+ rich-editor）      | 两行富文本；官方代码编辑器 + 语言 / 长行 / find / caret / 日志                                                              | 演示写法             | `editor-{d,r,o}-p`                                       |
| 52  | color-picker | el-color-picker                 | 面板拉满卡片，4 个色板被 `space-between` 摊开（官方 8 个色板，面板在 440 上限的 Stage 里）                                  | 套件 + 演示写法      | `color-picker-{d,r,o}-p`, `color-picker-d-k`             |

所有 52 组 `demo` 与 `ref` 的 PNG 在 phone 与 desktop 两种尺寸下 SHA-256 全等（脚本见"怎么看出来的"一节），这是"外壳无偏离"的直接证据；六个问题在 `ref` 上同样出现。

### 2.1 六个已知问题的根因

**accordion**：`DemoSection` 的行不给宽度（`kit.tsx:57`），演示只写了 `alignSelf: "stretch"`（`accordion.tsx:39-44`；参照页 `accordion.ref.tsx:42-47` 相同）。在行里那是交叉轴，accordion 按 max-content 排成一行，正文被 `DemoCard` 裁掉、chevron 被推到卡片外。官方把触发器放进 `sectionSurface`（列）里的 `Split > Stage`（`references/nsh/website/demos/el-accordion.tsx:60-80`；`references/nsh/examples/nsh-gallery-ui/demo.ts:166-217` 的 `Split` 给出宽度）。桌面尺寸下（726 pt）同一份代码正常，证明 look 与外壳无问题。

**collapsible**：同一行的宽度问题（`collapsible.tsx:12-30`；`collapsible.ref.tsx:57-72`）。触发器内部又包了一层 `flexGrow: 1` 的行（`packages/ui/collapsible.tsx:111`），在内容宽的行里没有可增长的空间，所以 chevron 贴在文字后；官方把 `RowLabel` 与 `DisclosureChevron` 直接放进 `disclosureTriggerLook` 的行，行本身由 `sectionSurface` 拉伸（`el-collapsible.tsx:61`）。"Default 打开却不显示内容"在两种画布与 iOS 触屏渲染里都不复现：内容是有的，只是排成单行、被卡片右缘裁掉，看起来像空白（`collapsible-d-p`、`collapsible-r-p`；同批的 iOS 触屏截图 `apps/docs/demos/shots/collapsible-touch-light.png` 也一样）。"Closed 却显示内容"也不复现：Closed 一栏是关着的（`collapsible-d-p`）；若截图里它展开了，是点击后的状态。

**checkbox**：`Scale` / `Round` / `States` 三节里的 Checkbox 直接放在 `DemoSection` 的行里（`checkbox.tsx:67-108`；`checkbox.ref.tsx:81-160`），没有 `listRow`。`nsh/base` 的 Checkbox 默认是列：indicator 在上、children 在下（`references/nsh/crates/nsh-base/src/checkbox.rs:116-120`），所以标签落在方框下方。官方每个 Checkbox 都带 `listRow`（`el-checkbox.tsx:53,69,81`），行内排列。**"描述行带红色虚线框"不复现**：`packages/ui/checkbox.tsx` 与 `lib/surface.tsx` 里没有任何 `borderStyle: "dashed"` 或 danger 边框（全仓只有 `context-menu` 演示的灰色虚线投放区、`select.tsx:140` 的 solid outline），web（`checkbox-d-p`、`checkbox-d-k`、`checkbox-d-cp`）与 iOS 触屏（`apps/docs/demos/shots/checkbox-touch-light.png`）都没有该框；它来自应用之外（浏览器 / 系统 / 截图工具的焦点或调试框），不是本组件画的。描述行真正的问题是它与方框同一行时的挤压（同上的列布局），而不是边框。

**color-picker**：演示把 `ColorPanel` 直接放进 `DemoSection`（`color-picker.tsx:18-32`；参照页 `color-picker.ref.tsx:19-33` 相同），行不给宽度上限，面板拉满卡片；`ColorSwatches` 用 `justifyContent: "space-between"`（`packages/ui/color-picker.tsx:398`），4 个色板（`color-picker.tsx:9`）于是在整行宽度上摊开。官方用 8 个色板、把面板放进 `Split` 的 `Stage`（`el-color-picker.tsx:14,43,57`；Stage 上限 440）。"只占左半边"在 390 与 1024 的打包截图里都没有出现（面板是满宽），文档站 726 宽下也是满宽；可见的是"过宽"而不是"半宽"。

**data-table**：包装 `View` 在 `DemoSection` 的行里只有交叉轴拉伸（`data-table.tsx:29-34`；`data-table.ref.tsx:30-34`），实测包装 2×200（只剩 1 pt 边框）、表体 0×154；`DataTable` 的 `style={{ flex: 1 }}` 在列方向只长高，不长宽。改成 `width: "100%"` 后同一份数据正常绘制（`scripts/audit/probe/data-table-width.tsx` 的实验截图 `/tmp/audit-test/table-width.png`）。官方把表放进 `Split > Stage`，外层 `View` 有高度、宽度由列给出（`el-data-table.tsx:48-56`）。

**emoji-picker**：固定 `width: 342`（`emoji-picker.tsx:23-41`；参照页 `emoji-picker.ref.tsx:25-43`），而 390 页面里 `DemoCard` 的内容宽约 318，342 的面板横向出框；"Chrome" 小节是手搭的假外壳，只放了两个 emoji（`emoji-picker.tsx:42-58`）。官方用 `width: wide() ? 342 : undefined` + `alignSelf: "stretch"`，窄屏占满卡片（`el-emoji-picker.tsx:33-38`），而且只有一个真正的 `EmojiPanel`（数据在 `packages/ui/emoji-picker.tsx` 的 `emojiGroups`，演示里第二个面板已经能显示完整列表）。

## 三、汇总

### 3.1 任务 2：画布与套件（先做）

> **已完成**（`5a7a050`、`965b67d`、`39b568f`、`376c954`、`b96adb9`、`05798f7`、`3817175`、以及返工 `REVIEW-1` 的提交）。发布模板没有播放器入口，因此走的是下面第 2 条的注入（`apps/docs/scripts/player-options.ts`，注释里写了为什么不走播放器；模板文字变了怎么办见 [`toolchain.md`](../toolchain.md) 的换 CLI 一节）。
>
> `bun scripts/audit/audit.ts canvas` 的实测（页视口 1440×900，探针应用原地打包，`windowSize()` 是**应用启动时**看到的窗口——面板先按布局的高启动，量到内容后再把 frame 压到内容高，与官网一致，见 `references/nsh/website/src/lib/demo-client.ts:120-131` 与 `:135-147`）：
>
> | 布局                                      | iframe     | 应用看到的窗口 | `platform.desktop` |
> | ----------------------------------------- | ---------- | -------------- | ------------------ |
> | Phone                                     | 390 × 670  | 390 × 844      | 假                 |
> | Desktop（文档列宽）                       | 726 × 612  | 726 × 900      | 真                 |
> | Desktop（demo 卡放宽到 1180，stage 1178） | 1024 × 420 | 1024 × 900     | 真                 |
>
> Phone 的 frame 宽 390、idiom `phone`；Desktop 是 desktop idiom，宽取 min(1024, 列宽)。站点切亮 / 暗，探针的 `colorScheme()` 分别为 `light` / `dark`（运行中 `postMessage`）。JSON 在 `/tmp/nsh-audit/canvas.json`，截图 `apps/docs/demos/shots/audit/canvas-*.png`。

1. **`apps/docs/src/lib/demo.js`**：`phoneHtml` 的 iframe 地址按布局加 `?idiom=phone|desktop` 与 `?theme=<站点当前主题>`；`demoPanelHtml` 的初始 `data-layout` 与 `initDemos` 的默认一致（现在 HTML 写 desktop、脚本默认 mobile，会闪一次）；`LAYOUTS.desktop` 改成 1024×**900**（与 `references/nsh/website/src/lib/demo-client.ts:44-45` 一致）。
2. **让演示真的认这两个参数**：发布模板（`references/nsh/crates/nsh-cli/src/web/index.html`）没有出口。两条路：
   - 用 NSH 播放器：`public/play/index.html`（`references/nsh/crates/nsh-platform-web/web/index.html:48-52`）+ `nsh build` 出的 `demos/<name>.js`，和官网一致；文档站构建脚本改成 `nsh build`。
   - 或留在 `nsh package`，在 `apps/docs/scripts/player-options.ts` 里对生成的 `index.html` 注入运行时自己的 `idiom` / `dark` 选项（文档站与审计共用一份，`scripts/audit/targets.ts` 直接 import 它）。实际走的是这条；第二种是补丁，长期应走第一种。
3. **`apps/docs/src/lib/demo-client.ts`**：`fit()` 不再按比例缩高度；高度取 `min(布局高, max(420, 内容高 + 32))`，需要 `contentHeight()` 与加载后重测（照 `references/nsh/website/src/lib/demo-client.ts:75-108,150-158`）；切换布局时**重载** iframe 让新 idiom 生效（`demo-client.ts:157-166`）；主题变化 `postMessage`。
4. **`apps/docs/demos/kit.tsx`**：`DemoSection` 增加轴向（`inline` 行 / `block` 列）；`block` 用列 + `alignItems: "stretch"`，整宽控件不再靠 `flexGrow`。`DemoPage` 加 `Scroll`（或由第 3 条的内容高度兜住），保证内容不被裁。
5. **`apps/docs/demos/`**：新增官方的演示适配层（`Stage`、`Split`、`Inspector`、`Panel`、`Log`、`Segmented`、`desktop`、`wide`、`sideBySide`），从 `references/nsh/examples/nsh-gallery-ui/demo.ts` 搬（`demo.ts:45,49,53,122-286`），只供演示，不进 registry；同步改 `AGENTS.md` 的"不搬 demo 适配"一条（demo-parity 已决定）。
6. **验证**：`bun scripts/audit/audit.ts canvas` 应给出 Phone `390×844 / desktop=false`、Desktop `1024×<内容高> / desktop=true`；`port:check`、`catalog --check` 不变。

### 3.2 任务 3：组件修复

**没有发现需要改的外壳或 look。** 证据：

- 52 个 `<id>.tsx` 与 `<id>.ref.tsx` 在 390×844、1024×640 下 SHA-256 全等；390×844 / desktop-idiom 的 52 张 demo 截图里 48 张与 `apps/docs/demos/baseline/` 逐字节相同（4 张差异见"结论"：dialog / alert-dialog 是打开与否，calendar / date-picker 是渲染时钟）。
- 六个问题在参照页上同样出现，且在官方尺寸下由 look 正常绘制（accordion 726 宽正常、collapsible 1024 正常、color-picker 在官方 440 Stage 里正常、data-table 给足宽度正常、emoji 面板在 342 宽内正常、checkbox 行布局由调用方给）。
- 唯一的"外壳可疑点"是 `packages/ui/collapsible.tsx:111` 包了一层 `flexGrow: 1` 的行；但在有界宽度下它正确工作，改它反而会让参照页与组件页不一致（P4）。建议不动。

因此任务 3 的清单是：**无组件改动**；任务 2/4 完成后重跑 `port:render`（P4 仍须逐字节相同）、`port:render:touch`、`test:gallery`、`test:install`，把改动锁在演示层。

### 3.3 任务 4：官方示例移植（按家族）

有官方示例的 42 个组件，`<id>.tsx` 与 `<id>.ref.tsx` 都改写成官方场景（同一场景，ref 把组件换成 look 展开在 `nsh/base` 上）。没有官方示例的 10 个用同一套适配层补 Stage / Inspector / Log。

| 家族       | 组件                                                                                             | 要做的事                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 按钮与开关 | button、toggle、toggle-group、switch、toolbar、segmented                                         | 官方 `el-button` / `el-toggle` / `el-toolbar` 的场景：一行按钮 + 开关 + Toggle、Inspector 里的 pressed / disabled / last onPress                                                             |
| 选择与输入 | input、number-input、otp-input、time-field、select、combobox、calendar、date-picker              | 官方多字段场景（input 的 name/password/notes/sign in；number-input 的 tickets/price/temperature；select 的 13 语言 + region；combobox 的 labels/assignee；date-picker 的 due/range/meeting） |
| 开关与选择 | checkbox、radio-group                                                                            | 官方 `listRow` 场景：全选 / 单项、三个价格档；补充独立控件的行布局（Scale / Round / States 每项加 `listRow` 或包一层行）                                                                     |
| 浮层       | dialog、alert-dialog、sheet、popover、hover-card、tooltip、menu、context-menu、toast             | 官方触发器 + 展示方式切换 + Inspector 日志；不再用"常开"代替交互（或保留一个常开示例，另加触发器场景）                                                                                       |
| 展开       | accordion、collapsible、tabs、carousel                                                           | 官方 FAQ / 存储用量 / 统计卡 / 照片轮播；主体放进 `Split > Stage`，正文与 chevron 有界                                                                                                       |
| 数据       | data-table、table、tree、command、scrollbar、pagination、plot、diff-view                         | 官方数据量（2000 行 data-table、完整树、7 个命令、78 点 plot、7 行 diff）；plot 补 `style={{ height }}`；data-table 包装改 `width: "100%"`                                                   |
| 内容       | text-view、editor、emoji-picker、color-picker、avatar                                            | 官方整篇 markdown / 代码编辑器 / 完整 emoji 面板 / 三个取色器 / 8 人 avatar 组；emoji 固定宽改 `wide() ? 342 : undefined`                                                                    |
| 工作区     | resizable、dock-area                                                                             | 官方三栏 + console 开关 / dock 的四块面板 + 关闭 + 日志；`DockArea` 加 `class="flex-1"`（否则内容 0 高）                                                                                     |
| 无官方     | spinner、badge、meter、stat、status、toggle-group、segmented、time-field、calendar、context-menu | 用适配层补 Stage + Inspector + Log；保持现有覆盖（variant / size / tone / states）                                                                                                           |

移植时优先用 `scripts/audit/audit.ts shots --only <id>` 对照 `official-*` 截图；六个已知问题的验收点是 390 宽下不横向溢出、不裁切（`demo-phone`）且 1024 宽下有检查器并排（`demo-desktop`）。

### 3.4 官方示例 ↔ 本库组件

| 本库 id                                                                                          | 官方文件                                                       | 备注                                                                    |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| accordion                                                                                        | el-accordion.tsx                                               |                                                                         |
| alert-dialog                                                                                     | el-alert-dialog.tsx                                            |                                                                         |
| avatar                                                                                           | el-avatar.tsx                                                  |                                                                         |
| button                                                                                           | el-button.tsx                                                  |                                                                         |
| carousel                                                                                         | el-carousel.tsx                                                |                                                                         |
| checkbox                                                                                         | el-checkbox.tsx                                                |                                                                         |
| collapsible                                                                                      | el-collapsible.tsx                                             |                                                                         |
| color-picker                                                                                     | el-color-picker.tsx                                            |                                                                         |
| combobox                                                                                         | el-combobox.tsx                                                |                                                                         |
| command                                                                                          | el-command.tsx                                                 |                                                                         |
| data-table                                                                                       | el-data-table.tsx                                              |                                                                         |
| date-picker                                                                                      | el-date-picker.tsx                                             | 内含日历，作为 calendar 的参照                                          |
| dialog                                                                                           | el-dialog.tsx                                                  |                                                                         |
| diff-view                                                                                        | el-diff-view.tsx                                               |                                                                         |
| dock-area                                                                                        | el-dock.tsx                                                    | 名字不同（dock → dock-area）                                            |
| editor                                                                                           | el-editor.tsx + el-rich-editor.tsx                             | 两个示例：代码编辑器与富文本                                            |
| emoji-picker                                                                                     | el-emoji-picker.tsx                                            |                                                                         |
| hover-card                                                                                       | el-hover-card.tsx                                              |                                                                         |
| input                                                                                            | el-input.tsx                                                   |                                                                         |
| link                                                                                             | el-link.tsx                                                    |                                                                         |
| menu                                                                                             | el-menu.tsx                                                    |                                                                         |
| number-input                                                                                     | el-number-input.tsx                                            |                                                                         |
| otp-input                                                                                        | el-otp-input.tsx                                               |                                                                         |
| pagination                                                                                       | el-pagination.tsx                                              |                                                                         |
| plot                                                                                             | el-plot.tsx + el-plot-{cells,dots,dual,pie,ranges,treemap}.tsx | 7 个示例，`plot-*` 都归 plot                                            |
| popover                                                                                          | el-popover.tsx                                                 |                                                                         |
| progress                                                                                         | el-progress.tsx                                                |                                                                         |
| radio-group                                                                                      | el-radio.tsx                                                   | 名字不同（radio → radio-group）                                         |
| resizable                                                                                        | el-resizable.tsx                                               |                                                                         |
| scrollbar                                                                                        | el-scrollbar.tsx                                               |                                                                         |
| select                                                                                           | el-select.tsx                                                  |                                                                         |
| sheet                                                                                            | el-sheet.tsx                                                   |                                                                         |
| slider                                                                                           | el-slider.tsx                                                  |                                                                         |
| switch                                                                                           | el-switch.tsx                                                  |                                                                         |
| table                                                                                            | el-table.tsx                                                   |                                                                         |
| tabs                                                                                             | el-tabs.tsx                                                    |                                                                         |
| text-view                                                                                        | demos/text-view.tsx + el-text-selection.tsx                    | 官方文本演示不在 `el-` 前缀里；`el-text-selection` 是同一控件的选区演示 |
| toast                                                                                            | el-toast.tsx                                                   |                                                                         |
| toggle                                                                                           | el-toggle.tsx                                                  |                                                                         |
| toolbar                                                                                          | el-toolbar.tsx                                                 |                                                                         |
| tooltip                                                                                          | el-tooltip.tsx                                                 |                                                                         |
| tree                                                                                             | el-tree.tsx                                                    |                                                                         |
| spinner、badge、meter、stat、status、toggle-group、segmented、time-field、calendar、context-menu | 无                                                             | 本库独有；`segmented` 在官方只作为检查器控件出现                        |

官方有、本库没有对应组件（不进本库，供未来判断）：`el-canvas`、`el-control-flow`、`el-image`、`el-keyboard`、`el-list`、`el-overlay`、`el-safe-area`、`el-scroll`、`el-shader`、`el-terminal`、`el-text`、`el-video`、`el-view`、`el-web-view`，以及 `counter.tsx`、`guide-layout.tsx`、`guide-components.tsx`。其中 `el-text` 是纯 `Text` 排版（嵌套、链接），本库没有对应的 Text 组件；`text-view` 对应的是 `website/demos/text-view.tsx` + `el-text-selection`。

## 附：证据与工具

- 截图：`apps/docs/demos/shots/audit/`（524 张，gitignored）。命名：`<id>-{demo,ref,official}-{phone,desktop}.png`；`plot` / `editor` / `text-view` 的额外官方示例带后缀（`plot-official-phone-cells.png` 等）；文档站实测尺寸另有 `<id>-{demo,ref}-canvas{phone,desktop}.png` 与 `canvas-*.png`、`probe-*.png`。
- 工具：`scripts/audit/chrome.ts`（静态服务 + DevTools 截图）、`audit.ts`（批量打包 / 截图 / 画布 / 探针）、`shoot.ts`（任意 `.tsx` 一张）、`sheet.ts`（对照页）、`targets.ts`（官方对应表）。探针应用在 `scripts/audit/probe/`，三个一次性实验（`dock-flex`、`plot-height`、`data-table-width`）留在同目录，注释里写明用途。
- 本次测量：154 个包（52 demo + 52 ref + 50 官方/额外），308 张官方尺寸截图 + 208 张文档站尺寸截图 + 8 张画布/探针截图 = 524 张；打包失败 0，截图失败 0。
