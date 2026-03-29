import {CommentInterface} from "@/interfaces/interfaces"
export const fetchComments = async (videoID: number): Promise<CommentInterface[]> => {
  try {
    const response = await fetch(`http://10.0.2.2:7200/get-comment?videoID=${videoID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Comments, ${response.statusText}`);
    }

    const data: CommentInterface[] = await response.json();
    return data;

  } catch (error) {
    throw error;
  }
};