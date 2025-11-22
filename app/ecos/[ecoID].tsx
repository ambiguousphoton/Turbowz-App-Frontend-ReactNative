import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Animated } from "react-native";
import { GetToken, GetUser } from "@/HelperFuncs/localStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import PrimaryButtonComponent from "@/components/Buttons";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import CommentSectionComponent from "@/components/CommentSection";
import EcoCommentInputComponent from "@/components/EcoCommentInput";

export default function EcoPage() {
  const { ecoID } = useLocalSearchParams();
  const [ecoData, setEcoData] = useState<EcoDataInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [profileImageError, setProfileImageError] = useState(false);
  const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);
  const [isLuved, setIsLuved] = useState<boolean>(false);
  const [currentLuvCount, setCurrentLuvCount] = useState<number>(0);
  const { width: screenWidth } = Dimensions.get('window');
  const luvAnimScale = useRef(new Animated.Value(1)).current;
  const commentsAnimScale = useRef(new Animated.Value(1)).current;
  const refreshRef = useRef<(() => void) | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const snapPoints = useMemo(() => ['71%', "90%"], []);

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
        const response = await fetch(`http://10.0.2.2:7011/emd?eco_id=${ecoID}`);
        if (response.ok) {
          const data = await response.json();
          setEcoData(data);
        }
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
          const response = await fetch(`http://10.0.2.2:8010/get-following-info?userID=${ecoData.Uploader_ID}&requesterID=${currentUserID}`);
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
  }, [currentUserID, ecoData?.Uploader_ID]);

  useEffect(() => {
    const getLuvStatus = async () => {
      if (currentUserID && ecoData?.Eco_Id) {
        try {
          const response = await fetch('http://10.0.2.2:7011/check-eco-luv-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `eco_id=${ecoData.Eco_Id}&user_ID=${currentUserID}`
          });
          if (response.ok) {
            const data = await response.json();
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
        const response = await fetch(`http://10.0.2.2:8100/eco-saved-status?ecoID=${ecoData.Eco_Id}`, {
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
  }, [ecoData?.Eco_Id]);

  const handleFollow = async () => {
    if (!ecoData?.Uploader_ID || !currentUserID) return;
    
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
        body: `followeeID=${ecoData.Uploader_ID}`
      });
      
      if (response.ok) {
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
      
      const response = await fetch('http://10.0.2.2:7011/luv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authToken || ''
        },
        body: `eco_id=${ecoData.Eco_Id}`
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLuved(data.luved);
        
        const statusResponse = await fetch('http://10.0.2.2:7011/check-eco-luv-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `eco_id=${ecoData.Eco_Id}&user_ID=${currentUserID}`
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setCurrentLuvCount(statusData.total_luvs || 0);
        }
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
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={require('@/assets/images/backIcon.png')} className="w-6 h-6" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold flex-1">Eco Post</Text>
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="border border-gray-200">
          <View className="px-2 py-2 flex-row items-center">
            {profileImageError ? (
              <View className="w-6 h-6 mr-2 rounded-full bg-primary-25 justify-center items-center">
                <Text className="text-primary text-xs font-semibold">
                  {ecoData.Uploader_Name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            ) : (
              <Image 
                source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${ecoData.Uploader_ID}` }} 
                className="w-6 h-6 mr-2 rounded-full" 
                resizeMode="cover" 
                onError={() => setProfileImageError(true)}
              />
            )}
            <TouchableOpacity 
              className="flex-row items-center flex-1"
              onPress={() => {
                if (currentUserID && ecoData.Uploader_ID === currentUserID) {
                  router.push('/(tabs)/myprofile');
                } else {
                  router.push(`/users/${ecoData.Uploader_ID}`);
                }
              }}
            >
              <Text className="text-black font-semibold mr-2">{ecoData.Uploader_Name}</Text>
              <Text className="text-gray-500 text-secondary">{ecoData.Uploader_Handle}</Text>
            </TouchableOpacity>
            {currentUserID !== ecoData.Uploader_ID && (
              <TouchableOpacity 
                className={`${followInfo?.AlreadyFollowed ? 'bg-select' : 'bg-primary-150'} px-3 py-1 rounded-lg`}
                onPress={handleFollow}
              >
                <Text className={`${followInfo?.AlreadyFollowed ? 'text-black': 'text-white'} text-xs font-semibold`}>
                  {followInfo?.AlreadyFollowed ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View className="pb-2" style={{ marginLeft: 32 }}>
            <Text className="text-black">{ecoData.Eco_Text}</Text>
          </View>
          
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
                  source={{ uri: `http://10.0.2.2:8088/e?eco_url=${ecoData.Eco_Url}&index=${index}` }}
                  style={{ width: screenWidth, height: 300 }}
                  resizeMode="contain"
                  onError={(error) => {
                    setImageError(prev => ({...prev, [`${ecoData.Eco_Id}-${index}`]: true}));
                  }}
                />
              ))}
            </ScrollView>
            {ecoData.Images_Count > 1 && (
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row' }}>
                {Array.from({ length: ecoData.Images_Count }, (_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: (currentImageIndex[ecoData.Eco_Id] || 0) === index ? 'white' : 'rgba(255,255,255,0.5)',
                      marginHorizontal: 2
                    }}
                  />
                ))}
              </View>
            )}
            <ScrollView horizontal className="flex-row mt-2 mb-9" showsHorizontalScrollIndicator={false}>
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
              <TouchableOpacity 
                className="p-2 mr-2"
                onPress={async () => {
                  try {
                    const token = await GetToken('jwt');
                    if (!token) {
                      Alert.alert("Error", "Authentication required.");
                      return;
                    }
                    const response = await fetch(`http://10.0.2.2:8100/save-eco?ecoID=${ecoData.Eco_Id}`, {
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
                    console.error('Save eco error:', error);
                  }
                }}
              >
                <Image source={isSaved ? require("../../assets/images/SavedIcon.png") : require("../../assets/images/SaveIcon.png")} className="w-6 h-6" resizeMode="contain"/>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity 
              className="bg-gray-100 rounded-xl mb-3 justify-center items-center py-1 flex-1 mx-2"
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
            
            <Text className="text-xl font-semibold py-2 border-b border-gray-200 px-2">Comments</Text>
            
            <CommentSectionComponent 
              ecoID={+ecoID} 
              onRefresh={(refreshFn) => { refreshRef.current = refreshFn; }} 
            />
          </BottomSheet>

          <EcoCommentInputComponent 
            ecoID={+ecoID} 
            onCommentAdded={() => refreshRef.current?.()} 
          />
        </>
      )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}