import {Text, View, ActivityIndicator,Image, Pressable} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { VideoCardInterface } from '@/interfaces/interfaces'
import React, { useState, useEffect } from "react";
import { Link } from 'expo-router';
import { UserDataInterface } from '@/interfaces/interfaces';
import ConnectionRequestButton from './connectionRequestButton';
import UserContactCardPlaceholder from './UserContactCardPlaceholder';

interface UserContactCardProps {
    userID: string;
    roomID?: string;
    latestMessage?: string;
    latestMessageTime?: string;
    unreadCount?: number;
    shareType?: string;
    shareId?: string;
    shareTitle?: string;
    shareText?: string;
    shareUrl?: string;
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelectionToggle?: (selected: boolean) => void;
}

const UserContactCard = ({userID, roomID, latestMessage, latestMessageTime, unreadCount, shareType, shareId, shareTitle, shareText, shareUrl, selectionMode, isSelected, onSelectionToggle}: UserContactCardProps) => {
    const [data, setData] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImageError, setProfileImageError] = useState(false);

    useEffect(() => {
    fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`) // use 10.0.2.2 for Android emulator
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
      }, [userID]);
    if (loading) return <UserContactCardPlaceholder />;
    if (!data) return (
        <View className="p-4 bg-white border border-select rounded-2xl mb-3">
            <Text className="text-gray-500 text-center">No user found</Text>
        </View>
    );

    if (selectionMode) {
        return (
            <Pressable 
                className={`flex-row items-center p-4 bg-white border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                onPress={() => onSelectionToggle?.(!isSelected)}
            >
                <View className={`w-6 h-6 rounded-full border-2 mr-3 justify-center items-center ${isSelected ? 'bg-primary-150 border-primary-150' : 'border-gray-300'}`}>
                    {isSelected && <Text className="text-white text-xs">✓</Text>}
                </View>
                {profileImageError ? (
                    <View className="w-12 h-12 rounded-full bg-primary-25 justify-center items-center">
                        <Text className="text-primary text-lg font-semibold">
                            {data?.UserProfileName?.[0]?.toUpperCase() || '?'}
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
                <View className="ml-4 flex-1">
                    <Text className="text-base font-semibold" numberOfLines={1}>
                        {data.UserProfileName}
                    </Text>
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                        {latestMessage || data.UserDescription || "Hey there!"}
                    </Text>
                </View>
            </Pressable>
        );
    }

    return (
        <Link href={{
            pathname: `/chats/${userID}`,
            params: {
                ...(roomID && { roomID }),
                ...(shareType && { shareType }),
                ...(shareId && { shareId }),
                ...(shareTitle && { shareTitle }),
                ...(shareText && { shareText }),
                ...(shareUrl && { shareUrl })
            }
        }} asChild>
            <Pressable className="flex-row items-center p-4 bg-white border-b border-gray-100">
            {/* Profile Icon */}
            {profileImageError ? (
                <View className="w-12 h-12 rounded-full bg-primary-25 justify-center items-center">
                    <Text className="text-primary text-lg font-semibold">
                        {data?.UserProfileName?.[0]?.toUpperCase() || '?'}
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
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <Text className="text-base font-semibold" numberOfLines={1}>
                        {data.UserProfileName}
                        </Text>

                    </View>
                    {latestMessageTime && (
                        <Text className="text-xs text-gray-400">
                            {(() => {
                                const messageDate = new Date(latestMessageTime);
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);
                                
                                const isToday = messageDate.toDateString() === today.toDateString();
                                const isYesterday = messageDate.toDateString() === yesterday.toDateString();
                                
                                if (isToday) return messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                if (isYesterday) return 'Yesterday';
                                return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            })()
                            }
                        </Text>
                    )}
                </View>
                <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
                    {latestMessage || data.UserDescription || "Hey there!"}
                    </Text>
                    {unreadCount && unreadCount > 0 && (
                        <View className="w-2 h-2 bg-primary-150 rounded-full ml-2" />
                    )}
                </View>
            </View>
            </Pressable>
        </Link>
    )
}
export default UserContactCard;