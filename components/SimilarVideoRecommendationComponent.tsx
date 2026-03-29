import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import FullVideoCardComponent from './FullVideoCardComponent';
import useFetch from '@/Services/useFetch';
interface SimilarVideoRecommendationComponentProps {
  videoID: number;
}

const fetchSimilarVideos = async (videoID: number, page: number = 1) => {
  const response = await fetch(`http://10.0.2.2:8007/recommend?video_id=${videoID}&page=${page}&limit=5`);
  return response.json();
};

export default function SimilarVideoRecommendationComponent({ videoID }: SimilarVideoRecommendationComponentProps) {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  const { data: videos, loading, error } = useFetch(() => fetchSimilarVideos(videoID, 1), true);
  
  React.useEffect(() => {
    if (videos?.results) {
      setAllVideos(videos.results);
      setPage(1);
      setHasNextPage(videos.results.length === 5);
    }
  }, [videos]);
  
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newData = await fetchSimilarVideos(videoID, nextPage);
      if (newData?.results?.length) {
        setAllVideos(prev => [...prev, ...newData.results]);
        setPage(nextPage);
        setHasNextPage(newData.results.length === 5);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.error('Error loading more videos:', err);
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  }, [videoID, page, loadingMore, hasNextPage]);

  // Similar videos data

  if (loading) return <Text className="px-2">Loading similar videos...</Text>;
  if (error) return <Text className="px-2 text-red-500">Error loading similar videos</Text>;
  if (!allVideos.length) return <Text className="px-2">No similar videos found</Text>;

  return (
    <View className="px-2 my-3">
      {/* <Text className="text-lg font-semibold mb-2">Similar Videos</Text> */}
      <FlatList
        data={allVideos}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.Video_ID}
        renderItem={({ item }) => (
          <FullVideoCardComponent 
            VideoURL={item.Video_Url}
            Title={item.Title}
            Views={item.Views}
            Upload_Time={item.Upload_Time}
            Uploader_Name={item.Uploader_Name}
            Video_ID={item.Video_ID}
            Uploader_ID={item.Uploader_ID}
            Uploader_Handle={item.Uploader_Handle}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          loadingMore ? <ActivityIndicator size="small" color="black" className="py-4" /> : null
        }
      />
    </View>
  );
}