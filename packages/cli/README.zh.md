# shadcn-nsh

[English](./README.md)

从 shadcn-nsh registry 向应用复制 styled NSH 组件的 CLI。

```sh
bunx shadcn-nsh@latest init -c apps/web
bunx shadcn-nsh@latest add button
```

默认 registry：`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`。

## 命令

| 命令                | 作用                                                       |
| ------------------- | ---------------------------------------------------------- |
| `init`              | 写 `nsh-ui.json`、装一个主题、把每个 `nsh.json` 指向它     |
| `add [components…]` | 复制条目及其 `registryDependencies`                        |
| `list`              | registry 的全部条目，应用已有的标 `✓`                      |
| `view <items…>`     | `add` 会写的文件：目标路径与内容                           |
| `diff [items…]`     | 对比应用内文件与 registry 的；有差异时退出码 1             |
| `build`             | 把 `registry.json` 构建到 `public/r`（维护本 registry 用） |
| `serve`             | 用 HTTP 提供 `public/r`，本地测试用                        |

每个命令都接受 `-c, --cwd <dir>`（默认：当前目录）。`init`、`add`、`list`、`view`、`diff`
另接受 `--registry <url>`（含 `{name}` 的模板）；省略时 `add`、`list`、`view`、`diff` 用
`nsh-ui.json` 里的，`init` 用公共 registry。`init` 还接受 `--overwrite`、`-y`（接受，当前不弹确认）与 `--theme <name>`：
`default`（本库自己的主题）或 `shadcn`（shadcn 的 neutral 配色与平面 finish）。

## add

```sh
shadcn-nsh add button -c apps/web
shadcn-nsh add --all
shadcn-nsh add button --dry-run
shadcn-nsh add button --overwrite
```

- 应用没有的文件写入；与 registry 相同的跳过。
- 应用改过的文件保留并报告 `kept components/ui/button.tsx, differs (run diff)`。
  `--overwrite`（`-o`）替换它并打印改动量：`overwrite components/ui/button.tsx (+2 -1)`。
- `theme.json` 按 key 合并：应用保留自己的颜色，补上缺的 token；改过颜色的主题原样保留
  （`kept theme.json (the app's colors stay)`）。
- `--all`（`-a`）加全部 `registry:ui` 条目（含依赖）。
- 点名一个主题（`add theme-shadcn`，`add theme` 是换回默认）就是换主题：文件写到应用里，
  `nsh-ui.json` 的 `theme` 记下新的那个。
- 此后 `theme` 这个依赖按应用的主题解析，所以 `add button`、`add button --overwrite`、
  `add --all --overwrite` 都不会把默认主题写回来。
- `--dry-run` 用 `would write …` / `would overwrite …` 打印同样的行，一个字节都不写——
  包括 `init` 会先写的 `nsh-ui.json` 与主题。

## list、view、diff

```sh
shadcn-nsh list
shadcn-nsh list --json
shadcn-nsh view button
shadcn-nsh diff
shadcn-nsh diff button
```

`list` 读目录（`index.json`），条目任一文件在应用里就标为已装。

`view` 打印 `add` 会写的内容：依赖在前、目标路径、import 已按本应用改写；不写文件。

`diff` 用同一份改写后的内容与应用里的文件比较。不带条目时列出有差异的已装条目，带条目时
打印改动的行。有差异时退出码 1，可以用来卡更新：

```sh
shadcn-nsh diff || echo "run shadcn-nsh add <item> --overwrite"
```

行以 registry 版本对照应用版本：`-` 是覆盖会删掉的应用中的行，`+` 是它会加的行。
`theme.json` 按 key 比较、不按值——改过颜色的主题是应用自己的，只有 `add --overwrite`
会整体替换。

## nsh-ui.json

`init` 把它写在组件安装的地方：

```json
{
  "registry": "https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json",
  "theme": "theme",
  "aliases": {
    "components": "./components",
    "ui": "./components/ui",
    "lib": "./lib",
    "theme": "./lib/theme"
  }
}
```

`theme` 是应用装的 `registry:theme` 条目（`theme`，或 `theme-shadcn`）；文件里没有它就是
`theme`。

monorepo（`apps/*` + `packages/ui`）里它位于 `packages/ui`，`add -c apps/web` 装到那里。

## 本仓开发

```sh
bun run shadcn-nsh -- --help
bun run cli:build
bun run registry:build   # 生成 public/r，再用它做端到端
bun run shadcn-nsh -- add button -c apps/web --registry "file://$PWD/public/r/{name}.json"
```

`bun test packages/cli` 用临时应用和由 `public/r` 生成的 `file://` registry 跑命令测试。
