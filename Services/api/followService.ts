const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8010"
    : "https://turbowz.com/api/follow";

export async function getFollowingInfo(userID: number | string, requesterID: number | string) {
  const response = await fetch(`${BASE_URL}/get-following-info?userID=${userID}&requesterID=${requesterID}`);
  if (response.ok) return response.json();
  return null;
}

export async function follow(token: string, followeeID: number | string) {
  const response = await fetch(`${BASE_URL}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: `followeeID=${followeeID}`,
  });
  return response.ok;
}

export async function unfollow(token: string, followeeID: number | string) {
  const response = await fetch(`${BASE_URL}/unfollow`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: `followeeID=${followeeID}`,
  });
  return response.ok;
}

export async function getFollowers(userID: number | string) {
  const response = await fetch(`${BASE_URL}/get-followers?checkID=${userID}`);
  if (response.ok) {
    const data = await response.json();
    return data.followers || [];
  }
  return [];
}

export async function getFollowees(userID: number | string) {
  const response = await fetch(`${BASE_URL}/get-followees?checkID=${userID}`);
  if (response.ok) {
    const data = await response.json();
    return data.IsFollowing || [];
  }
  return [];
}
