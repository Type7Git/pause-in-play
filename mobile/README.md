# Lumenera: phone app (Capacitor)

This folder wraps the Lovable web app in a native Android and iOS shell. The web app itself is untouched and still built in Lovable.

**How it works right now (test phase):** the app opens the live site at `https://pause-in-play.lovable.app` inside a native shell, with native splash screen, icons, status bar, back button, an offline page and the permissions for reminders and the microphone. Anything you publish in Lovable appears in the app straight away, with no rebuild.

- App ID: `au.com.type7.pauseinplay` (kept from the Pause in Play test builds; it is never shown to users, but it is permanent once published to a store, so change it before the first store release if you want `au.com.type7.lumenera`)
- App name: Lumenera
- Capacitor 8

## Get the Android test app

1. On GitHub, open **Actions** → **Android test build** → the latest green run.
2. Under **Artifacts**, download **lumenera-test-apk** (a zip containing `app-debug.apk`).
3. Send the APK to your Android phone (email, Google Drive, or USB) and open it.
4. Allow "Install unknown apps" for whichever app you opened it from, then install.

A new APK is built automatically whenever anything in `mobile/` changes on the `capacitor` branch. You only need a new APK when the native shell changes; web changes from Lovable show up by themselves.

## iPhone (needs the Mac)

1. Install Xcode from the Mac App Store, and Node.js 22.
2. `git clone` this repo, `git checkout capacitor`, then in `mobile/`: `npm ci && npx cap sync ios && npx cap open ios`.
3. In Xcode: select the App target → Signing & Capabilities → sign in with your Apple ID (Personal Team) → plug in your iPhone → Run.
   A free Apple ID install expires after 7 days. TestFlight replaces this once the Apple Developer account is approved.

## Regenerate icons and splash screens

Replace the PNGs in `mobile/assets/` and run `npm run assets` then `npx cap sync`. `mobile/store/` holds the Play Store feature graphic.

- Android 12 and newer show the flower (`drawable-*/splash_icon.png`) on blush (`values*/splash_colors.xml`); older Android shows the full splash picture.
- The native splash hands over to the web app's own loading screen (the flower blooming with rising bubbles, in `src/components/BootSplash.tsx` on main), which hides the native splash as soon as it appears. The native splash hides itself after 4 seconds at most.
- Test builds are signed with `android/app/lumenera-test.keystore` so each new APK installs over the last. It's a test key only: the Play Store release needs its own upload key, kept out of the repo.

## Before store submission (to do)

- Move from loading the live URL to a bundled build (SPA mode) that calls the hosted server functions, so the app works offline and meets Apple's minimum-functionality rule.
- Wire native plugins into the web app: local notifications for reminders, haptics, share sheet, biometric lock for Intimacy and relationships, native push via Firebase Cloud Messaging.
- Release signing (Play upload key, Apple certificates) in the cloud build service.
