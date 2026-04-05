const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8080"
    : "https://turbowz.com/api/upload";

const VMD_BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7999"
    : "https://turbowz.com/api/vmd";

export async function pollVideoStatus(videoId: number, onReady: () => void, intervalMs = 5000) {
  const id = setInterval(async () => {
    try {
      const res = await fetch(`${VMD_BASE_URL}/video-status?video_id=${videoId}`);
      const data = await res.json();
      if (data.status === "ready") {
        clearInterval(id);
        onReady();
      }
    } catch {}
  }, intervalMs);
  return () => clearInterval(id);
}

export async function uploadVideo(token: string, formData: FormData) {
  return fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: token },
    body: formData,
  });
}

export async function uploadEco(token: string, formData: FormData) {
  return fetch(`${BASE_URL}/eco-upload`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "multipart/form-data" },
    body: formData,
  });
}

export async function uploadEvent(token: string, formData: FormData) {
  return fetch(`${BASE_URL}/event-upload`, {
    method: "POST",
    headers: { Authorization: token },
    body: formData,
  });
}

export async function uploadProfilePicture(token: string, formData: FormData) {
  return fetch(`${BASE_URL}/pfp-upload`, {
    method: "POST",
    headers: { Authorization: token },
    body: formData,
  });
}
