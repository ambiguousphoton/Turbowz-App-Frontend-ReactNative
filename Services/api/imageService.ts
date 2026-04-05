const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8088"
    : "https://turbowz.com/api/image";

export const imageUrl = (videoUrl: string) => `${BASE_URL}/i?img=${videoUrl}`;
export const pfpUrl = (userId: number | string) => `${BASE_URL}/pfp?user_id=${userId}`;
export const ecoImageUrl = (ecoUrl: string, index: number) => `${BASE_URL}/e?eco_url=${ecoUrl}&index=${index}`;
export const eventImageUrl = (eventUrl: string) => `${BASE_URL}/event-img?event_url=${eventUrl}`;
export const adImageUrl = (adId: number | string) => `${BASE_URL}/ad?ad_id=${adId}`;
