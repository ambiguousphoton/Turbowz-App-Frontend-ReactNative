import { View, Text, FlatList, ActivityIndicator } from "react-native";
import VideoCard from "../VideoCardCompnent";
import useFetch from "@/Services/useFetch";
import { VideoCardInterface } from "@/interfaces/interfaces";

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
  const { data: videos, loading, error } = useFetch<VideoCardInterface[]>(() => fetchUserVideos(userID), true);

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
        data={videos}
        keyExtractor={(item, index) => item.VideoURL || index.toString()}
        renderItem={({ item }) => <VideoCard {...item} />}
        ListHeaderComponent={headerComponent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}