# ppal-app

PantryPal is the required mobile client for the course project. It uses Ionic, Angular standalone components, and Capacitor.

## Accepted MVP

The first release targets one controlled demonstration pantry and online-only CRUD operations. It includes product validation, expiration classification, sorting by expiration date, loading/empty/error states, and search as a lower-priority convenience. There are no accounts, login, camera access, native reminders, offline cache, or offline writes. See ADR-002 in ppal-docs for the authoritative scope.

This app must not be presented as a public multi-user service while its API has no authentication.

## Architecture

The client follows a feature-first structure and the dependency direction presentation -> domain <- data:

- Domain contains product types, validation rules, expiration calculations, and the repository contract.
- Data implements the contract through one configured Angular HttpClient.
- Presentation uses an Angular Signals facade/ViewModel with explicit immutable screen state.
- The API is the source of truth; the client does not connect directly to PostgreSQL.

## Requirements

- Node.js 22 or newer
- npm
- Android Studio, JDK 21, Android SDK and an Android emulator for Android testing
- Docker Desktop and the sibling ppal-api, ppal-db, and ppal-infra repositories for the full local flow

## Install and validate

Commands: npm ci, npm run lint, npm test -- --configuration ci, and npm run build.

The production build uses a placeholder HTTPS API origin until a real deployment URL is configured in src/environments/environment.prod.ts. Do not release that placeholder configuration to users.

## Android debug workflow

The development environment targets the host machine's API from an Android emulator through 10.0.2.2:3000. Start the local API and PostgreSQL stack from ppal-infra first.

Run npm run build:android:debug, then npx cap open android.

After adding the Android platform, run scripts/configure-android-local-dev.ps1 to create a debug-only manifest overlay that permits cleartext traffic for the local development API. The overlay is under src/debug and is not included in release manifests. Do not enable cleartext traffic in the main application manifest or in a production build.

Install the debug APK from android/app/build/outputs/apk/debug/app-debug.apk. This build is for local testing only.

## Native project

Generate the platform after installing dependencies with npx cap add android and npx cap sync android.

Commit the Android project source to the feature branch, but do not commit Gradle build outputs, local SDK paths, signing keys, or APK/AAB/IPA artifacts. Build artifacts should be retained as release artifacts, not source files.

## API configuration

- Browser development: http://localhost:3000/api
- Android emulator development: http://10.0.2.2:3000/api
- Production: replace the reserved placeholder origin in environment.prod.ts with a controlled HTTPS deployment before making a release build.

The app intentionally shows a connection error and retry action when the API is unavailable. It must never substitute a fake product list or treat a failed request as an empty pantry.
