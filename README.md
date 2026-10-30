# ppal-app

PantryPal is the required mobile client for the course project. It uses Ionic, Angular standalone components, and Capacitor.

## Accepted MVP

The first release targets one controlled demonstration pantry and online-only CRUD operations. It includes product validation (positive quantities with at most three decimal places, and integer counts for Units/Packages), expiration classification, sorting by expiration date, loading/empty/error states, and search as a lower-priority convenience. There are no accounts, login, camera access, native reminders, offline cache, or offline writes. See ADR-002 in ppal-docs for the authoritative scope.

This app must not be presented as a public multi-user service while its API has no authentication.

## Architecture

The client follows a feature-first structure and the dependency direction presentation -> domain <- data:

- Domain contains product types, validation rules, expiration calculations, and the repository contract.
- Data implements the contract through one configured Angular HttpClient.
- Presentation uses an Angular Signals facade/ViewModel with explicit immutable screen state.
- The API is the source of truth; the client does not connect directly to PostgreSQL.

## Requirements

- Node.js 24.15 or newer (Angular 22 / H3 toolchain requirement)
- npm
- Android Studio, JDK 21, Android SDK and an Android emulator for Android testing
- Docker Desktop and the sibling ppal-api, ppal-db, and ppal-infra repositories for the full local flow

## Install and validate

Commands: npm ci, npm run lint, npm run test:ci, and npm run build.

The production build uses a placeholder HTTPS API origin until a real deployment URL is configured in src/environments/environment.prod.ts. Do not release that placeholder configuration to users.

## Android debug workflow

The development environment targets the host machine's API from an Android emulator through 10.0.2.2:3000. Start the local API and PostgreSQL stack from ppal-infra first.

The native request path enables CapacitorHttp in `capacitor.config.ts`, so Angular HttpClient requests are routed through Capacitor's native HTTP layer on supported native platforms rather than being blocked as WebView mixed content. The Android emulator URL remains `http://10.0.2.2:3000/api`. This local HTTP configuration is for controlled debug use only; a release build must use a real HTTPS API endpoint.

The Haptics and Status Bar plugins are isolated behind TypeScript ports and Capacitor adapters registered at the application composition root. These selected UI plugins require no runtime permission; camera, geolocation, and notifications remain out of MVP scope in ADR-002. Unit tests use hand-written doubles for the Haptics port and verify root registration of the Status Bar port.

Run npm run build:android:debug, then npx cap open android.

After adding the Android platform, run scripts/configure-android-local-dev.ps1 to create android/app/src/debug/AndroidManifest.xml, a debug-only manifest overlay that permits cleartext traffic for the local development API. Do not enable cleartext traffic in the main manifest or release manifest. Do not enable cleartext traffic in the main application manifest or in a production build.

Install the debug APK from android/app/build/outputs/apk/debug/app-debug.apk. This build is for local testing only.

## Native project

Generate the platform after installing dependencies with npx cap add android and npx cap sync android.

Commit the Android project source to the feature branch, but do not commit Gradle build outputs, local SDK paths, signing keys, or APK/AAB/IPA artifacts. Build artifacts should be retained as release artifacts, not source files.

## API configuration

- Browser development: http://localhost:3000/api
- Android emulator development: http://10.0.2.2:3000/api
- Production: replace the reserved placeholder origin in environment.prod.ts with a controlled HTTPS deployment before making a release build.

The app intentionally shows a connection error and retry action when the API is unavailable. It must never substitute a fake product list or treat a failed request as an empty pantry. On native platforms, successful create, update, and delete operations provide a best-effort light haptic acknowledgement; this feedback never determines whether a server operation succeeded.
