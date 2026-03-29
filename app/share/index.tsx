import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import ContactsComponent from "../../components/ContactsComponent"
import { useWS } from '@/context/WebSocketConnectionContext'
import { dbEvents, saveOutgoingMessage } from '@/HelperFuncs/MessageStorage'
import { GetUser } from '@/HelperFuncs/localStorage'
import { useSQLiteContext } from 'expo-sqlite'
import GliterAlertComponent from '@/components/GliterAlertComponent'


const SharePage = () => {
    const { messages, sendMessage: wsSendMessage } = useWS();
    const db = useSQLiteContext();
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedContacts, setSelectedContacts] = useState<{userID: string, roomID: string}[]>([]);
    const [sending, setSending] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<TextInput>(null);
    const clearingRef = useRef(false);
    const { shareType, shareId, shareTitle, shareText, shareUrl, shareHandle } = useLocalSearchParams();

    const handleClearSearch = () => {
        clearingRef.current = true;
        setSearchQuery('');
        searchInputRef.current?.blur();
        setTimeout(() => { clearingRef.current = false; }, 100);
    };

    useEffect(() => {
        const handleRoomUpdated = () => {
            setRefreshKey(prev => prev + 1);
        };
        
        const subscription = dbEvents.addListener('roomUpdated', handleRoomUpdated);
        return () => subscription.remove();
    }, []);

    const handleMassShare = async () => {
        if (selectedContacts.length === 0) return;
        
        setSending(true);
        const sharedContent = shareType === 'video' 
            ? `Check out this video: ${shareTitle}\nhttps://turbowz.com/video?id=${encodeURIComponent(shareId as string)}&url=${encodeURIComponent(shareUrl as string || '')}`
            : shareType === 'eco'
            ? `Check out this eco: ${shareText}\nhttps://turbowz.com/eco?id=${encodeURIComponent(shareId as string)}`
            : `Check out this profile: ${shareTitle} (@${shareHandle})\nhttps://turbowz.com/profile?id=${encodeURIComponent(shareId as string)}`;
        
        const currentUser = await GetUser();
        let successCount = 0;
        
        for (const contact of selectedContacts) {
            const messageData = {
                messageText: sharedContent,
                destinationID: contact.userID,
                roomID: contact.roomID,
                links: ""
            };
            
            if (currentUser?.UserID) {
                await saveOutgoingMessage(messageData, currentUser.UserID.toString(), db);
            }
            
            const success = wsSendMessage(messageData);
            if (success) successCount++;
        }
        
        setSending(false);
        router.back();
        
        setTimeout(() => {
            setAlertMessage('Sent');
            setAlertVisible(true);
        }, 100);
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="px-4 py-2 flex-row items-center border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Image source={require('../../assets/images/backIcon.png')} className="w-6 h-6" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Share</Text>
                {selectedContacts.length > 0 && (
                    <Text className="text-primary-150 text-sm ml-auto">
                        {selectedContacts.length} selected
                    </Text>
                )}
            </View>
            
            <View className="px-4 py-3">
                <View className="flex-row items-center">
                    <TextInput
                        ref={searchInputRef}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search contacts..."
                        className="bg-white rounded-2xl px-4 py-3 text-base flex-1"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                            setIsSearchFocused(false);
                        }}
                    />
                    {(searchQuery.length > 0 || isSearchFocused) && (
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            className="px-6 py-6"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Image
                                source={require("../../assets/images/CrossIcon.png")}
                                className="w-5 h-5"
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <ContactsComponent 
                    key={refreshKey}
                    searchQuery={searchQuery}
                    shareType={shareType as string}
                    shareId={shareId as string}
                    shareTitle={shareTitle as string}
                    shareText={shareText as string}
                    shareHandle={shareHandle as string}
                    selectionMode={true}
                    selectedContacts={selectedContacts}
                    onSelectionChange={setSelectedContacts}
                />
            </ScrollView>
            
            <View className="bg-white mx-4 mb-6 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-gray-50 rounded-xl mr-4 justify-center items-center">
                        {shareType === 'video' ? (
                            <Text className="text-xl">🎥</Text>
                        ) : shareType === 'eco' ? (
                            <Image 
                                source={require('../../assets/images/HomeScreenLogo.png')} 
                                className="w-8 h-8" 
                                resizeMode="contain"
                            />
                        ) : (
                            <Text className="text-xl">👤</Text>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-base" numberOfLines={2}>
                            {shareType === 'video' ? shareTitle : shareType === 'eco' ? shareText : `${shareTitle} (@${shareHandle})`}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            {shareType === 'video' ? 'Video' : shareType === 'eco' ? 'Eco' : 'Profile'} • Ready to share
                        </Text>
                    </View>
                </View>
                {selectedContacts.length > 0 && (
                    <TouchableOpacity 
                        className={`mt-4 py-3 px-6 rounded-xl flex-row items-center justify-center ${sending ? 'bg-gray-300' : 'bg-primary-150'}`}
                        onPress={handleMassShare}
                        disabled={sending}
                    >
                        <Text className="text-white font-semibold text-base">
                            {sending ? 'Sending...' : `Send to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {alertVisible && (
                <GliterAlertComponent 
                    message={alertMessage}
                    visible={alertVisible}
                    onHide={() => setAlertVisible(false)}
                />
            )}
        </SafeAreaView>
    );
}

export default SharePage