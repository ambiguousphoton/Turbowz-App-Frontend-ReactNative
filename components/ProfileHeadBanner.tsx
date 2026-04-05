import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { UserDataInterface } from "@/interfaces/interfaces";
import { useRouter } from 'expo-router';
import { getTurbomaxStatus } from '@/Services/api/userService';
import { pfpUrl } from '@/Services/api/imageService';

interface ProfileHeadBannerProps {
    user: UserDataInterface;
    followInfo?: {FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null;
}

const ProfileHeadBanner: React.FC<ProfileHeadBannerProps> = ({ user, followInfo }) => {
    const router = useRouter();
    const [profileImageError, setProfileImageError] = useState(false);
    const [isTurboVerified, setIsTurboVerified] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    
    useEffect(() => {
        if (user?.UserID) {
            getTurbomaxStatus(user.UserID)
                .then(setIsTurboVerified)
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
            <Modal
                visible={showImageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/90 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setShowImageModal(false)}
                >
                    <Image 
                        source={{ uri: pfpUrl(user?.UserID) }}
                        className="w-full h-96"
                        resizeMode="contain"
                    />
                    <TouchableOpacity 
                        className="absolute top-12 right-6 bg-white/20 rounded-full p-2"
                        onPress={() => setShowImageModal(false)}
                    >
                        <Text className="text-white text-2xl font-bold">×</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            
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
                        <TouchableOpacity onPress={() => setShowImageModal(true)}>
                            <Image 
                                source={{ uri: pfpUrl(user?.UserID) }}
                                className="w-24 h-24 rounded-full border-4 border-white" 
                                resizeMode="cover" 
                                onError={() => setProfileImageError(true)}
                            />
                        </TouchableOpacity>
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
                        <TouchableOpacity onPress={() => router.push(`/following?userID=${user.UserID}`)}>
                            <Text className="text-gray-500 text-sm mr-6">{followInfo?.FolloweeCount || 0} Following</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push(`/followers?userID=${user.UserID}`)}>
                            <Text className="text-gray-500 text-sm">{followInfo?.FollowerCount || 0} Followers</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ProfileHeadBanner;