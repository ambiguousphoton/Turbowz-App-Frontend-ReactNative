import { VideoDetailsInterface } from "@/interfaces/interfaces";

const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7999"
    : "https://turbowz.com/api/video";

export async function fetchVideoDetails(videoID: number, token: string): Promise<VideoDetailsInterface> {
  const response = await fetch(`${BASE_URL}/vmd?video_id=${videoID}`, {
    headers: { Accept: "application/json", Authorization: token },
  });
  if (!response.ok) throw new Error(`Failed to fetch video details, ${response.statusText}`);
  return response.json();
}

export async function getTrendingVideos(limit: number, offset: number, userID: number) {
  const response = await fetch(`${BASE_URL}/get-trending-videos?limit=${limit}&offset=${offset}&userID=${userID}`);
  return response.json();
}

export async function getSavedVideos(token: string, limit: number = 10, offset: number = 0) {
  const response = await fetch(`${BASE_URL}/get-saved-videos?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: token },
  });
  return response.json();
}

export async function getVideoScore(videoID: string | number) {
  const response = await fetch(`${BASE_URL}/get-videos-score?video_id=${videoID}`);
  if (response.ok) return response.json();
  return null;
}

export async function postView(videoID: string | number, userID: number) {
  return fetch(`${BASE_URL}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `video_id=${videoID}&user_id=${userID}`,
  });
}

export async function luvVideo(token: string, videoID: string | number) {
  const response = await fetch(`${BASE_URL}/luv`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: `video_id=${+videoID}`,
  });
  return response.json();
}
