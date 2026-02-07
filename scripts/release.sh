#!/usr/bin/env bash
set -euo pipefail

if [[ "${SKIP_TESTS:-0}" != "1" ]]; then
  pnpm test
fi

npm pack --dry-run >/dev/null
npm publish --access public "$@"
