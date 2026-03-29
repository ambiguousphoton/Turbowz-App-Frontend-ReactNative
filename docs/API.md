# API Reference

This document describes the backend API endpoints consumed by the Turbowz frontend.

## Authentication

### Sign Up
```
POST /create-new-account
Host: :8100
Content-Type: application/x-www-form-urlencoded
```

**Body:**
| Field | Type | Description |
|---|---|---|
| `user_handle` | string | Unique username |
| `user_profile_name` | string | Display name |
| `userDescription` | string | Bio |
| `fromLocation` | string | Location |
| `userDateOfBirth` | string | Date of birth |
| `gender` | string | Gender |
| `email` | string | Email address |
| `phoneNumber` | string | Phone number |
| `password` | string | Password |

**Response:** `{ "token": "<jwt>", "userID": "<id>" }`

### Sign In
```
POST /authenticate
Host: :8100
Content-Type: application/x-www-form-urlencoded
```

**Body:**
| Field | Type |
|---|---|
| `user_handle` | string |
| `password` | string |

**Response:** `{ "token": "<jwt>", "userID": "<id>" }`

---

## Videos

### Get Video Details
```
GET /vmd?video_id={videoID}
Host: :7999
Authorization: <jwt>
```

**Response:**
```json
{
  "VideoID": 1,
  "Uploader_Name": "string",
  "Uploader_ID": 1,
  "Uploader_Handle": "string",
  "Title": "string",
  "Views": 100,
  "Video_Info": "string",
  "Luvs": 50,
  "Upload_Time": "2025-01-01T00:00:00Z",
  "Already_Luved": false,
  "Tags": ["learn", "sci"]
}
```

---

## Search

### Search Videos
```
GET /search?keyword={query}&limit={n}&offset={n}
Host: :8082
```

**Response:** Array of `VideoCardInterface` objects.

### Search Users
```
GET /search-users?keyword={query}
Host: :8100
```

**Response:** Array of user handle strings.

---

## WebSocket (Chat)

### Connect
```
ws://{host}:8280/connect-with-socket-server?user={userID}
Headers:
  Authorization: <jwt>
```

### Message Format
```json
{
  "messageText": "string",
  "sourceID": "number",
  "destinationID": "number",
  "roomID": "string",
  "links": "string"
}
```

Messages received via `onmessage` are automatically persisted to the local SQLite database.

---

## Data Models

### VideoCardInterface
```typescript
{
  VideoID: number
  UploaderName: string
  UploaderHandle: string
  UploaderID?: number
  Title: string
  Views: number
  VideoURL: string
  Tags: string[]
  Date: string
}
```

### EcoDataInterface
```typescript
{
  Eco_Text: string
  Eco_Id: number
  Eco_Url: string
  Images_Count: number
  Created_At: string
  View_Count: number
  Comment_Count: number
  Luv_Count: number
  Uploader_Name: string
  Uploader_Handle: string
  Uploader_ID: number
  Save_Count: number
  Already_Luved: boolean
  Tags: string[]
}
```

### UserDataInterface
```typescript
{
  UserID: number
  UserHandle: string
  UserProfileName: string
  UserDescription: string
  FromLocation: string
  Gender: string
}
```

### MessageData
```typescript
{
  Message_ID: number
  Message_Text: string
  Source_ID: number
  Destination_ID: number
  Source_Sent_Time: string
  links: string
  Destination_Receive_Time: string
  Room_ID: string
}
```

### CommentInterface
```typescript
{
  Commenter_Name: string
  Comment_id: number
  Commenter_id: number
  Parent_video_id: number
  Comment_text: string
  Comment_date: string
  Commenter_Handle: string
  hasContextFlag?: boolean
  Parent_Comment_ID?: { Int64: number; Valid: boolean }
}
```
