# Architecture

## Overview

Turbowz is a React Native mobile app built on Expo SDK 53 with file-based routing (Expo Router). It follows a microservice-oriented frontend pattern — the app communicates with four independent backend services over REST and WebSocket.

## App Lifecycle

```
App Launch
  └─ _layout.tsx
       ├─ AuthProvider (wraps entire app)
       │    └─ Checks SecureStore for JWT
       └─ WebSocketProvider (wraps entire app)
            └─ SQLiteProvider (messages.db)
                 └─ Stack Navigator (headerless)
                      ├─ (tabs)/ — authenticated users
                      └─ auth/  — unauthenticated users
```

On launch, `AuthContext` checks for a stored JWT. If no session exists, the tab layout redirects to `auth/Welcome`. Once authenticated, the WebSocket provider establishes a persistent connection for real-time messaging.

## Navigation

File-based routing via Expo Router. The bottom tab navigator has five tabs:

| Tab | Route | Screen |
|---|---|---|
| Enrich | `(tabs)/enrich` | Content discovery / explore feed |
| Home | `(tabs)/index` | Video feed (nested layout with user sub-routes) |
| Create | `(tabs)/create` | Triggers a bottom sheet (not a screen) |
| Chats | `(tabs)/chats` | Chat list |
| Profile | `(tabs)/myprofile` | Current user's profile |

Dynamic routes use bracket syntax: `videos/[videoID]`, `ecos/[ecoID]`, `events/[eventID]`, `chats/[userID]`.

## State Management

Two React Context providers at the root level:

### AuthContext (`context/AuthContext.js`)
- Manages `session` (boolean) and `user` state
- Provides `signInSession(token, userData)` and `signOutSession()`
- Persists JWT and user data via `expo-secure-store`
- Falls back to `localStorage` on web

### WebSocketContext (`context/WebSocketConnectionContext.js`)
- Wraps children in `SQLiteProvider` for message persistence
- Maintains a WebSocket connection with auto-reconnect (2s delay)
- Sends JWT in WebSocket handshake headers
- Incoming messages are saved to SQLite via `MessageStorage.ts`
- Exposes `connected`, `messages`, and `sendMessage()` to consumers

## Data Layer

### API Services (`Services/`)

| File | Endpoints | Auth |
|---|---|---|
| `UserAuthMethods.ts` | `POST /create-new-account`, `POST /authenticate` | No |
| `VideoDetailsAPI.ts` | `GET /vmd?video_id=` | JWT (Authorization header) |
| `SearchAPI.ts` | `GET /search?keyword=`, `GET /search-users?keyword=` | No |
| `GetCommentsAPI.ts` | Comments endpoint | — |
| `useFetch.ts` | Generic fetch hook with loading/error state | — |

### Local Storage (`HelperFuncs/`)

| File | Purpose |
|---|---|
| `localStorage.ts` | JWT & user data via SecureStore, search history (capped at 10) |
| `MessageStorage.ts` | SQLite CRUD for chat messages, uses `fbemitter` for DB change events |
| `timeAgo.ts` | Relative time formatting |
| `constants.ts` | Content tag definitions (19 categories with colors) |

## Styling

NativeWind (Tailwind CSS for React Native) with a custom theme:

```
Primary colors: #DBFCFF (25) → #05BAFF (200)
Secondary: #FE68E0 (pink)
Accent: #E5FF01 (wierd/yellow-green)
```

Custom utilities for shape variants: `.shape-circle`, `.shape-square`, `.shape-diamond`.

## TypeScript Interfaces

Defined in `interfaces/interfaces.ts`:

- `VideoCardInterface` / `VideoDetailsInterface` — video metadata
- `EcoDataInterface` — eco post data (text, images, votes, tags)
- `UserSignUpInterface` / `UserSignInInterface` — auth payloads
- `UserDataInterface` — user profile data
- `CommentInterface` — comment with nested reply support
- `MessageData` — chat message structure

## Key Components

| Component | Purpose |
|---|---|
| `VideoPlayer.tsx` | Full video player with controls |
| `EcoCardComponent.tsx` | Eco post card with voting |
| `CommentSection.tsx` | Threaded comments |
| `CreateBottomSheet.tsx` | Content creation menu (video, eco, event) |
| `ProfileHeadBanner.tsx` | Profile header with avatar and stats |
| `ActivityHeatmap.tsx` | GitHub-style activity visualization |
| `ContactsComponent.tsx` | Chat contacts list |
| `UserProfileCardTypeSearch.tsx` | User card in search results |
| `Simple3DModel.tsx` | 3D model rendering via expo-three |

## Backend Services

The app expects four backend services running locally (default `10.0.2.2` for Android emulator):

```
:7999  — Video Metadata Service (video details, luvs, views)
:8082  — Search Service (video search, pagination)
:8100  — User Service (auth, profiles, user search, followers)
:8280  — WebSocket Service (real-time chat)
```

All REST calls use `fetch()`. Auth-protected endpoints send the JWT in the `Authorization` header.
