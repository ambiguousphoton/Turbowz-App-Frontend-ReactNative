import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { timeAgo } from '@/HelperFuncs/timeAgo';

interface FullVideoCardComponentProps {
  VideoURL: string;
  Title: string;
  Views: number;
  Upload_Time: string;
  Uploader_Name: string;
  Video_ID: string;
  Uploader_ID: string;
  Uploader_Handle?: string;
}

export default function FullVideoCardComponent({
  VideoURL,
  Title,
  Views,
  Upload_Time,
  Uploader_Name,
  Video_ID,
  Uploader_ID,
  Uploader_Handle
}: FullVideoCardComponentProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const { GetToken } = await import('@/HelperFuncs/localStorage');
        const token = await GetToken('jwt');
        if (!token) return;
        const response = await fetch(`http://10.0.2.2:8100/video-saved-status?videoID=${Video_ID}`, {
          method: 'POST',
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.saved);
        }
      } catch (error) {
        console.error('Fetch saved status error:', error);
      }
    };
    fetchSavedStatus();
  }, [Video_ID]);

  return (
    <TouchableOpacity 
      className="bg-white px-2 mt-3 pb-9 "
       onPress={() => router.push({pathname:'/videos/[videoID]', params:{videoID:Video_ID, VideoURL :  VideoURL}})}
    >
      <View style={{ position: 'relative' }}>
        {imageError ? (
          <View 
            className="w-full bg-gray-200 justify-center items-center rounded-lg"
            style={{ aspectRatio: 16/9 }}
          >
            <Text className="text-gray-500">No Image</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: `http://10.0.2.2:8088/i?img=${VideoURL}` }}
            className="w-full bg-gray-200 rounded-lg"
            style={{ aspectRatio: 16/9 }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
        <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
          <Image 
            source={require('../assets/images/PlayIcon.png')}
            className="w-4 h-4"
            resizeMode="contain"
            style={{ tintColor: 'white' }}
          />
        </View>
      </View>
      <View className="pt-3 flex-row ">
        {profileImageError ? (
          <View className="w-9 h-9 mr-4 rounded-full bg-primary-25 justify-center items-center">
            <Text className="text-primary text-xs font-semibold">
              {Uploader_Name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        ) : (
          <Image 
            source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${Uploader_ID}` }} 
            className="w-9 h-9 mr-4 rounded-full" 
            resizeMode="cover" 
            onError={() => setProfileImageError(true)}
          />
        )}        
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-black text-base font-medium flex-1 pr-2" numberOfLines={2}>
              {Title}
            </Text>
            <TouchableOpacity 
              className="p-1"
              onPress={async () => {
                try {
                  const { GetToken } = await import('@/HelperFuncs/localStorage');
                  const token = await GetToken('jwt');
                  if (!token) {
                    console.error('Authentication required');
                    return;
                  }
                  const response = await fetch(`http://10.0.2.2:8100/save-video?videoID=${Video_ID}`, {
                    method: 'POST',
                    headers: {
                      'Authorization': token
                    }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    setIsSaved(data.saved);
                  }
                } catch (error) {
                  console.error('Save video error:', error);
                }
              }}
            >
              <Image source={isSaved ? require('../assets/images/SavedIcon.png') : require('../assets/images/SaveIcon.png')} className="w-5 h-5" resizeMode="contain"/>
            </TouchableOpacity>
          </View>
          <Text className="text-secondary text-sm ">{Uploader_Handle}</Text>
          <Text className="text-gray-500 text-xs">
            {Views} views • {timeAgo(Upload_Time)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}