import {StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Pressable} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { VideoCardInterface } from '@/interfaces/interfaces'
import React, { useState, useEffect } from "react";
import { TagsDisplay } from './TagsDisplay';
import { videoSavedStatus, saveVideo } from '@/Services/api/userService';
import { imageUrl } from '@/Services/api/imageService';




function timeAgo(timestamp: string | number | Date) {
  const now = new Date();
  const date = new Date(timestamp); // works with ISO strings with timezone
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    yrs: 31536000,   // 365*24*60*60
    month: 2592000,   // 30*24*60*60
    week: 604800,     // 7*24*60*60
    day: 86400,       // 24*60*60
    hr: 3600,       // 60*60
    min: 60,
    sec: 1,
  };

  for (const unit in intervals) {
    const interval = Math.floor(seconds / intervals[unit]);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}





const VideoCard =({ VideoID, UploaderName, UploaderHandle, Title, Views, VideoURL, Date, UploaderID, Tags}: VideoCardInterface) =>{
    const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
    const [isPressed, setIsPressed] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({ window }) => {
        setScreenWidth(window.width);
        });

        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        const fetchSavedStatus = async () => {
            try {
                const { GetToken } = await import('@/HelperFuncs/localStorage');
                const token = await GetToken('jwt');
                if (!token) return;
                const data = await videoSavedStatus(token, VideoID);
                if (data) setIsSaved(data.saved);
            } catch (error) {
                console.error('Fetch saved status error:', error);
            }
        };
        fetchSavedStatus();
    }, [VideoID]);
        
    const imageWidth = Math.min(screenWidth * 0.5, 200);
    const imageHeight = (imageWidth * 9) / 16;



    return (
        <Pressable  
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={() => router.push({pathname:'/videos/[videoID]', params:{videoID:VideoID, VideoURL :  VideoURL}})}
            className={`flex-row p-3 mb-4 ${isPressed ? "bg-gray-100" : "bg-white"}`}
        >
                {imageError ? (
                    <View 
                        style={{ width: imageWidth, height: imageHeight }}
                        className="bg-black justify-center items-center rounded-2xl"
                    >
                        <Text className="text-gray-500">No Image</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: imageUrl(VideoURL) }}
                        style={{ width: imageWidth, height: imageHeight }}
                        className="rounded-2xl"
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                )}
                
                <View className="flex-1 ml-3 justify-start">
                    <Text numberOfLines={2} className="text-base  mb-2">{Title}</Text>
                    
                    
                    <View>
                        <Text className="text-secondary text-sm">{UploaderHandle}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-sm">{Views} views</Text>
                        <Text className="text-gray-400 text-sm mx-2">•</Text>
                        <Text className="text-gray-400 text-sm">{timeAgo(Date)}</Text>
                    </View>
                    
                    <View className="flex-row mt-2 items-center">
                        <View className="flex-1 mr-2">
                            <TagsDisplay tags={Tags} />
                        </View>
                        <TouchableOpacity 
                            className="p-1 ml-1"
                            onPress={async () => {
                                try {
                                    const { GetToken } = await import('@/HelperFuncs/localStorage');
                                    const token = await GetToken('jwt');
                                    if (!token) {
                                        console.error('Authentication required');
                                        return;
                                    }
                                    const data = await saveVideo(token, VideoID);
                                    if (data) setIsSaved(data.saved);
                                } catch (error) {
                                    console.error('Save video error:', error);
                                }
                            }}
                        >
                            <Image source={isSaved ? require("../assets/images/SavedIcon.png") : require("../assets/images/SaveIcon.png")} className="w-5 h-5" resizeMode="contain"/>
                        </TouchableOpacity>
                    </View>
                </View>
        </Pressable>
    )
}
export default VideoCard;