import { searchVideos } from "./api/searchService";
import { searchUsers } from "./api/userService";

export const FetchVideos = ({ keyword, limit, offset }: { keyword: string; limit?: number; offset?: number }) =>
  searchVideos({ keyword, limit, offset });

export const FetchUsers = ({ keyword }: { keyword: string }) =>
  searchUsers(keyword);
