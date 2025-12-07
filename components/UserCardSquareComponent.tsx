import {Text, View, ActivityIndicator, Image, Pressable} from 'react-native'
import { router } from 'expo-router'
import React, { useState, useEffect } from "react";
import { UserDataInterface } from '@/interfaces/interfaces';
import { GetUser } from '@/HelperFuncs/localStorage';

const UserCardSquareComponent = ({userID}: {userID: string}) => {
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
        <View className="w-32 h-40 bg-white rounded-2xl justify-center items-center">
            <ActivityIndicator size="small" color="#69E2FF" />
        </View>
    );

    if (!data) return (
        <View className="w-32 h-40 bg-white border border-select rounded-2xl justify-center items-center">
            <Text className="text-gray-500 text-center text-xs">No user found</Text>
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
        <Pressable className="w-32 h-40 bg-white border border-gray-100 rounded-2xl p-3 justify-center items-center" onPress={handlePress}>
            {/* Profile Icon */}
            {profileImageError ? (
                <View className="w-12 h-12 rounded-full bg-primary-25 justify-center items-center mb-2">
                    <Text className="text-primary text-lg font-semibold" >
                        {data?.UserHandle?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
            ) : (
                <Image 
                    source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${userID}` }} 
                    className="w-12 h-12 rounded-full mb-2" 
                    resizeMode="cover" 
                    onError={() => setProfileImageError(true)}
                />
            )}

            {/* User Info */}
            <Text className="text-sm font-semibold text-center" numberOfLines={1}>
                {data.UserProfileName}
            </Text>
            <View className="flex-row items-center justify-center">

                <Text className="text-xs text-secondary text-center" numberOfLines={1} >
                    {data.UserHandle}
                </Text>
                {isTurboVerified && (
                    <Image 
                        source={require('../assets/images/TurboVerifiedIcon.png')} 
                        className="w-3 h-3 ml-1" 
                        resizeMode="contain" 
                    />
                )}
            </View>
            <Text className="text-xs text-gray-600 text-center" numberOfLines={2}>
                {data.UserDescription || "Hey there!"}
            </Text>
        </Pressable>
    )
}

export default UserCardSquareComponent;