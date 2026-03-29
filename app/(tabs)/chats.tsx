import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ContactsComponent from "../../components/ContactsComponent"
import { Link } from 'expo-router'
import { useWS } from '@/context/WebSocketConnectionContext'
import { dbEvents } from '@/HelperFuncs/MessageStorage'
import UserCardSquareComponent from '@/components/UserCardSquareComponent'
import TurbowConnectComponent from '@/components/TurbowConnect'
import Simple3DModel from '@/components/Simple3DModel'
const Create =() =>{
    const insets = useSafeAreaInsets();
    const { messages } = useWS();
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMainContent, setShowMainContent] = useState(true);
    const searchInputRef = useRef<TextInput>(null);
    const clearingRef = useRef(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleClearSearch = () => {
        clearingRef.current = true;
        setSearchQuery('');
        setShowMainContent(true);
        searchInputRef.current?.blur();
        setTimeout(() => { clearingRef.current = false; }, 100);
    };

    useEffect(() => {
        // WebSocket messages updated
    }, [messages]);



    useEffect(() => {
        const handleRoomUpdated = () => {
            setRefreshKey(prev => prev + 1);
        };
        
        const subscription = dbEvents.addListener('roomUpdated', handleRoomUpdated);
        return () => subscription.remove();
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: '#F0FAFE' }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>

                <View className="px-4 pt-4 pb-4">
                    <View className="flex-row items-center" style={styles.searchBar}>
                        <Image
                            source={require("../../assets/images/searchIcon.png")}
                            className="w-4 h-4 ml-3 mr-1 opacity-40"
                            resizeMode="contain"
                        />
                        <TextInput
                            ref={searchInputRef}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search chats..."
                            placeholderTextColor="#A0BCC8"
                            className="rounded-2xl px-3 py-3 text-base flex-1"
                            style={{ color: '#1C1C2E' }}
                            onFocus={() => {
                                setShowMainContent(false);
                                setIsSearchFocused(true);
                            }}
                            onBlur={() => {
                                setIsSearchFocused(false);
                                if (!clearingRef.current && searchQuery.length === 0) {
                                    setShowMainContent(true);
                                }
                            }}
                        />
                        {(searchQuery.length > 0 || isSearchFocused) && (
                            <TouchableOpacity
                                onPress={handleClearSearch}
                                className="px-4 py-4"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Image
                                    source={require("../../assets/images/CrossIcon.png")}
                                    className="w-4 h-4"
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {showMainContent && (
                    <>
                        <View style={styles.peopleSection}>
                            <View className="flex-row items-center px-4 pt-4 pb-3">
                                <Simple3DModel />
                                <Text className="text-base font-bold ml-2" style={{ color: '#023c69' }}>People you may know</Text>
                            </View>
                            <ScrollView horizontal className="flex-row px-4 pb-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                                <UserCardSquareComponent userID="7" />
                                <UserCardSquareComponent userID="80" />
                                <UserCardSquareComponent userID="8" />
                                <UserCardSquareComponent userID="7" />
                                <UserCardSquareComponent userID="80" />
                                <UserCardSquareComponent userID="8" />
                                <UserCardSquareComponent userID="27" />
                            </ScrollView>
                        </View>
                        <TurbowConnectComponent />
                    </>
                )}
                
                <View style={styles.chatListSection}>
                    <Text className="px-4 pt-4 pb-4 text-sm font-semibold" style={{ color: '#6BAFCF', letterSpacing: 0.5 }}>MESSAGES</Text>
                    <ContactsComponent key={refreshKey} searchQuery={searchQuery}/>
                </View>
                {/* <ScrollView horizontal className="flex-row my-2 mb-60" showsHorizontalScrollIndicator={true}>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2 mr-2"><Image source={require("../../assets/images/AgreeIcon.png")}  className="w-7 h-7 mx-2" resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Agree</Text></TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2 mr-2"><Image source={require("../../assets/images/DisagreeIcon.png")}  className="w-7 h-7 mx-2" resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Disagree</Text></TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2 mr-2"><Image source={require("../../assets/images/ShareIcon.png")}  className="w-7 h-7 mx-2 " resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Share</Text></TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2 mr-2"><Image source={require("../../assets/images/AgreeIcon.png")}  className="w-7 h-7 mx-2" resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Agree</Text></TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2 mr-2"><Image source={require("../../assets/images/DisagreeIcon.png")}  className="w-7 h-7 mx-2" resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Disagree</Text></TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 p-1 rounded-xl flex-row items-center p-2"><Image source={require("../../assets/images/ShareIcon.png")}  className="w-7 h-7 mx-2 " resizeMode="contain"/><Text className="text-gray-600 text-sm mr-2">Share</Text></TouchableOpacity>
                </ScrollView> */}
            </ScrollView>
        </View>
    )
}
export default Create;
const styles = StyleSheet.create({
    searchBar: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DBFCFF',
    },
    peopleSection: {
        backgroundColor: '#E8F6FC',
        marginBottom: 2,
        paddingBottom: 4,
    },
    chatListSection: {
        backgroundColor: '#FFFFFF',
        marginTop: 0,
        paddingBottom: 0,
    },
})