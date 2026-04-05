import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useLocalSearchParams, useFocusEffect, router} from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Animated, Share, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetToken } from "@/HelperFuncs/localStorage";
import useFetch from "@/Services/useFetch";
import { fetchVideoDetails } from "@/Services/VideoDetailsAPI";
import CommentSectionComponent from "@/components/CommentSection";
import CommentInputComponent from "@/components/CommentInput";
import {timeAgo} from "@/HelperFuncs/timeAgo";
import PrimaryButtonComponent from "@/components/Buttons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView,BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import VideoPlayer from "@/components/VideoPlayer";
import SimilarVideoRecommendationComponent from "@/components/SimilarVideoRecommendationComponent";
import UploaderVideosComponent from "@/components/UploaderVideosComponent";
import UploaderEcosComponent from "@/components/UploaderEcosComponent";
import { StatusBar } from "expo-status-bar";
import { GetUser } from "@/HelperFuncs/localStorage";
import ContentPageHeader from "@/components/ContentPageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GliterAlertComponent from "@/components/GliterAlertComponent";
import VotePanelComponent from "@/components/VotePanelComponent";
import { ALLOWED_TAGS } from "@/HelperFuncs/constants";
import ContentQualityBadge from "@/components/ContentQualityBadge";
import { videoSavedStatus, getTurbomaxStatus, saveVideo } from "@/Services/api/userService";
import { getVideoComments } from "@/Services/api/commentService";
import { getFollowingInfo, follow, unfollow } from "@/Services/api/followService";
import { pfpUrl } from "@/Services/api/imageService";
import { getVideoScore, postView, luvVideo } from "@/Services/api/videoService";
import { videoStreamUrl } from "@/Services/api/streamService";
     
