import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useLocalSearchParams, useFocusEffect, router} from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Animated, Share, Alert, Linking } from "react-native";
import { GetToken } from "@/HelperFuncs/localStorage";
import useFetch from "@/Services/useFetch";
import { fetchVideoDetails } from "@/Services/VideoDetailsAPI";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentSectionComponent from "@/components/CommentSection";
import CommentInputComponent from "@/components/CommentInput";
import {timeAgo} from "@/HelperFuncs/timeAgo";
import PrimaryButtonComponent from "@/components/Buttons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView,BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import VideoPlayer from "@/components/VideoPlayer";
import SimilarVideoRecommendationComponent from "@/components/SimilarVideoRecommendationComponent";
import { StatusBar } from "expo-status-bar";
import { GetUser } from "@/HelperFuncs/localStorage";
import { TimestampCopyButton } from '@/components/TimestampCopyButton';
     
export default function VideoPage() {
  const { videoID, VideoURL } = useLocalSearchParams(); // id matches [id].tsx
  const { data: vmd, loading } = useFetch(() => fetchVideoDetails(+videoID))
  const refreshRef = useRef<(() => void) | null>(null);
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
  const videoSource = `http://10.0.2.2:8091/get-video-stream/${VideoURL}/playlist.m3u8`;
  const videoPlayerRef = useRef<any>(null);
  console.log("uid:",vmd?.Uploader_ID)
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
        const response = await fetch(`http://10.0.2.2:8100/video-saved-status?videoID=${videoID}`, {
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
          const response = await fetch(`http://10.0.2.2:8010/get-following-info?userID=${vmd.Uploader_ID}&requesterID=${currentUserID}`);
          if (response.ok) {
            const data = await response.json();
            setFollowInfo(data);
          }
        } catch (error) {
          console.error('Error fetching follow info:', error);
        }
      }
    };
    getFollowInfo();
  }, [currentUserID, vmd?.Uploader_ID]);

  useEffect(() => {
    if (vmd?.Uploader_ID) {
      fetch(`http://10.0.2.2:8100/get-turbomax-status?userID=${vmd.Uploader_ID}`)
        .then(res => res.json())
        .then(result => setIsTurboVerified(result.turbomax_active || false))
        .catch(() => setIsTurboVerified(false));
    }
  }, [vmd?.Uploader_ID]);

  useEffect(() => {
    const updateView = async () => {
      try {
        const userData = await GetUser();
        const userID = userData?.UserID;
        if (!userID ) {
          Alert.alert("Error", "Authentication required.");
          return;
        }

        console.log('====================================');
        console.log(userID);
        console.log('====================================');
        
        await fetch("http://10.0.2.2:7999/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `video_id=${videoID}&user_id=${userID}`,
        });
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
    console.log('handleSheetChanges', index);
    setIsOpen(index >= 0);
  }, []);

  const handleFollow = async () => {
    try {
      const authToken = await GetToken('jwt');
      const isUnfollow = followInfo?.AlreadyFollowed;
      const endpoint = isUnfollow ? 'http://10.0.2.2:8010/unfollow' : 'http://10.0.2.2:8010/follow';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authToken || ''
        },
        body: `followeeID=${vmd?.Uploader_ID}`
      });
      
      if (response.ok) {
        console.log(isUnfollow ? 'Unfollow successful' : 'Follow successful');
        setFollowInfo(prev => prev ? {...prev, AlreadyFollowed: !prev.AlreadyFollowed, FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1} : null);
      } else {
        console.error(isUnfollow ? 'Unfollow failed:' : 'Follow failed:', response.status);
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    }
  };



  return (
      <>

       <SafeAreaView className="flex-1 bg-black m-0">
      <View className="bg-black">
      <StatusBar style="light" backgroundColor="black" />
      </View>
      <GestureHandlerRootView>
      
      <View className="relative">
        <VideoPlayer 
          ref={videoPlayerRef}
          key={VideoURL}
          videoSource={videoSource}
          style={{ width: "100%", height: 250, backgroundColor: "black" }}
          hideProgressBar={isOpen}
        />
        <TimestampCopyButton 
          getCurrentTime={() => videoPlayerRef.current?.getCurrentTime?.() || 0}
          videoTitle={vmd?.Title}
        />
      </View>
      <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-start mx-2 my-3">
          <Text 
            className="text-black text-xl flex-1 mr-3" 
            numberOfLines={titleExpanded ? undefined : 2}
            onPress={() => setTitleExpanded(!titleExpanded)}
          >
            {vmd?.Title}
          </Text>
          <View className="flex-row">
            <TouchableOpacity 
              className={`${isLuvved ? 'bg-red-100' : 'bg-gray-100'} p-2 rounded-xl flex-row items-center mr-2`}
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

                  const response = await fetch("http://10.0.2.2:7999/luv", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                      "Authorization": token
                    },
                    body: `video_id=${+videoID}`
                  });
                  const result = await response.json();
                  setIsLuvved(result.luved);
                } catch (err) {
                  console.error("Failed to luv video:", err);
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
              className="bg-gray-100 p-2 rounded-xl flex-row items-center mr-2"
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
              className="bg-gray-100 p-2 rounded-xl flex-row items-center mr-2"
              onPress={async () => {
                try {
                  const token = await GetToken('jwt');
                  if (!token) {
                    Alert.alert("Error", "Authentication required.");
                    return;
                  }
                  const response = await fetch(`http://10.0.2.2:8100/save-video?videoID=${videoID}`, {
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
              <Image source={isSaved ? require("../../assets/images/SavedIcon.png") : require("../../assets/images/SaveIcon.png")} className="w-6 h-6" resizeMode="contain"/>
            </TouchableOpacity>

          </View>
        </View>
        <Text className="text-gray-500 text-xs mx-2 mb-3">{timeAgo(vmd?.Upload_Time)} | {vmd?.Views} Views </Text>
        
        <View className="flex-row items-center py-2 mx-2 mb-3">

          {profileImageError || !vmd?.Uploader_ID ? (
            <View className="w-10 h-10 mr-3 rounded-xl bg-primary-25 justify-center items-center">
              <Text className="text-primary text-sm font-semibold">
                {vmd?.Uploader_Handle?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          ) : (
            <Image 
              source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${vmd?.Uploader_ID}` }} 
              className="w-10 h-10 mr-3 rounded-xl" 
              resizeMode="cover" 
              onError={() => setProfileImageError(true)}
            />
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
            <Text className="text-black text-base font-medium">
              {vmd?.Uploader_Name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-secondary text-sm">
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
        <View className="px-2 mb-3">
          <TouchableOpacity onPress={() => setShowMore(!showMore)} className="flex-row items-center">
            <Image 
              source={require('../../assets/images/backIcon.png')} 
              className="w-3 h-3 mr-1" 
              style={{ transform: [{ rotate: showMore ? '270deg' : '180deg' }] }}
            />
            <Text className="text-gray-500 text-xs">More</Text>
          </TouchableOpacity>
          {showMore && (
            <View className="mt-2">
              {vmd?.Video_Info && (
                <View className="mb-2">
                  <Text className="text-gray-700 text-xs font-semibold mb-1">Description</Text>
                  <Text className="text-gray-600 text-sm">{vmd.Video_Info}</Text>
                </View>
              )}
              {vmd?.Tags && vmd.Tags.length > 0 && (
                <View>
                  <Text className="text-gray-700 text-xs font-semibold mb-1">Tags</Text>
                  <View className="flex-row flex-wrap">
                    {vmd.Tags.map((tag, index) => (
                      <Text key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1">
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}
      
      <View className="flex-row mb-3 mx-2 gap-2">
        <TouchableOpacity 
          className="bg-gray-100 rounded-xl justify-center items-center py-1 flex-1"
          onPress={() => {
            animateButton(commentsAnimScale);
            handleOpenPressComments();
          }}
        >
          <Animated.View style={{ transform: [{ scale: commentsAnimScale }] }}>
            <Text className="text-black py-2 font-semibold">Comments</Text>
          </Animated.View>
        </TouchableOpacity>

      </View>
      
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
         
                <Text className="text-xl font-semibold py-2 border-b border-gray-200 px-2">Comments</Text>



                    <CommentSectionComponent 
                      videoID={+videoID} 
                      onRefresh={(refreshFn) => { refreshRef.current = refreshFn; }} 
                      onTimestampPress={(seconds) => {
                        if (videoPlayerRef.current?.player) {
                          videoPlayerRef.current.player.currentTime = seconds;
                          setIsOpen(false);
                        }
                      }}
                    />


              </BottomSheet>

              <CommentInputComponent 
                    videoID={+videoID} 
                    onCommentAdded={() => refreshRef.current?.()} 
                />
              </>
             
            )}
      </GestureHandlerRootView>
    </SafeAreaView>
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





 