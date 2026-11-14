# 统一 API 的命名

阶段 1-A 的设计稿，对应 [`positioning.md`](positioning.md) 路线表"阶段 1 打地基"的第一条。**只定名字，不改代码**；8 条已拍板（§7，全部按建议），另起任务实现，随 CLI / registry `0.3.0` 发布。

**口径**：组件由本库自己抽取并拥有，上游 `nsh-gallery-ui` 是参考规范，`// @port` 区域可以直接改（[`AGENTS.md`](../../AGENTS.md)、[`specs/ownership.md`](ownership.md)）。所以本稿不受"只改外壳"的限制，可以改 look 的参数名与取值；每条注明**改外壳**还是**改原 look 代码**。前置见 [§5.1](#51-前置工具与规则)，其中 `port-map.json` 的 `replace` 需要为零。

## 结论

**三个外观轴一律用 shadcn 的名字与取值（`variant` / `size` / `tone`），本库缺的 shadcn 值不假装有，本库特有的值另起名并在文档写明；`kind` 消失；像素尺寸不叫 `size`。**

| 轴        | 取值（shadcn 的顺序）                                                                  | 一句话规则                                              |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `variant` | `default` `secondary` `outline` `ghost` `destructive` `link`                           | 每个组件只收其中一个**子集**，子集写在文档页的 API 一节 |
| `size`    | `sm` `default` `lg`（图标按钮另有 `icon` `icon-sm` `icon-lg`）                         | 控件上只有刻度；像素用 `side` / `width` / `height`      |
| `tone`    | `neutral` `accent` `info` `warn` `danger` `up` `down`（`@shadcn-nsh/theme` 的 `Tone`） | 一种类型、一种写法：`Tone \| (() => Tone)`              |

值级映射（可 `sed`，见 [§6.1](#61-值级替换)）：

| 旧值                          | 新值                                                   | 出现在                                               |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| `primary`                     | `default`                                              | `Button`、`RoundButton`、`SplitButton`               |
| `accent`                      | `default`                                              | `Button`、`SplitButton`（同一 look，见 §4.1）        |
| `secondary`                   | `secondary`                                            | 不变（两边同名同义）                                 |
| `ghost`                       | `ghost`（按钮、图标按钮、触发器）`default`（`Toggle`） | 见 §4.1                                              |
| `danger`                      | `destructive`                                          | `Button`、`SplitButton`、`IconButton`、`MenuItem` 等 |
| `small` / `regular` / `large` | `sm` / `default` / `lg`                                | 所有 `size` 轴                                       |
| `ring`                        | `default`                                              | `Radio`                                              |

八条要拍板的事在 [§7](#7-待拍板)。

## 1 口径

与 [`AGENTS.md`](../../AGENTS.md) 的角色表一致：

| 来源                  | 角色                                               | 本稿动它什么                              |
| --------------------- | -------------------------------------------------- | ----------------------------------------- |
| 本库                  | 主题、外观、状态、几何、**对外 API 的决定者**      | 就是这里：定 `variant`/`size`/`tone` 的词 |
| 上游 `nsh-gallery-ui` | 外观的参考规范与抽取起点；变化由 `port:check` 提醒 | 取值**改名**，外观不动                    |
| shadcn                | 分发、目录、组合角色、**API 命名的参照**           | 取它的叫法，不取它的实现                  |
| `nsh/base`            | 行为与无障碍                                       | 不动                                      |

盘点范围：`packages/ui/*.tsx` 全部 52 个文件、178 个公开组件/零件，外加 `plot.tsx` 转发的 17 个 `nsh/base/plot` mark（`registry.json` 的 `registry:ui` 条目数 = 52）。"轴"指**外观**轴：`variant`、`size`、`tone`、`kind`，以及与它们重叠的布尔外观开关（`outline`、`danger`、`quiet`、`outlined`、`round`…）。状态轴（`selected`、`checked`、`pressed`、`busy`、`invalid`、`disabled`）与几何轴（`width`、`height`、`side`、`marker`）不在改名范围，本稿只在它们与外观轴混淆时点出来（`busy` ≠ `loading` 变体；`invalid` 已是 shadcn 的词）。

## 2 盘点

### 2.1 52 个文件与公开组件

`轴` 列只列**外观**轴；`—` 表示这个文件里的组件没有外观轴（只有状态、几何或样式钩子）。

| 文件               | 公开组件                                                                                                                                                                                                       | 轴                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `accordion.tsx`    | `Accordion` `AccordionItem` `AccordionHeader` `AccordionTrigger` `AccordionPanel` `AccordionDivider` `DisclosureChevron`                                                                                       | —                                                  |
| `alert-dialog.tsx` | `AlertDialog` `AlertDialogTrigger` `AlertDialogContent` `AlertDialogAction` `AlertDialogHeader` `AlertDialogFooter` `AlertDialogTitle` `AlertDialogDescription`                                                | `variant`（Trigger）、`role`（Action）             |
| `avatar.tsx`       | `Avatar`                                                                                                                                                                                                       | —                                                  |
| `badge.tsx`        | `Badge`                                                                                                                                                                                                        | `tone`、`outline`                                  |
| `button.tsx`       | `Button` `IconButton` `RoundButton` `SplitButton` `SplitButtonSegment` `SplitButtonDivider`                                                                                                                    | `variant`、`size`、`tone`（IconButton）            |
| `calendar.tsx`     | `Calendar` `CalendarItem` `TimeSegment`                                                                                                                                                                        | —                                                  |
| `carousel.tsx`     | `Carousel` `CarouselContent` `CarouselItem` `CarouselPrevious` `CarouselNext` `CarouselPagination` `CarouselPaginationItem` `CarouselDot`                                                                      | `glass`、`side`（前后箭头）                        |
| `checkbox.tsx`     | `Checkbox` `CheckboxMark` `ChoiceLight`                                                                                                                                                                        | `scale`、`round`                                   |
| `collapsible.tsx`  | `Collapsible` `CollapsibleTrigger` `CollapsibleContent`                                                                                                                                                        | —                                                  |
| `color-picker.tsx` | `ColorPanel` `ColorPopover` `ColorFields` `ColorTrigger` `ColorSwatches` `ColorCopy` `ColorDropper`                                                                                                            | `alpha`、`format`（数据，不是外观轴）              |
| `combobox.tsx`     | `Combobox` `ComboboxTrigger` `ComboboxContent` `ComboboxItem` `ComboboxGroup` `ComboboxLabel` `ComboboxEmpty` `ComboToggle` `Chevron`                                                                          | `variant`（Trigger）                               |
| `command.tsx`      | `Command` `CommandRow` `CommandHeading` `CommandEmpty` `CommandKeys` `Kbd`                                                                                                                                     | —                                                  |
| `context-menu.tsx` | `ContextMenu` `ContextMenuTrigger` `ContextMenuContent`（+ 复用 `Menu*` 零件）                                                                                                                                 | `variant`（复用 `MenuItem` 的）                    |
| `data-table.tsx`   | `DataTable`                                                                                                                                                                                                    | `classes`（样式钩子）                              |
| `date-picker.tsx`  | `DatePicker` `DatePickerTrigger` `DatePickerContent` `DateTrigger`                                                                                                                                             | `kind`（`DateTrigger` 继承 `Picker`）              |
| `dialog.tsx`       | `Dialog` `DialogTrigger` `DialogClose` `DialogContent` `DialogTitle` `DialogDescription` `DialogFooter`                                                                                                        | `variant`（Trigger / Close）、`width`              |
| `diff-view.tsx`    | `DiffView` `DiffHunkActions`                                                                                                                                                                                   | `tone`（`"up" \| "down"`）、`iconOnly`             |
| `dock-area.tsx`    | `DockArea` `DockTab` `DockDragPreview`                                                                                                                                                                         | —                                                  |
| `editor.tsx`       | `Editor` `RichEditor`                                                                                                                                                                                          | —                                                  |
| `emoji-picker.tsx` | `EmojiPanel` `EmojiTabs` `EmojiTones` `EmojiPreview` `EmojiHeading`                                                                                                                                            | `fill`、`tone`（`EmojiSkinTone`，**不是** `Tone`） |
| `hover-card.tsx`   | `HoverCard` `HoverCardTrigger` `HoverCardContent`                                                                                                                                                              | `variant`（Trigger）、`compact`、`width`           |
| `input.tsx`        | `Input`                                                                                                                                                                                                        | `invalid`                                          |
| `link.tsx`         | `Link` `LinkText`                                                                                                                                                                                              | `quiet` `current` `visited` `inline` `icon`        |
| `menu.tsx`         | `Menu` `MenuTrigger` `MenuContent` `MenuItem` `MenuCheckboxItem` `MenuRadioItem` `MenuGroup` `MenuLabel` `MenuSeparator` `MenuShortcut` `MenuSub` `MenuSubTrigger` `MenuSubContent` `SubmenuRow` `SubmenuBack` | `variant`（Trigger）、`danger`（Item）             |
| `meter.tsx`        | `Meter`                                                                                                                                                                                                        | `tone`、`marker`                                   |
| `number-input.tsx` | `NumberInput` `NumberStep`                                                                                                                                                                                     | `steps`                                            |
| `otp-input.tsx`    | `OtpInput`                                                                                                                                                                                                     | `tone`、`cells`                                    |
| `pagination.tsx`   | `Pagination`                                                                                                                                                                                                   | `outlined`                                         |
| `plot.tsx`         | 转发 `nsh/base/plot` 的 17 个 mark/零件 + `Legend`                                                                                                                                                             | —                                                  |
| `popover.tsx`      | `Popover` `PopoverTrigger` `PopoverContent` `PopoverHeader` `PopoverTitle` `PopoverDescription`                                                                                                                | `variant`（Trigger）、`compact`、`width`           |
| `progress.tsx`     | `Progress`                                                                                                                                                                                                     | `tone`、`height`、`sweep`                          |
| `radio-group.tsx`  | `RadioGroup` `Radio` `RadioGroupItem` `RadioRing`                                                                                                                                                              | `variant`、`scale`、`indicator`                    |
| `resizable.tsx`    | `ResizablePanelGroup` `ResizablePanel`                                                                                                                                                                         | `axis`                                             |
| `scrollbar.tsx`    | `Scrollbar`                                                                                                                                                                                                    | `axis`、`mode`、`motion`                           |
| `segmented.tsx`    | `Segmented` `SegmentedList` `SegmentedItem`                                                                                                                                                                    | `size`、`fill`                                     |
| `select.tsx`       | `Select` `SelectTrigger` `SelectValue` `SelectContent` `SelectGroup` `SelectLabel` `SelectItem` `SelectSeparator` `Picker` `Chevron`                                                                           | `kind`、`invalid`、`clearable`                     |
| `sheet.tsx`        | `Sheet` `SheetTrigger` `SheetClose` `SheetContent`                                                                                                                                                             | `side`、`variant`（Trigger / Close）               |
| `slider.tsx`       | `Slider`                                                                                                                                                                                                       | `axis`（base）、`showValue`                        |
| `spinner.tsx`      | `Spinner`                                                                                                                                                                                                      | `size`（像素）、`tint`（颜色字符串）               |
| `stat.tsx`         | `Stat`                                                                                                                                                                                                         | `tone`、`width`、`truncate`                        |
| `status.tsx`       | `Status`                                                                                                                                                                                                       | `tone`                                             |
| `switch.tsx`       | `Switch`                                                                                                                                                                                                       | `size`                                             |
| `table.tsx`        | `Table` `TableHeader` `TableBody` `TableFooter` `TableRow` `TableHead` `TableCell` `TableCaption`                                                                                                              | `selected`（行状态）                               |
| `tabs.tsx`         | `Tabs` `TabsList` `TabsTrigger` `TabsContent` `Tab` `TabTitle`                                                                                                                                                 | `variant`（List）                                  |
| `text-view.tsx`    | `TextView`                                                                                                                                                                                                     | —                                                  |
| `time-field.tsx`   | `TimeField`                                                                                                                                                                                                    | —                                                  |
| `toast.tsx`        | `Toast`                                                                                                                                                                                                        | —                                                  |
| `toggle-group.tsx` | `ToggleGroup`（+ 转发 `Toggle`）                                                                                                                                                                               | `inset`、`vertical`                                |
| `toggle.tsx`       | `Toggle`                                                                                                                                                                                                       | `variant`、`size`、`text`                          |
| `toolbar.tsx`      | `Toolbar` `ToolbarGroup` `ToolbarSeparator`                                                                                                                                                                    | `axis`                                             |
| `tooltip.tsx`      | `Tooltip` `TooltipTrigger` `TooltipContent`                                                                                                                                                                    | `variant`（Trigger）、`rich`                       |
| `tree.tsx`         | `Tree` `TreeRow`                                                                                                                                                                                               | —                                                  |

### 2.2 有外观轴的组件：现状

`函数` 列：这个 prop 现在是否也接受 `() => T`。

| 组件                                | 轴          | 取值                                                          | 默认                  | 函数   | 上游 look 参数                                 |
| ----------------------------------- | ----------- | ------------------------------------------------------------- | --------------------- | ------ | ---------------------------------------------- |
| `Button`                            | `variant`   | `ButtonKind`：`primary` `accent` `secondary` `ghost` `danger` | `primary`             | 否     | `buttonLook(kind)`（`Live<ButtonKind>`）       |
| `Button`                            | `size`      | `ButtonSize`：`small` `regular` `large`                       | `regular`             | 否     | `ButtonLookOptions.size`（`Live<ButtonSize>`） |
| `IconButton`                        | `variant`   | `ghost` `secondary`                                           | `ghost`               | 否     | `iconButtonLook({ variant })`                  |
| `IconButton`                        | `tone`      | `"danger"`                                                    | —                     | 否     | `iconButtonLook({ tone })`                     |
| `RoundButton`                       | `variant`   | `primary` `secondary`                                         | `primary`             | 否     | `roundButtonLook(variant)`                     |
| `RoundButton`                       | `size`      | `number`（直径，28 / 40）                                     | 28 / 40               | 否     | `roundButtonLook(variant, { size })`           |
| `SplitButton`                       | `variant`   | `ButtonKind`                                                  | `primary`             | 否     | `splitButtonLook(kind)`                        |
| `SplitButton`                       | `size`      | `ButtonSize`                                                  | `regular`             | 否     | `ButtonLookOptions.size`                       |
| 十个触发器的 `variant`\*            | `variant`   | `ButtonKind`                                                  | `secondary`           | 否     | `buttonLook`                                   |
| `Badge`                             | `tone`      | `Tone`                                                        | `neutral`             | 否     | 直接在 port 区域里读 `tone()`                  |
| `Badge`                             | `outline`   | `boolean`                                                     | `false`               | 否     | 同上（`borderColor` + `transparent`）          |
| `Toggle`                            | `variant`   | `ghost` `outline`                                             | `ghost`               | 否     | `toggleLook({ variant })`                      |
| `Toggle`                            | `size`      | `ToggleSize`：`small` `regular` `large`                       | `regular`             | 否     | `ToggleLookOptions.size`（`Live<ToggleSize>`） |
| `TabsList`                          | `variant`   | `default` `line`                                              | `default`             | 否     | `tabsLook()` / `underlineTabsLook()`           |
| `SegmentedList`                     | `size`      | `SegmentedSize`：`small` `regular`                            | `regular`             | 否     | `segmentedLook({ size })`                      |
| `SegmentedList`                     | `fill`      | `boolean`                                                     | 触屏为真              | 否     | `segmentedLook({ fill })`                      |
| `Switch`                            | `size`      | `SwitchSize`：`small` `regular`                               | `regular`             | 否     | `switchLook(on, size)`                         |
| `Checkbox`                          | `scale`     | `number`（0.8 / 1 / 1.25）                                    | `1`                   | 否     | `ChoiceOptions.scale`                          |
| `Checkbox`                          | `round`     | `boolean`                                                     | `false`               | 否     | `ChoiceOptions.round`                          |
| `Radio`                             | `variant`   | `ring` `tile`                                                 | `ring`                | 否     | `choiceTileLook`（`tile`）否则 `RadioRing`     |
| `Radio`                             | `scale`     | `number`（0.8 / 1 / 1.25）                                    | `1`                   | 否     | `ChoiceOptions.scale`                          |
| `Radio`                             | `indicator` | `boolean`                                                     | `true`                | 否     | 无（画不画 `RadioRing`）                       |
| `SelectTrigger` / `Picker`          | `kind`      | `field` `outline`                                             | `field`               | 否     | `pickerLook({ kind })`（`Live` 兼容签名）      |
| `NumberInput`                       | `steps`     | `pair` `split`                                                | `pair`                | 否     | `numberInputSteps(kind, …)`                    |
| `Pagination`                        | `outlined`  | `boolean`                                                     | `false`               | 否     | `paginationItemClass({ outlined })`            |
| `Progress`                          | `tone`      | `Tone`                                                        | 无（柑橘）            | 否     | `progressLook(…, { tone })`（`Live<Tone>`）    |
| `Progress`                          | `height`    | `number`                                                      | `6`                   | 否     | `progressLook(…, { height })`                  |
| `Meter`                             | `tone`      | `Tone`                                                        | 无（强调色）          | 否     | `progressFill(6, tone)`                        |
| `Stat` `Status`                     | `tone`      | `Tone`                                                        | 无                    | 否     | 组件体内 `toneColor(props.tone)`               |
| `OtpInput`                          | `tone`      | `Tone \| (() => Tone)`                                        | 无                    | **是** | `otpCellLook({ tone })`（`Live<Tone>`）        |
| `DiffHunkActions`                   | `tone`      | `"up" \| "down"`                                              | 无                    | 否     | `solidTint(tone)`（`toneColor` 的实心版）      |
| `MenuItem`                          | `danger`    | `boolean`                                                     | `false`               | 否     | `MenuItemTextOptions.danger`                   |
| `Link`                              | `quiet`     | `boolean`                                                     | `false`               | 否     | `linkColor({ quiet })`                         |
| `PopoverContent` `HoverCardContent` | `compact`   | `boolean`                                                     | `false`               | 否     | `PopoverLookOptions.compact`                   |
| `TooltipContent`                    | `rich`      | `boolean`                                                     | `false`               | 否     | `TooltipLookOptions.rich`                      |
| `SheetContent`                      | `side`      | `top` `bottom` `left` `right`                                 | `bottom`              | 否     | `sheetPanel(side)`                             |
| `CarouselPrevious` `CarouselNext`   | `glass`     | `boolean`                                                     | `false`               | 否     | `CarouselArrowOptions.glass`                   |
| `CarouselPrevious` `CarouselNext`   | `side`      | `number`（箭头直径）                                          | `carouselSizes.arrow` | 否     | `CarouselArrowOptions.side`                    |
| `EmojiPanel`                        | `fill`      | `boolean`                                                     | `false`               | 否     | 无（`class` 换成 `flex-1`）                    |

\* 十个触发器：`AlertDialogTrigger`、`DialogTrigger`、`DialogClose`、`SheetTrigger`、`SheetClose`、`MenuTrigger`、`PopoverTrigger`、`HoverCardTrigger`、`TooltipTrigger`、`ComboboxTrigger` 上的同名 `variant`（共 10 个组件，见 §4.7）。

### 2.3 现状的六个毛病

1. **`variant` 的取值各不相同。** `ButtonKind`（5 值）算一套；`IconButton` 与 `RoundButton` 各自重写了 2 值联合；`Radio` 是 `ring | tile`；`Badge` 干脆没有 `variant`，只有 `outline` 布尔；`Picker` 用 `kind`。同一个概念在 10 个文件里出现 4 种写法、5 套取值。
2. **`tone` 四种写法。** `Tone`（`Badge`/`Stat`/`Status`/`Meter`/`Progress`）、`Tone \| (() => Tone)`（`OtpInput` 的 prop）、`Live<Tone>`（`progressLook`/`otpCellLook` 的选项）、`"danger"` 字面量（`IconButton`）；另有 `MenuItem.danger: boolean` 与 `DiffHunkActions.tone: "up" \| "down"` 两套"影子 tone"。
3. **`size` 三种含义。** 刻度（`small|regular|large`）、像素（`RoundButton.size: number`、`Spinner.size`、`Icon.size`）、乘数（`Checkbox.scale`、`Radio.scale`）。
4. **`kind` 还在。** `Picker`/`SelectTrigger`（`field | outline`）、`NumberInput.steps` 与 `paginationItemClass({outlined})` 是同一类"外观开关"，却不叫同一个名字。（原任务书说 "Input 用 `kind`"——实际 `Input` 没有 `kind`，是 `SelectTrigger`/`Picker`。）
5. **布尔开关与 `variant` 重叠。** `Badge.outline`、`Pagination.outlined` 表达的都是 `variant="outline"`；`IconButton.tone="danger"`、`MenuItem.danger` 表达的都是 `variant="destructive"`。
6. **重复的值。** `primary` 与 `accent` 在 `buttonLook` 里走完全相同的分支（`filled()` 两个都算、`rest()` 同一支、`ink()` 同一支）；两个名字一种外观。

## 3 对照 shadcn

取自 `references/shadcn-ui/apps/v4/registry/new-york-v4/ui/*`。

### 3.1 shadcn 的词汇

| 轴        | 取值                                                          | 出处                                                 |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `variant` | `default` `secondary` `outline` `ghost` `destructive` `link`  | `button.tsx` 的 `buttonVariants`；`badge.tsx` 同六值 |
| `size`    | `default` `xs` `sm` `lg` `icon` `icon-xs` `icon-sm` `icon-lg` | `button.tsx`；`toggle` 只有 `default` `sm` `lg`      |

其余组件的轴（同样是我们要对的名字）：

| 组件                           | 轴与取值                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `Badge`                        | `variant`：六值同上                                                          |
| `Toggle`                       | `variant`：`default` `outline`；`size`：`default` `sm` `lg`                  |
| `ToggleGroup`                  | `variant` + `size`（转发给 group 里的 toggle）+ `spacing`                    |
| `Tabs`                         | `TabsList` 的 `variant`：`default` `line`                                    |
| `Select`                       | `SelectTrigger` 的 `size`：`sm` `default`                                    |
| `Switch`                       | `size`：`sm` `default`                                                       |
| `Avatar`                       | `size`：`default` `sm` `lg`                                                  |
| `AlertDialog`                  | `AlertDialogContent` 的 `size`：`default` `sm`                               |
| `Sheet`                        | `side`：`top` `right` `bottom` `left`                                        |
| `DropdownMenu` / `ContextMenu` | `Item` 的 `variant`：`default` `destructive`                                 |
| `Calendar`                     | `buttonVariant`：Button 的六值（默认 `ghost`）、`captionLayout`              |
| `Pagination`                   | `PaginationLink` 的 `size`（默认 `icon`）与 `variant`（`outline` / `ghost`） |
| `Button`（`size="icon"`）      | 图标按钮不是独立组件：`variant="ghost" size="icon"`                          |

没有外观轴的 shadcn 组件（本库也不该有，只有 `className`）：`Input`、`Textarea`、`Checkbox`、`RadioGroup`、`Slider`、`Progress`、`Table`、`Tooltip`、`Popover`、`Accordion`、`Carousel`、`Resizable`、`Command`、`ScrollArea`、`Sonner`、`Breadcrumb`、`Separator`、`Skeleton`、`SheetContents`。`Sidebar` 有 `variant: sidebar | floating | inset` 与 `collapsible`，本库没有对应组件，不在盘点范围。

### 3.2 翻译对照：一个概念两种叫法

| 概念             | 本库（0.2）                                             | shadcn                                   | 结论                         |
| ---------------- | ------------------------------------------------------- | ---------------------------------------- | ---------------------------- |
| 主操作           | `primary`                                               | `default`                                | 改                           |
| 中性实心         | `secondary`                                             | `secondary`                              | 一致                         |
| 裸（悬停才有底） | `ghost`（按钮）/ `ghost`（toggle）                      | `ghost`（按钮）/ **`default`**（toggle） | 按组件分开，见 §4.1          |
| 危险             | `danger`                                                | `destructive`                            | 改                           |
| 边               | `outline`（布尔）、`outlined`（布尔）、`kind="outline"` | `variant="outline"`                      | 统一成 `variant`             |
| 小 / 中 / 大     | `small` / `regular` / `large`                           | `sm` / `default` / `lg`                  | 改                           |
| 图标按钮         | 独立组件 `IconButton`/`RoundButton`                     | `Button size="icon"`                     | 保留组件（上游有），轴名对齐 |

### 3.3 没有 shadcn 对应的（本库特有）

`RoundButton`、`SplitButton`、`Segmented`、`Radio.variant="tile"`、`Picker.kind`（trigger 的"字段井 / 线框按钮"）、`Carousel` 箭头的 `glass`、`DiffHunkActions`、`Meter`、`Stat`、`Status`、`DockArea`、`DiffView`、`ColorPanel`、`EmojiPanel`、`NumberInput`、`TimeField`、`OtpInput`、`Tree`、`Plot`、`TextView`、`Editor`、`Link`、`Pagination`、`Scrollbar`、`Toolbar`。它们的轴**沿用本库自己的名字**，但同名轴（`variant`/`size`/`tone`）的值仍然从上面的词表里取。

## 4 提案：一张词汇表

### 4.1 `variant`

```ts
// 每个组件导出一个自己的联合，值只能从这里取
export type ButtonVariant = "default" | "secondary" | "ghost" | "destructive";
```

| 值            | 语义                   | 上游 look                                                       | shadcn                                                    |
| ------------- | ---------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `default`     | 唯一主操作；柑橘填充   | `filled()` → `finish.accent`，字 `colors.onAccent`              | `default`：`bg-primary text-primary-foreground`           |
| `secondary`   | 中性实心，普通可见动作 | `finish.raised`                                                 | `secondary`：`bg-secondary text-secondary-foreground`     |
| `ghost`       | 透明，悬停才有底       | `ghostFill()`                                                   | `ghost`：`hover:bg-accent hover:text-accent-foreground`   |
| `destructive` | 危险动作               | `tints.danger` + 危险边 + 危险字（**浅底**）                    | `destructive`：`bg-destructive`（**实心**）               |
| `outline`     | 边 + 页面底            | 本库 `Button` 没有这个 look（`Picker` 的 `outline` 是它的一半） | `outline`：`border bg-background shadow-xs`               |
| `link`        | 文字按钮               | 本库没有                                                        | `link`：`text-primary underline-offset-4 hover:underline` |

规则：

- **R1 值是 shadcn 的六个，组件只收子集。** 子集写在文档页的 API 一节与 `props.test-d.ts` 旁边；没有 look 的值不假装支持（所以 `Button` 的 0.3.0 子集是 `default | secondary | ghost | destructive`）。要补 `outline` / `link` 是**加外观**（新 look + 四张截图），不是改名，属阶段 2，见 §7 第 2 条。
- **R2 默认值叫 `default`，除非该组件的"无名"外观在 shadcn 里另有名字。** 于是 `Button`/`Badge`/`Radio`/`Picker`/`Pagination`/`TabsList`/`MenuItem` 默认 `default`；`IconButton` 默认 `ghost`（shadcn 的裸图标按钮就是 `variant="ghost"`）；`Toggle` 默认 `default`（shadcn 的 toggle `default` 本身就是透明）。
- **R3 `primary` → `default`，`danger` → `destructive`，`accent` 删除。** `accent` 在 `buttonLook` 里与 `primary` 走同一条分支（`filled()`、`rest()`、`ink()`、hover、press 全部相同），是同一个外观的第二个名字。删掉它不改变任何像素；将来若要"更亮的一档"，以新值在阶段 2 出现。
- **R4 布尔外观开关并入 `variant`。** `Badge.outline`、`Pagination.outlined`、`Picker.kind` 都变成 `variant?: "default" | "outline"`；`IconButton.tone="danger"`、`MenuItem.danger` 变成 `variant="destructive"`。

### 4.2 `size`

```ts
export type ButtonSize = "sm" | "default" | "lg";
```

| 旧                               | 新        | 备注                                     |
| -------------------------------- | --------- | ---------------------------------------- |
| `small`                          | `sm`      | 指针 24 / 触屏 36                        |
| `regular`                        | `default` | 指针 28 / 触屏 40（不变）                |
| `large`                          | `lg`      | 指针 34 / 触屏 48                        |
| `RoundButton.size={n}`           | 删除      | 见下                                     |
| `Checkbox.scale` / `Radio.scale` | `size`    | 0.8 / 1 / 1.25 → `sm` / `default` / `lg` |

规则：

- **R5 控件上的 `size` 只表示刻度。** 这是 shadcn 自己的分工：`cva` 的 `size` 变体是刻度（`sm`/`default`/`lg`/`icon`），像素是 Tailwind 的 `size-4` 工具类。所以：控件的 `size` 只收 `sm|default|lg`；**零件**（`Icon`、`Spinner`、`MenuMark`、`NumberStep`）的 `size` 是像素，保持现状（它们没有刻度轴）。控件要精确像素用 `side` / `width` / `height`（`RoundButton` 的 `side`、`Progress` 的 `height`、`Dialog` 的 `width`、`Carousel` 箭头的 `side`）。
- **R6 步进按组件定，不强行三等分。** `Toggle`/`Button` 三档；`Switch`/`Segmented` 两档（`sm` | `default`，与 shadcn 相同）；`Avatar` 若要 `size` 用 shadcn 的 `default | sm | lg`。每个组件的合法取值写在文档页。
- **R7 图标按钮的刻度从 `Button` 的尺寸表推导**（`buttonSizes[size].height`），不再各写一套数字：`IconButton` 指针 24 / 28 / 34（默认 `default` = 28），触屏 36 / 40 / 48；`RoundButton` 的直径取同一张表（默认 `default` = 28 / 40，与今天一致），`side?: number` 作为精确几何的逃生口，`roundButtonGlyph(variant, side)` 跟着它走。

### 4.3 `tone`

```ts
// 真源在 @shadcn-nsh/theme，本库从 packages/ui/index.ts 再导出一次
export type Tone = "neutral" | "accent" | "info" | "warn" | "danger" | "up" | "down";
```

规则：

- **R8 一个类型。** 所有"按语义上色"的 prop 都是 `tone?: Tone`，值只有这七个。`packages/ui/index.ts` 重新导出 `Tone`，用户不必再 import 主题包。
- **R9 一种写法：每个 `tone` prop 的类型都是 `Tone | (() => Tone)`，内部用一处 `read()` 读。** 传值（`tone={verdict()}`）是常规用法；函数形式是**唯一**允许的晚读手段，给"样式只在挂载时算一次"的控件（`OtpInput` 的格子判定、`Progress` 的填充色、`DiffHunkActions` 的行底）。不再有第二套写法。
- **R10 `danger` 不是 tone。** 危险是**变体**（`variant="destructive"`），不是给按钮染色；`IconButton.tone="danger"` 与 `MenuItem.danger` 都并入 `variant`。`Tone` 里的 `"danger"` 只出现在"一条数据的严重程度"上（`Status`、`Badge`、`Meter`、`DiffHunkActions` 的行底）。
- **R11 影子 tone 归并。** `DiffHunkActions.tone: "up" | "down"` → `tone?: Tone`（`solidTint` 对七值都成立，文档写明常用 `up`/`down`）。`EmojiSkinTone` 是**另一个概念**（肤色），名字不动，文档点明它不是 `Tone`。

### 4.4 响应式取值：一条规则

**R12 值能变就传值，读得到的地方读；只有"晚读"才写函数。**

| 场景                                               | 写法                            | 例                                         |
| -------------------------------------------------- | ------------------------------- | ------------------------------------------ |
| 值会变，组件在自己的 JSX 里读（多数组件）          | 传值                            | `tone={verdict()}`、`variant={kind()}`     |
| 值会变，样式在挂载时算一次（格子、进度填充、行底） | `() => T`                       | `OtpInput` 的 `tone`、`Progress` 的 `tone` |
| 结构轴（`variant`/`size`）                         | **只传值**，不收函数            | `size="sm"`                                |
| look 的选项（`ButtonLookOptions.size` 等）         | `Live<T> = T \| (() => T)` 保持 | 参照页与自定义 look 用                     |

`Live<T>` 是 look 层的机制：`tone` 的 props 用它（R9），`variant`/`size` 不用。今天 `button.tsx` 与 `toggle.tsx` 各有一份私有 `Live`，实现时合并成 look 层的一处。

### 4.5 结构名与状态名（不进三个轴）

| 类别      | 名字                                                                                                              | 规则                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 结构/布局 | `side`、`axis`、`orientation`、`fill`、`inset`、`indicator`、`round`、`steps`、`compact`、`rich`、`glass`、`text` | 有自己的形状，用描述性名字，**不叫 `variant`/`kind`** |
| 状态      | `selected`、`checked`、`pressed`、`busy`、`invalid`、`disabled`、`readonly`                                       | 状态不是外观轴；`invalid` 已是 shadcn 的词            |
| 几何      | `width`、`height`、`side`、`marker`                                                                               | 像素                                                  |
| 样式钩子  | `class`、`style`、`classes`、`cells`、`indicatorStyle`…                                                           | 使用者优先（P5）                                      |

删掉的重叠状态：`IconButton.on` → 用 base 的 `selected`（shadcn 用 `aria-pressed`/`data-state`，没有第二个开关）。

### 4.6 类型名

| 旧                      | 新                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ButtonKind`            | `ButtonVariant`（`default \| secondary \| ghost \| destructive`）                                                                                   |
| `ButtonSize`（值变）    | `ButtonSize`（`sm \| default \| lg`）                                                                                                               |
| `ToggleSize`（值变）    | `ToggleSize`（`sm \| default \| lg`）                                                                                                               |
| `SegmentedSize`（值变） | `SegmentedSize`（`sm \| default`）                                                                                                                  |
| `SwitchSize`（值变）    | `SwitchSize`（`sm \| default`）                                                                                                                     |
| `TabsListVariant`       | 不变（shadcn 也是 `default \| line`）                                                                                                               |
| 新增                    | `IconButtonVariant`、`RoundButtonVariant`、`ToggleVariant`、`BadgeVariant`、`RadioVariant`、`PickerVariant`、`PaginationVariant`、`MenuItemVariant` |

每个联合类型的取值必须是 §4.1 的子集；`line`（shadcn 的 tabs 也有）与 `tile`（本库特有）是登记在案的外延，实现里用一个断言测试固定住（值 ∈ 词表 ∪ `{line, tile}`），新增值会让测试红。

### 4.7 每个组件：旧 → 新

`破坏` 列：✓ = 旧写法编译不过或外观变了，需要改调用方；新增 = 只加不减。

| 组件                                                                                                                                                                | 轴                 | 0.2                                                              | 0.3                                                                               | 破坏          | 迁移                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `Button`                                                                                                                                                            | `variant`          | `primary` `accent` `secondary` `ghost` `danger`，默认 `primary`  | `default` `secondary` `ghost` `destructive`，默认 `default`，类型 `ButtonVariant` | ✓             | `primary`/`accent` → `default`；`danger` → `destructive`；显式 `variant="primary"` 可省 |
| `Button`                                                                                                                                                            | `size`             | `small` `regular` `large`                                        | `sm` `default` `lg`                                                               | ✓             | 值级替换                                                                                |
| `IconButton`                                                                                                                                                        | `variant`          | `ghost` `secondary`，默认 `ghost`                                | `ghost` `secondary` `destructive`，默认 `ghost`                                   | 新增          | 原样可用                                                                                |
| `IconButton`                                                                                                                                                        | `tone`             | `"danger"`                                                       | 删除，用 `variant="destructive"`                                                  | ✓             | `tone="danger"` → `variant="destructive"`                                               |
| `IconButton`                                                                                                                                                        | `on`               | `boolean`                                                        | 删除，用 base 的 `selected`                                                       | ✓             | `on` → `selected`                                                                       |
| `IconButton`                                                                                                                                                        | `size`             | 无                                                               | `sm` `default` `lg`，默认 `default`                                               | 新增          | 可选                                                                                    |
| `RoundButton`                                                                                                                                                       | `variant`          | `primary` `secondary`，默认 `primary`                            | `default` `secondary`，默认 `default`                                             | ✓             | `primary` → `default`（或省略）                                                         |
| `RoundButton`                                                                                                                                                       | `size`             | `number`（直径）                                                 | `sm` `default` `lg`，默认 `default`；`side?: number` 精确覆盖                     | ✓             | `size={n}` → `size="sm" \| "default" \| "lg"`，或 `side={n}`                            |
| `SplitButton`                                                                                                                                                       | `variant`          | `ButtonKind`，默认 `primary`                                     | `ButtonVariant`，默认 `default`                                                   | ✓             | 值级替换                                                                                |
| `SplitButton`                                                                                                                                                       | `size`             | `ButtonSize`                                                     | `sm` `default` `lg`                                                               | ✓             | 值级替换                                                                                |
| `AlertDialogTrigger` `DialogTrigger` `DialogClose` `SheetTrigger` `SheetClose` `MenuTrigger` `PopoverTrigger` `HoverCardTrigger` `TooltipTrigger` `ComboboxTrigger` | `variant`          | `ButtonKind`，默认 `secondary`                                   | `ButtonVariant`，默认 `secondary`                                                 | ✓（仅值改名） | `primary` → `default`、`danger` → `destructive`                                         |
| `AlertDialogAction`                                                                                                                                                 | `role`             | `destructive` / `cancel` / 其他 → `danger`/`secondary`/`primary` | 不变（行为轴），内部映射改成 `destructive`/`secondary`/`default`                  | —             | 不用改                                                                                  |
| `Badge`                                                                                                                                                             | `variant`          | 无（`outline: boolean`）                                         | `default` `outline`，默认 `default`                                               | ✓             | `outline` → `variant="outline"`                                                         |
| `Badge`                                                                                                                                                             | `tone`             | `Tone`                                                           | `Tone \| (() => Tone)`，默认 `neutral`                                            | 放宽          | 原样可用（类型放宽）                                                                    |
| `Toggle`                                                                                                                                                            | `variant`          | `ghost` `outline`，默认 `ghost`                                  | `default` `outline`，默认 `default`                                               | ✓             | `variant="ghost"` → 省略或 `"default"`                                                  |
| `Toggle`                                                                                                                                                            | `size`             | `small` `regular` `large`                                        | `sm` `default` `lg`                                                               | ✓             | 值级替换                                                                                |
| `TabsList`                                                                                                                                                          | `variant`          | `default` `line`                                                 | 不变                                                                              | —             | 不用改                                                                                  |
| `SegmentedList`                                                                                                                                                     | `size`             | `small` `regular`                                                | `sm` `default`                                                                    | ✓             | 值级替换                                                                                |
| `Switch`                                                                                                                                                            | `size`             | `small` `regular`                                                | `sm` `default`                                                                    | ✓             | 值级替换                                                                                |
| `Checkbox`                                                                                                                                                          | `size`             | 无（`scale: number`）                                            | `sm` `default` `lg`，默认 `default`；`scale` 删除                                 | ✓             | `scale={0.8}` → `size="sm"`，`scale={1.25}` → `"lg"`                                    |
| `Radio`                                                                                                                                                             | `variant`          | `ring` `tile`，默认 `ring`                                       | `default` `tile`，默认 `default`                                                  | ✓             | `variant="ring"` → 省略或 `"default"`                                                   |
| `Radio`                                                                                                                                                             | `size`             | 无（`scale: number`）                                            | `sm` `default` `lg`                                                               | ✓             | 同 `Checkbox`                                                                           |
| `Radio`                                                                                                                                                             | `indicator`        | `boolean`                                                        | 不变                                                                              | —             | 不用改                                                                                  |
| `SelectTrigger` `Picker` `DateTrigger`                                                                                                                              | `variant`          | `kind: field \| outline`，默认 `field`                           | `variant: default \| outline`，默认 `default`                                     | ✓             | 改名 + `field` → `default`                                                              |
| `NumberInput`                                                                                                                                                       | `steps`            | `pair` `split`                                                   | 不变（结构名）                                                                    | —             | 不用改                                                                                  |
| `Pagination`                                                                                                                                                        | `variant`          | 无（`outlined: boolean`）                                        | `default` `outline`，默认 `default`                                               | ✓             | `outlined` → `variant="outline"`                                                        |
| `Progress`                                                                                                                                                          | `tone`             | `Tone`                                                           | `Tone \| (() => Tone)`（look 已是 `Live`）                                        | 放宽          | 原样可用                                                                                |
| `Meter` `Stat` `Status`                                                                                                                                             | `tone`             | `Tone`                                                           | `Tone \| (() => Tone)`                                                            | 放宽          | 原样可用（类型放宽）                                                                    |
| `OtpInput`                                                                                                                                                          | `tone`             | `Tone \| (() => Tone)`                                           | 不变                                                                              | —             | 不用改                                                                                  |
| `DiffHunkActions`                                                                                                                                                   | `tone`             | `"up" \| "down"`                                                 | `Tone \| (() => Tone)`（常用 `up`/`down`）                                        | 放宽          | 原样可用                                                                                |
| `MenuItem` `ContextMenuItem`                                                                                                                                        | `variant`          | 无（`danger: boolean`）                                          | `default` `destructive`，默认 `default`                                           | ✓             | `danger` → `variant="destructive"`                                                      |
| `Link`                                                                                                                                                              | `quiet`            | `boolean`                                                        | 不变（链接状态，非变体）                                                          | —             | 不用改                                                                                  |
| `PopoverContent` `HoverCardContent` `TooltipContent`                                                                                                                | `compact` `rich`   | `boolean`                                                        | 不变                                                                              | —             | 不用改                                                                                  |
| `SheetContent`                                                                                                                                                      | `side`             | `top` `bottom` `left` `right`                                    | 不变                                                                              | —             | 不用改                                                                                  |
| `CarouselPrevious` `CarouselNext`                                                                                                                                   | `glass` `side`     | `boolean` / `number`                                             | 不变                                                                              | —             | 不用改                                                                                  |
| `ToggleGroup`                                                                                                                                                       | `inset` `vertical` | `boolean`                                                        | 不变（`variant`/`size` 转发给子 `Toggle` 是阶段 2 的事）                          | —             | 不用改                                                                                  |
| `Spinner`                                                                                                                                                           | `size` `tint`      | 像素 / 颜色字符串                                                | 不变（零件，见 R5）                                                               | —             | 不用改                                                                                  |

### 4.8 迁移前后

```tsx
// 0.2
<Button variant="primary" size="large">Save</Button>
<Button variant="danger" size="small">Delete</Button>
<Badge label="Failed" tone="danger" outline />
<IconButton tone="danger" on={starred()} accessibilityLabel="Delete" />
<Radio variant="ring" scale={1.25} />
<SelectTrigger kind="outline" />
<Pagination outlined />

// 0.3
<Button size="lg">Save</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Badge label="Failed" tone="danger" variant="outline" />
<IconButton variant="destructive" selected={starred()} accessibilityLabel="Delete" />
<Radio size="lg" />
<SelectTrigger variant="outline" />
<Pagination variant="outline" />
```

## 5 实现约束：会改到原 look 代码的地方

### 5.1 前置：工具与规则

`// @port` 区域是**来源标注**，可以直接改（[`AGENTS.md`](../../AGENTS.md)、[`ARCHITECTURE.md`](../ARCHITECTURE.md) 的 P1–P6）：`port:check` 只提醒"上游改了什么、要不要采纳"，`port:vendor` 只给新组件抽初稿、不覆盖已有代码，`port-map.json` 的 `replace` / `copy` 已废弃（[`specs/ownership.md`](ownership.md)）。所以改 look 不需要任何 `replace`，**本稿需要的 `replace` 为零**。

代价在另一头：改完 look 之后，上游同一处的后续变化会变成"待审阅"而不是"不一致"，得靠人看。这由 `upstream.reviewed` 与 `port:review`（同属 `ownership.md` 的改造）承担，不是本稿要新建的机制。

本稿只在工具上追加三件小事：

| 要改的地方                  | 改什么                                                                                 | 为谁                 |
| --------------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| `scripts/port/coverage.ts`  | `AXES` 去掉 `kind`，加 `variant` / `size` / `tone` 的词表校验（见 §4.6 的断言）        | 演示覆盖率与词表一致 |
| `docs/GLOSSARY.md`          | **Variant / Size** 词条现在是"prop 名用 shadcn 的，取值用上游的"，与本稿相反，必须改写 | 词汇的真源           |
| `docs/specs/positioning.md` | "现状评估"里 API 一致性那一行更新                                                      | 路线表               |

`ownership.md` 的验收第 1 条（"在任意 Port Region 里改一行，`port:check` 仍通过"）与第 3 条（"`port:vendor` 不改动任何已有文件"）是本稿的前提：它们落地之前，改 look 会被下一次搬运冲掉。两件事的顺序写进实现任务的第一个 commit。

### 5.2 原 look 代码：逐条

| 文件                                                                                                                                     | 改动                                                                                                                                                                                                                                                                                                                                       | 为了           |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `packages/ui/button.tsx`（`look/button.ts` 区域）                                                                                        | `ButtonKind` → `ButtonVariant` 且值改成 `default`/`secondary`/`ghost`/`destructive`；`filled()`、`rest()`、`ink()`、`buttonGlyph`/`buttonLabel` 的默认值；删 `accent` 分支；`IconButtonLookOptions.variant` 加 `destructive`、去 `tone`、加 `size`；`roundButtonLook`/`roundButtonGlyph` 收 `ButtonSize`（+ `side`）；`splitButtonLook` 同 | R1、R3、R4、R7 |
| `packages/ui/toggle.tsx`（`look/tool.ts`）                                                                                               | `ToggleLookOptions.variant` 的 `ghost` → `default`；`ToggleSize` 值；文档注释                                                                                                                                                                                                                                                              | R1、R2、R6     |
| `packages/ui/checkbox.tsx`（`look/choice.tsx`）                                                                                          | `ChoiceOptions.scale` → `size: ChoiceSize`（`sm`/`default`/`lg` → 0.8/1/1.25）；`checkboxLook`/`CheckboxMark`/`RadioRing`/`choiceTileLook` 的调用点                                                                                                                                                                                        | R5、R6         |
| `packages/ui/radio-group.tsx`                                                                                                            | 依赖上面的 `ChoiceOptions`；`RadioRing` 的 `scale` 参数改成 `size`                                                                                                                                                                                                                                                                         | R5             |
| `packages/ui/segmented.tsx`（`look/tabs.tsx`）                                                                                           | `SegmentedSize` 值 `small`/`regular` → `sm`/`default`                                                                                                                                                                                                                                                                                      | R6             |
| `packages/ui/switch.tsx`（`look/switch.ts`）                                                                                             | `SwitchSize` 值；`switchLook(on, size)` 的两个分支                                                                                                                                                                                                                                                                                         | R6             |
| `packages/ui/select.tsx`（`look/listbox.tsx`）                                                                                           | `PickerLookOptions.kind` → `variant`；`PickerProps.kind` → `variant`；`pickerLook` 内部分支                                                                                                                                                                                                                                                | R1、R4、R5     |
| `packages/ui/badge.tsx`（`index.tsx`）                                                                                                   | `outline` → `variant`；`tone` 改成 `read()` 晚读；文档注释                                                                                                                                                                                                                                                                                 | R4、R8、R9     |
| `packages/ui/menu.tsx`（`look/menu.tsx`）                                                                                                | `MenuItemTextOptions.danger` → `variant?: "default" \| "destructive"`；`menuItemGlyph`、`menuItemLabel`、`menuItemNote` 的入参                                                                                                                                                                                                             | R1、R4、R10    |
| `packages/ui/stat.tsx` `status.tsx` `meter.tsx`（`index.tsx`）                                                                           | `tone` 晚读（`read(props.tone)`），使 `Tone \| (() => Tone)` 成立                                                                                                                                                                                                                                                                          | R9             |
| `packages/ui/progress.tsx`（`look/meter.ts`）                                                                                            | 无需改（`progressLook` 的 `tone` 已是 `Live`）；只放宽 prop 类型                                                                                                                                                                                                                                                                           | R9             |
| `packages/ui/pagination.tsx`（`look/nav.tsx`）                                                                                           | `paginationItemClass({ outlined })` → `{ variant }`；`paginationArrows` 的判断                                                                                                                                                                                                                                                             | R1、R4         |
| `packages/ui/diff-view.tsx`（`look/workspace.tsx`）                                                                                      | `DiffHunkActions` 的 `tone` 放宽到 `Tone \| (() => Tone)` 并用 `read()` 读（`solidTint` 已通用）                                                                                                                                                                                                                                           | R9、R11        |
| `packages/ui/otp-input.tsx`（`look/field.tsx`）                                                                                          | 无需改（`otpCellLook` 已是 `Live<Tone>`）；只改 prop 的类型名与文档                                                                                                                                                                                                                                                                        | —              |
| `packages/ui/input.tsx`（`look/field.tsx`）                                                                                              | 无需改（`invalid`/`multiline`/`readonly` 已是目标叫法）                                                                                                                                                                                                                                                                                    | —              |
| `packages/ui/carousel.tsx`（`look/nav.tsx`）                                                                                             | 无需改（`glass`/`side` 是结构名）                                                                                                                                                                                                                                                                                                          | —              |
| 其余 look（`disclosure`、`color`、`overlay`、`plot`、`menu.popup`、`tree`、`command`、`data-table`、`dock-area`、`editor`、`text-view`） | 不动                                                                                                                                                                                                                                                                                                                                       | —              |

### 5.3 外壳

- 组件文件里 `split()` 的键名、类型、默认值、`?? "…"` 的字面量跟着改（`variant`/`size`/`tone`/`variant="outline"`）。
- `Button` 的默认 `primary`、`SplitButton` 的默认 `primary`、十个触发器的默认 `secondary`、`IconButton` 的默认 `ghost`、`Toggle` 的默认 `ghost`（改后 `default`）。
- `IconButton` 去掉 `on` 的桥接（`selected={props.selected ?? props.on}` → 直接透传）。
- `Radio`：默认值 `ring` → `default`（`tile` 分支的判断值不变）；`scale` → `size` 的换算放在外壳（`{ sm: 0.8, default: 1, lg: 1.25 }`），look 仍收数字。
- `RoundButton`：`size` → `buttonSizes[...].height`（或 `side`），`roundButtonGlyph` 跟着。
- `Checkbox`/`Radio` 的 `size` → `scale` 的换算表放在外壳，一张常量表（`{ sm: 0.8, default: 1, lg: 1.25 }`）。

### 5.4 影响面（实现任务要动的文件）

| 位置                                       | 数量                                                                                         | 为什么                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `packages/ui/*.tsx`                        | 30 个文件有外观轴（§2.2 覆盖全部；含 5 个只改触发器 `variant` 的宿主文件）                   | 改 props 与 look 调用                               |
| `apps/docs/demos/*.tsx`                    | `"small"` 48 处、`"secondary"` 78 处、`"primary"` 26 处、`"accent"` 27 处、`"danger"` 31 处… | 演示要跟新词汇；每个轴值仍须出现（`port:coverage`） |
| `apps/docs/demos/*.ref.tsx`                | 52 个参照页，其中 31 个直接调 look                                                           | look 的参数名/取值变了，参照页要跟；否则 P4 比不了  |
| `apps/gallery/**`                          | 行为测试与冒烟页，值字面量                                                                   | 同上                                                |
| `apps/docs/src/pages/docs/components/*.md` | 52 个组件页（+ `index.astro`）                                                               | Variant / Size / API 三节                           |
| `apps/docs/src/pages/docs/customizing.md`  | 1 个                                                                                         | 讲 look 参数的地方                                  |
| `apps/docs/demos/props.test-d.ts`          | 1 个                                                                                         | 断言外壳 props 是 base 超集（与轴无关，但类型会变） |
| `registry.json` → `public/r`               | 全部 52 条重建                                                                               | 文件内容变了                                        |

### 5.5 完成口径

`bun run port:check`、`port:coverage`、`catalog --check`、`nsh check`、`port:render`（四张截图人眼过）、`port:render:touch`、`test:unit`、`test:gallery`、`test:install`、`vp check` 全绿；`docs/GLOSSARY.md` 的 Variant 词条与本稿一致；新增的词表断言测试覆盖每个 `*Variant` / `*Size` 联合。

## 6 迁移（0.2 → 0.3）

### 6.1 值级替换

多数迁移是机械的。**按组件**跑，不要全仓一把梭（`ghost` 在 `Button`/`IconButton` 保持不变，只在 `Toggle` 变 `default`；`primary` 在 `RoundButton`/`SplitButton`/`Button` 变 `default`）：

```sh
# 1. 尺寸：三档 → shadcn 名（演示与画廊里的字面量）
grep -rl --include=*.tsx -E 'size="(small|regular|large)"' apps packages | xargs sed -i '' \
  -e 's/size="small"/size="sm"/g' -e 's/size="regular"/size="default"/g' -e 's/size="large"/size="lg"/g'

# 2. 按钮：primary/accent → default，danger → destructive（按钮、触发器、look 调用一并）
grep -rl --include=*.tsx -E 'variant="(primary|accent)"' apps packages | xargs sed -i '' \
  -e 's/variant="primary"/variant="default"/g' -e 's/variant="accent"/variant="default"/g'
grep -rl --include=*.tsx 'variant="danger"' apps packages | xargs sed -i '' 's/variant="danger"/variant="destructive"/g'

# 3. Toggle 的 ghost → 省略（或 "default"）：只改 Toggle 的调用点。
#    `variant="ghost"` 在 11 个文件里出现，多数是 Button/IconButton，**别全局跑**。

# 4. 布尔开关 → 变体（每个只涉及一个组件，手改比 sed 稳；下面是演示 / 画廊里的数量）
#    <Badge outline>                  7 处
#    <Pagination outlined>            2 处
#    <MenuItem danger>                3 处
#    <SelectTrigger kind="outline">   16 处 `kind=`（含 DateTrigger）
```

剩下的（`scale` → `size`、`RoundButton.size={n}`、`IconButton.tone="danger"`、`IconButton.on`）语义不完全一一对应，按 §4.7 的表手工改。

### 6.2 不提供 props 别名

**建议：不提供。** 与 [`ARCHITECTURE.md`](../ARCHITECTURE.md) 分发一栏"不为旧 registry id 提供别名"同一条逻辑：

1. **别名会冻结两份词汇。** 本稿要消灭的正是"同一个概念两个名字"；留 `primary` 作为 `default` 的别名，等于把毛病留在门里，而且 `variant` 的联合会变成 8 个值，`port:coverage` 与文档要同时维护两套。
2. **复制即拥有，迁移成本低。** 组件源码在应用里，改的是自己的文件；§6.1 的 `sed` 加一张表就够。真要自动化，用户可以在自己的仓库写一个 codemod，库不必背。
3. **0.3.0 是一次性切换。** 版本号已经说明一切；`0.2 → 0.3` 的破坏性在发布说明里写清楚，比"悄悄兼容"更诚实。
4. 若担心不可见，把**编译期**的迁移提示做好：旧值从联合里删掉后，`vp check` / `nsh check` 会直接报类型错误，指向新值——这比运行期 warning 更早、更准。

### 6.3 发布说明草稿（放 `CHANGELOG` / release notes）

> **0.3.0：统一的 API**
>
> `variant` / `size` / `tone` 现在一律是 shadcn 的写法，`kind` 不再出现。**这是破坏性变更**：旧值编译不过，请按下面的表改。
>
> | 旧                                     | 新                                         |
> | -------------------------------------- | ------------------------------------------ |
> | `variant="primary"` `variant="accent"` | `variant="default"`（或省略）              |
> | `variant="danger"`                     | `variant="destructive"`                    |
> | `size="small" / "regular" / "large"`   | `size="sm" / "default" / "lg"`             |
> | `<Badge outline />`                    | `<Badge variant="outline" />`              |
> | `<Pagination outlined />`              | `<Pagination variant="outline" />`         |
> | `<MenuItem danger />`                  | `<MenuItem variant="destructive" />`       |
> | `<IconButton tone="danger" />`         | `<IconButton variant="destructive" />`     |
> | `<IconButton on={x} />`                | `<IconButton selected={x} />`              |
> | `<SelectTrigger kind="outline" />`     | `<SelectTrigger variant="outline" />`      |
> | `<Checkbox scale={0.8} />`             | `<Checkbox size="sm" />`                   |
> | `<Radio variant="ring" />`             | `<Radio />`（`default` 就是环）            |
> | `<RoundButton size={24} />`            | `<RoundButton size="sm" />` 或 `side={24}` |
> | `<Toggle variant="ghost" />`           | `<Toggle />`（`default` 就是透明）         |
>
> 没有别名：旧值直接删掉。渐进式迁移可用 §6.1 的 `sed`。行为、外观、`nsh/base` 的 props 一律没变。

## 7 拍板结果

用户 2026-11-14 决定：**8 条全部按建议**。

| #   | 问题                                                                                          | 建议                                                                                                 |
| --- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | 删掉 `variant="accent"`（与 `default` 像素相同）还是留作本库特有值？                          | **删**。两个名字一个外观；将来要"更亮一档"再加新值。                                                 |
| 2   | 0.3.0 是否补 `Button` 的 `outline` / `link`（shadcn 有，本库没有 look）？                     | **不补**。补 = 新外观（要先有 look 与四张截图），不是改名，属阶段 2；文档写明"暂无这两个值"。        |
| 3   | `Radio.variant` 的默认值叫什么？`ring` 保留还是改 `default`？                                 | **改 `default`**，另一个保留 `tile`。符合 R2（默认值叫 `default`），且 `ring` 是描述不是类别。       |
| 4   | `tone` 是否全部改成 `Tone \| (() => Tone)`（要改 Badge/Stat/Status/Meter 的 port 区域）？     | **改**。一种写法；代价是 4 个组件要改 port 区域里的 `tone` 读取。                                    |
| 5   | `IconButton.tone="danger"` → `variant="destructive"`、`on` → `selected`：接受这两个小破坏吗？ | **接受**。与 shadcn 的 `Button variant="destructive"` 一致，也去掉一个重复的状态 prop。              |
| 6   | `IconButton` / `RoundButton` 新增 `size` 轴（现在没有）？                                     | **加**（只增不减）。刻度从 `buttonSizes` 推导，默认值等于今天的尺寸，现有代码不受影响。              |
| 7   | `RoundButton.size` 从数字改成刻度，另留 `side?: number` 精确覆盖？                            | **改**。否则 `size` 有两个意思；`side` 保留精确几何（P5 的精神：不缩减能力）。                       |
| 8   | `Badge.label` → `children`（shadcn 写法）顺带做吗？                                           | **可选，建议做**。`<Badge>12</Badge>` 是 shadcn 用户的肌肉记忆；`label` 保留一个版本也行，但不建议。 |

另有两件不由本稿决定、但会在实现时撞上：**`ownership.md` 的工具改造**（§5.1 的前提）与**演示覆盖率脚本的轴名表**（`variant`/`size`/`tone` 之外的新轴不会被检查）。
