# Card、Field、Item：三个组合组件（#19）

## 目标

MyAid 改用本库后，复制进来的文件不改、外观只经主题。应用里最常见的容器、表单行和列表行如果不由本库提供，应用就得自己给文字和表面上色，绕过主题。

用户在 2026-11-14 决定：shadcn 有的部件**全部**加，名字与 shadcn（`references/shadcn-ui/apps/v4/registry/new-york-v4/ui/{card,field,item}.tsx`）一致。

## 部件

| 组件  | 部件                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card  | `Card` · `CardHeader` · `CardTitle` · `CardDescription` · `CardAction` · `CardContent` · `CardFooter`                                                     |
| Field | `FieldSet` · `FieldLegend` · `FieldGroup` · `Field` · `FieldContent` · `FieldLabel` · `FieldTitle` · `FieldDescription` · `FieldSeparator` · `FieldError` |
| Item  | `ItemGroup` · `ItemSeparator` · `Item` · `ItemMedia` · `ItemContent` · `ItemTitle` · `ItemDescription` · `ItemActions` · `ItemHeader` · `ItemFooter`      |

轴也照 shadcn：`Field` 的 `orientation`（vertical / horizontal / responsive）；`Item` 的 `variant`（default / outline / muted）、`size`（default / sm）；`ItemMedia` 的 `variant`（default / icon / image）；`FieldLegend` 的 `variant`（legend / label）。

## 决定

| 项          | 决定                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 起步        | 每个组件用 `bun run port:new` 起步                                                                                                         |
| Card        | 外观取自上游 `nsh-gallery-ui/index.tsx` 的 `Card`（`sectionSurface`）；port-map 里它从"演示外框"的 exclude 改成去向 `packages/ui/card.tsx` |
| Field、Item | 上游没有外观，由本库设计：只用主题角色（文字层级、`faint`、`danger`、分隔线、表面），没有 Reference Page 就声明 `selfReference`            |
| 自适应      | `Field` 的 `responsive` 在手机上竖排、桌面上横排；`Item` 在手机上按触屏尺寸                                                                |
| 职责        | `Item` 只负责一行内容的排版，不管选中和按键（那是 menu / tree 的事）；可以放进可按的容器里                                                 |
| 无障碍      | 查 `nsh/base` 是否能把标签与输入框关联、能否把错误读给读屏；能就接上，不能就只做视觉，并在文档页写明                                       |
| 演示        | 每个组件的演示覆盖亮 / 暗、手机 / 桌面；`Field` 演示包着本库的 `Input`、`Select`、`Switch`、`Checkbox`                                     |

## 验收标准

1. 三个 registry 条目 `card`、`field`、`item`，部件和轴与上表一致，`shadcn-nsh add` 能装，`test:install` 通过。
2. 组件代码里没有颜色字面量；`port:check`、`catalog --check`、`nsh check apps/docs/demos`、`vp check`、`port:render` 通过，四张截图人眼看过。
3. 文档页各一页，固定四节；`README.md` 的组件列表更新。
