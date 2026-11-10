# 触屏与动效核对

模拟器：**iPhone 17**（`608FEF1E-1F66-4FA9-92E3-7F7004F85BC0`），runtime **iOS 27.2**。CLI：`nsh 0.4.0 (e626a8d)`。

截图：`nsh test <entry> --target ios`，`app.setColorScheme` 后 `app.screenshot`。目录 `$TMPDIR/ios-shots`（本机这次是 `/var/folders/34/333j9whj3cg8qswf23575k700000gn/T/ios-shots`）。每页只拍首屏；长页下半在折叠线以下，没有逐段滚动。

减少动效：`open(entry, { reducedMotion: true })`（`nsh/test` 的 `OpenOptions.reducedMotion`，对应 `reduceMotion()`）。无运行中改这一项的 `app.set*`。

头less `bun run test:gallery`：**72 通过**。同一套在 `--target ios` 上：**47 通过，25 失败**。其中 22 个是用例写了 `platform: "macos"`（或依赖 hover / 右键），目标机会拒绝：桌面 platform 不能跑在 iOS 上。另外 3 个：DataTable 的方向键在模拟器上没有把选中行从 `sel=1` 移到 `sel=2`；theme 的外观切换和 toast 的第二次 `open` 报 `no host that takes test steps is connected`（模拟器主机断开，不是断言内容）。

## 组件

`pass`：首屏可读，点击区已是 44（或本来不是按压目标）。`fixed`：这次改过。`known-issue`：仍不符合 44，或库里没有该控件。

| 组件         | 触屏                                                           | 暗色 | 减少动效                                                 |
| ------------ | -------------------------------------------------------------- | ---- | -------------------------------------------------------- |
| accordion    | pass                                                           | pass | fixed（按下时长 0；chevron 本就有 `motion-reduce`）      |
| avatar       | known-issue（触屏边长 40，不是按压目标）                       | pass | pass（`motion-reduce` 取消淡入）                         |
| button       | pass（默认 40 + hit slop）                                     | pass | fixed（下沉取消，时长 0）                                |
| checkbox     | fixed（行最小 44×44，盒仍是 22）                               | pass | pass（`groupSink` + `follow` 弹簧）                      |
| collapsible  | pass                                                           | pass | fixed（按下）；chevron class 本就取消                    |
| combobox     | pass（行 44，触屏 sheet）                                      | pass | fixed（按下与列表 chevron 弹簧）                         |
| command      | pass（行 44，搜索 48）                                         | pass | pass                                                     |
| context-menu | pass（与 menu 同一行高和 sheet）                               | pass | fixed（入场时长 0）                                      |
| data-table   | fixed（`rowHeight` / `headerHeight` 44）                       | pass | pass（表格本身无过渡）                                   |
| dialog       | pass                                                           | pass | pass（base 持有，无自有时长）                            |
| input        | pass（触屏最小 46）                                            | pass | pass（颜色 class）                                       |
| link         | pass（32 + hit slop）                                          | pass | fixed                                                    |
| menu         | pass（行 46，底部 sheet）                                      | pass | fixed（入场 0；勾选是弹簧）                              |
| number-input | fixed（堆叠步进各 44，井高 88）                                | pass | pass（步进 class）                                       |
| otp-input    | pass（格 44×52；首屏以下）                                     | pass | pass                                                     |
| pagination   | pass（44）                                                     | pass | pass                                                     |
| popover      | pass                                                           | pass | fixed（入场 0）                                          |
| progress     | pass（轨道不是按压目标）                                       | pass | pass（glide 的 class 取消；循环仍 `ignoreReduceMotion`） |
| radio-group  | fixed（行最小 44×44）                                          | pass | pass                                                     |
| scrollbar    | known-issue（轨道 16，不是 44）                                | pass | pass                                                     |
| select       | fixed（搜索从 40 提到 44；行与 sheet 原本已是 44 / 顶圆角 20） | pass | fixed                                                    |
| sheet        | pass                                                           | pass | pass（base 滑入）                                        |
| slider       | fixed（触屏带 32→44）                                          | pass | fixed（透明度时长 0；拇指 class 取消）                   |
| switch       | fixed（带标签的行最小 44；无标签仍靠 hit slop）                | pass | fixed（边与阴影时长 0；旋钮弹簧照旧）                    |
| table        | pass（正文行，不是 44 按钮）                                   | pass | pass                                                     |
| tabs         | fixed（轨道 40→52，内框去掉 3pt inset 和 1pt 边后是 44）       | pass | fixed                                                    |
| toast        | pass（关闭 24 + hit slop）                                     | pass | fixed                                                    |
| toggle       | pass（38 + hit slop）                                          | pass | fixed                                                    |
| toggle-group | pass                                                           | pass | fixed（同 toggle）                                       |
| tooltip      | pass                                                           | pass | fixed（淡入时长 0）                                      |
| tree         | pass（行 44）                                                  | pass | pass（chevron class）                                    |

没有 **DatePicker**。store `nsh/base` 有导出，本库没有包装，所以没有日期 sheet。清除按钮（select / combobox）在 base 上没有 `hitSlop`，触屏仍是 20pt 方块，记在这里，不把行撑满。

`listbox` 页同时打开多个列表。触屏上每个都是 sheet，叠在一起，后面的页被遮罩压暗。最前面一张的行（Apple / Banana / Cherry，以及搜索 sheet 的 Lemon）可读。这是演示页同时 `open`，不是 sheet 样式错了。

## 动效断言

`apps/gallery/tests/motion.test.tsx`：

- 按下（button / toggle / link，以及 `pressSink`）：`background-color` 等 + `transform`，150ms `ease-out`；悬停样式没有 `transform`。
- 减少动效：这些时长为 0，`activeStyle` 不再带 scale。menu / popover 入场同样为 0（平时 100 / 150）。tooltip 淡入平时 100，减少时 0。toast class 去掉 `duration-200`，并保留 `motion-reduce:transition-none`。
- chevron、行、字段、步进、glide、头像、表格行、滚动条拇指：class 含 `motion-reduce:transition-none`，以及文档里的 `duration-100/150/180/200/300`。
- 旋钮 / 勾选弹簧：`springs.move` 504/38，`springs.control` 1218/70。`follow()` 在 `reduceMotion()` 时 `set`，不 `spring`。
- 不确定进度：800ms、`alternate`、`infinite`、`ignoreReduceMotion: true`。

## 截图

`App`、`choice`、`command`、`data-table`、`field`、`listbox`、`menu`、`meter`、`nav`、`overlays`、`pilot`、`scrollbar`、`tree`，各 `-light.png` / `-dark.png`。`demo-kit.tsx` 不是入口。
