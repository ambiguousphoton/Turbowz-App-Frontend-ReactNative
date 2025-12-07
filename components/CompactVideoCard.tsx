import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { timeAgo } from '@/HelperFuncs/timeAgo';

interface CompactVideoCardProps {
  VideoURL: string;
  Title: string;
  Views: number;
  Date: string;
  UploaderName: string;
  VideoID: string;
  UploaderID: number;
  UploaderHandle: string;
}

export default function CompactVideoCard({
  VideoURL,
  Title,
  Views,
  Date,
  UploaderName,
  VideoID,
  UploaderID,
  UploaderHandle
}: CompactVideoCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);



  return (
    <TouchableOpacity 
      className="w-48 bg-white rounded-lg shadow-sm border border-gray-100 mr-3"
      onPress={() => router.push({pathname:'/videos/[videoID]', params:{videoID:VideoID, VideoURL: VideoURL}})}
    >
      {imageError ? (
        <View className="w-full h-24 bg-gray-200 justify-center items-center rounded-t-lg">
          <Text className="text-gray-500 text-xs">No Image</Text>
        </View>
      ) : (
        <Image 
          source={{ uri: `http://10.0.2.2:8088/i?img=${VideoURL}` }}
          className="w-full h-24 rounded-t-lg bg-gray-200"
          onError={() => setImageError(true)}
        />
      )}
      <View className="p-3">
        <Text className="font-medium text-sm text-black mb-1" numberOfLines={2}>
          {Title}
        </Text>
        <Text className="text-xs text-gray-500 mb-1">{UploaderName}</Text>
        <Text className="text-xs text-gray-400">
          {Views} views • {timeAgo(Date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}