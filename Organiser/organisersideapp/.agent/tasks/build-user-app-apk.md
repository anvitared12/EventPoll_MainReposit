---
description: Build APK for User App
---

# Build APK for User App

## Current Situation

- EAS Build is failing with an error
- Build logs are not accessible without logging into Expo dashboard
- Need to create an APK file for the user app

## Options to Build APK

### Option 1: Fix EAS Build (Cloud Build)

**Pros:**

- No local setup required
- Handles all dependencies automatically
- Can build for multiple platforms

**Cons:**

- Requires Expo account login
- Build logs not immediately visible
- Debugging is harder

**Steps:**

1. Log into Expo account in browser
2. View build logs at: https://expo.dev/accounts/fighter_flamingo/projects/usersideapp/builds/be856166-0305-45ec-8603-a97a724396a9
3. Identify the error from logs
4. Fix the issue in code
5. Retry the build

### Option 2: Local Build with EAS Build

**Pros:**

- Full control over build process
- Immediate error visibility
- No cloud queue wait time

**Cons:**

- Requires Android SDK and Java setup
- More complex local environment

**Steps:**

1. Install Android SDK and Java JDK
2. Set up environment variables (ANDROID_HOME, JAVA_HOME)
3. Run: `eas build --platform android --profile apk --local`

### Option 3: Expo Development Build

**Pros:**

- Quick for testing
- Good for development

**Cons:**

- Not suitable for distribution
- Requires Expo Go or development client

## Recommended Approach

**Option 1** - Fix EAS Build by viewing the logs in the browser, as it's the simplest and most reliable for production APKs.

## Next Steps

1. User logs into Expo dashboard in browser
2. View build error logs
3. Fix identified issues
4. Retry build
