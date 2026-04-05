const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8991"
    : "https://turbowz.com/api/ads";

export async function getBannerAds(page: number = 1, limit: number = 10) {
  const response = await fetch(`${BASE_URL}/get-b-ads?page=${page}&limit=${limit}`);
  return response.ok ? response.json() : [];
}
