# 0006 每个 finish 只带它用得到的字段

- 日期：2026-11-24
- 状态：已采纳（2026-11-24）
- 规范：[`docs/specs/theme-roles.md`](../specs/theme-roles.md) 第 2、3 节；源码 [`packages/theme/finish-fields.ts`](../../packages/theme/finish-fields.ts)（#374）

## 背景

#293 让 finish 的可选字段变必填：十五个角色都写满十六个字段，不写的取中性值，中性值在 `tokens/base/style.shared.tokens.json` 的 `finish` 组里写一次，编译时铺进每套主题的每个角色。好处是形状固定、读取时不用判断字段在不在；代价是**每套主题、每份编译产物都在重复“这里没有东西”**：`inset` 没有底、`card` 没有材质、`disabled` 没有模糊，但它们的 `material: null`、`backdropFilter: "none"`、`gradient: null` 一份不少地写在六套主题里。

#374 要求按角色收紧：**一个字段属于一个角色，当且仅当六套主题里至少一套在这个角色上给了它一个不是中性的值。** 中性值是：`null`、`backdropFilter` / `material` 的 `"none"`、`elevation` 的 `0` / `null`，以及“每套主题里都等于组件不写它时会画出来的东西”的值——典型是 `border-top-color` 与这个角色的 `border-color` 相同。

## 量出来的表

在 `refactor/finish-fields` 分支上（`fill` 成层、`knob` 有 `checked-*` 之后）把六套主题 × 亮暗的 finish 逐字段解析、逐字段比较，得到每个字段在哪些角色上真的有用：

| 字段                                                 | 只有这些角色用到它                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `gradient`                                           | `fill`（default 的亮暗各一条真实渐变）、`knob`（default 的亮暗各一条）                                   |
| `pressed-background` / `pressed-foreground`          | `accent`（winui 亮暗各一套 `AccentFillColorTertiary` 与 `TextOnAccentFillColorSecondary`）               |
| `material`                                           | `raised`、`overlay`、`inverse`、`glass`（apple 的 glass、winui 的 acrylic）                              |
| `backdropFilter`                                     | 同上（apple 30px、default 与 shadcn 20px、solid-glass 14px + saturate）                                  |
| `elevation`                                          | `card`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`hover`、`pressed`（material：1/1/3/6/6/3/1/1） |
| `border-top-color`                                   | `raised`、`hover`（winui 暗色的斜面；亮色下等于 `border-color`，中性）                                   |
| `border-bottom-color`                                | `raised`、`hover`（winui 亮色）、`accent`（winui 的 `brand-edge`，与 `border-color` 不同）               |
| `pressed-opacity`                                    | `accent`（0.88 / 1）                                                                                     |
| `checked-background` / `-border-color` / `-gradient` | `knob`                                                                                                   |
| `background` `shadow` `border-color` `foreground`    | `inset` 之外的所有角色（`inset` 的底是空的，靠影子与边画出来）                                           |

由此十五个角色的字段表就是 `finishFields`（`theme-roles.md` §2 有同一张表，`check:theme` 拿两处与每套主题对账）：

| finish     | 字段                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `card`     | `background` `shadow` `border-color` `foreground` `elevation`                                                                       |
| `inset`    | `shadow` `border-color` `foreground`                                                                                                |
| `channel`  | `background` `shadow` `border-color` `foreground`                                                                                   |
| `raised`   | `background` `shadow` `border-color` `border-top-color` `border-bottom-color` `backdropFilter` `foreground` `material`              |
| `plate`    | `background` `shadow` `border-color` `foreground` `elevation`                                                                       |
| `overlay`  | `background` `shadow` `border-color` `backdropFilter` `foreground` `material` `elevation`                                           |
| `modal`    | `background` `shadow` `border-color` `foreground` `elevation`                                                                       |
| `inverse`  | `background` `shadow` `border-color` `backdropFilter` `foreground` `material` `elevation`                                           |
| `glass`    | `background` `shadow` `border-color` `backdropFilter` `foreground` `material` `elevation`                                           |
| `accent`   | `background` `shadow` `border-color` `border-bottom-color` `pressed-background` `pressed-foreground` `pressed-opacity` `foreground` |
| `fill`     | `background` `gradient` `shadow` `border-color` `foreground`                                                                        |
| `knob`     | `background` `gradient` `shadow` `border-color` `checked-background` `checked-border-color` `checked-gradient` `foreground`         |
| `hover`    | `background` `shadow` `border-color` `border-top-color` `border-bottom-color` `foreground` `elevation`                              |
| `pressed`  | `background` `shadow` `border-color` `foreground` `elevation`                                                                       |
| `disabled` | `background` `shadow` `border-color` `foreground`                                                                                   |

