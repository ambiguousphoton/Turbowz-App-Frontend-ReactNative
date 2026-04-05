import { VideoCardInterface, EcoDataInterface } from "@/interfaces/interfaces";

const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:8082"
    : "https://turbowz.com/api/search";

export async function searchVideos({ keyword, limit = 10, offset = 0 }: { keyword: string; limit?: number; offset?: number }): Promise<VideoCardInterface[]> {
  const q = keyword || "hostel";
  const response = await fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Failed to fetch search results, ${response.statusText}`);
  const rawData = await response.json();
  if (!Array.isArray(rawData)) return [];
  return rawData.map((video: any) => ({
    VideoID: video.VideoID,
    UploaderName: video.UploaderName,
    UploaderHandle: video.UploaderHandle,
    UploaderID: video.UploaderID,
    Title: video.Title,
    Views: video.Views,
    VideoURL: video.VideoURL,
    Date: video.Date,
    Tags: video.Tags,
  }));
}

export async function searchVideosByUser(userID: number): Promise<VideoCardInterface[]> {
  const response = await fetch(`${BASE_URL}/search-video-with?userID=${userID}`);
  if (!response.ok) throw new Error("Failed to fetch user videos");
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((video: any) => ({
    VideoID: parseInt(video.Video_ID),
    UploaderName: video.Uploader_Name,
    UploaderHandle: video.Uploader_Handle,
    Title: video.Title,
    Views: video.Views,
    VideoURL: video.Video_Url,
    Date: video.Upload_Time,
  }));
}

export async function searchEcosByUser(userID: number): Promise<EcoDataInterface[]> {
  const response = await fetch(`${BASE_URL}/search-eco-by-user?userID=${userID}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Failed to fetch user ecos (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((eco: any) => ({
    Eco_Id: eco.Eco_Id,
    Eco_Url: eco.Eco_Url,
    Eco_Text: eco.Eco_Text,
    Images_Count: eco.Images_Count,
    Created_At: eco.Created_At,
    View_Count: eco.View_Count,
    Comment_Count: eco.Comment_Count,
    Luv_Count: eco.Luv_Count,
    Tags: eco.Tags || [],
    Uploader_ID: eco.Uploader_ID,
    Uploader_Name: eco.Uploader_Name,
    Uploader_Handle: eco.Uploader_Handle,
    Save_Count: eco.Saves_Count || 0,
    Already_Luved: eco.Already_Luved ?? false,
  }));
}
