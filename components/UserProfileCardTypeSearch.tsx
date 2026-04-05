import {Text, View, ActivityIndicator,Image, Pressable, TouchableOpacity} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { VideoCardInterface } from '@/interfaces/interfaces'
import React, { useState, useEffect } from "react";
import { Link } from 'expo-router';
import { UserDataInterface } from '@/interfaces/interfaces';
import ConnectionRequestButton from './connectionRequestButton';
import { GetUser, GetToken } from '@/HelperFuncs/localStorage';
import { getUser, getTurbomaxStatus } from '@/Services/api/userService';
import { getFollowingInfo, follow, unfollow } from '@/Services/api/followService';
import { pfpUrl } from '@/Services/api/imageService';

const UserContactCardTypeSearch = ({userID}:{userID :string}) =>{
    const [data, setData] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImageError, setProfileImageError] = useState(false);
    const [currentUserID, setCurrentUserID] = useState<number | null>(null);
    const [isTurboVerified, setIsTurboVerified] = useState(false);
    const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);

    useEffect(() => {
        const getUserID = async () => {
            const localUser = await GetUser();
            setCurrentUserID(localUser?.UserID || null);
            
            // Fetch follow info after getting current user
            if (localUser?.UserID) {
                getFollowingInfo(userID, localUser.UserID)
                    .then(setFollowInfo)
                    .catch(() => setFollowInfo(null));
            }
        };
        getUserID();
        
        getUser(userID)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));

        getTurbomaxStatus(userID)
            .then(setIsTurboVerified)
            .catch(() => setIsTurboVerified(false));
    }, [userID]);
    if (loading) return (
        <View className="p-4 bg-white ">
            <ActivityIndicator size="small" color="#69E2FF" />
        </View>
    );
    if (!data) return (
        <View className="p-4 bg-white border border-select rounded-2xl mb-3">
            <Text className="text-gray-500 text-center">No user found</Text>
        </View>
    );

    const handleFollow = async (e: any) => {
        e.stopPropagation();
        try {
            const authToken = await GetToken('jwt');
            const isUnfollow = followInfo?.AlreadyFollowed;
            const success = isUnfollow
                ? await unfollow(authToken || '', userID)
                : await follow(authToken || '', userID);
            if (success) {
                setFollowInfo(prev => prev ? {
                    ...prev, 
                    AlreadyFollowed: !prev.AlreadyFollowed, 
                    FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1
                } : null);
            }
        } catch (error) {
            console.error('Follow/Unfollow error:', error);
        }
    };

    const handlePress = () => {
        if (currentUserID && parseInt(userID) === currentUserID) {
            router.push('/(tabs)/myprofile');
        } else {
            router.push(`./users/${userID}`);
        }
    };

    return (
        <Pressable className="p-4 bg-white " onPress={handlePress}>
            <View className="flex-row items-start">
                {/* Profile Icon */}
                {profileImageError ? (
                    <View className="w-12 h-12 rounded-full bg-primary-25 justify-center items-center">
                        <Text className="text-primary text-lg font-semibold">
                            {data?.UserHandle?.[0]?.toUpperCase() || '?'}
                        </Text>
                    </View>
                ) : (
                    <Image 
                        source={{ uri: pfpUrl(userID) }} 
                        className="w-12 h-12 rounded-full" 
                        resizeMode="cover" 
                        onError={() => setProfileImageError(true)}
                    />
                )}

                {/* User Info */}
                <View className="ml-4 flex-1 min-w-0">
                    <View className='flex-row items-center flex-wrap'>
                        <Text className="text-base font-semibold flex-shrink" numberOfLines={1}>
                            {data.UserProfileName}
                        </Text>
                        <View className="ml-2 flex-row items-center flex-shrink">
                            <Text className="text-base text-secondary">{data.UserHandle}</Text>
                            {isTurboVerified && (
                                <Image 
                                    source={require('../assets/images/TurboVerifiedIcon.png')} 
                                    className="w-4 h-4 ml-1" 
                                    resizeMode="contain" 
                                />
                            )}
                        </View>
                    </View>

                    
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {data.UserDescription || "Hey there!"}
                    </Text>
                    
                    {followInfo && (
                        <Text className="text-xs text-gray-500 mt-1">
                            {followInfo.FollowerCount} followers
                        </Text>
                    )}
                </View>
                
                {/* Follow Button */}
                {currentUserID && parseInt(userID) !== currentUserID && followInfo && (
                    <View className="ml-2 justify-center">
                        <TouchableOpacity 
                            onPress={handleFollow}
                            className={`px-3 py-1.5 rounded-lg ${
                                followInfo.AlreadyFollowed ? 'bg-gray-200' : 'bg-black'
                            }`}
                        >
                            <Text className={`text-xs font-medium ${
                                followInfo.AlreadyFollowed ? 'text-gray-700' : 'text-white'
                            }`}>
                                {followInfo.AlreadyFollowed ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Pressable>

    )
}
export default UserContactCardTypeSearch;