删掉的槽位与它们的证据：`default` 的 `accent.border-top-color` / `border-bottom-color` 都等于 `{brand-edge}`，也就是它的 `border-color`；`winui` 的 `pressed`、`plate` 的上下边色等于 `{color.border}`；`shadcn`、`solid-glass`、`apple`、`material` 的上下边色是 `transparent`，与“不写这条边色”画出来的一样（`null`：没有自己的颜色，跟 `border-color` 走）。

## 决定

1. **`packages/theme/finish-fields.ts` 是字段表的唯一出处。** 导出 `finishFields`（角色 → 字段）与由它推出的类型：`FinishRole`、`FinishOf<role>`、`FaceRole`（`inset` 之外的角色）。`theme.ts` 的 `FinishStyle<role>`、`finish`、`platformMaterial(role)` 都由这张表推出，**读一个角色没有的字段是类型错误**（`finish.card.borderTopColor`、`finish.inset.backgroundColor` 编不过）。
2. **中性值只写在有这个字段的角色上。** `tokens/base/style.shared.tokens.json` 的 `finish` 组按角色给出各自的 `$extensions`：`card` 只写 `elevation`，`raised` 写 `backdropFilter` / `material` / 两条边色，`accent` 写按下两色与下边色，`fill` / `knob` 写 `gradient`，`hover` 写两条边色与 `elevation`，`pressed` 写 `elevation`，`inset` / `channel` / `disabled` 什么都不写。
3. **主题源码不再重复中性值。** 六套主题的 DTCG 源里，角色没有的字段整条删掉；有、但取中性值的也删掉（中性值由 base 提供）；`transparent` 是有值的颜色，留着。生成器（`scripts/theme/finishes/*.ts`）同步删掉，删掉 122 条语句，没有一处改值。
4. **两侧的检查都按角色。** `check:theme` 拿 `finishFields` 与每套主题合并后的字段集合对账（少一个、多一个都点名），`scripts/tokens/lint.ts` 在源码阶段就拦下角色没有的字段，`scripts/theme/material.ts` 只给有 `material` / `elevation` 的角色要求那两个值；规范里那张逐角色的表也由 `check:theme` 对账，表与代码不可能漂移。
5. **组件跟着类型收窄。** `lib/look.ts` 的 `Fill` 只接受 `FaceRole`；`inset` 没有底，所以复选框的“井”不再借 `fillOf(face)` 取影，而是 `ChoiceLook.shade: FinishRole`（`well` 取 `"inset"`），只读 `boxShadow`。`stateLayer()` / `hovered()` 上那个从来没人传真值的 `under`（渐变）参数一并删掉。

## 理由

- 形状固定是为了让读者不用判断字段在不在；但它只在**读取处**省事，而读取处本来就要按角色分别写。代价落在所有主题作者与编译产物上：一个字段在六套主题里出现九十次，其中八十几次是“没有”。
- 字段表写进代码，类型与检查才有一处可依：以前“字段集合固定”只写在文档里，`check:theme` 拿默认主题当模板；现在默认主题也只是这张表的一个读者。
- 中性值继续只写一次，只是范围从“所有角色”收到“有这个字段的角色”：`inset` 没有底，就不该有一条“它的底是中性值”的记录。

## 不采纳的方案

- **保留强制字段，只在编译产物里省掉中性值。** 源码里仍要写满十六个字段，主题作者照样每套主题重复一遍；且“写了等于没写”的值会让 `theme:diff` 无法区分“删掉一个中性槽位”和“改了一个值”。
- **中性值按组写一份（`finish.$extensions.neutral`），角色只写差异。** 读者要先合并两层再做判断，类型也推不出“这个角色有没有这个字段”；`finishFields` 一张表就把两件事都说了。
- **让 `inset` 也带 `background`，把井画成透明底。** 井的底是空的：它靠内阴影与边画出来，写 `background: "transparent"` 与不写它，在 NSH 里都是不画底，但前者会让 `paints()` 的判定与 `port:render` 的口径分叉。
- **顺手删掉没人读的风格字段（`state.overlay.focus` / `dragged`、`dimension.size.control.*.switch`、`typography.headline`）。** 它们在仓库里确实没有读者，但每套主题都给了非中性值（material 的 0.10 / 0.16 叠色、各主题的开关档位、七级字阶），删掉会改动主题数据而不是中性槽位，也会动到公开的读取接口（`overlayWash`、`controlSize.switch`、`font.size`）。这次只收 finish 的字段表，那几项留在 §3 的清单里，等各自的 issue 决定。

## 完成后的样子

- `bun run check:theme`：十五个角色的字段集合与 `finishFields` 一致（六套主题 × 亮暗，0 差）。
- `bun run theme:diff --same`：删掉的都是中性键；`dimension` 的 8 处值变化早于本次改动（本机基线陈旧）。
- 组件与参照页的像素不变（`port:render` / `port:render:theme`）。
