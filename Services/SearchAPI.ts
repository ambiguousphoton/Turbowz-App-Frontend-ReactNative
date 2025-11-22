import { VideoCardInterface } from "@/interfaces/interfaces";

export const FetchVideos = async ({keyword}: {keyword: string}) => {

    const endpoint = keyword 
    ? `http://10.0.2.2:8082/search?keyword=${encodeURIComponent(keyword)}`
    : `http://10.0.2.2:8082/search?keyword=hostel`

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    })
    if (!response.ok){
        throw new Error(`Failed to fetch search results, ${response.statusText}` );
    }

    const rawData = await response.json();
    if (!rawData || !Array.isArray(rawData)) {
        return [];
    }
    // Transform API response to match VideoCardInterface
    const data: VideoCardInterface[] = rawData.map((video: any) => ({
        VideoID: video.VideoID,
        UploaderName: video.UploaderName,
        UploaderHandle: video.UploaderHandle,
        UploaderID: video.UploaderID,
        Title: video.Title,
        Views: video.Views,
        VideoURL: video.VideoURL,
        Date: video.Date
    }));
    return data;
}

export const FetchUsers = async ({keyword}: {keyword: string}) => {
    const endpoint = keyword 
    ? `http://10.0.2.2:8100/search-users?keyword=${encodeURIComponent(keyword)}`
    : `http://10.0.2.2:8100/search-users?keyword=`

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    })
    if (!response.ok){
        throw new Error(`Failed to fetch user search results, ${response.statusText}` );
    }

    const data: string[] = await response.json();
    if (!data || !Array.isArray(data)) {
        return [];
    }
    return data;
} 


