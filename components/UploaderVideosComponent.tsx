import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import useFetch from "@/Services/useFetch";
import { VideoCardInterface } from "@/interfaces/interfaces";
import { timeAgo } from "@/HelperFuncs/timeAgo";

interface MoreFromUploaderProps {
  uploaderID: number;
  uploaderName: string;
  currentVideoID: number;
}

import { searchVideosByUser } from "@/Services/api/searchService";
import { imageUrl } from "@/Services/api/imageService";

export default function UploaderVideosComponent({ uploaderID, uploaderName, currentVideoID }: MoreFromUploaderProps) {
  const { data: videos, loading } = useFetch<VideoCardInterface[]>(() => searchVideosByUser(uploaderID), true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const filteredVideos = videos?.filter(video => video.VideoID !== currentVideoID)
    .sort((a, b) => b.Views - a.Views)
    .slice(0, 10) || [];

  if (loading || !filteredVideos.length) return null;

  const handleImageError = (videoID: number) => {
    setImageErrors(prev => new Set([...prev, videoID]));
  };

  const renderVideoItem = ({ item }: { item: VideoCardInterface }) => (
    <TouchableOpacity
      className="w-64 mr-4 bg-white rounded-xl p-3"
      onPress={() => router.push(`/videos/${item.VideoID}?VideoURL=${item.VideoURL}`)}
    >
      {imageErrors.has(item.VideoID) ? (
        <View className="bg-gray-200 rounded-xl h-36 mb-3 justify-center items-center">
          <Text className="text-gray-500">No Image</Text>
        </View>
      ) : (
        <Image 
          source={{ uri: imageUrl(item.VideoURL) }}
          className="w-full h-36 rounded-xl mb-3"
          resizeMode="cover"
          onError={() => handleImageError(item.VideoID)}
        />
      )}
      <Text className="text-gray-900 font-semibold text-sm mb-1" numberOfLines={2}>
        {item.Title}
      </Text>
      <Text className="text-gray-600 text-xs">
        {item.Views} views • {timeAgo(item.Date)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-6 bg-gray-100 py-4">
      <Text className="text-gray-900 font-black text-xl mb-4 mx-4 tracking-wider" style={{ textShadowColor: '#fbbf24', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>
        MORE FROM {uploaderName.toUpperCase()}
      </Text>
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.VideoID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}