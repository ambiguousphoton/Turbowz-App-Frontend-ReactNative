const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7992"
    : "https://turbowz.com/api/activity";

export async function getWatchHistory(token: string, page: number = 1, limit: number = 10) {
  const response = await fetch(`${BASE_URL}/get-user-watch-history?page=${page}&limit=${limit}`, {
    headers: { Authorization: token },
  });
  return response.json();
}

export async function deleteMyHistory(userID: number) {
  const response = await fetch(`${BASE_URL}/delete-my-history?userID=${userID}`);
  return response.ok;
}

export async function getActivityData(userID: number) {
  const response = await fetch(`${BASE_URL}/get-activity-data?userID=${userID}`);
  return response.json();
}

export async function postVideoVote(videoId: number, userId: number, quality: number, aiUsage: number) {
  return fetch(`${BASE_URL}/post-video-vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, user_id: userId, quality, ai_usage: aiUsage }),
  });
}

export async function postEcoVote(ecoId: number, userId: number, quality: number, aiUsage: number) {
  return fetch(`${BASE_URL}/post-echo-vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eco_id: ecoId, user_id: userId, quality, ai_usage: aiUsage }),
  });
}
