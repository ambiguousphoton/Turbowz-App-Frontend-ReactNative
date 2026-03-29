import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import VideoCard from "../VideoCardCompnent";
import useFetch from "@/Services/useFetch";
import { VideoCardInterface } from "@/interfaces/interfaces";
import { useState, useMemo } from "react";

interface PostsRouteProps {
  userID: number;
  headerComponent?: React.ReactNode;
}

const fetchUserVideos = async (userID: number): Promise<VideoCardInterface[]> => {
  const response = await fetch(`http://10.0.2.2:8082/search-video-with?userID=${userID}`);
  if (!response.ok) throw new Error('Failed to fetch user videos');
  const data = await response.json();

  if (!data || !Array.isArray(data)) return [];
  
  return data.map((video: any) => ({
    VideoID: parseInt(video.Video_ID),
    UploaderName: video.Uploader_Name,
    UploaderHandle: video.Uploader_Handle,
    Title: video.Title,
    Views: video.Views,
    VideoURL: video.Video_Url,
    Date: video.Upload_Time
  }));
};

export const PostsRoute = ({ userID, headerComponent }: PostsRouteProps) => {
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popularity'>('recent');
  const { data: videos, loading, error } = useFetch<VideoCardInterface[]>(() => fetchUserVideos(userID), true);

  const sortedVideos = useMemo(() => {
    if (!videos) return [];
    return [...videos].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.Date).getTime() - new Date(a.Date).getTime();
        case 'oldest':
          return new Date(a.Date).getTime() - new Date(b.Date).getTime();
        case 'popularity':
          return b.Views - a.Views;
        default:
          return 0;
      }
    });
  }, [videos, sortBy]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  const SortButtons = () => (
    <View className="flex-row justify-end items-center mt-3 mb-4 px-3">
      <View className="flex-row bg-gray-100 rounded-2xl p-0.5 shadow-sm">
        {(['recent', 'oldest', 'popularity'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortBy(option)}
            className={`px-3 py-2 mx-0.5 rounded-xl transition-all duration-200 ${
              sortBy === option 
                ? 'bg-black shadow-lg' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`text-sm font-medium capitalize ${
              sortBy === option 
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!videos || videos.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {headerComponent}
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No posts yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedVideos}
        keyExtractor={(item, index) => item.VideoURL || index.toString()}
        renderItem={({ item }) => <VideoCard {...item} />}
        ListHeaderComponent={
          <>
            {headerComponent}
            <SortButtons />
          </>
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}