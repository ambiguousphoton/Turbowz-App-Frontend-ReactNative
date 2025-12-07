import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoEcoCardComponent from '@/components/VideoEcoCardComponent';
import { EcoCardComponent } from '@/components/EcoCardComponent';
import BannerAdComponent from '@/components/BannerAdComponent';
import useFetch from '@/Services/useFetch';
import { GetUser } from '@/HelperFuncs/localStorage';


const fetchRecommendations = async (page: number = 1) => {
  const user = await GetUser();
  const userId = user?.UserID || 27;
  
  try {
    console.log('Fetching for user ID:', userId);
    
    const videosResponse = await fetch(`http://10.0.2.2:8007/recommend-videos-for-user?user_id=${userId}&page=${page}&limit=5`);
    console.log('Videos response status:', videosResponse.status);
    
    const ecosResponse = await fetch(`http://10.0.2.2:8007/recommend-ecos?user_id=${userId}&page=${page}&limit=5`);
    console.log('Ecos response status:', ecosResponse.status);
    
    const adsResponse = await fetch(`http://10.0.2.2:8991/get-b-ads?page=1&limit=10`);
    
    const videos = videosResponse.ok ? await videosResponse.json() : null;
    const ecos = ecosResponse.ok ? await ecosResponse.json() : null;
    const ads = adsResponse.ok ? await adsResponse.json() : null;
    
    console.log('Raw videos data:', JSON.stringify(videos, null, 2));
    console.log('Raw ecos data:', JSON.stringify(ecos, null, 2));
    console.log('Raw ads data:', JSON.stringify(ads, null, 2));
    
    const videoResults = Array.isArray(videos) ? videos : (videos?.results || videos?.data || []);
    const ecoResults = Array.isArray(ecos) ? ecos : (ecos?.results || ecos?.data || []);
    const adResults = Array.isArray(ads) ? ads : [];
    
    console.log('Processed video results:', videoResults?.length || 0);
    console.log('Processed eco results:', ecoResults?.length || 0);
    console.log('Processed ad results:', adResults?.length || 0);
    
    const mixedResults = [];
    
    // Add videos
    if (Array.isArray(videoResults)) {
      videoResults.forEach(video => {
        mixedResults.push({ ...video, type: 'video' });
      });
    }
    
    // Add ecos
    if (Array.isArray(ecoResults)) {
      ecoResults.forEach(eco => {
        mixedResults.push({ ...eco, type: 'eco' });
      });
    }
    
    // Add ads
    if (Array.isArray(adResults)) {
      adResults.forEach(ad => {
        mixedResults.push({ ...ad, type: 'ad' });
      });
    }
    
    // Shuffle content randomly
    const adsOnly = mixedResults.filter(item => item.type === 'ad');
    const contentOnly = mixedResults.filter(item => item.type !== 'ad');
    
    for (let i = contentOnly.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [contentOnly[i], contentOnly[j]] = [contentOnly[j], contentOnly[i]];
    }
    
    console.log('Final mixed results:', contentOnly.length, 'content +', adsOnly.length, 'ads');
    console.log('Ads data being returned:', adsOnly);
    return { results: contentOnly, ads: adsOnly };
  } catch (error) {
    console.error('Fetch error:', error);
    return { results: [] };
  }
};

