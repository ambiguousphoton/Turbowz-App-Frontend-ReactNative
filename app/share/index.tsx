import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import ContactsComponent from "../../components/ContactsComponent"
import { useWS } from '@/context/WebSocketConnectionContext'
import { dbEvents } from '@/HelperFuncs/MessageStorage'


const SharePage = () => {
    const { messages } = useWS();
    const [refreshKey, setRefreshKey] = useState(0);
    const { shareType, shareId, shareTitle, shareText, shareUrl } = useLocalSearchParams();

    useEffect(() => {
        const handleRoomUpdated = () => {
            setRefreshKey(prev => prev + 1);
        };
        
        const subscription = dbEvents.addListener('roomUpdated', handleRoomUpdated);
        return () => subscription.remove();
    }, []);

    return (
        <SafeAreaView className="flex-1">
            <View className="px-4 py-2 flex-row items-center border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Image source={require('../../assets/images/backIcon.png')} className="w-6 h-6" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Share</Text>
            </View>
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <ContactsComponent 
                    key={refreshKey}
                    shareType={shareType as string}
                    shareId={shareId as string}
                    shareTitle={shareTitle as string}
                    shareText={shareText as string}
                    shareUrl={shareUrl as string}
                />
            </ScrollView>
            
            <View className="bg-white mx-4 mb-6 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-gray-50 rounded-xl mr-4 justify-center items-center">
                        {shareType === 'video' ? (
                            <Text className="text-xl">🎥</Text>
                        ) : (
                            <Image 
                                source={require('../../assets/images/HomeScreenLogo.png')} 
                                className="w-8 h-8" 
                                resizeMode="contain"
                            />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-base" numberOfLines={2}>
                            {shareType === 'video' ? shareTitle : shareText}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            {shareType === 'video' ? 'Video' : 'Eco'} • Ready to share
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SharePage;