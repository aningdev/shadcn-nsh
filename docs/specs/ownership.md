# 组件归本库：检查工具改造

## 目标

用户决定（2026-11-14）：组件与主题**由本库自己抽取并拥有**，上游 `nsh-gallery-ui` 与官方推荐的样子是参考规范。规则已改（`AGENTS.md`、`docs/ARCHITECTURE.md` 的 P1–P6），工具要跟上：从"必须与上游一致"改为"上游变化提醒"。

## 现状 → 目标

| 工具 / 文件         | 现在                                                            | 改为                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port:check`        | 每个 Port Region 必须与上游（格式化后）逐字一致，否则失败       | **P2 变化提醒**：对比"已审阅的上游提交"与当前基线，列出上游改动过、且在 Port Map 里有去向的声明（及新增 / 删除的声明、文件），作为待审阅；不比较我们的代码与上游是否相同 |
| `port-map.json`     | `upstream.commit`；`replace` 登记偏离；`copy` 原样复制          | 增加 `upstream.reviewed`（已审阅到的上游提交）；`replace` 与 `copy` 废弃（迁移掉）；主题文件标为本库所有                                                                 |
| `port:review`（新） | 无                                                              | 审阅完待审阅项后，把 `upstream.reviewed` 移到当前基线（可按文件 / 声明逐项确认）                                                                                         |
| `port:vendor`       | 覆盖全部区域与 copy 文件                                        | 只为**新组件**抽取初稿（`port:vendor <id>` 或被 `port:new` 调用）；已存在的区域一律不覆盖                                                                                |
| `port:bump`         | 移基线后 vendor 重填区域                                        | 移基线后**不重填**，改为输出 P2 的待审阅清单                                                                                                                             |
| `ui-guards.test.ts` | 只扫 Port Region 之外的颜色字面量（旧 P7）                      | **P3**：扫全部组件、lib、`stage.tsx`（含 Port Region）；现有字面量迁到主题角色，或在清单里逐条豁免并写原因（目标为零）                                                   |
| 上游漂移工作流      | 比较最新 release 与基线                                         | 不变（仍提醒"有新 release"）；issue 正文的下一步改为 bump + 审阅                                                                                                         |
| 发布产物的文件头    | "由 port:vendor 填充，改 port-map.json"（维护者说明发给了用户） | 给用户看的说明："这是你的代码，可随意修改；源自 NSH 示例 `nsh-gallery-ui`（Apache-2.0），见 NOTICE"；`// @port` 标记在 `registry:build` 时去掉或保留由实现决定并说明     |

## 验收标准

1. 在任意 Port Region 里改一行，`port:check` 仍通过（不再要求与上游一致）。
2. 把 `upstream.reviewed` 设到一个更早的上游提交，`port:check` 列出这段时间上游改动过的、有去向的声明；`port:review` 后清单清空。
3. `port:vendor` 不改动任何已有文件（跑完 `git diff` 为空）；`port:new` 仍能为新组件抽出初稿。
4. `port-map.json` 里不再有 `replace` / `copy`；主题文件标为本库所有。
5. P3 守卫扫到 Port Region 内部；现有字面量迁走或逐条豁免（豁免有原因）。
6. 发布到 `public/r` 的文件头是给用户看的说明，不再提 `port:vendor` / `port-map.json`；`test:install` 通过。
7. `docs/port.md`、`docs/toolchain.md` 的流程与检查表随之更新；全量检查通过。
