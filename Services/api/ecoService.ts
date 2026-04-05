const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7011"
    : "https://turbowz.com/api/eco";

export async function getEcoMetadata(ecoID: string | number) {
  const response = await fetch(`${BASE_URL}/emd?eco_id=${ecoID}`);
  if (response.ok) return response.json();
  return null;
}

export async function checkEcoLuvStatus(ecoID: string | number, userID: number) {
  const response = await fetch(`${BASE_URL}/check-eco-luv-status`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `eco_id=${ecoID}&user_ID=${userID}`,
  });
  if (response.ok) return response.json();
  return null;
}

export async function luvEco(token: string, ecoID: string | number) {
  const response = await fetch(`${BASE_URL}/luv`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: `eco_id=${ecoID}`,
  });
  if (response.ok) return response.json();
  return null;
}

export async function getEcoScore(ecoID: string | number) {
  const response = await fetch(`${BASE_URL}/get-echo-score?echo_id=${ecoID}`);
  if (response.ok) return response.json();
  return null;
}

export async function getTrendingEcos(limit: number = 10, offset: number = 0) {
  const response = await fetch(`${BASE_URL}/get-trending-ecos?limit=${limit}&offset=${offset}`);
  if (response.ok) return response.json();
  return [];
}

export async function getSavedEcos(token: string, limit: number = 10, offset: number = 0) {
  const response = await fetch(`${BASE_URL}/get-saved-ecos?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: token },
  });
  if (response.ok) return response.json();
  return [];
}
