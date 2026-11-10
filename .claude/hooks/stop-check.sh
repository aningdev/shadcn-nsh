#!/bin/bash
# Stop: 工作区自上次通过后有变化才跑 `bun run check`；失败时 exit 2，把报错尾部回灌给 Claude。
input=$(command cat)
# 已处于 stop hook 续跑中则放行，避免死循环
[ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
stamp=.claude/.check-stamp

snapshot() { { git status --porcelain; git diff HEAD; } 2>/dev/null | shasum | cut -d' ' -f1; }

[ "$(snapshot)" = "$(command cat "$stamp" 2>/dev/null)" ] && exit 0

out=$(bun run check 2>&1)
if [ $? -eq 0 ]; then
  snapshot >"$stamp"   # check 含 --fix，通过后再取快照
  exit 0
fi

echo "bun run check 未通过（输出尾部）：" >&2
echo "$out" | tail -n 60 >&2
exit 2
