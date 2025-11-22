import {StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Pressable} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { VideoCardInterface } from '@/interfaces/interfaces'
import React, { useState, useEffect } from "react";




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





const VideoCard =({ VideoID, UploaderName, UploaderHandle, Title, Views, VideoURL, Date, UploaderID}: VideoCardInterface) =>{
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
                const response = await fetch(`http://10.0.2.2:8100/video-saved-status?videoID=${VideoID}`, {
                    method: 'POST',
                    headers: { 'Authorization': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsSaved(data.saved);
                }
            } catch (error) {
                console.error('Fetch saved status error:', error);
            }
        };
        fetchSavedStatus();
    }, [VideoID]);
        
    const imageWidth = Math.min(screenWidth * 0.4, 160);
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
                        className="bg-black justify-center items-center rounded-lg"
                    >
                        <Text className="text-gray-500">No Image</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: `http://10.0.2.2:8088/i?img=${VideoURL}` }}
                        style={{ width: imageWidth, height: imageHeight }}
                        className="rounded-lg"
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                )}
                
                <View className="flex-1 ml-3 justify-start">
                    <Text numberOfLines={2} className="text-base  mb-2">{Title}</Text>
                    
                    
                    <View className="flex-row flex-wrap">
                        <Text className="text-secondary text-xs mr-2">{UploaderHandle}</Text>
                        <Text className="text-gray-400 text-xs mr-2">{Views} Views</Text>
                        <Text className="text-gray-400 text-xs">{timeAgo(Date)}</Text>
                    </View>
                    
                    <View className="flex-row mt-2 items-center justify-between">
                        <View className="flex-row">
                            <Text className="text-xs bg-yellow-100 rounded-full px-2  mr-1">com</Text>
                            <Text className="text-xs bg-pink-100 rounded-full px-2  mr-1">rom</Text>
                            <Text className="text-xs bg-purple-100 rounded-full px-2 ">sci-fi</Text>
                        </View>
                        <TouchableOpacity 
                            className="p-1"
                            onPress={async () => {
                                try {
                                    const { GetToken } = await import('@/HelperFuncs/localStorage');
                                    const token = await GetToken('jwt');
                                    if (!token) {
                                        console.error('Authentication required');
                                        return;
                                    }
                                    const response = await fetch(`http://10.0.2.2:8100/save-video?videoID=${VideoID}`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': token
                                        }
                                    });
                                    if (response.ok) {
                                        const data = await response.json();
                                        setIsSaved(data.saved);
                                    }
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