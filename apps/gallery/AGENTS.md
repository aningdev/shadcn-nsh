# Gallery

原生验真入口：对照 [`references/nsh/examples/gallery`](../../references/nsh/examples/gallery) 的壳层模式，演示 [`@shadcn-nsh/ui`](../../packages/ui) 的 styled 包装。  
**不做**：改 `nsh` / `nsh/base`；不把本目录或参考 `nsh-gallery-ui` 的演示样式当成可发布 API。

## 目标（尚未落地）

与参考对齐的 **Phone `NavStack` + Desktop 侧栏** 壳（搜索、`DemoPage`/`Card`、`lazy`、持久化上次 demo、根级 Toaster），侧栏只挂 **本库已导出组件** 的 lazy demo。

| 做 | 不做 |
| -- | ---- |
| 壳结构仿参考 `App` / `nav` / `ui` / `TitleBar` | 1:1 搬 Apps、Primitives、Styling、Motion、Platform |
| demo 只 import `@shadcn-nsh/ui` + 本目录壳零件 | 依赖参考 `nsh-gallery-ui` 当契约 |
| 缺口写入 [GAPS.md](./GAPS.md)，随 UI 补全再加 demo | 搬参考 `tests` / `Bench` / `tools` / lucide codegen |

当前 [`App.tsx`](./App.tsx) 仍是单页冒烟；完整壳与按组件拆分的 demos **暂缓**（与参考差距大，先跟 `@shadcn-nsh/ui` 一起补）。

## 补全顺序

1. [`packages/ui/COMPONENTS.md`](../../packages/ui/COMPONENTS.md) 里组件 status → done 并 registry 可 `add`。
2. 在本 app 加对应 `demos/*` + 侧栏 `DemoEntry`。
3. 从 [GAPS.md](./GAPS.md) 删掉该行。

## 命令

```sh
bun run check:gallery
bun run dev:gallery
```
