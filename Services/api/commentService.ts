import { CommentInterface } from "@/interfaces/interfaces";

const BASE_URL =
  process.env.EXPO_PUBLIC_TURBOWZ_ENV === "test"
    ? "http://10.0.2.2:7200"
    : "https://turbowz.com/api/comment";

export async function getVideoComments(videoID: number, limit?: number, offset?: number): Promise<CommentInterface[]> {
  const params = limit !== undefined ? `&limit=${limit}&offset=${offset ?? 0}` : "";
  const response = await fetch(`${BASE_URL}/get-comment?videoID=${videoID}${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Failed to fetch comments, ${response.statusText}`);
  return response.json();
}

export async function getEcoComments(ecoID: number) {
  const response = await fetch(`${BASE_URL}/get-eco-comment?ecoID=${ecoID}`);
  if (response.ok) return response.json();
  return null;
}

export async function pushComment(token: string, videoID: number, commentText: string, hasContextFlag: boolean, parentCommentID?: number) {
  const body = `parentVideoID=${videoID}&commentText=${encodeURIComponent(commentText)}&hasContextFlag=${hasContextFlag}${parentCommentID ? `&parentCommentID=${parentCommentID}` : ""}`;
  return fetch(`${BASE_URL}/push-comment`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body,
  });
}

export async function pushEcoComment(token: string, ecoID: number, commentText: string, hasContextFlag: boolean, parentCommentID?: string | number) {
  const params = new URLSearchParams({
    parentEcoID: ecoID.toString(),
    commentText,
    hasContextFlag: hasContextFlag.toString(),
  });
  if (parentCommentID) params.append("parentCommentID", parentCommentID.toString());
  return fetch(`${BASE_URL}/push-eco-comment`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
    body: params.toString(),
  });
}
