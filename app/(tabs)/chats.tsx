import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ContactsComponent from "../../components/ContactsComponent"
import { Link } from 'expo-router'
import { useWS } from '@/context/WebSocketConnectionContext'
import { dbEvents } from '@/HelperFuncs/MessageStorage'
import UserCardSquareComponent from '@/components/UserCardSquareComponent'
import TurbowConnectComponent from '@/components/TurbowConnect'
const Create =() =>{
    const insets = useSafeAreaInsets();
    const { messages } = useWS();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        console.log("📱 Chats page - WebSocket messages updated:", messages.length);
    }, [messages]);



    useEffect(() => {
        const handleRoomUpdated = () => {
            console.log("🔄 Room updated, refreshing chats list...");
            setRefreshKey(prev => prev + 1);
        };
        
        const subscription = dbEvents.addListener('roomUpdated', handleRoomUpdated);
        return () => subscription.remove();
    }, []);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>

                <Text className="px-4 py-2  text-lg font-semibold">People you may know!</Text>
                <ScrollView horizontal className="flex-row my-2" showsHorizontalScrollIndicator={false}>
                    <UserCardSquareComponent userID="7" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="80" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="8" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="7" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="80" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="8" />
                    <View style={{ width: 8 }} />
                    <UserCardSquareComponent userID="27" />
                </ScrollView>
            
                <TurbowConnectComponent />
                
                <ContactsComponent key={refreshKey}/>
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
const styles = StyleSheet.create({})