#!/usr/bin/env bash
# Publish this folder to https://wayneusc.github.io
# Prereq: create an EMPTY GitHub repo named  WayneUSC.github.io  first.
set -e
REPO="https://github.com/WayneUSC/WayneUSC.github.io.git"

echo "Publishing to $REPO ..."
[ -d .git ] || git init
git add -A
git commit -m "Update homepage ($(date +%Y-%m-%d))" || echo "(nothing to commit)"
git branch -M main
if git remote | grep -q origin; then
  git remote set-url origin "$REPO"
else
  git remote add origin "$REPO"
fi
git push -u origin main
echo
echo "Done. Now enable GitHub Pages:"
echo "  Settings -> Pages -> Source: Deploy from a branch -> main / (root)"
echo "Then visit: https://wayneusc.github.io"
