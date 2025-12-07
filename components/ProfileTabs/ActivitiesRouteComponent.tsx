import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import CompactVideoCard from '../CompactVideoCard';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  
  const { data: videos, loading, error } = useFetch(() => fetchWatchHistory(1), true);
  const { data: savedData, loading: savedLoadingState } = useFetch(() => fetchSavedVideos(0), true);
  console.log(videos);
  console.log("============================================"
  )
  React.useEffect(() => {
    if (videos?.results) {
      setAllVideos(videos.results.slice(0, 5));
    }
  }, [videos]);

  React.useEffect(() => {
    if (savedData) {
      setSavedVideos(savedData.slice(0, 5));
    }
  }, [savedData]);

  if (loading || savedLoadingState) return <Text className="px-2">Loading activities...</Text>;
  if (error) return <Text className="px-2 text-red-500">Error loading watch history</Text>;

  return (
    <ScrollView className="px-2 my-3">
      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2"
        onPress={() => router.push('/history')}
      >
        <Text className="text-lg font-semibold">History</Text>
        <Text className="text-gray-500">→</Text>
      </TouchableOpacity>
      
      {allVideos.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {allVideos.map((item) => (
            <CompactVideoCard 
              key={item.Video_ID}
              VideoURL={item.Video_Url}
              Title={item.Title}
              Views={item.Views}
              Date={item.Upload_Time}
              UploaderName={item.Uploader_Name}
              VideoID={item.Video_ID}
              UploaderID={item.Uploader_ID}
              UploaderHandle={item.Uploader_Handle}
            />
          ))}
        </ScrollView>
      ) : (
        <Text className="px-2 text-gray-500 mb-4">No watch history found</Text>
      )}

      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2 mt-4"
        onPress={() => router.push('/saved')}
      >
        <Text className="text-lg font-semibold">Saved Videos</Text>
        <Text className="text-gray-500">→</Text>
      </TouchableOpacity>
      
      {savedVideos.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {savedVideos.map((item) => (
            <CompactVideoCard 
              key={item.Video_ID}
              VideoURL={item.Video_Url}
              Title={item.Title}
              Views={item.Views}
              Date={item.Upload_Time}
              UploaderName={item.Uploader_Name}
              VideoID={item.Video_ID}
              UploaderID={item.Uploader_ID}
              UploaderHandle={item.Uploader_Handle}
            />
          ))}
        </ScrollView>
      ) : (
        <Text className="px-2 text-gray-500">No saved videos found</Text>
      )}
    </ScrollView>
  );
};