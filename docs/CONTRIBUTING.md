# Contributing

## Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd FrontendService
npm install
```

### 2. Environment

Create a `.env` file in the project root. The app currently hardcodes `10.0.2.2` (Android emulator loopback) in service files — update these to match your backend setup:

- `Services/VideoDetailsAPI.ts` → port 7999
- `Services/SearchAPI.ts` → port 8082
- `Services/UserAuthMethods.ts` → port 8100
- `context/WebSocketConnectionContext.js` → port 8280

### 3. Run a development build

Expo Go does not support the native modules used in this project. You need a development build:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

Then start the dev server:

```bash
npx expo start --dev-client
```

### 4. Run on simulators

```bash
npx expo run:ios      # Requires Xcode
npx expo run:android  # Requires Android Studio
```

## Project Conventions

### File naming
- Components: `PascalCase.tsx` (e.g., `VideoPlayer.tsx`)
- Services: `PascalCase.ts` (e.g., `SearchAPI.ts`)
- Helpers: `camelCase.ts` (e.g., `timeAgo.ts`)
- Routes: lowercase or `[param].tsx` for dynamic routes

### Styling
- Use NativeWind (Tailwind) classes via `className` prop
- Custom theme colors are defined in `tailwind.config.js`
- Avoid inline `style` objects when a Tailwind class exists

### State
- Global state lives in Context providers (`context/`)
- Local component state uses `useState` / `useReducer`
- No external state library (Redux, Zustand, etc.)

### API calls
- Service functions go in `Services/`
- Use the `useFetch` hook for data fetching with loading/error states
- Auth-protected calls must include the JWT from `GetToken('jwt')`

### Types
- Shared interfaces go in `interfaces/interfaces.ts`
- Component props can be typed inline or in the same file

## Linting

```bash
npm run lint
```

Uses ESLint with the `eslint-config-expo` preset.

## EAS Build Profiles

Defined in `eas.json`:

| Profile | Purpose |
|---|---|
| `development` | Dev client build, internal distribution |
| `preview` | Internal testing build |
| `production` | Production build with auto-incrementing version |
