import { View, Text, Image, Dimensions, ScrollView, TouchableOpacity, Animated } from "react-native";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { useState, useEffect, useRef } from "react";
import { GetUser, GetToken } from "@/HelperFuncs/localStorage";
import { Link, router } from "expo-router";

interface EcoCardProps {
  item: EcoDataInterface;
}

export const EcoCardComponent = ({ item }: EcoCardProps) => {
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [profileImageError, setProfileImageError] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);
  const [isLuved, setIsLuved] = useState<boolean>(false);
  const [initialIsLuved, setInitialIsLuved] = useState<boolean>(false);
  const [currentLuvCount, setCurrentLuvCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const luvAnimScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getCurrentUser = async () => {
      const localUser = await GetUser();
      setCurrentUserID(localUser?.UserID || null);
      console.log('EcoCard - Current User ID:', localUser?.UserID);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const getFollowInfo = async () => {
      if (currentUserID && item.Uploader_ID) {
        try {
          const response = await fetch(`http://10.0.2.2:8010/get-following-info?userID=${item.Uploader_ID}&requesterID=${currentUserID}`);
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
  }, [currentUserID, item.Uploader_ID]);

  useEffect(() => {
    const getLuvStatus = async () => {
      if (currentUserID && item.Eco_Id) {
        try {
          const response = await fetch('http://10.0.2.2:7011/check-eco-luv-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `eco_id=${item.Eco_Id}&user_ID=${currentUserID}`
          });
          if (response.ok) {
            const data = await response.json();
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
        const response = await fetch(`http://10.0.2.2:8100/eco-saved-status?ecoID=${item.Eco_Id}`, {
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
  }, [item.Eco_Id]);

  const handleFollow = async () => {
    if (!item.Uploader_ID || !currentUserID) {
      console.error('Invalid uploader ID or current user ID');
      return;
    }
    
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
        body: `followeeID=${item.Uploader_ID}`
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
      
      const response = await fetch('http://10.0.2.2:7011/luv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authToken || ''
        },
        body: `eco_id=${item.Eco_Id}`
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLuved(data.luved);
        
        // Refresh luv count from API
        const statusResponse = await fetch('http://10.0.2.2:7011/check-eco-luv-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `eco_id=${item.Eco_Id}&user_ID=${currentUserID}`
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setCurrentLuvCount(statusData.total_luvs || 0);
        }
        
        console.log('Luv action successful:', data.luved);
      } else {
        console.error('Luv action failed:', response.status);
      }
    } catch (error) {
      console.error('Luv error:', error);
    }
  };

  return (
    <Link href={`/ecos/${item.Eco_Id}`} asChild>
      <TouchableOpacity>
        <View className="border border-gray-200">
      <View className="px-2 py-2 flex-row items-center">
        {profileImageError ? (
          <View className="w-6 h-6 mr-2 rounded-full bg-primary-25 justify-center items-center">
            <Text className="text-primary text-xs font-semibold">
              {item.Uploader_Name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        ) : (
          <Image 
            source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${item.Uploader_ID}` }} 
            className="w-6 h-6 mr-2 rounded-full" 
            resizeMode="cover" 
            onError={() => setProfileImageError(true)}
          />
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
          <Text className="text-black font-semibold mr-2">{item.Uploader_Name}</Text>
          <Text className="text-gray-500 text-secondary">{item.Uploader_Handle}</Text>
        </TouchableOpacity>
        {currentUserID !== item.Uploader_ID && (
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
        <Text className="text-black">{item.Eco_Text}</Text>
      </View>
      
      <View style={{ position: 'relative' }} >
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(prev => ({...prev, [item.Eco_Id]: index}));
          }}
          
        >
          {Array.from({ length: item.Images_Count }, (_, index) => (
            <Image
              key={index}
              source={{ uri: `http://10.0.2.2:8088/e?eco_url=${item.Eco_Url}&index=${index}` }}
              style={{ width: screenWidth, height: 300 }}
              resizeMode="contain"
              onError={(error) => {
                console.log('Image load error:', error.nativeEvent.error);
                console.log('Image URL:', `http://10.0.2.2:8088/e?eco_url=${item.Eco_Url}&index=${index}`);
                setImageError(prev => ({...prev, [`${item.Eco_Id}-${index}`]: true}));
              }}
              onLoad={() => console.log('Image loaded successfully for eco:', item.Eco_Id, 'index:', index)}
            />
          ))}
        </ScrollView>
        {item.Images_Count > 1 && (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row' }}>
            {Array.from({ length: item.Images_Count }, (_, index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: (currentImageIndex[item.Eco_Id] || 0) === index ? 'white' : 'rgba(255,255,255,0.5)',
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
                source={isLuved ? require("../assets/images/LuvedIcon.png") : require("../assets/images/ToLuvIcon.png")} 
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
                shareId: item.Eco_Id,
                shareText: item.Eco_Text,
                shareUrl: item.Eco_Url
              }
            })}
          >
            <Image source={require("../assets/images/ShareIcon.png")} className="w-7 h-7 mx-2" resizeMode="contain"/>
            <Text className="text-gray-600 text-sm mr-2">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-2 mr-2"
            onPress={async () => {
              try {
                const token = await GetToken('jwt');
                if (!token) {
                  console.error('Authentication required');
                  return;
                }
                const response = await fetch(`http://10.0.2.2:8100/save-eco?ecoID=${item.Eco_Id}`, {
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
            <Image source={isSaved ? require("../assets/images/SavedIcon.png") : require("../assets/images/SaveIcon.png")} className="w-6 h-6" resizeMode="contain"/>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {Object.keys(imageError).some(key => key.startsWith(item.Eco_Id.toString())) && (
        <View className="px-4">
          <Text className="text-red-500 text-sm mt-2">Some images failed to load</Text>
        </View>
      )}
        </View>
      </TouchableOpacity>
    </Link>
  );
};