export default function Enrich() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [globalAdPool, setGlobalAdPool] = useState<any[]>([]);
  const globalAdIndexRef = useRef(0);
  const [selectedFilter, setSelectedFilter] = useState('Mix');
  const filters = ['Mix', 'Videos', 'Ecos'];

  
  const { data: videos, loading, error } = useFetch(() => fetchRecommendations(1), true);
  
  React.useEffect(() => {
    if (videos?.results) {
      const uniqueVideos = videos.results.filter((item: any, index: number, self: any[]) => 
        self.findIndex(v => {
          if (item.type === 'video') return v.Video_ID === item.Video_ID;
          return v.Eco_Id === item.Eco_Id;
        }) === index
      );
      
      // Set up global ad pool
      const ads = videos.ads || [];
      setGlobalAdPool(ads);
      globalAdIndexRef.current = 0;
      
      // Insert ads every 5 items
      const finalResults = [];
      console.log('Available ads for insertion:', ads.length, ads);
      
      for (let i = 0; i < uniqueVideos.length; i++) {
        // Add ad at position 0 and every 5 items
        if (i % 5 === 0 && ads.length > 0) {
          const adToInsert = ads[globalAdIndexRef.current % ads.length];
          console.log('Inserting ad at position', i, 'ad index:', globalAdIndexRef.current, ':', adToInsert);
          finalResults.push(adToInsert);
          globalAdIndexRef.current++;
        }
        finalResults.push(uniqueVideos[i]);
      }
      
      console.log('Final results with ads:', finalResults.length, 'items');
      console.log('Ad items in final results:', finalResults.filter(item => item.type === 'ad').length);
      
      setAllVideos(finalResults);
      setPage(1);
      setHasNextPage(videos.results.length > 0);
    }
  }, [videos]);
  
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newData = await fetchRecommendations(nextPage);
      if (newData?.results?.length) {
        setAllVideos(prev => {
          const newContent = newData.results.filter((item: any, index: number, self: any[]) => 
            self.findIndex(v => {
              if (item.type === 'video') return v.Video_ID === item.Video_ID;
              return v.Eco_Id === item.Eco_Id;
            }) === index
          );
          
          // Insert ads into new content using global ad pool
          const finalNewContent = [];
          const ads = globalAdPool.length > 0 ? globalAdPool : (newData.ads || []);
          console.log('LoadMore - Available ads:', ads.length);
          const currentLength = prev.length;
          
          for (let i = 0; i < newContent.length; i++) {
            const globalIndex = currentLength + finalNewContent.length;
            if (globalIndex % 5 === 0 && ads.length > 0) {
              const adToInsert = ads[globalAdIndexRef.current % ads.length];
              console.log('LoadMore - Inserting ad at global position', globalIndex, 'ad index:', globalAdIndexRef.current, ':', adToInsert);
              finalNewContent.push(adToInsert);
              globalAdIndexRef.current++;
            }
            finalNewContent.push(newContent[i]);
          }
          
          return [...prev, ...finalNewContent];
        });
        setPage(nextPage);
        setHasNextPage(newData.results.length > 0);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.error('Error loading more recommendations:', err);
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasNextPage]);

  if (loading) return (
    <View className="flex-1 bg-white/90">
      <Text className="px-6" style={{ paddingTop: insets.top + 24 }}>Loading recommendations...</Text>
    </View>
  );
  
  if (error) return (
    <View className="flex-1 bg-white/90">
      <Text className="px-6 text-red-500" style={{ paddingTop: insets.top + 24 }}>Error loading recommendations</Text>
    </View>
  );
  
  if (!allVideos.length) return (
    <View className="flex-1 bg-white/90">
      <Text className="px-6" style={{ paddingTop: insets.top + 24 }}>No recommendations found</Text>
    </View>
  );

  const getFilteredData = () => {
    if (selectedFilter === 'Videos') {
      return allVideos.filter(item => item.type === 'video' || item.type === 'ad');
    } else if (selectedFilter === 'Ecos') {
      return allVideos.filter(item => item.type === 'eco' || item.type === 'ad');
    }
    return allVideos;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2"
          style={{ maxHeight: 40 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`mr-3 px-4 py-1 rounded-xl ${
                selectedFilter === filter ? 'bg-black' : 'bg-white border'
              }`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text className={`text-sm font-medium ${
                selectedFilter === filter ? 'text-white' : 'text-gray-700'
              }`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <FlatList
          data={getFilteredData()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.type}-${item.type === 'video' ? item.Video_ID : item.type === 'ad' ? item.ad_id : item.Eco_Id}-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'video') {
              return (
                <VideoEcoCardComponent 
                  VideoURL={item.Video_Url}
                  Title={item.Title}
                  Views={item.Views}
                  Upload_Time={item.Upload_Time}
                  Uploader_Name={item.Uploader_Name}
                  Video_ID={item.Video_ID}
                  Uploader_ID={item.Uploader_ID}
                  Uploader_Handle={item.Uploader_Handle}
                />
              );
            } else if (item.type === 'ad') {
              return (
                <BannerAdComponent 
                  ad_id={item.ad_id}
                  title={item.title}
                  redirect_url={item.redirect_url}
                />
              );
            } else {
              return <EcoCardComponent item={item} />;
            }
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            loadingMore ? <ActivityIndicator size="small" color="black" className="py-4" /> : null
          }
        />
      </ScrollView>
    </View>
  );
}