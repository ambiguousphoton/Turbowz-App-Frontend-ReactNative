import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import CompactVideoCard from '../CompactVideoCard';
import ActivityHeatmap from '../ActivityHeatmap';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';
import { useRouter } from 'expo-router';
import { getSavedEcos } from '@/Services/api/ecoService';
import { getWatchHistory, getActivityData } from '@/Services/api/activityService';
import { getSavedVideos } from '@/Services/api/videoService';

interface ActivitiesRouteProps {
  userID: number;
  isMyProfile?: boolean;
}

const fetchWatchHistory = async (page: number = 1) => {
  const token = await GetToken('jwt');
  return getWatchHistory(token || '', page, 50);
};

const fetchSavedVideos = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  return getSavedVideos(token || '', 10, offset);
};

const fetchSavedEcos = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  return getSavedEcos(token || '', 10, offset);
};

const fetchActivityDataFn = async (userID: number) => {
  return getActivityData(userID);
};

export const ActivitiesRoute = ({ userID, isMyProfile }: ActivitiesRouteProps) => {
  const router = useRouter();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [savedEcos, setSavedEcos] = useState<any[]>([]);
  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  
  const { data: videos, loading, error } = useFetch(() => fetchWatchHistory(1), true);
  const { data: savedData, loading: savedLoadingState } = useFetch(() => fetchSavedVideos(0), true);
  const { data: savedEcosData, loading: savedEcosLoading } = useFetch(() => fetchSavedEcos(0), true);
  const { data: activityData } = useFetch(() => fetchActivityDataFn(userID), true);
  
  React.useEffect(() => {
    if (videos?.results) {
      setAllVideos(videos.results.slice(0, 5));
      setFullHistory(videos.results);
    }
  }, [videos]);

  React.useEffect(() => {
    if (savedData) {
      setSavedVideos(savedData.slice(0, 5));
    }
  }, [savedData]);

  React.useEffect(() => {
    if (savedEcosData) {
      setSavedEcos(savedEcosData.slice(0, 5));
    }
  }, [savedEcosData]);



  const mindAnalytics = useMemo(() => {
    if (!fullHistory.length) return { tagData: [], creatorData: [] };
    
    const tags: { [key: string]: number } = {};
    const creators: { [key: string]: number } = {};
    const totalVideos = fullHistory.length;
    
    fullHistory.forEach(video => {
      if (video.Tags) {
        video.Tags.forEach((tag: string) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
      if (video.Uploader_Name) {
        creators[video.Uploader_Name] = (creators[video.Uploader_Name] || 0) + 1;
      }
    });
    
    const colors = ['#2563EB', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#0891B2'];
    
    const tagData = Object.entries(tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, population], index) => ({
        value: population,
        color: colors[index % colors.length],
        text: name,
        percentage: ((population / totalVideos) * 100).toFixed(1)
      }));
    
    const creatorData = Object.entries(creators)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, population], index) => ({
        value: population,
        color: colors[index % colors.length],
        text: name,
        percentage: ((population / totalVideos) * 100).toFixed(1)
      }));
    
    return { tagData, creatorData };
  }, [fullHistory]);

  if (loading || savedLoadingState || savedEcosLoading) return <Text className="px-2">Loading activities...</Text>;
  if (error) return <Text className="px-2 text-red-500">Error loading watch history</Text>;

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="py-4">
        {/* Panel 1: Upload Activity */}
        <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
          <Text className="text-lg font-semibold text-black mb-4">Upload Activity</Text>
          <ActivityHeatmap activityData={activityData} />
        </View>

        {/* Panel 2: History - Only for own profile */}
        {isMyProfile && (
          <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => router.push('/history')}
            >
              <Text className="text-lg font-semibold text-black">History</Text>
              <Text className="text-black text-lg">→</Text>
            </TouchableOpacity>
            
            {allVideos.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="-mx-4"
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
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
              <Text className="text-gray-500">No watch history found</Text>
            )}
          </View>
        )}

        {/* Panel 3: Saved Videos - Only for own profile */}
        {isMyProfile && (
          <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => router.push('/saved')}
            >
              <Text className="text-lg font-semibold text-black">Saved Videos</Text>
              <Text className="text-black text-lg">→</Text>
            </TouchableOpacity>
            
            {savedVideos.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="-mx-4"
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
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
              <Text className="text-gray-500">No saved videos found</Text>
            )}
          </View>
        )}

        {/* Panel 3.5: Saved Ecos - Only for own profile */}
        {isMyProfile && (
          <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
            <Text className="text-lg font-semibold text-black mb-4">Saved Ecos</Text>
            {savedEcos.length > 0 ? (
              <View className="flex-row flex-wrap">
                {savedEcos.map((eco) => (
                  <View key={eco.Eco_Id} className="w-1/2 p-1">
                    <TouchableOpacity onPress={() => router.push(`/eco/${eco.Eco_Id}`)}>
                      <Text className="text-sm" numberOfLines={2}>{eco.Content}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500">No saved ecos found</Text>
            )}
          </View>
        )}

        {/* Panel 4: Viewing Analytics - Only for own profile */}
        {isMyProfile && (
          <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setAnalyticsExpanded(!analyticsExpanded)}
            >
              <Text className="text-lg font-semibold text-black">Viewing Analytics</Text>
              <Text className="text-black text-lg">{analyticsExpanded ? '↓' : '→'}</Text>
            </TouchableOpacity>
            
            {analyticsExpanded && (
              <>
                {mindAnalytics.tagData.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-4">Content Categories</Text>
                    <View className="flex-row items-center justify-center">
                      <View className="mr-2">
                        {mindAnalytics.tagData.map((item) => (
                          <View key={item.text} className="flex-row items-center mb-1">
                            <View className="w-3 h-3 rounded mr-2" style={{ backgroundColor: item.color }} />
                            <Text className="text-xs text-gray-600">{item.text} {item.percentage}%</Text>
                          </View>
                        ))}
                      </View>
                      <PieChart
                        data={mindAnalytics.tagData}
                        radius={60}
                        innerRadius={30}
                        showText={false}
                        donut
                      />
                    </View>
                  </View>
                )}
                
                {mindAnalytics.creatorData.length > 0 && (
                  <View>
                    <Text className="text-base font-medium text-gray-700 mb-4">Top Creators</Text>
                    <View className="flex-row items-center justify-center">
                      <View className="mr-2">
                        {mindAnalytics.creatorData.map((item) => (
                          <View key={item.text} className="flex-row items-center mb-1">
                            <View className="w-3 h-3 rounded mr-2" style={{ backgroundColor: item.color }} />
                            <Text className="text-xs text-gray-600">{item.text} {item.percentage}%</Text>
                          </View>
                        ))}
                      </View>
                      <PieChart
                        data={mindAnalytics.creatorData}
                        radius={60}
                        innerRadius={30}
                        showText={false}
                        donut
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};