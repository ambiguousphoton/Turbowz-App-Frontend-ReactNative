import { View, Text, Image, Dimensions, ScrollView, TouchableOpacity, Animated, Modal } from "react-native";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { useState, useEffect, useRef } from "react";
import { GetUser, GetToken } from "@/HelperFuncs/localStorage";
import { Link, router } from "expo-router";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import ContentQualityBadge from "@/components/ContentQualityBadge";
import EcoMorePanelComponent from "./EcoMorePanelComponent";
import { getTurbomaxStatus, ecoSavedStatus, saveEco } from "@/Services/api/userService";
import { checkEcoLuvStatus, getEcoScore, luvEco } from "@/Services/api/ecoService";
import { getFollowingInfo, follow, unfollow } from "@/Services/api/followService";
import { pfpUrl, ecoImageUrl } from "@/Services/api/imageService";

interface EcoCardProps {
  item: EcoDataInterface;
}

export const EcoCardComponent = ({ item }: EcoCardProps) => {
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [profileImageError, setProfileImageError] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [followInfo, setFollowInfo] = useState<{ FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean } | null>(null);
  const [isLuved, setIsLuved] = useState<boolean>(false);
  const [initialIsLuved, setInitialIsLuved] = useState<boolean>(false);
  const [currentLuvCount, setCurrentLuvCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isTurboVerified, setIsTurboVerified] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const luvAnimScale = useRef(new Animated.Value(1)).current;
  const [showTags, setShowTags] = useState(false);
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
    const getFollowInfo = async () => {
      if (currentUserID && item.Uploader_ID) {
        try {
          const data = await getFollowingInfo(item.Uploader_ID, currentUserID);
          if (data) setFollowInfo(data);
        } catch (error) {
          console.error('Error fetching follow info:', error);
        }
      }
    };
    getFollowInfo();
  }, [currentUserID, item.Uploader_ID]);

  useEffect(() => {
    if (item.Uploader_ID) {
      getTurbomaxStatus(item.Uploader_ID)
        .then(setIsTurboVerified)
        .catch(() => setIsTurboVerified(false));
    }
  }, [item.Uploader_ID]);

  useEffect(() => {
    const getLuvStatus = async () => {
      if (currentUserID && item.Eco_Id) {
        try {
          const data = await checkEcoLuvStatus(item.Eco_Id, currentUserID);
          if (data) {
            setIsLuved(data.luved);
            setInitialIsLuved(data.luved);
            setCurrentLuvCount(data.total_luvs || 0);
          }
        } catch (error) {
          console.error('Error fetching luv status:', error);
        }
      }
    };
    getLuvStatus();
  }, [currentUserID, item.Eco_Id, item.Luv_Count]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const token = await GetToken('jwt');
        if (!token) return;
        const data = await ecoSavedStatus(token, item.Eco_Id);
        if (data) setIsSaved(data.saved);
      } catch (error) {
        console.error('Fetch saved status error:', error);
      }
    };
    fetchSavedStatus();
  }, [item.Eco_Id]);

  useEffect(() => {
    if (item.Eco_Id) {
      getEcoScore(item.Eco_Id)
        .then(data => {
          setEcoQuality(data?.Echo_Quality?.Valid ? data.Echo_Quality.Float64 : 0);
          setEcoAIUsage(data?.Echo_AI_Usage?.Valid ? data.Echo_AI_Usage.Float64 : 0);
        })
        .catch(() => {
          setEcoQuality(0);
          setEcoAIUsage(0);
        });
    }
  }, [item.Eco_Id]);

  const handleFollow = async () => {
    if (!item.Uploader_ID || !currentUserID) {
      console.error('Invalid uploader ID or current user ID');
      return;
    }

    try {
      const authToken = await GetToken('jwt');
      const isUnfollow = followInfo?.AlreadyFollowed;
      const success = isUnfollow
        ? await unfollow(authToken || '', item.Uploader_ID)
        : await follow(authToken || '', item.Uploader_ID);
      if (success) {
        setFollowInfo(prev => prev ? { ...prev, AlreadyFollowed: !prev.AlreadyFollowed, FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1 } : null);
      } else {
        console.error(isUnfollow ? 'Unfollow failed:' : 'Follow failed:', response.status);
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    }
  };

  const handleLuv = async () => {
    if (!item.Eco_Id || !currentUserID) {
      console.error('Invalid eco ID or current user ID');
      return;
    }

    Animated.sequence([
      Animated.timing(luvAnimScale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
      Animated.timing(luvAnimScale, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    try {
      const authToken = await GetToken('jwt');

      const data = await luvEco(authToken || '', item.Eco_Id);
      if (data) {
        setIsLuved(data.luved);
        const statusData = await checkEcoLuvStatus(item.Eco_Id, currentUserID!);
        if (statusData) setCurrentLuvCount(statusData.total_luvs || 0);
      } else {
        console.error('Luv action failed:', response.status);
      }
    } catch (error) {
      console.error('Luv error:', error);
    }
  };

  return (
    <View className="border-b border-gray-100">
      <View className="px-2 py-2 flex-row items-center">
        {profileImageError ? (
          <View className="w-9 h-9 mr-4 rounded-full bg-primary-25 justify-center items-center">
            <Text className="text-primary text-xs font-semibold">
              {item.Uploader_Name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => {
            if (currentUserID && item.Uploader_ID === currentUserID) {
              router.push('/(tabs)/myprofile');
            } else {
              router.push(`/users/${item.Uploader_ID}`);
            }
          }}>
            <Image
              source={{ uri: pfpUrl(item.Uploader_ID) }}
              className="w-9 h-9 mr-4 rounded-full"
              resizeMode="cover"
              onError={() => setProfileImageError(true)}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => {
            if (currentUserID && item.Uploader_ID === currentUserID) {
              router.push('/(tabs)/myprofile');
            } else {
              router.push(`/users/${item.Uploader_ID}`);
            }
          }}
        >
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-black font-semibold mr-2">{item.Uploader_Name}</Text>
              <Text className="text-gray-500 text-secondary">{item.Uploader_Handle}</Text>
              {isTurboVerified && (
                <Image
                  source={require('../assets/images/TurboVerifiedIcon.png')}
                  className="w-4 h-4 ml-1"
                  resizeMode="contain"
                />
              )}
            </View>

          </View>
        </TouchableOpacity>
        {currentUserID !== item.Uploader_ID && (
          <TouchableOpacity
            className={`${followInfo?.AlreadyFollowed ? 'bg-select' : 'bg-primary-150'} px-3 py-1 rounded-lg`}
            onPress={handleFollow}
          >
            <Text className={`${followInfo?.AlreadyFollowed ? 'text-black' : 'text-white'} text-xs font-semibold`}>
              {followInfo?.AlreadyFollowed ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity className="p-3" onPress={() => setShowVotePanel(true)}>
          <Image source={require('../assets/images/VerticalMoreIcon.png')} className="w-5 h-5" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <View className="pb-2" style={{ marginLeft: 52 }}>
        <Text className="text-black">{item.Eco_Text}</Text>
      </View>

      <View style={{ position: 'relative' }} >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(prev => ({ ...prev, [item.Eco_Id]: index }));
          }}

        >
          {Array.from({ length: item.Images_Count }, (_, index) => (
            <Image
              key={index}
              source={{ uri: ecoImageUrl(item.Eco_Url, index) }}
              style={{ width: screenWidth, height: 300 }}
              resizeMode="contain"
              onError={(e) => {
                console.error(`[EcoImage] Failed to load eco=${item.Eco_Id} index=${index} uri=${ecoImageUrl(item.Eco_Url, index)}`, e.nativeEvent.error);
                setImageError(prev => ({ ...prev, [`${item.Eco_Id}-${index}`]: true }));
              }}
            />
          ))}
        </ScrollView>
        {item.Images_Count > 1 && (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontSize: 12 }}>
              {(currentImageIndex[item.Eco_Id] || 0) + 1}/{item.Images_Count}
            </Text>
          </View>
        )}
        <View className="flex-row items-center px-4 py-2">
          <Text className="text-gray-400 text-sm">{timeAgo(item.Created_At)}</Text>
          {item.Tags && item.Tags.length > 0 && (
            <>
              <Text className="text-gray-400 text-sm mx-2">•</Text>
              <View className="flex-row flex-wrap flex-1">
                {item.Tags.map((tag, index) => (
                  <Text key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-1">
                    {tag}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>
        <View className="flex-row justify-between mt-2 mb-4" style={{ paddingLeft: 16, paddingRight: 16 }}>
          <View className="flex-row" style={{ gap: 40 }}>
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={handleLuv}
            >
              <Animated.View style={{ transform: [{ scale: luvAnimScale }] }}>
                <Image
                  source={isLuved ? require("../assets/images/LuvedIcon.png") : require("../assets/images/ToLuvIcon.png")}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </Animated.View>
              <Text className="text-gray-600 text-sm ml-1">{currentLuvCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={() => router.push(`/ecos/${item.Eco_Id}?openComments=true`)}
            >
              <Image source={require("../assets/images/CommentsIcon.png")} className="w-5 h-5" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={() => router.push({
                pathname: '/share',
                params: {
                  shareType: 'eco',
                  shareId: item.Eco_Id,
                  shareText: item.Eco_Text,
                  shareUrl: item.Eco_Url
                }
              })}
            >
              <Image source={require("../assets/images/ShareIcon.png")} className="w-5 h-5" resizeMode="contain" />
            </TouchableOpacity>
            {(ecoQuality > 0 || ecoAIUsage > 0) && (
              <View className="flex-row items-center p-2">
                <ContentQualityBadge quality={ecoQuality} aiUsage={ecoAIUsage} />
              </View>
            )}
            {/* <TouchableOpacity 
              className="flex-row items-center p-2"
            >
              <Image source={require("../assets/images/ShareExternalIcon.png")} className="w-5 h-5" resizeMode="contain"/>
            </TouchableOpacity> */}

          </View>
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={async () => {
              try {
                const token = await GetToken('jwt');
                if (!token) {
                  console.error('Authentication required');
                  return;
                }
                const data = await saveEco(token, item.Eco_Id);
                if (data) setIsSaved(data.saved);
              } catch (error) {
                console.error('Save eco error:', error);
              }
            }}
          >
            <Image source={isSaved ? require("../assets/images/SavedIcon.png") : require("../assets/images/SaveIcon.png")} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {Object.keys(imageError).some(key => key.startsWith(item.Eco_Id.toString())) && (
        <View className="px-4">
          <Text className="text-red-500 text-sm mt-2">Some images failed to load</Text>
        </View>
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
            <EcoMorePanelComponent isExpanded={votePanelExpanded} setIsExpanded={setVotePanelExpanded} contentId={item.Eco_Id} contentType="eco" ecoText={item.Eco_Text} tags={item.Tags} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};