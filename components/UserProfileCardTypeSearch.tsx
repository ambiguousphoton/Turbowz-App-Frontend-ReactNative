import {Text, View, ActivityIndicator,Image, Pressable} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { VideoCardInterface } from '@/interfaces/interfaces'
import React, { useState, useEffect } from "react";
import { Link } from 'expo-router';
import { UserDataInterface } from '@/interfaces/interfaces';
import ConnectionRequestButton from './connectionRequestButton';
import { GetUser } from '@/HelperFuncs/localStorage';

const UserContactCardTypeSearch = ({userID}:{userID :string}) =>{
    const [data, setData] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImageError, setProfileImageError] = useState(false);
    const [currentUserID, setCurrentUserID] = useState<number | null>(null);
    const [isTurboVerified, setIsTurboVerified] = useState(false);

    useEffect(() => {
        const getUserID = async () => {
            const localUser = await GetUser();
            setCurrentUserID(localUser?.UserID || null);
        };
        getUserID();
        
        fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`)
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));

        fetch(`http://10.0.2.2:8100/get-turbomax-status?userID=${userID}`)
            .then(res => res.json())
            .then(result => setIsTurboVerified(result.turbomax_active || false))
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

    const handlePress = () => {
        if (currentUserID && parseInt(userID) === currentUserID) {
            router.push('/(tabs)/myprofile');
        } else {
            router.push(`./users/${userID}`);
        }
    };

    return (
        <Pressable className="flex-row items-center p-4 bg-white border-b border-gray-100" onPress={handlePress}>
            {/* Profile Icon */}
            {profileImageError ? (
                <View className="w-12 h-12 rounded-full bg-primary-25 justify-center items-center">
                    <Text className="text-primary text-lg font-semibold">
                        {data?.UserHandle?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
            ) : (
                <Image 
                    source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${userID}` }} 
                    className="w-12 h-12 rounded-full" 
                    resizeMode="cover" 
                    onError={() => setProfileImageError(true)}
                />
            )}

            {/* User Info */}
            <View className="ml-4 flex-1">
                <View className='flex-row'>
                <Text className="text-base font-semibold" numberOfLines={1}>
                {data.UserProfileName}
                </Text>
                <View className="ml-2 flex-row items-center">
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
            </View>
            </Pressable>

    )
}
export default UserContactCardTypeSearch;