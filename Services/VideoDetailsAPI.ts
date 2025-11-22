import {VideoDetailsInterface} from "@/interfaces/interfaces"
import { GetToken } from "@/HelperFuncs/localStorage";

export const fetchVideoDetails = async (videoID : number): Promise<VideoDetailsInterface> =>{

    try{
        const token = await GetToken('jwt');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`http://10.0.2.2:7999/vmd?video_id=${videoID}`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                Authorization: token
            }
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch video details, ${response.statusText}`)
        }
        const data: VideoDetailsInterface = await response.json()

        return data

    }catch (error){
        console.log(error)
        throw error 
    }
}