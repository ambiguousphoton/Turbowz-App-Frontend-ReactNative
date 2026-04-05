const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8007"
    : "https://turbowz.com/api/recommend";

export async function recommendSimilarVideos(videoID: number, page: number = 1, limit: number = 5) {
  const response = await fetch(`${BASE_URL}/recommend?video_id=${videoID}&page=${page}&limit=${limit}`);
  return response.json();
}

export async function recommendVideosForUser(userId: number, page: number = 1, limit: number = 5) {
  const response = await fetch(`${BASE_URL}/recommend-videos-for-user?user_id=${userId}&page=${page}&limit=${limit}`);
  return response.ok ? response.json() : [];
}

export async function recommendEcosForUser(userId: number, page: number = 1, limit: number = 5) {
  const response = await fetch(`${BASE_URL}/recommend-ecos?user_id=${userId}&page=${page}&limit=${limit}`);
  return response.ok ? response.json() : [];
}
