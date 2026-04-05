const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8091"
    : "https://turbowz.com/api/stream";

export const videoStreamUrl = (videoUrl: string) =>
  `${BASE_URL}/get-video-stream/${videoUrl}/playlist.m3u8`;
