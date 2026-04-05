import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Animated, Modal } from "react-native";
import { GetToken, GetUser } from "@/HelperFuncs/localStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import PrimaryButtonComponent from "@/components/Buttons";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import CommentSectionComponent from "@/components/CommentSection";
import EcoCommentInputComponent from "@/components/EcoCommentInput";
import UploaderEcosComponent from "@/components/UploaderEcosComponent";
import ContentPageHeader from "@/components/ContentPageHeader";
import EcoMorePanelComponent from "@/components/EcoMorePanelComponent";
import ContentQualityBadge from "@/components/ContentQualityBadge";
import { getTurbomaxStatus, ecoSavedStatus, saveEco } from "@/Services/api/userService";
import { getEcoMetadata, checkEcoLuvStatus, getEcoScore, luvEco } from "@/Services/api/ecoService";
import { getFollowingInfo, follow, unfollow } from "@/Services/api/followService";
import { ecoImageUrl, pfpUrl } from "@/Services/api/imageService";

export default function EcoPage() {
  const { ecoID, openComments } = useLocalSearchParams();
  const [ecoData, setEcoData] = useState<EcoDataInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [profileImageError, setProfileImageError] = useState(false);
  const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);
  const [isLuved, setIsLuved] = useState<boolean>(false);
  const [currentLuvCount, setCurrentLuvCount] = useState<number>(0);
  const [isTurboVerified, setIsTurboVerified] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const luvAnimScale = useRef(new Animated.Value(1)).current;
  const commentsAnimScale = useRef(new Animated.Value(1)).current;
  const refreshRef = useRef<(() => void) | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | number | null>(null);
  const snapPoints = useMemo(() => ['71%', "90%"], []);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [votePanelExpanded, setVotePanelExpanded] = useState(true);
  const [ecoQuality, setEcoQuality] = useState<number>(0);
  const [ecoAIUsage, setEcoAIUsage] = useState<number>(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const localUser = await GetUser();
      setCurrentUserID(localUser?.UserID || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchEcoData = async () => {
      if (!ecoID) return;
      
      try {
        setLoading(true);
        const data = await getEcoMetadata(ecoID);
        if (data) setEcoData(data);
      } catch (error) {
        console.error('Error fetching eco data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcoData();
  }, [ecoID]);

  useEffect(() => {
    const getFollowInfo = async () => {
      if (currentUserID && ecoData?.Uploader_ID) {
        try {
          const data = await getFollowingInfo(ecoData.Uploader_ID, currentUserID);
          if (data) setFollowInfo(data);
        } catch (error) {
          console.error('Error fetching follow info:', error);
        }
      }
    };
    getFollowInfo();
  }, [currentUserID, ecoData?.Uploader_ID]);

  useEffect(() => {
    if (ecoData?.Uploader_ID) {
      getTurbomaxStatus(ecoData.Uploader_ID)
        .then(setIsTurboVerified)
        .catch(() => setIsTurboVerified(false));
    }
  }, [ecoData?.Uploader_ID]);

  useEffect(() => {
    const getLuvStatus = async () => {
      if (currentUserID && ecoData?.Eco_Id) {
        try {
          const data = await checkEcoLuvStatus(ecoData.Eco_Id, currentUserID);
          if (data) {
            setIsLuved(data.luved);
            setCurrentLuvCount(data.total_luvs || 0);
          }
        } catch (error) {
          console.error('Error fetching luv status:', error);
        }
      }
    };
    getLuvStatus();
  }, [currentUserID, ecoData?.Eco_Id]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!ecoData?.Eco_Id) return;
      try {
        const token = await GetToken('jwt');
        if (!token) return;
        const data = await ecoSavedStatus(token, ecoData.Eco_Id);
        if (data) setIsSaved(data.saved);
      } catch (error) {
        console.error('Fetch saved status error:', error);
      }
    };
    fetchSavedStatus();
  }, [ecoData?.Eco_Id]);

  useEffect(() => {
    if (ecoData?.Eco_Id) {
      getEcoScore(ecoData.Eco_Id)
        .then(data => {
          setEcoQuality(data?.Echo_Quality?.Valid ? data.Echo_Quality.Float64 : 0);
          setEcoAIUsage(data?.Echo_AI_Usage?.Valid ? data.Echo_AI_Usage.Float64 : 0);
        })
        .catch(() => {
          setEcoQuality(0);
          setEcoAIUsage(0);
        });
    }
  }, [ecoData?.Eco_Id]);

  useEffect(() => {
    if (openComments === 'true' && ecoData) {
      handleOpenPressComments();
    }
  }, [openComments, ecoData]);

  const handleFollow = async () => {
    if (!ecoData?.Uploader_ID || !currentUserID) return;
    
    try {
      const authToken = await GetToken('jwt');
      const isUnfollow = followInfo?.AlreadyFollowed;
      const success = isUnfollow
        ? await unfollow(authToken || '', ecoData.Uploader_ID)
        : await follow(authToken || '', ecoData.Uploader_ID);
      if (success) {
        setFollowInfo(prev => prev ? {...prev, AlreadyFollowed: !prev.AlreadyFollowed, FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1} : null);
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    }
  };

  const handleLuv = async () => {
    if (!ecoData?.Eco_Id || !currentUserID) return;
    
    Animated.sequence([
      Animated.timing(luvAnimScale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
      Animated.timing(luvAnimScale, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
    
    try {
      const authToken = await GetToken('jwt');
      
      const data = await luvEco(authToken || '', ecoData.Eco_Id);
      if (data) {
        setIsLuved(data.luved);
        const statusData = await checkEcoLuvStatus(ecoData.Eco_Id, currentUserID!);
        if (statusData) setCurrentLuvCount(statusData.total_luvs || 0);
      }
    } catch (error) {
      console.error('Luv error:', error);
    }
  };

  const handleOpenPressComments = () => {
    setIsOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSheetChanges = useCallback((index: number) => {
    setIsOpen(index >= 0);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!ecoData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Eco not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GestureHandlerRootView className="flex-1">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute rounded-full bg-white p-2 z-10"
          style={{ top: 8, left: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}
        >
          <Image source={require('@/assets/images/backIcon.png')} className="w-5 h-5" />
        </TouchableOpacity>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View>
          <View style={{ position: 'relative' }}>
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setCurrentImageIndex(prev => ({...prev, [ecoData.Eco_Id]: index}));
              }}
            >
              {Array.from({ length: ecoData.Images_Count }, (_, index) => (
                <Image
                  key={index}
                  source={{ uri: ecoImageUrl(ecoData.Eco_Url, index) }}
                  style={{ width: screenWidth, height: 300 }}
                  resizeMode="contain"
                  onError={(error) => {
                    setImageError(prev => ({...prev, [`${ecoData.Eco_Id}-${index}`]: true}));
                  }}
                />
              ))}
            </ScrollView>
            {ecoData.Images_Count > 1 && (
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {(currentImageIndex[ecoData.Eco_Id] || 0) + 1}/{ecoData.Images_Count}
                </Text>
              </View>
            )}
            <View className="px-4 pt-4">
              <View className="flex-row items-center">
                {profileImageError ? (
                  <View className="w-10 h-10 mr-3 rounded-full bg-primary-25 justify-center items-center">
                    <Text className="text-primary text-sm font-bold">
                      {ecoData.Uploader_Name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => {
                    if (currentUserID && ecoData.Uploader_ID === currentUserID) {
                      router.push('/(tabs)/myprofile');
                    } else {
                      router.push(`/users/${ecoData.Uploader_ID}`);
                    }
                  }}>
                    <Image 
                      source={{ uri: pfpUrl(ecoData.Uploader_ID) }} 
                      className="w-10 h-10 mr-3 rounded-full" 
                      resizeMode="cover" 
                      onError={() => setProfileImageError(true)}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  className="flex-1"
                  onPress={() => {
                    if (currentUserID && ecoData.Uploader_ID === currentUserID) {
                      router.push('/(tabs)/myprofile');
                    } else {
                      router.push(`/users/${ecoData.Uploader_ID}`);
                    }
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-black font-bold text-[15px]">{ecoData.Uploader_Name}</Text>
                    {isTurboVerified && (
                      <Image 
                        source={require('../../assets/images/TurboVerifiedIcon.png')} 
                        className="w-4 h-4 ml-1" 
                        resizeMode="contain" 
                      />
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs mt-0.5">{ecoData.Uploader_Handle}</Text>
                </TouchableOpacity>
                {currentUserID !== ecoData.Uploader_ID && (
                  <TouchableOpacity 
                    className={`${followInfo?.AlreadyFollowed ? 'bg-select' : 'bg-primary-150'} px-4 py-1.5 rounded-full`}
                    onPress={handleFollow}
                  >
                    <Text className={`${followInfo?.AlreadyFollowed ? 'text-black': 'text-white'} text-xs font-semibold`}>
                      {followInfo?.AlreadyFollowed ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity className="p-2" onPress={() => setShowVotePanel(true)}>
                  <Image source={require('../../assets/images/VerticalMoreIcon.png')} className="w-5 h-5" resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="mx-4 mt-3 mb-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-gray-800 text-[14px] leading-5">{ecoData.Eco_Text}</Text>
            </View>
            <ScrollView horizontal className="flex-row px-2 mb-3" showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                className="p-2 mr-2 flex-row items-center"
                onPress={handleLuv}
              >
                <Animated.View style={{ transform: [{ scale: luvAnimScale }] }}>
                  <Image 
                    source={isLuved ? require("../../assets/images/LuvedIcon.png") : require("../../assets/images/ToLuvIcon.png")} 
                    className="w-6 h-6" 
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text className="text-gray-600 text-sm ml-1">{currentLuvCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="p-1 rounded-xl flex-row items-center p-2 mr-2"
                onPress={() => router.push({
                  pathname: '/share',
                  params: {
                    shareType: 'eco',
                    shareId: ecoData.Eco_Id,
                    shareText: ecoData.Eco_Text,
                    shareUrl: ecoData.Eco_Url
                  }
                })}
              >
                <Image source={require("../../assets/images/ShareIcon.png")} className="w-7 h-7 mx-2" resizeMode="contain"/>
                <Text className="text-gray-600 text-sm mr-2">Share</Text>
              </TouchableOpacity>
              {(ecoQuality > 0 || ecoAIUsage > 0) && (
                <View className="flex-row items-center p-2 mr-2">
                  <ContentQualityBadge quality={ecoQuality} aiUsage={ecoAIUsage} />
                </View>
              )}
              <TouchableOpacity 
                className="p-2"
                onPress={async () => {
                  try {
                    const token = await GetToken('jwt');
                    if (!token) {
                      Alert.alert("Error", "Authentication required.");
                      return;
                    }
                    const data = await saveEco(token, ecoData.Eco_Id);
                    if (data) setIsSaved(data.saved);
                  } catch (error) {
                    console.error('Save eco error:', error);
                  }
                }}
              >
                <Image source={isSaved ? require("../../assets/images/SavedIcon.png") : require("../../assets/images/SaveIcon.png")} className="w-6 h-6" resizeMode="contain"/>
              </TouchableOpacity>
            </ScrollView>
            
            {ecoData.Tags && ecoData.Tags.length > 0 && (
              <View className="px-4 pb-3">
                <TouchableOpacity onPress={() => setShowTags(!showTags)} className="flex-row items-center">
                  <Image 
                    source={require('../../assets/images/backIcon.png')} 
                    className="w-3 h-3 mr-1" 
                    style={{ transform: [{ rotate: showTags ? '270deg' : '180deg' }] }}
                  />
                  <Text className="text-gray-500 text-xs">Tags ({ecoData.Tags.length})</Text>
                </TouchableOpacity>
                {showTags && (
                  <View className="flex-row flex-wrap mt-2">
                    {ecoData.Tags.map((tag, index) => (
                      <Text key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1">
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            {ecoData.Uploader_ID && ecoData.Uploader_Name && (
              <UploaderEcosComponent 
                uploaderID={ecoData.Uploader_ID}
                uploaderName={ecoData.Uploader_Name}
                currentEcoID={ecoData.Eco_Id}
              />
            )}
            
            <TouchableOpacity 
              className="bg-gray-100 rounded-xl mb-4 justify-center items-center py-1 mx-4 mt-1"
              onPress={() => {
                Animated.sequence([
                  Animated.timing(commentsAnimScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
                  Animated.timing(commentsAnimScale, { toValue: 1, duration: 100, useNativeDriver: true })
                ]).start();
                handleOpenPressComments();
              }}
            >
              <Animated.View style={{ transform: [{ scale: commentsAnimScale }] }}>
                <Text className="py-2 font-semibold">Comments</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
        
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
          >
            <BottomSheetView style={{ backgroundColor: '#ffffff' }}>
              <View className="h-[500]"></View>
            </BottomSheetView>
            
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200 px-2">
              <Text className="text-xl font-semibold text-gray-900">
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
              ecoID={+ecoID} 
              onRefresh={(refreshFn) => { refreshRef.current = refreshFn; }}
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

          <EcoCommentInputComponent 
            ecoID={+ecoID} 
            onCommentAdded={() => refreshRef.current?.()} 
            parentCommentID={replyToCommentId || undefined}
          />
        </>
      )}
      
      <Modal visible={showVotePanel} transparent animationType="fade" onRequestClose={() => setShowVotePanel(false)}>
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowVotePanel(false)}>
          <TouchableOpacity className="w-11/12 max-w-md relative" activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity 
              className="absolute -top-16 right-0 bg-red-500 w-12 h-12 rounded-full items-center justify-center"
              onPress={() => setShowVotePanel(false)}
            >
              <Text className="text-white text-2xl font-bold">×</Text>
            </TouchableOpacity>
            <EcoMorePanelComponent isExpanded={votePanelExpanded} setIsExpanded={setVotePanelExpanded} contentId={ecoData.Eco_Id} contentType="eco" ecoText={ecoData.Eco_Text} tags={ecoData.Tags} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}