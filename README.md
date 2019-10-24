# Birdjet
Personal budgeting android app

## How to run

1. [Create Firebase project](https://firebase.google.com/docs/android/setup#console) to get a `google-services.json` file
containing a set of credentials for Android devices to use when authenticating with your Firebase project.

2. Add the JSON file to the following location:

```
/android/app/google-services.json
```

2. Clone the repo

```
git clone https://github.com/baradusov/birdjet.git
```

3. Install dependencies

```
cd birdjet && yarn install
```

4. Start packager

```
yarn start
```

5. Run the app

```
yarn android
```

## Generate APK

```
cd android
./gradlew assembleRelease
```
Generated APKs can be found under `android/app/build/outputs/apk/release/`
