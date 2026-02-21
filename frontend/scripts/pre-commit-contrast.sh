#!/bin/bash

# Pre-commit hook for contrast checking
# To install: ln -s ../../frontend/scripts/pre-commit-contrast.sh .git/hooks/pre-commit
# Or copy this file to .git/hooks/pre-commit

echo "🎨 Running contrast checker..."

cd frontend
npm run check:contrast

EXIT_CODE=$?

if [ $EXIT_CODE -eq 2 ]; then
  echo ""
  echo "❌ Critical contrast failures detected!"
  echo "Please fix the contrast issues before committing."
  echo ""
  echo "To bypass this check (not recommended):"
  echo "  git commit --no-verify"
  exit 1
elif [ $EXIT_CODE -eq 1 ]; then
  echo ""
  echo "⚠️  Contrast warnings detected."
  echo "Consider fixing these issues for better accessibility."
  echo ""
  echo "To proceed anyway:"
  echo "  git commit --no-verify"
  # Allow commit with warnings
  exit 0
else
  echo ""
  echo "✅ All contrast checks passed!"
  exit 0
fi
