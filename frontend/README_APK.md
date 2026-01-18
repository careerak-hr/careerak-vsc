# Build Android APK (Capacitor)

This guide shows how to wrap the React frontend into an Android APK using Capacitor.

Prerequisites on your machine:
- Node.js and npm installed
- Android Studio with Android SDK installed
- Java JDK installed (as required by Android Studio)

Steps:

1. Install dependencies (run in `frontend`):

```bash
npm install
```

2. Build the web app:

```bash
npm run build:web
```

3. Initialize Capacitor (only first time):

```bash
npx cap init Careerak com.careerak.app --web-dir=build
```

4. Add Android platform:

```bash
npx cap add android
```

5. Copy web build into native project:

```bash
npx cap copy
```

6. Open Android Studio and build APK:

```bash
npx cap open android
```

In Android Studio:
- Let Gradle sync and install any SDK components it requests.
- From `Build` menu choose `Build Bundle(s) / APK(s) -> Build APK(s)`.
- After build completes, Android Studio will give you a link to the generated APK.

Notes:
- You will need to sign the APK for distribution; for testing a debug APK is fine.
- If you prefer CLI builds, you can use Gradle wrapper inside `android/` folder, e.g.:

```bash
cd android
./gradlew assembleDebug   # on Windows: gradlew.bat assembleDebug
```

If you want, I can:
- Add a small script to automatically run `npm run build:web && npx cap copy`.
- Or set up Cordova instead of Capacitor.

