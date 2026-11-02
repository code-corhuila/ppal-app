$ErrorActionPreference = "Stop"

$manifestDirectory = Join-Path $PSScriptRoot "..\android\app\src\debug"
$manifestPath = Join-Path $manifestDirectory "AndroidManifest.xml"
$mainManifest = Join-Path $PSScriptRoot "..\android\app\src\main\AndroidManifest.xml"

if (-not (Test-Path $mainManifest)) {
    throw "Android platform is missing. Run 'npx cap add android' from the app repository root first."
}

New-Item -ItemType Directory -Path $manifestDirectory -Force | Out-Null

@'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true" />
</manifest>
'@ | Set-Content -Path $manifestPath -Encoding utf8

Write-Output "Created debug-only Android manifest overlay at android/app/src/debug/AndroidManifest.xml."
Write-Output "Cleartext traffic is allowed only in debug builds for the local development API. Do not add this setting to the main manifest or release overlays."
