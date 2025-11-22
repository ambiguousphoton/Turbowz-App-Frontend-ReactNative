import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import VideoCard from '../VideoCardCompnent';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';

interface ActivitiesRouteProps {
  userID: number;
}

const fetchWatchHistory = async (page: number = 1) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:7992/get-user-watch-history?page=${page}&limit=10`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

const fetchSavedVideos = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:7999/get-saved-videos?limit=10&offset=${offset}`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

export const ActivitiesRoute = ({ userID }: ActivitiesRouteProps) => {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isSavedExpanded, setIsSavedExpanded] = useState(false);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  
  const { data: videos, loading, error } = useFetch(() => fetchWatchHistory(1), true);
  const { data: savedData, loading: savedLoadingState } = useFetch(() => fetchSavedVideos(0), true);
  console.log(videos);
  console.log("============================================"
  )
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

  React.useEffect(() => {
    if (savedData) {
      setSavedVideos(savedData);
    }
  }, [savedData]);
  
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

  if (loading || savedLoadingState) return <Text className="px-2">Loading activities...</Text>;
  if (error) return <Text className="px-2 text-red-500">Error loading watch history</Text>;
  if (!allVideos.length) return <Text className="px-2">No watch history found</Text>;

  return (
    <View className="px-2 my-3">
      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2"
        onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
      >
        <Text className="text-lg font-semibold">History</Text>
        <Text className="text-gray-500">{isHistoryExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isHistoryExpanded && (
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
      )}

      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2 mt-4"
        onPress={() => setIsSavedExpanded(!isSavedExpanded)}
      >
        <Text className="text-lg font-semibold">Saved Videos</Text>
        <Text className="text-gray-500">{isSavedExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isSavedExpanded && (
        <FlatList
          data={savedVideos}
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
        />
      )}
    </View>
  );
};