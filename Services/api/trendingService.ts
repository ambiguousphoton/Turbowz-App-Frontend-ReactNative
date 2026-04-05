const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:9090"
    : "https://turbowz.com/api/trending";

export { BASE_URL as TRENDING_BASE_URL };
