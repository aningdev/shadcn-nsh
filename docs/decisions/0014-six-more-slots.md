# 0014 再加六个槽：焦点线宽、复选框盒、滑块旋钮底色、弹层圆角、标签页轨道底色、井的边

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 依据：[0013](0013-one-contract-value-slots.md) 第 3 条（加槽要对每套主题都有意义、nsh-gallery 有值）；[0004](0004-theme-contract-freeze.md)（契约变化要有决策记录）

## 背景

按 M3 的 token 给 material 配值（#408）时，有六处差别在现有槽里没有位置，只能写成组件里的常量：输入框聚焦下边线的宽、复选框盒的边长、滑块旋钮的底色、弹层的圆角、标签页轨道的底色、井（编辑器、搜索框等凹进去的面）的边。每一处在别的平台也有自己的值（winui 焦点线 2、apple 的井无边），不是 material 独有的风味。

## 决定

1. 契约第 11 节新增六个槽，每套主题都有值，默认值取今天的外观（所以 nsh-gallery、shadcn、solid-glass、apple、winui 的像素不变）：

   | 槽                  | base 默认             | 例外                      |
   | ------------------- | --------------------- | ------------------------- |
   | `field.focus.width` | 3                     | winui 2，material 2       |
   | `choice.box`        | pointer 16 / touch 20 | material 18               |
   | `slider.knob.face`  | `finish:knob`         | material `color:primary`  |
   | `popup.corner`      | `container`           | material `control`（4dp） |
   | `tabs.track.face`   | `color:inset`         | material `none`           |
   | `well.edge`         | `color:border`        | apple、material `none`    |

2. 组件读到的颜色角色必须在 `colors` 里：`colors` 增加 `secondary` / `secondaryForeground`，`check:theme` 拒绝槽里 `color:<role>` 指向 `colors` 没有的角色（像素比对在同一主题下比组件与参照，缺角色画不出来时两边一样空，查不出来）。

## 理由

- 都是数值或颜色角色，退化值照 0013 表达形态（`none` = 没有轨道底 / 没有边），不引入枚举、不加主题分支。
- 默认值等于今天的外观，其他主题零像素变化，风险只在 material。

## 不采纳

- **只在 material 的 token 里加键**：0004 第 3 条禁止为一套主题加键。
- **在组件里按主题写常量**：回到 0013 删掉的平台配方。
