import { UserSignUpInterface, UserSignInInterface } from "@/interfaces/interfaces";

const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8100"
    : "https://turbowz.com/api/user/";

// --- Auth ---

export async function verifyEmail(email: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email }).toString(),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function confirmEmail(email: string, otp: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/confirm-email`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, otp }).toString(),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function signUpAccount(user: UserSignUpInterface): Promise<{ token: string; userID: string }> {
  const response = await fetch(`${BASE_URL}/create-new-account`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(user as Record<string, string>).toString(),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function signInAccount(user: UserSignInInterface): Promise<{ token: string; userID: string }> {
  const response = await fetch(`${BASE_URL}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(user as Record<string, string>).toString(),
  });
  if (!response.ok) throw new Error(`Failed to sign in account: ${response.statusText}`);
  return response.json();
}

// --- User ---

export async function getUser(userID: number | string) {
  const response = await fetch(`${BASE_URL}/get-user?userID=${userID}`);
  return response.json();
}

export async function getTurbomaxStatus(userID: number | string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/get-turbomax-status?userID=${userID}`);
  const data = await res.json();
  return data.turbomax_active || false;
}

export async function searchUsers(keyword: string): Promise<string[]> {
  const endpoint = keyword
    ? `${BASE_URL}/search-users?keyword=${encodeURIComponent(keyword)}`
    : `${BASE_URL}/search-users?keyword=`;
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Failed to fetch user search results, ${response.statusText}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function updateProfile(token: string, fields: { user_handle: string; user_profile_name: string; userDescription: string; fromLocation: string; gender: string }) {
  const body = new URLSearchParams(fields).toString();
  return fetch(`${BASE_URL}/update-profile`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

// --- Save / Status ---

export async function videoSavedStatus(token: string, videoID: string | number) {
  const response = await fetch(`${BASE_URL}/video-saved-status?videoID=${videoID}`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (response.ok) return response.json();
  return null;
}

export async function saveVideo(token: string, videoID: string | number) {
  const response = await fetch(`${BASE_URL}/save-video?videoID=${videoID}`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (response.ok) return response.json();
  return null;
}

export async function ecoSavedStatus(token: string, ecoID: string | number) {
  const response = await fetch(`${BASE_URL}/eco-saved-status?ecoID=${ecoID}`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (response.ok) return response.json();
  return null;
}

export async function saveEco(token: string, ecoID: string | number) {
  const response = await fetch(`${BASE_URL}/save-eco?ecoID=${ecoID}`, {
    method: "POST",
    headers: { Authorization: token },
  });
  if (response.ok) return response.json();
  return null;
}

export async function saveEvent(token: string, eventID: string | number) {
  const response = await fetch(`${BASE_URL}/save-event?eventID=${eventID}`, {
    method: "POST",
    headers: { Authorization: token || "" },
  });
  if (response.ok) return response.json();
  return null;
}
