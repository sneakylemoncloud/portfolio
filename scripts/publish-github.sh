#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-portfolio}"
VISIBILITY="${2:-public}"

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not logged in to GitHub. Run: gh auth login"
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin already exists:"
  git remote -v
  git push -u origin main
  exit 0
fi

gh repo create "$REPO_NAME" \
  --"$VISIBILITY" \
  --source=. \
  --remote=origin \
  --description "Retro-OS portfolio site for Alex Shaji" \
  --push

echo ""
echo "Done. View repo: $(gh repo view --web 2>/dev/null || gh repo view --json url -q .url)"
