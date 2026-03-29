import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import VideoCard from '@/components/VideoCardCompnent';
import useFetch from '@/Services/useFetch';
import { GetToken, GetUser } from '@/HelperFuncs/localStorage';

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
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: any[]}>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: videos, loading, error } = useFetch(() => fetchWatchHistory(1), true);

  React.useEffect(() => {
    if (videos?.results) {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const videoMap = new Map();
      
      videos.results.forEach((video: any) => {
        const watchedAt = new Date(video.Watched_At);
        const videoId = video.Video_ID;
        
        if (!videoMap.has(videoId) || watchedAt > new Date(videoMap.get(videoId).Watched_At)) {
          videoMap.set(videoId, video);
        }
      });
      
      const uniqueVideos = Array.from(videoMap.values());
      setAllVideos(uniqueVideos);
      
      // Group by date
      const grouped = uniqueVideos.reduce((acc: {[key: string]: any[]}, video) => {
        const watchDate = new Date(video.Watched_At).toDateString();
        if (!acc[watchDate]) acc[watchDate] = [];
        acc[watchDate].push(video);
        return acc;
      }, {});
      setGroupedVideos(grouped);
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
          const videoMap = new Map();
          
          combined.forEach((video: any) => {
            const watchedAt = new Date(video.Watched_At);
            const videoId = video.Video_ID;
            
            if (!videoMap.has(videoId) || watchedAt > new Date(videoMap.get(videoId).Watched_At)) {
              videoMap.set(videoId, video);
            }
          });
          
          const uniqueVideos = Array.from(videoMap.values());
          
          // Group by date
          const grouped = uniqueVideos.reduce((acc: {[key: string]: any[]}, video) => {
            const watchDate = new Date(video.Watched_At).toDateString();
            if (!acc[watchDate]) acc[watchDate] = [];
            acc[watchDate].push(video);
            return acc;
          }, {});
          setGroupedVideos(grouped);
          
          return uniqueVideos;
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
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Image source={require('@/assets/images/backIcon.png')} className="w-6 h-6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Watch History</Text>
        </View>
        <TouchableOpacity 
          className="bg-red-500 px-4 py-2 rounded-full flex-row items-center"
          onPress={() => setShowDeleteModal(true)}
        >
          <Image source={require('@/assets/images/backIcon.png')} className="w-3 h-3 mr-1" style={{ tintColor: 'white', transform: [{ rotate: '180deg' }] }} />
          <Text className="text-white text-sm font-semibold">Clear All</Text>
        </TouchableOpacity>
      </View>
      {Object.keys(groupedVideos).length > 0 ? (
        <FlatList
          data={Object.entries(groupedVideos).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())}
          showsVerticalScrollIndicator={false}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, videos] }) => (
            <View>
              <Text className="px-4 py-2 text-lg font-semibold bg-gray-100">{date}</Text>
              {videos.map((video) => (
                <VideoCard 
                  key={video.Video_ID}
                  VideoURL={video.Video_Url}
                  Title={video.Title}
                  Views={video.Views}
                  Date={video.Upload_Time}
                  UploaderName={video.Uploader_Name}
                  VideoID={video.Video_ID}
                  UploaderID={video.Uploader_ID}
                  UploaderHandle={video.Uploader_Handle}
                />
              ))}
            </View>
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
      
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">Delete History</Text>
            <Text className="text-gray-600 text-center mb-8 leading-6">
              Are you sure you want to delete all your watch history? This action cannot be undone.
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 py-4 rounded-full"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-red-500 py-4 rounded-full"
                onPress={async () => {
                  try {
                    const user = await GetUser();
                    const userID = user?.UserID;
                    if (!userID) return;
                    
                    const response = await fetch(`http://10.0.2.2:7992/delete-my-history?userID=${userID}`);
                    if (response.ok) {
                      setAllVideos([]);
                      setGroupedVideos({});
                      setShowDeleteModal(false);
                      Alert.alert("Success", "Watch history deleted successfully");
                    }
                  } catch (error) {
                    Alert.alert("Error", "Failed to delete watch history");
                  }
                }}
              >
                <Text className="text-white text-center font-semibold text-base">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}