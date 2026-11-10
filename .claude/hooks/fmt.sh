#!/bin/bash
# PostToolUse(Edit|Write): 对刚改动的源文件跑 vp fmt；失败不阻断。
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */references/*|*/public/r/*|*/node_modules/*|*/.nsh/*) exit 0 ;;
  *.ts|*.tsx|*.json|*.md|*.astro|*.css) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
vp fmt "$f" >/dev/null 2>&1 || true
exit 0
