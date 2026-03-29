import { Text, View, Image, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Animated, Dimensions, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import HeaderBar from "../../../components/HeaderBar";
import { FetchVideos, FetchUsers } from "@/Services/SearchAPI";
import useFetch from "@/Services/useFetch";
import { GetUser } from "@/HelperFuncs/localStorage";
import VideoCard from "@/components/VideoCardCompnent";
import UserContactCard from "@/components/UserContactCard";
import { EcoCardComponent } from "@/components/EcoCardComponent";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams } from 'expo-router';
import UserContactCardTypeSearch from "@/components/UserProfileCardTypeSearch";
import TrendingEcoComponent from "@/components/TrendingEcoComponent";
import VideoEcoCardComponent from "@/components/VideoEcoCardComponent";
import EventCardSquareComponent from "@/components/EventCardSquareComponent";


export default function Index() {
  const params = useGlobalSearchParams<{ q?: string }>();
  const initialQuery = params.q ?? '';
  const insets = useSafeAreaInsets();

  const [searchQuerry, setSearchQuerry] = useState<string>(initialQuery);
  const [selectedTag, setSelectedTag] = useState('All');
  const router = useRouter();
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 24) / 2; // 2 columns with padding
  const [page, setPage] = useState(1);
  const [allTrendingContent, setAllTrendingContent] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [videoPage, setVideoPage] = useState(1);
  const [allTrendingVideos, setAllTrendingVideos] = useState<any[]>([]);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);
  const [allTrendingEcos, setAllTrendingEcos] = useState<any[]>([]);
  const [ecoPage, setEcoPage] = useState(1);
  const [loadingMoreEcos, setLoadingMoreEcos] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchVideos, setSearchVideos] = useState<any[]>([]);
  const [searchOffset, setSearchOffset] = useState(0);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  
  const fetchTrendingContent = async (pageNum: number = 1) => {
    const user = await GetUser();
    const userID = user?.UserID || 27;
    const offset = (pageNum - 1) * 10;
    
    const [videosResponse, ecosResponse] = await Promise.all([
      fetch(`http://10.0.2.2:7999/get-trending-videos?limit=10&offset=${offset}&userID=${userID}`),
      fetch(`http://10.0.2.2:7011/get-trending-ecos?limit=10&offset=${offset}`)
    ]);
    
    const videos = await videosResponse.json();
    const ecos = await ecosResponse.json();
    
    // Mix videos and ecos randomly
    const mixed = [];
    const maxLength = Math.max(videos.length, ecos.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (videos[i]) mixed.push({ ...videos[i], type: 'video' });
      if (ecos[i]) mixed.push({ ...ecos[i], type: 'eco' });
    }
    
    return mixed.sort(() => Math.random() - 0.5);
  };
  
  const tags = ['All', 'Videos', 'Users'];
  const trendingTags = ['Videos', 'Ecos'];
  const [selectedTrendingTag, setSelectedTrendingTag] = useState('Videos');
  const {
    data: users,
    loading: usersLoading,
    refetch: usersRefetch,
    reset: usersReset,
    error: usersError,
  } = useFetch(() => FetchUsers({ keyword: searchQuerry }), true);

  const {
    data: videos,
    loading: videosLoading,
    refetch: videosRefetch,
    reset: videosReset,
    error: videosError,
  } = useFetch(() => FetchVideos({ keyword: searchQuerry, limit: 10, offset: 0 }), true);
  
  const {
    data: trendingContent,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(() => fetchTrendingContent(1), true);
  
  useEffect(() => {
    const loadUser = async () => {
      const user = await GetUser();
      setCurrentUser(user);
    };
    loadUser();
    
    fetch('http://10.0.2.2:7002/index-events?limit=20&offset=0')
      .then(res => res.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);



  useEffect(() => {
    if (trendingContent && trendingContent.length > 0) {
      setAllTrendingContent(trendingContent);
      setAllTrendingVideos(trendingContent.filter(item => item.type === 'video'));
      setAllTrendingEcos(trendingContent.filter(item => item.type === 'eco'));
      setEcoPage(1);
      setPage(1);
      setVideoPage(1);
      setHasNextPage(trendingContent.length >= 10);
    }
  }, [trendingContent]);
  
  const loadMoreTrending = async () => {
    if (loadingMore || !hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newContent = await fetchTrendingContent(nextPage);
      if (newContent && newContent.length > 0) {
        setAllTrendingContent(prev => [...prev, ...newContent]);
        setPage(nextPage);
        setHasNextPage(newContent.length >= 10);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading more trending:', error);
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  };
  
  const loadMoreVideos = async () => {
    if (loadingMoreVideos) return;
    
    setLoadingMoreVideos(true);
    try {
      const userID = currentUser?.UserID || 27;
      const nextVideoPage = videoPage + 1;
      const offset = (nextVideoPage - 1) * 10;
      
      const response = await fetch(`http://10.0.2.2:7999/get-trending-videos?limit=10&offset=${offset}&userID=${userID}`);
      const newVideos = await response.json();
      
      if (newVideos && newVideos.length > 0) {
        const videosWithType = newVideos.map((video: any) => ({ ...video, type: 'video' }));
        setAllTrendingVideos(prev => [...prev, ...videosWithType]);
        setVideoPage(nextVideoPage);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMoreVideos(false);
    }
  };
  
  const loadMoreEcos = async () => {
    if (loadingMoreEcos) return;
    
    setLoadingMoreEcos(true);
    try {
      const nextEcoPage = ecoPage + 1;
      const offset = (nextEcoPage - 1) * 10;
      
      const response = await fetch(`http://10.0.2.2:7011/get-trending-ecos?limit=10&offset=${offset}`);
      const newEcos = await response.json();
      
      if (newEcos && newEcos.length > 0) {
        const ecosWithType = newEcos.map((eco: any) => ({ ...eco, type: 'eco' }));
        setAllTrendingEcos(prev => [...prev, ...ecosWithType]);
        setEcoPage(nextEcoPage);
      }
    } catch (error) {
      console.error('Error loading more ecos:', error);
    } finally {
      setLoadingMoreEcos(false);
    }
  };
  
  const handleTrendingScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (selectedTrendingTag === 'Videos') {
        loadMoreVideos();
      } else {
        loadMoreEcos();
      }
    }
    handleScroll(event);
  };

  useEffect(() => {
    if (videos) {
      setSearchVideos(videos);
      setSearchOffset(0);
      setHasMoreSearch(videos.length >= 10);
    }
  }, [videos]);

  useEffect(() => {
    const func = async () => {
      if (searchQuerry.trim()) {
        await videosRefetch();
        await usersRefetch();
      } else {
        videosReset();
        usersReset();
        setSearchVideos([]);
        setSearchOffset(0);
      }
    };
    func();
  }, [searchQuerry]);

  const loadMoreSearchVideos = async () => {
    if (loadingMoreSearch || !hasMoreSearch || !searchQuerry.trim()) return;
    
    setLoadingMoreSearch(true);
    try {
      const newOffset = searchOffset + 10;
      const newVideos = await FetchVideos({ keyword: searchQuerry, limit: 10, offset: newOffset });
      
      if (newVideos && newVideos.length > 0) {
        setSearchVideos(prev => [...prev, ...newVideos]);
        setSearchOffset(newOffset);
        setHasMoreSearch(newVideos.length >= 10);
      } else {
        setHasMoreSearch(false);
      }
    } catch (error) {
      console.error('Error loading more search videos:', error);
      setHasMoreSearch(false);
    } finally {
      setLoadingMoreSearch(false);
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    
    if (diff > 5 && currentScrollY > 50) {
      Animated.timing(headerTranslateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < -5) {
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    lastScrollY.current = currentScrollY;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const newContent = await fetchTrendingContent(1);
      if (newContent) {
        setAllTrendingContent(newContent);
        setAllTrendingVideos(newContent.filter(item => item.type === 'video'));
        setAllTrendingEcos(newContent.filter(item => item.type === 'eco'));
        setPage(1);
        setVideoPage(1);
        setEcoPage(1);
        setHasNextPage(newContent.length >= 10);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ position: 'relative' }}>
      <Animated.View style={{ 
        position: 'absolute', 
        top: insets.top, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        transform: [{ translateY: headerTranslateY }] 
      }}>
        <HeaderBar onSearchPress={() => {
          router.push('/search/Search')
          setSearchQuerry("")
          
        }} SearchTerm={searchQuerry}/>
      </Animated.View>
      
{   searchQuerry  ?   (<ScrollView className="flex-1" onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: insets.top + 60 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4"
          style={{ maxHeight: 32 }}
        >
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              className={`mr-3 px-4 py-1 rounded-xl mt-2 ${
                selectedTag === tag ? 'bg-black' : 'bg-white border '
              }`}
              onPress={() => setSelectedTag(tag)}
            >
              <Text className={`text-sm font-medium ${
                selectedTag === tag ? 'text-white' : 'text-gray-700'
              }`}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {searchQuerry.trim() && (
          <Text className="py-2 px-4 text-base font-bold bg-white">
            The search results for{" "}
            <Text className="text-secondary">{searchQuerry}.</Text>
          </Text>
        )}

        {(videosLoading || usersLoading) ? (
          <ActivityIndicator
            size="large"
            color="black"
            className="mt-10 self-center"
          />
        ) : (videosError || usersError) ? (
          <Text className=" px-4 text-base font-bold text-red-500">
            Error: {videosError?.message || usersError?.message}
          </Text>
        ) : (
          <>
            {selectedTag === 'All' ? (
              <>
                {/* Top 3 Users */}
                {users && users.length > 0 && (
                  <View className="mb-4">
                    <Text className="px-4 py-2 text-lg font-semibold">Top Users</Text>
                    {users.slice(0, 3).map((user) => (
                      <UserContactCardTypeSearch key={user} userID={user} />
                    ))}
                    {users.length > 3 && (
                      <TouchableOpacity 
                        className="px-4 py-2" 
                        onPress={() => setSelectedTag('Users')}
                      >
                        <Text className="text-sm text-secondary font-medium">More users...</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                {/* Videos */}
                {searchVideos && searchVideos.length > 0 && (
                  <View>
                    <Text className="px-4 py-2 text-lg font-semibold">Videos</Text>
                    <FlatList
                      data={searchVideos}
                      showsVerticalScrollIndicator={false}
                      keyExtractor={(item) => item.VideoURL}
                      renderItem={({ item }) => <VideoCard {...item} />}
                      scrollEnabled={false}
                      onEndReached={loadMoreSearchVideos}
                      onEndReachedThreshold={0.5}
                      ListFooterComponent={() => 
                        loadingMoreSearch ? <ActivityIndicator size="small" color="black" className="py-4" /> : null
                      }
                    />
                  </View>
                )}
              </>
            ) : (
              <FlatList
                data={selectedTag === 'Users' ? users || [] : searchVideos}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => selectedTag === 'Users' ? item : item.VideoURL}
                renderItem={({ item }) => selectedTag === 'Users' ? <UserContactCardTypeSearch userID={item} /> : <VideoCard {...item} />}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                onEndReached={() => selectedTag === 'Videos' && loadMoreSearchVideos()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => 
                  loadingMoreSearch ? <ActivityIndicator size="small" color="black" className="py-4" /> : null
                }
              />
            )}
          </>
        )}
      </ScrollView>) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 100 }} onScroll={handleTrendingScroll} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {events.length > 0 && (
            <View className="mb-4">
              <Text className="px-4 py-2 text-lg font-semibold">Upcoming Events</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                {events.map((event) => (
                  <View key={event.Event_Id} className="mr-3">
                    <EventCardSquareComponent event={event} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          {allTrendingVideos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
              {allTrendingVideos.map((video) => (
                <View key={video.Video_ID} className="w-80 mr-3">
                  <VideoEcoCardComponent
                    VideoURL={video.Video_Url}
                    Title={video.Title}
                    Views={video.Views}
                    Upload_Time={video.Upload_Time}
                    Uploader_Name={video.Uploader_Name}
                    Video_ID={video.Video_ID}
                    Uploader_ID={video.Uploader_ID}
                    Uploader_Handle={video.Uploader_Handle}
                  />
                </View>
              ))}
            </ScrollView>
          )}
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-xl font-bold text-black">Trending</Text>
            <Text className="text-sm text-gray-500 mt-1">Popular content right now</Text>
          </View>
          
          {trendingLoading ? (
            <ActivityIndicator size="large" color="black" className="mt-10 self-center" />
          ) : trendingError ? (
            <Text className="px-4 text-base font-bold text-red-500">Error loading trending content</Text>
          ) : (
            <View className="flex-1">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="px-4"
                style={{ maxHeight: 32 }}
              >
                {trendingTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    className={`mr-3 px-4 py-1 rounded-xl mt-2 ${
                      selectedTrendingTag === tag ? 'bg-black' : 'bg-white border '
                    }`}
                    onPress={() => setSelectedTrendingTag(tag)}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedTrendingTag === tag ? 'text-white' : 'text-gray-700'
                    }`}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {selectedTrendingTag === 'Videos' ? (
                allTrendingVideos.map((item) => (
                  <VideoCard 
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
                ))
              ) : (
                <View className="px-3 pt-4">
                  <View className="flex-row justify-between">
                    <View className="flex-1 pr-1">
                      {allTrendingEcos?.filter((_, index) => index % 2 === 0).map((item) => (
                        <TrendingEcoComponent key={`eco-left-${item.Eco_Id}`} item={item} itemWidth={itemWidth} />
                      ))}
                    </View>
                    <View className="flex-1 pl-1">
                      {allTrendingEcos?.filter((_, index) => index % 2 === 1).map((item) => (
                        <TrendingEcoComponent key={`eco-right-${item.Eco_Id}`} item={item} itemWidth={itemWidth} />
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}