import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { UserDataInterface } from "@/interfaces/interfaces";

interface ProfileHeadBannerProps {
    user: UserDataInterface;
    followInfo?: {FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null;
}

const ProfileHeadBanner: React.FC<ProfileHeadBannerProps> = ({ user, followInfo }) => {
    const [profileImageError, setProfileImageError] = useState(false);
    const [isTurboVerified, setIsTurboVerified] = useState(false);
    
    useEffect(() => {
        if (user?.UserID) {
            fetch(`http://10.0.2.2:8100/get-turbomax-status?userID=${user.UserID}`)
                .then(res => res.json())
                .then(result => setIsTurboVerified(result.turbomax_active || false))
                .catch(() => setIsTurboVerified(false));
        }
    }, [user?.UserID]);

    const getShapeStyle = (firstLetter: string) => {
        const charCode = firstLetter.toUpperCase().charCodeAt(0);
        const shapeIndex = charCode % 3;
        
        switch (shapeIndex) {
            case 0: return 'shape-circle'; // Circle
            case 1: return 'shape-square'; // Rounded square
            case 2: return 'shape-diamond'; // Diamond
            default: return 'shape-circle';
        }
    };

    return (
        <View className="relative mx-4">
            <View className="h-20 bg-primary-25 mt-2 w-full rounded-2xl overflow-hidden">
                <View className="absolute inset-0">
                    <View className="absolute top-2 left-4 w-6 h-6 bg-primary-150 shape-circle opacity-30" />
                    <View className="absolute top-4 right-8 w-4 h-4 bg-primary-300 shape-square opacity-40" />
                    <View className="absolute bottom-3 left-12 w-5 h-5 bg-primary-200 shape-diamond opacity-35" />
                    <View className="absolute top-1 right-16 w-3 h-3 bg-primary-150 shape-diamond opacity-50" />
                    <View className="absolute bottom-2 right-4 w-7 h-7 bg-primary-300 shape-circle opacity-25" />
                    <View className="absolute top-6 left-20 w-4 h-4 bg-primary-200 shape-square opacity-45" />
                </View>
            </View>
            
            <View className="px-6 items-center relative -mt-20"> 
                <View className="mt-2 mb-2"> 
                    {profileImageError || !user?.UserID ? (
                        <View className={`w-24 h-24 ${getShapeStyle(user?.UserHandle?.[0] || '?')} bg-primary-25 justify-center items-center border-4 border-white`}>
                            <Text className="text-primary text-3xl font-semibold">
                                {user?.UserHandle?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                    ) : (
                        <Image 
                            source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${user?.UserID}` }}
                            className="w-24 h-24 rounded-full border-4 border-white" 
                            resizeMode="cover" 
                            onError={() => setProfileImageError(true)}
                        />
                    )}
                </View>
                
                <View className='items-center'>
                    <View className="flex-row items-center mb-1">
                        <Text className="text-xl font-semibold">{user?.UserProfileName}</Text>
                        {isTurboVerified && (
                            <Image 
                                source={require('../assets/images/TurboVerifiedIcon.png')} 
                                className="w-5 h-5 ml-1" 
                                resizeMode="contain" 
                            />
                        )}
                    </View>

                    {user?.UserDescription && (
                        <Text className="text-gray-600 text-sm text-center mb-2">{user.UserDescription}</Text>
                    )}
                    
                    <View className="flex-row">
                        <Text className="text-gray-500 text-sm mr-6">{followInfo?.FolloweeCount || 0} Following</Text>
                        <Text className="text-gray-500 text-sm">{followInfo?.FollowerCount || 0} Followers</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ProfileHeadBanner;