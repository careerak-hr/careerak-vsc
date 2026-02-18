# Git Quick Guide - Careerak

## 🚀 Quick Start

### First Time Setup
```cmd
setup_git.bat
```

### Daily Workflow
```cmd
git_commit_push.bat
```

### Test Before Push
```cmd
test_git_push.bat
```

---

## 📋 Common Commands

### Check Status
```cmd
git status
```

### Add & Commit
```cmd
git add .
git commit -m "Your message"
```

### Push to GitHub
```cmd
git push origin main
```

### Pull Updates
```cmd
git pull origin main
```

---

## 🛠️ Available Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `setup_git.bat` | Configure Git | First time or change settings |
| `test_git_push.bat` | Test push | Before actual push |
| `git_commit_push.bat` | Complete workflow | Daily commits |

---

## 🔧 Quick Fixes

### "Please tell me who you are"
```cmd
setup_git.bat
```

### "Authentication failed"
Use Personal Access Token from: https://github.com/settings/tokens

### "Your branch is behind"
```cmd
git pull origin main
```

### Undo last commit (keep changes)
```cmd
git reset --soft HEAD~1
```

### Discard all local changes
```cmd
git restore .
```

---

## 📚 Full Documentation

🇸🇦 Arabic Guide: [docs/GIT_WORKFLOW_AR.md](docs/GIT_WORKFLOW_AR.md)

---

## ✅ Current Repository

- **URL**: https://github.com/careerak-hr/careerak-vsc
- **Branch**: main
- **Remote**: origin

---

## 🎯 Recommended Workflow

1. **Start**: `git pull origin main`
2. **Work**: Make your changes
3. **Commit & Push**: `git_commit_push.bat`

---

**Quick Help**: Run `test_git_push.bat` to diagnose issues
