#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
用法:
  scripts/init-standalone-with-remote.sh <remote-url> [branch] [--push]

示例:
  scripts/init-standalone-with-remote.sh git@github.com:yourname/dailyflows-openclaw-plugin.git
  scripts/init-standalone-with-remote.sh https://github.com/yourname/dailyflows-openclaw-plugin.git main --push
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

REMOTE_URL="${1:-}"
BRANCH="${2:-main}"
PUSH_NOW="0"

if [[ -z "$REMOTE_URL" ]]; then
  usage
  exit 1
fi

if [[ "${3:-}" == "--push" ]]; then
  PUSH_NOW="1"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PLUGIN_DIR"

if [[ ! -d "$PLUGIN_DIR/.git" ]]; then
  echo "[1/5] 当前目录还不是 git 仓库，先初始化"
  "$SCRIPT_DIR/init-standalone-local.sh" "$BRANCH"
else
  echo "[1/5] 检测到已存在 git 仓库，跳过初始化"
fi

cd "$PLUGIN_DIR"

echo "[2/5] 设置分支名: $BRANCH"
git branch -M "$BRANCH"

echo "[3/5] 绑定 origin: $REMOTE_URL"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo "[4/5] 检查工作区"
git status --short

echo "[5/5] 输出后续操作"
if [[ "$PUSH_NOW" == "1" ]]; then
  echo "开始推送到远端..."
  git push -u origin "$BRANCH"
  echo "推送完成。"
else
  echo "已完成初始化 + 远端绑定。"
  echo "如需推送，执行:"
  echo "  git push -u origin $BRANCH"
fi
