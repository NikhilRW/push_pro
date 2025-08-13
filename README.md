This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
{
  "name": "push_pro",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest"
  },
  "dependencies": {
    "@react-native-vector-icons/fontawesome": "^12.3.0",
    "@react-native-vector-icons/fontawesome5": "^12.2.0",
    "@react-native-vector-icons/fontawesome6": "^12.2.0",
    "@react-native-vector-icons/fontisto": "^12.3.0",
    "@react-native-vector-icons/foundation": "^12.3.0",
    "nativewind": "^4.1.23",
    "prettier": "^3.6.2",
    "prettier-plugin-tailwindcss": "^0.6.14",
    "react": "19.1.0",
    "react-native": "0.80.0",
    "react-native-fs": "^2.20.0",
    "react-native-haptic-feedback": "^2.3.3",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-reanimated": "3.18.0",
    "react-native-safe-area-context": "^5.5.2",
    "react-native-sound": "^0.12.0",
    "react-native-tts": "^4.1.1",
    "react-native-vision-camera": "4.7.1",
    "react-native-vision-camera-face-detector": "^1.8.6",
    "react-native-worklets-core": "^1.6.0",
    "tailwindcss": "^3.4.17",
    "react-native-gesture-handler": "2.27.1",
    "to-words": "^4.7.0",
    "@shopify/react-native-skia": "2.1.1"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@babel/preset-env": "^7.25.3",
    "@babel/runtime": "^7.25.0",
    "@react-native-community/cli": "19.1.1",
    "@react-native-community/cli-platform-android": "19.1.1",
    "@react-native-community/cli-platform-ios": "19.1.1",
    "@react-native/babel-preset": "0.80.2",
    "@react-native/eslint-config": "0.80.2",
    "@react-native/metro-config": "0.80.2",
    "@react-native/typescript-config": "0.80.2",
    "@types/jest": "^29.5.13",
    "@types/react": "^19.1.0",
    "@types/react-test-renderer": "^19.1.0",
    "eslint": "^8.19.0",
    "jest": "^29.6.3",
    "react-native-dotenv": "3.4.11",
    "react-test-renderer": "19.1.0",
    "typescript": "5.0.4"
  },
  "engines": {
    "node": ">=18"
  }
