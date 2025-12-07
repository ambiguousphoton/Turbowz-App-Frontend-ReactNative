import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import VideoCard from '@/components/VideoCardCompnent';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';

const fetchSavedVideos = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:7999/get-saved-videos?limit=50&offset=${offset}`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

export default function SavedPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: savedVideos, loading, error } = useFetch(() => fetchSavedVideos(0), true);

  if (loading) return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="black" />
      </View>
    </View>
  );

  if (error) return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Text className="px-4 py-4 text-red-500">Error loading saved videos</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Image source={require('@/assets/images/backIcon.png')} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Saved Videos</Text>
      </View>
      {savedVideos?.length > 0 ? (
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
      ) : (
        <Text className="px-4 text-gray-500">No saved videos found</Text>
      )}
    </View>
  );
}