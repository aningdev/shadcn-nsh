# 发版

一次 `vX.Y.Z` 标签放出两样东西：npm 上的 `shadcn-nsh@X.Y.Z`，以及**这个标签下的 `public/r`**。CLI 默认从与自己同版本的标签读 registry（`https://raw.githubusercontent.com/aningdev/shadcn-nsh/v<version>/public/r/{name}.json`），所以装到的文件与在跑的 CLI 永远对得上，新版本也不会悄悄改掉已装应用的源码。`main` 上是开发中的 registry，不对外读。

标签只用 `v*`。历史上叫 `cli-v*` 的那几个留作存档，不再使用。

## 1 发版之前

- 这一版要带的 PR 都已合并，`main` 是绿的：`check.yml` 跑 `bun run check`、演示与 gallery 的类型检查、`port:render`、`test:install`。
- 本地再跑一遍 `bun run test:install`：在真实 NSH 应用里 `init` / `add`，逐条目。
- 改动都写下了：每个 PR 已在 `CHANGELOG.md` 的 `Unreleased` 写了自己的条目；文档站、README 的兼容矩阵跟上了。
- 上游那侧是干净的：`bun run port:check` 没有未审阅的变化（审阅过的已经 `bun run port:review` 记下）。

## 2 定版本号

CLI 与组件库共用一个版本号。

| 这次改了什么                                                   | 版本                       |
| -------------------------------------------------------------- | -------------------------- |
| 组件 API、registry 条目 id、主题数据的破坏性变化；删掉某个条目 | 1.0 之前 minor，之后 major |
| 新组件、新条目、新主题、只增不改的 API                         | minor                      |
| 修 bug、只改外观细节（不改 API 与数据形状）、只改文档与演示    | patch                      |

破坏性变化也可以几个凑一次 minor 发，别为了"完整"把两次 minor 压成一次 major。

## 3 切 `CHANGELOG.md`

把 `Unreleased` 这一节改成版本标题，并在顶部留一个新的空 `Unreleased`：

```md
## Unreleased

## vX.Y.Z — YYYY-MM-DD

### Added

…
```

条目面向用的人写：改动之后感知到什么，不是"哪个文件动了"。破坏性的加 `**Breaking:**` 前缀，写清怎么迁移（旧的写法 → 新的写法）。

## 4 版本号与兼容矩阵

- `packages/cli/package.json` 的 `version` 改成 `X.Y.Z`。
- `README.md` 与 `README.zh.md` 的兼容矩阵加一行（本库版本 ↔ NSH CLI 版本）。
- 如果这次跟着换了 NSH 基线：`port-map.json` 的 `upstream.cli` 与 `upstream.commit` 一起更新（`bun run port:bump`，见 [`toolchain.md`](toolchain.md)）。

## 5 发版 PR

`main` 受保护，发版也走 PR：

```sh
git switch -c chore/release-vX.Y.Z
bun run registry:build          # registry.json → public/r
git add -A
git commit -m "chore(release): vX.Y.Z"
git push -u origin chore/release-vX.Y.Z
gh pr create --title "chore(release): vX.Y.Z" --body-file <这一版的 CHANGELOG 节>
```

`public/r` 必须在这个 PR 里：标签读的就是它。CI 绿了 squash 合并。

## 6 打标签

在合并后的 `main` 上打，标签指向发版 PR 的那个 squash 提交：

```sh
git switch main && git pull --ff-only
git log -1 --oneline            # 应是 chore(release): vX.Y.Z
git tag vX.Y.Z
git push origin vX.Y.Z
```

`publish-cli.yml` 在 `v*` 标签上发布到 npm；发布前它会校验标签与 `packages/cli/package.json` 的版本一致，不一致就失败，不发。

## 7 GitHub Release

标题 `vX.Y.Z`，正文取 `CHANGELOG.md` 里这一节。Release 是"这次发了什么"的固定链接，也是别人引用某一版时该贴的东西。

## 8 发完之后

- 文档站随 `main` 自动部署（`deploy-docs.yml`），不用单独操作。
- 装不上、文件不对：发一个补丁版本。**不要改已经发出去的标签**——那等于换掉别人已经装进应用的源码。
- 兼容矩阵与 `upstream.cli` 跟着一起更新，别让它们落后于实际基线。