export default function VideoPage() {
  const { videoID, VideoURL } = useLocalSearchParams();
  const { data: vmd, loading, error } = useFetch(() => fetchVideoDetails(+videoID));
  
  useEffect(() => {
    console.log('VMD Data:', vmd);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [vmd, loading, error]);
  
  const refreshRef = useRef<(() => void) | null>(null);
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [CommentSectionVisible, setCommentSectionVisible] = useState(false);
  const [isLuvved, setIsLuvved] = useState(false);
  const [initialLuvCount, setInitialLuvCount] = useState(0);
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isTurboVerified, setIsTurboVerified] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [comments, setComments] = useState([]);
  const [commentIndex, setCommentIndex] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [votePanelExpanded, setVotePanelExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoQuality, setVideoQuality] = useState<number>(0);
  const [videoAIUsage, setVideoAIUsage] = useState<number>(0);

  const luvAnimScale = useRef(new Animated.Value(1)).current;
  const shareAnimScale = useRef(new Animated.Value(1)).current;
  const promoteAnimScale = useRef(new Animated.Value(1)).current;
  const commentsAnimScale = useRef(new Animated.Value(1)).current;
  
  const animateButton = (animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };
  const snapPoints = useMemo(() => ['71%', "90%"], []);
  const videoSource = videoStreamUrl(VideoURL as string);
  const videoPlayerRef = useRef<any>(null);
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (videoPlayerRef.current?.player) {
          videoPlayerRef.current.player.pause();
        }
      };
    }, [])
  );

  


  useEffect(() => {
    if (vmd?.Already_Luved !== undefined) {
      setIsLuvved(vmd.Already_Luved);
      setInitialLuvCount(vmd.Luvs || 0);
    }
  }, [vmd]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const token = await GetToken('jwt');
        if (!token) return;
        const data = await videoSavedStatus(token, videoID as string);
        if (data) setIsSaved(data.saved);
      } catch (error) {
        console.error('Fetch saved status error:', error);
      }
    };
    fetchSavedStatus();
  }, [videoID]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const localUser = await GetUser();
      setCurrentUserID(localUser?.UserID || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const getFollowInfo = async () => {
      if (currentUserID && vmd?.Uploader_ID) {
        try {
          const data = await getFollowingInfo(vmd.Uploader_ID, currentUserID);
          if (data) setFollowInfo(data);
        } catch (error) {
          console.error('Error fetching follow info:', error);
        }
      }
    };
    getFollowInfo();
  }, [currentUserID, vmd?.Uploader_ID]);

  useEffect(() => {
    if (vmd?.Uploader_ID) {
      getTurbomaxStatus(vmd.Uploader_ID)
        .then(setIsTurboVerified)
        .catch(() => setIsTurboVerified(false));
    }
  }, [vmd?.Uploader_ID]);

  useEffect(() => {
    if (videoID) {
      getVideoScore(videoID)
        .then(data => {
          setVideoQuality(data?.Video_Quality?.Valid ? data.Video_Quality.Float64 : 0);
          setVideoAIUsage(data?.Video_AI_Usage?.Valid ? data.Video_AI_Usage.Float64 : 0);
        })
        .catch(() => {
          setVideoQuality(0);
          setVideoAIUsage(0);
        });
    }
  }, [videoID]);

  useEffect(() => {
    const fetchCommentsPreview = async () => {
      try {
        const data = await getVideoComments(+videoID, 3, 0);
        const commentsArray = data.comments || data || [];
        setComments(commentsArray);
      } catch (error) {
        // Error fetching comments preview
      }
    };

    if (videoID) {
      fetchCommentsPreview();
      const interval = setInterval(() => {
        setCommentIndex(prev => (prev + 1) % 3);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [videoID]);

  useEffect(() => {
    const updateView = async () => {
      try {
        const userData = await GetUser();
        const userID = userData?.UserID;
        if (!userID) {
          Alert.alert("Error", "Authentication required.");
          return;
        }

        console.log('====================================');
        console.log(userID);
        console.log('====================================');
        
        await postView(videoID, userID);
        console.log("View updated!");
      } catch (err) {
        console.error("Failed to update view:", err);
      }
    };

    updateView();
  }, [videoID]);




  const handleOpenPressComments = () => {
    setIsOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSheetChanges = useCallback((index: number) => {
    setIsOpen(index >= 0);
  }, []);

  const handleFollow = async () => {
    try {
      const authToken = await GetToken('jwt');
      const isUnfollow = followInfo?.AlreadyFollowed;
      const success = isUnfollow
        ? await unfollow(authToken || '', vmd?.Uploader_ID)
        : await follow(authToken || '', vmd?.Uploader_ID);
      if (success) {
        setFollowInfo(prev => prev ? {...prev, AlreadyFollowed: !prev.AlreadyFollowed, FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1} : null);
      }
    } catch (error) {
      // Follow/Unfollow error
    }
  };



  return (
      <>
       <View className="flex-1 bg-white m-0">
      {!isFullscreen && (
        <View style={{ paddingTop: insets.top }}>
          <StatusBar style="dark" backgroundColor="white" />
          <ContentPageHeader onSearchPress={() => router.push('/search/Search')} SearchTerm="" showBack />
        </View>
      )}
      <GestureHandlerRootView>
      
      <VideoPlayer 
        ref={videoPlayerRef}
        videoSource={videoSource}
        style={{ width: "100%", height: 250, backgroundColor: "black" }}
        onFullscreenChange={setIsFullscreen}
        onTimestampCopy={(timestamp) => {
          setAlertMessage(`Timestamp ${timestamp} copied!`);
          setAlertVisible(true);
        }}
      />
      <GliterAlertComponent 
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
      />
      <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
        <View className="mx-4 my-4">
          <View className="flex-row justify-between items-start mb-4">
            {vmd?.Title && (
              <View className="flex-1 mr-4">
                <Text 
                  className="text-gray-900 text-lg font-bold mb-2 leading-6" 
                  numberOfLines={titleExpanded ? undefined : 2}
                  onPress={() => setTitleExpanded(!titleExpanded)}
                >
                  {vmd.Title}
                </Text>
                 <View className='flex-row'>
                        <Text className="bg-gray-600 text-white px-2  rounded-l-lg font-semibold text-sm">
                          {vmd?.Views} views
                        </Text>
                        <Text className="bg-secondary text-white px-2  rounded-r-lg font-semibold text-sm">
                          {timeAgo(vmd?.Upload_Time)}
                        </Text>
                        {/* <Text className='bg-yellow-200 text-black px-2 rounded-l-lg font-semibold  ml-5 text-sm'>AI</Text>
                        <Text className='bg-black text-white text-black px-2 rounded-r-lg font-semibold text-sm'>low</Text> */}
                 </View>
                {/* <Text className="text-gray-600 text-sm">{vmd?.Views} Views • {timeAgo(vmd?.Upload_Time)}</Text> */}
              </View>
            )}
            <View className="bg-gray-100 p-1 rounded-2xl flex-row gap-1">
              <TouchableOpacity 
                className={`${isLuvved ? 'bg-red-100' : 'bg-white'} px-3 py-2 rounded-2xl flex-row items-center`}
                onPress={async () => {
                  Animated.sequence([
                    Animated.timing(luvAnimScale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
                    Animated.timing(luvAnimScale, { toValue: 1, duration: 100, useNativeDriver: true })
                  ]).start();
                  
                  try {
                    const token = await GetToken('jwt');
                    if (!token) {
                      Alert.alert("Error", "Authentication required.");
                      return;
                    }

                    const result = await luvVideo(token, videoID);
                    setIsLuvved(result.luved);
                  } catch (err) {
                    // Failed to luv video
                    setIsLuvved(!isLuvved);
                  }
                }}
              >
                <Animated.View style={{ transform: [{ scale: luvAnimScale }] }}>
                  <Image 
                    source={isLuvved ? require("../../assets/images/LuvedIcon.png") : require("../../assets/images/ToLuvIcon.png")} 
                    className="w-6 h-6" 
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text className={`${isLuvved ? 'text-red-600' : 'text-gray-600'} text-sm ml-1`}>
                  {isLuvved && !vmd?.Already_Luved ? initialLuvCount + 1 : !isLuvved && vmd?.Already_Luved ? initialLuvCount - 1 : initialLuvCount}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-white px-3 py-2 rounded-2xl flex-row items-center"
                onPress={() => {
                  animateButton(shareAnimScale);
                  router.push({
                    pathname: '/share',
                    params: {
                      shareType: 'video',
                      shareId: videoID,
                      shareTitle: vmd?.Title,
                      shareUrl: VideoURL
                    }
                  });
                }}
              >
                <Animated.View style={{ transform: [{ scale: shareAnimScale }] }}>
                  <Image source={require("../../assets/images/ShareIcon.png")} className="w-6 h-6" resizeMode="contain"/>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-white px-3 py-2 rounded-2xl flex-row items-center"
                onPress={async () => {
                  try {
                    const token = await GetToken('jwt');
                    if (!token) {
                      Alert.alert("Error", "Authentication required.");
                      return;
                    }
                    const data = await saveVideo(token, videoID as string);
                    if (data) setIsSaved(data.saved);
                  } catch (error) {
                    // Save video error
                  }
                }}
              >
                <Image source={isSaved ? require("../../assets/images/SavedIcon.png") : require("../../assets/images/SaveIcon.png")} className="w-6 h-6" resizeMode="contain"/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View className="flex-row items-center py-3 mx-4 mb-4">
          {profileImageError || !vmd?.Uploader_ID ? (
            <View className="w-10 h-10 mr-3 rounded-xl bg-primary-25 justify-center items-center">
              <Text className="text-primary text-sm font-semibold">
                {vmd?.Uploader_Handle?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => {
              if (currentUserID && vmd?.Uploader_ID === currentUserID) {
                router.push('/(tabs)/myprofile');
              } else {
                router.push(`/users/${vmd?.Uploader_ID}`);
              }
            }}>
              <Image 
                source={{ uri: pfpUrl(vmd?.Uploader_ID) }} 
                className="w-10 h-10 mr-3 rounded-xl" 
                resizeMode="cover" 
                onError={() => setProfileImageError(true)}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            className="flex-1"
            onPress={() => {
              if (currentUserID && vmd?.Uploader_ID === currentUserID) {
                router.push('/(tabs)/myprofile');
              } else {
                router.push(`/users/${vmd?.Uploader_ID}`);
              }
            }}
          >
            <Text className="text-gray-900 text-base font-semibold">
              {vmd?.Uploader_Name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-sm">
                {vmd?.Uploader_Handle}
              </Text>
              {isTurboVerified && (
                <Image 
                  source={require('../../assets/images/TurboVerifiedIcon.png')} 
                  className="w-4 h-4 ml-1" 
                  resizeMode="contain" 
                />
              )}
            </View>
          </TouchableOpacity>
          {currentUserID !== vmd?.Uploader_ID && (
            <View className="w-24 h-10">
               <PrimaryButtonComponent text={followInfo?.AlreadyFollowed ? 'Following' : 'Follow'} onPress={handleFollow} clicked={followInfo?.AlreadyFollowed}/>
            </View>
          )}
        </View>
      {((vmd?.Tags && vmd.Tags.length > 0) || vmd?.Video_Info) && (
        <View className={`mx-4 mb-4 ${showMore ? 'bg-gray-100 rounded-2xl p-4' : ''}`}>
          <TouchableOpacity onPress={() => setShowMore(!showMore)} className={`flex-row ${showMore ? 'justify-end p-2 ' : ''}`}>
            {showMore ? (
              <Text className="text-gray-500 text-3xl">×</Text>
            ) : (
              <Text className="text-gray-900 text-sm font-semibold">More details</Text>
            )}
          </TouchableOpacity>
          {showMore && (
            <View>
              {vmd?.Video_Info && (
                <View className="mb-4">
                  <Text className="text-gray-900 text-base font-bold mb-3">Description</Text>
                  <Text className="text-gray-700 text-sm leading-6">{vmd.Video_Info}</Text>
                </View>
              )}
              {vmd?.Tags && vmd.Tags.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-900 text-base font-bold mb-3">Tags</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {vmd.Tags.map((tag, index) => {
                      const getTagColor = (tagValue: string) => {
                        const tagObj = ALLOWED_TAGS.find(tag => tag.value === tagValue);
                        if (tagObj) return tagObj.color;
                        const randomColors = ['bg-sky-100 text-gray-700', 'bg-zinc-100 text-gray-700', 'bg-neutral-100 text-gray-700', 'bg-red-100 text-gray-700', 'bg-blue-100 text-gray-700', 'bg-green-100 text-gray-700', 'bg-yellow-100 text-gray-700', 'bg-purple-100 text-gray-700'];
                        const hash = tagValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        return randomColors[hash % randomColors.length];
                      };
                      return (
                        <Text key={index} className={`text-sm ${getTagColor(tag)} rounded-lg  px-2 py-1 font-medium`}>
                          {tag}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              )}
              <View className="flex-row">
                <ContentQualityBadge quality={videoQuality} aiUsage={videoAIUsage} />
              </View>
            </View>
          )}
        </View>
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setActiveTab(page);
          if (page === 0 && votePanelExpanded) {
            setVotePanelExpanded(false);
          }
        }}
      >
        <View style={{ width: Dimensions.get('window').width }} className="px-4">
          <TouchableOpacity 
            className="bg-gray-100 rounded-2xl p-1 pb-4"
            onPress={() => {
              animateButton(commentsAnimScale);
              handleOpenPressComments();
            }}
          >
            <Animated.View style={{ transform: [{ scale: commentsAnimScale }] }}>
              {comments?.length > 0 && (
                <View className="mb-2 bg-white rounded-xl p-2 pr-5 flex-row">
                  <View className="w-6 h-6 mr-2 rounded-full bg-primary-25 justify-center items-center">
                    <Text className="text-primary text-xs font-semibold">
                      {comments[commentIndex]?.Commenter_Name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-xs mb-1">
                      {comments[commentIndex]?.Commenter_Name || 'Anonymous'} | Top comment
                    </Text>
                    <Text className="text-gray-700 text-sm" numberOfLines={3}>
                      {comments[commentIndex]?.Comment_text || 'Great video!'}
                    </Text>
                  </View>
                </View>
              )}
              <View className="flex-row items-center justify-center pt-2">
                <Image source={require("../../assets/images/CommentsIcon.png")} className="w-5 h-5 mr-2" resizeMode="contain"/>
                <Text className="text-gray-700 font-semibold text-base">View all comments</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
        <View style={{ width: Dimensions.get('window').width }} className="px-4">
          <VotePanelComponent isExpanded={votePanelExpanded} setIsExpanded={setVotePanelExpanded} contentId={+videoID} contentType="video" />
        </View>
      </ScrollView>
      
      <View className="flex-row justify-center mb-6 gap-2">
        <TouchableOpacity 
          className={`w-2 h-2 rounded-full ${activeTab === 0 ? 'bg-black' : 'bg-gray-300'}`}
          onPress={() => {
            setActiveTab(0);
            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
          }}
        />
        <TouchableOpacity 
          className={`w-2 h-2 rounded-full ${activeTab === 1 ? 'bg-black' : 'bg-gray-300'}`}
          onPress={() => {
            setActiveTab(1);
            scrollViewRef.current?.scrollTo({ x: Dimensions.get('window').width, animated: true });
          }}
        />
      </View>
      
      {vmd?.Uploader_ID && vmd?.Uploader_Name && (
        <UploaderVideosComponent 
          uploaderID={vmd.Uploader_ID}
          uploaderName={vmd.Uploader_Name}
          currentVideoID={+videoID}
        />
      )}
      
      {vmd?.Uploader_ID && vmd?.Uploader_Name && (
        <UploaderEcosComponent 
          uploaderID={vmd.Uploader_ID}
          uploaderName={vmd.Uploader_Name}
          currentEcoID={0}
        />
      )}
      
      <SimilarVideoRecommendationComponent videoID={+videoID} />

      </ScrollView>



            {isOpen && (
              <>
               <BottomSheet 
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={(props) => (
                  <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                  />
                )}
                enablePanDownToClose
                onChange={handleSheetChanges}
                // activeOffsetY={[-999, 999]} 
              >
                <BottomSheetView 
                style={{ backgroundColor: '#ffffff' }}
                >
                  <View className="h-[500]"></View>
      

                </BottomSheetView>
         
                <View className="flex-row justify-between items-center py-3 border-b border-gray-200 px-4">
                  <Text className="text-lg font-bold text-gray-900">
                    {isReplying ? 'Reply to Comment' : 'Comments'}
                  </Text>
                  {!isReplying && (
                    <TouchableOpacity onPress={() => setIsOpen(false)}>
                      <Image 
                        source={require('../../assets/images/CrossIcon.png')} 
                        className="w-6 h-6" 
                        resizeMode="contain" 
                      />
                    </TouchableOpacity>
                  )}
                </View>



                    <CommentSectionComponent 
                      videoID={+videoID} 
                      onRefresh={(refreshFn) => { refreshRef.current = refreshFn; }} 
                      onTimestampPress={(seconds) => {
                        if (videoPlayerRef.current?.player) {
                          videoPlayerRef.current.player.currentTime = seconds;
                          setIsOpen(false);
                        }
                      }}
                      onCommentsChange={setComments}
                      onClose={() => setIsOpen(false)}
                      onReplyStateChange={setIsReplying}
                      onReplyToComment={(commentId) => {
                        setReplyToCommentId(commentId);
                      }}
                      onReplyBack={() => {
                        setReplyToCommentId(null);
                      }}
                    />


              </BottomSheet>

              <CommentInputComponent 
                    videoID={+videoID} 
                    onCommentAdded={() => {
                      refreshRef.current?.();
                      // Don't automatically reset reply state - let user navigate back manually
                    }} 
                    parentCommentID={replyToCommentId || undefined}
                />
              </>
             
            )}
      </GestureHandlerRootView>
    </View>
      </>
     

  );
}


export const DescriptionComponent = ({ description, maxLength = 5 }: { description: string | undefined; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;
  
  const shouldTruncate = description.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? description : description.substring(0, maxLength) + '...';

  if (!shouldTruncate) return null;

  return (
    <View className="  mb-3 mx-2 py-1 rounded-lg ">
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <Text>
          <Text className="text-gray-600 text-sm">{displayText}</Text>
          <Text className="text-gray-400"> {isExpanded ? "show less" : "show more"}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}





 