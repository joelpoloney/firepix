# Firepix

Firepix is a photo sharing app written using the Firebase JS SDK. You can view the
presentation I gave on this at https://goo.gl/ZH6XjW.

## Configuration

1. On the Overview page in the Firebase Console (http://console.firebase.google.com/),
navigate to your project and select `Add Firebase to your web app`. Copy the configuration
into `src/firebase.config.ts`.

2. Add your Firebase projectId to `.firebaserc`.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will
automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/`
directory.

## Deploy to Firebase

Run `firebase deploy` after building your code.
