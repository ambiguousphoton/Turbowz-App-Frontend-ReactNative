import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import VideoCard from '@/components/VideoCardCompnent';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';

const fetchWatchHistory = async (page: number = 1) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:7992/get-user-watch-history?page=${page}&limit=10`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

export default function HistoryPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  const { data: videos, loading, error } = useFetch(() => fetchWatchHistory(1), true);

  React.useEffect(() => {
    if (videos?.results) {
      const uniqueVideos = videos.results.filter((video: any, index: number, self: any[]) => 
        self.findIndex(v => v.Video_ID === video.Video_ID) === index
      );
      setAllVideos(uniqueVideos);
      setPage(1);
      setHasNextPage(videos.results.length === 10);
    }
  }, [videos]);
  
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newData = await fetchWatchHistory(nextPage);
      if (newData?.results?.length) {
        setAllVideos(prev => {
          const combined = [...prev, ...newData.results];
          return combined.filter((video, index, self) => 
            self.findIndex(v => v.Video_ID === video.Video_ID) === index
          );
        });
        setPage(nextPage);
        setHasNextPage(newData.results.length === 10);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.error('Error loading more videos:', err);
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasNextPage]);

  if (loading) return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="black" />
      </View>
    </View>
  );

  if (error) return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Text className="px-4 py-4 text-red-500">Error loading watch history</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Image source={require('@/assets/images/backIcon.png')} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Watch History</Text>
      </View>
      {allVideos.length > 0 ? (
        <FlatList
          data={allVideos}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.Video_ID}
          renderItem={({ item }) => (
            <VideoCard 
              VideoURL={item.Video_Url}
              Title={item.Title}
              Views={item.Views}
              Date={item.Upload_Time}
              UploaderName={item.Uploader_Name}
              VideoID={item.Video_ID}
              UploaderID={item.Uploader_ID}
              UploaderHandle={item.Uploader_Handle}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            loadingMore ? <ActivityIndicator size="small" color="black" className="py-4" /> : null
          }
        />
      ) : (
        <Text className="px-4 text-gray-500">No watch history found</Text>
      )}
    </View>
  );
}