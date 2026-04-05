import {Text, View, ActivityIndicator, Pressable, Image} from 'react-native'
import { router } from 'expo-router'
import React, { useState, useEffect } from "react";
import { eventImageUrl } from '@/Services/api/imageService';

interface EventData {
    Event_Id: number;
    Event_Url: string;
    Event_Title: string;
    Event_Description: string;
    Event_Start_Time: string;
    Uploader_Name: string;
    Images_Count: number;
    Tags: string[];
}

const EventCardSquareComponent = ({event}: {event: EventData}) => {
    const [imageError, setImageError] = useState(false);
    
    const handlePress = () => {
        router.push(`/events/${event.Event_Id}`);
    };

    return (
        <Pressable className="w-48 h-56 bg-white border border-gray-100 rounded-2xl overflow-hidden" onPress={handlePress}>
            {/* Event Image */}
            {event.Images_Count > 0 && !imageError ? (
                <Image 
                    source={{ uri: eventImageUrl(`${event.Event_Url}_0`) }} 
                    className="w-full h-32" 
                    resizeMode="cover" 
                    onError={() => setImageError(true)}
                />
            ) : (
                <View className="w-full h-32 bg-primary-25 justify-center items-center">
                    <Text className="text-4xl">📅</Text>
                </View>
            )}

            {/* Event Info */}
            <View className="p-3">
                <Text className="text-sm font-semibold" numberOfLines={1}>
                    {event.Event_Title}
                </Text>
                <Text className="text-xs text-secondary mt-1" numberOfLines={1}>
                    {new Date(event.Event_Start_Time).toLocaleDateString()}
                </Text>
                {event.Tags && event.Tags.length > 0 && (
                    <View className="flex-row flex-wrap mt-1">
                        {event.Tags.slice(0, 2).map((tag, index) => (
                            <Text key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1">
                                {tag}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        </Pressable>
    )
}

export default EventCardSquareComponent;
