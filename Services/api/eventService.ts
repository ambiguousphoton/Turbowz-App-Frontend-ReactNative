const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7002"
    : "https://turbowz.com/api/event";

export async function getEventMetadata(eventID: string | number) {
  const response = await fetch(`${BASE_URL}/event-md?event_id=${eventID}`);
  if (response.ok) return response.json();
  return null;
}

export async function getIndexEvents(limit: number = 20, offset: number = 0) {
  const response = await fetch(`${BASE_URL}/index-events?limit=${limit}&offset=${offset}`);
  if (response.ok) return response.json();
  return [];
}

export async function luvEvent(token: string, eventID: string | number) {
  const response = await fetch(`${BASE_URL}/luv-event`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: `event_id=${eventID}`,
  });
  if (response.ok) return response.json();
  return null;
}
