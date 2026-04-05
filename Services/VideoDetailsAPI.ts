import { GetToken } from "@/HelperFuncs/localStorage";
import { fetchVideoDetails as _fetchVideoDetails } from "./api/videoService";

export const fetchVideoDetails = async (videoID: number) => {
  const token = await GetToken("jwt");
  if (!token) throw new Error("Authentication required");
  return _fetchVideoDetails(videoID, token);
};
