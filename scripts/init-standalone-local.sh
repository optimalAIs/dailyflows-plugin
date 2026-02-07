#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BRANCH="${1:-main}"

if [[ -d "$PLUGIN_DIR/.git" ]]; then
  echo "[skip] $PLUGIN_DIR 已经是 Git 仓库（存在 .git）"
  echo "如果你想重建，请先手动处理现有 .git。"
  exit 1
fi

cd "$PLUGIN_DIR"

echo "[1/4] 初始化仓库"
git init

echo "[2/4] 添加文件"
git add .

echo "[3/4] 创建初始提交"
git commit -m "chore: bootstrap dailyflows openclaw plugin"

echo "[4/4] 设置默认分支: $BRANCH"
git branch -M "$BRANCH"

echo
echo "完成。"
echo "仓库路径: $PLUGIN_DIR"
echo "下一步（可选）:"
echo "  git remote add origin <your-github-repo-url>"
echo "  git push -u origin $BRANCH"
