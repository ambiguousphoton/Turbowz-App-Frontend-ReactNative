# Turbowz — Frontend Service

A cross-platform social media mobile application built with React Native and Expo. Turbowz lets users share videos, create eco-posts, chat in real-time, discover content, and connect with other users.

## Features

- **Video Sharing** — Upload, watch, and interact with videos (luv, comment, save, share)
- **Eco Posts** — Create and browse text/image-based posts with voting and comments
- **Real-time Chat** — WebSocket-powered messaging with local SQLite persistence
- **Content Discovery** — Search for videos and users, explore content by tags, view watch history
- **Events** — Create and browse community events
- **User Profiles** — Customizable profiles with followers/following, activity heatmaps, and profile tabs (posts, ecos, shop, activities)
- **Authentication** — JWT-based sign-up/sign-in with secure token storage

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 53) / React Native 0.79 |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Styling | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for RN) |
| State | React Context (Auth, WebSocket) |
| Storage | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (tokens), [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (messages) |
| Real-time | WebSocket (auto-reconnect) |
| JS Engine | Hermes (New Architecture enabled) |
| 3D | Three.js via expo-three |

## Project Structure

```
app/
├── (tabs)/              # Bottom tab navigator
│   ├── enrich.tsx       # Content discovery / explore feed
│   ├── index/           # Home feed (videos)
│   ├── create.tsx       # Create content (bottom sheet trigger)
│   ├── chats.tsx        # Chat list
│   └── myprofile.tsx    # Current user profile
├── auth/                # Welcome, sign-in, sign-up screens
├── videos/[videoID].tsx # Video detail & player
├── ecos/[ecoID].tsx     # Eco post detail
├── events/[eventID].tsx # Event detail
├── chats/[userID].tsx   # Chat conversation
├── search/              # Search screen
├── share/               # Share content screen
├── settings/            # User settings
├── create-video.tsx     # Video upload flow
├── create-eco.tsx       # Eco post upload flow
├── create-event.tsx     # Event creation flow
├── update-profile.tsx   # Edit profile
├── followers.tsx        # Followers list
├── following.tsx        # Following list
├── history.tsx          # Watch history
└── saved.tsx            # Saved content

components/              # Reusable UI components
Services/                # API service functions
HelperFuncs/             # Utilities (localStorage, time, constants, message storage)
context/                 # React Context providers (Auth, WebSocket)
interfaces/              # TypeScript interfaces
assets/                  # Images, fonts, 3D objects
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For native builds: Xcode (iOS) / Android Studio (Android)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo dev server
npx expo start

# Platform-specific
npx expo run:ios
npx expo run:android
npx expo start --web
```

### Development Build

This project uses a [development build](https://docs.expo.dev/develop/development-builds/introduction/) with native modules (expo-sqlite, expo-secure-store, expo-video, etc.) that require a custom native runtime rather than Expo Go.

```bash
# Build for internal distribution
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Environment

Create a `.env` file in the project root with your backend service URLs. The app currently expects the following backend services:

| Service | Default Port | Purpose |
|---|---|---|
| Video Metadata | 7999 | Video details API |
| Search | 8082 | Video search |
| User Service | 8100 | Auth, user search, profiles |
| WebSocket | 8280 | Real-time messaging |

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run on web |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to blank app directory |

## Content Tags

Videos and ecos can be tagged with categories: Learning, Video Games, Anime, Cartoons, Comedy, Science, Music, Action, Adventure, Culture, Movies, Romance, Horror, Religious, Kids Shows, Story, Fiction, History, Education.

## License

Private project.
