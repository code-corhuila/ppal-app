# ppal-app

PantryPal is the required mobile client for the course project. It uses Ionic, Angular standalone components, and Capacitor.

## Repository workflow

The project uses separate repositories and keeps project scope, architecture decisions, and contracts in ppal-docs. The accepted mobile MVP targets one controlled demonstration pantry with online-only operations. The mobile app accesses PostgreSQL only through the REST API.

## Development status

This branch contains the initial Ionic + Angular application scaffold for Activity 3. A successful scaffold build or APK installation does not imply that PantryPal's product features have been implemented. Continue implementation from the reviewed H3 MVP feature branch.

## Requirements

- Node.js and npm
- Android Studio, JDK, and Android SDK for Android builds
- Capacitor CLI matching the declared @capacitor/core version

## Commands

```powershell
npm ci
npm run lint
npm test -- --configuration ci
npm run build
```

The generated www folder and local build output are not source-of-truth files. Do not commit secrets, local SDK paths, keystores, or APK/AAB/IPA binaries.
