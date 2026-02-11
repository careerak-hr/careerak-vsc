# Careerak Build System

## Quick Start

### 1. Test Your Environment
```cmd
test_build_environment.bat
```

### 2. Build the App
```cmd
build_careerak_optimized.bat
```

### 3. Get Your APK
Find it in: `apk_output\Careerak-v1.0-debug.apk`

## Build Scripts

### Main Build Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `build_careerak_optimized.bat` | ⭐ **Recommended** - Optimized build with better error handling | Daily development |
| `build_careerak_clean.bat` | Ultra-clean build with zero warnings | Clean builds |
| `build_careerak_final.bat` | Stable production build | Final releases |

### Utility Scripts

| Script | Description |
|--------|-------------|
| `test_build_environment.bat` | Check if all required tools are installed |
| `fix_gradle_issues.bat` | Fix common Gradle problems |

## Build Process Steps

The build process includes:

1. **Git Status Check** - Optional commit and push
2. **Frontend Build** - Compile React app (`npm run build`)
3. **Capacitor Sync** - Sync web assets to Android
4. **Gradle Clean** - Clean previous builds
5. **APK Assembly** - Build the Android APK

## Troubleshooting

### Build Takes Too Long?

**First Build**: 10-15 minutes (downloading dependencies)  
**Subsequent Builds**: 2-5 minutes

If stuck at "CONFIGURING":
```cmd
fix_gradle_issues.bat
# Choose option 4 (Full clean)
```

### Common Issues

#### "Could not resolve dependencies"
```cmd
cd frontend\android
gradlew clean --refresh-dependencies
```

#### "Out of memory"
Edit `frontend\android\gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m
```

#### Gradle daemon issues
```cmd
cd frontend\android
gradlew --stop
```

## Optimizations Applied

### Gradle Performance
- ✅ Increased JVM memory to 2GB
- ✅ Enabled parallel builds
- ✅ Enabled Gradle caching
- ✅ Enabled configure on demand

### Build Scripts
- ✅ Stop daemons before build
- ✅ Better error messages
- ✅ Progress indicators
- ✅ Optional Git operations

## Requirements

- Node.js 18+ and npm
- Java JDK 21
- Android SDK
- Stable internet connection (first build)

## Documentation

- 🇸🇦 Arabic Guide: `BUILD_QUICK_START_AR.md`
- 🇸🇦 Detailed Solutions: `docs/BUILD_ISSUES_SOLUTIONS_AR.md`

## Build Output

After successful build:
```
✅ APK: frontend\android\app\build\outputs\apk\debug\Careerak-v1.0-debug.apk
✅ Copy: apk_output\Careerak-v1.0-debug.apk
```

## Manual Build (Step by Step)

If automated scripts fail:

```cmd
# 1. Build frontend
cd frontend
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Build Android
cd android
gradlew --stop
gradlew clean --no-daemon
gradlew assembleDebug --no-daemon --warning-mode none
```

## Tips

1. **First build patience**: First build downloads all dependencies
2. **Close other apps**: Free up memory during build
3. **Stable internet**: Required for dependency downloads
4. **Use VPN**: If Maven repositories are blocked

---

**Last Updated**: 2026-02-11  
**Engineer**: Eng.AlaaUddien
