import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetToken, GetUser } from "@/HelperFuncs/localStorage";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import ContentPageHeader from "@/components/ContentPageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveEvent } from "@/Services/api/userService";
import { getEventMetadata, luvEvent } from "@/Services/api/eventService";
import { eventImageUrl } from "@/Services/api/imageService";

interface EventData {
  Event_Id: number;
  Event_Url: string;
  Event_Title: string;
  Uploader_ID: number;
  Uploader_Handle: string;
  Uploader_Name: string;
  Event_Description: string;
  View_Count: number;
  Luv_Count: number;
  Comment_Count: number;
  Tags: string[];
  Already_Luved: boolean;
  Images_Count: number;
  Saves_Count: number;
  Created_At: string;
  Event_Start_Time: string;
  Event_End_Time: string;
}

export default function EventPage() {
  const { eventID } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLuved, setIsLuved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventMetadata(eventID);
        if (data && data.Event_Id) {
          setEvent(data);
          setIsLuved(data.Already_Luved);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    const getCurrentUser = async () => {
      const user = await GetUser();
      setCurrentUserID(user?.UserID || null);
    };

    if (eventID) {
      fetchEvent();
      getCurrentUser();
    }
  }, [eventID]);

  const handleLuv = async () => {
    try {
      const token = await GetToken('jwt');
      const data = await luvEvent(token || '', eventID as string);
      if (data) setIsLuved(data.luved);
    } catch (error) {
      console.error('Luv error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = await GetToken('jwt');
      const data = await saveEvent(token || '', eventID as string);
      if (data) setIsSaved(data.saved);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>Event not found</Text>
      </View>
    );
  }

  const tabs = ['Overview', 'Data', 'Discussion'];

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with floating back button */}
        <View style={{ position: 'relative' }}>
          {event.Images_Count > 0 && !imageError ? (
            <Image
              source={{ uri: eventImageUrl(`${event.Event_Url}_0`) }}
              className="w-full h-56"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-56 bg-primary-25 justify-center items-center">
              <Text className="text-6xl">📅</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute rounded-full bg-white p-2"
            style={{ top: insets.top + 8, left: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}
          >
            <Image source={require('@/assets/images/backIcon.png')} className="w-5 h-5" />
          </TouchableOpacity>
        </View>

        {/* Title & Actions */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{event.Event_Title}</Text>
          
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.push(`/users/${event.Uploader_ID}`)}>
              <Text className="text-sm text-secondary font-medium">{event.Uploader_Name}</Text>
            </TouchableOpacity>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-sm text-gray-600">{timeAgo(event.Created_At)}</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              className="flex-1 bg-primary-150 py-3 rounded-xl items-center"
              onPress={() => {}}
            >
              <Text className="text-white font-semibold">Join Competition</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`${isLuved ? 'bg-red-100' : 'bg-gray-100'} px-4 py-3 rounded-xl`}
              onPress={handleLuv}
            >
              <Image
                source={isLuved ? require("../../assets/images/LuvedIcon.png") : require("../../assets/images/ToLuvIcon.png")}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-100 px-4 py-3 rounded-xl"
              onPress={handleSave}
            >
              <Image
                source={isSaved ? require("../../assets/images/SavedIcon.png") : require("../../assets/images/SaveIcon.png")}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-1 items-center border-r border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{event.View_Count}</Text>
              <Text className="text-xs text-gray-600">Views</Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{event.Luv_Count}</Text>
              <Text className="text-xs text-gray-600">Likes</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-gray-900">{event.Comment_Count}</Text>
              <Text className="text-xs text-gray-600">Comments</Text>
            </View>
          </View>

          {/* Timeline */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-sm font-bold text-gray-900 mb-3">Timeline</Text>
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
              <View className="flex-1">
                <Text className="text-xs text-gray-600">Start Date</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {new Date(event.Event_Start_Time).toLocaleString()}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
              <View className="flex-1">
                <Text className="text-xs text-gray-600">End Date</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {new Date(event.Event_End_Time).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          {event.Tags && event.Tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {event.Tags.map((tag, index) => (
                <Text key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">
                  {tag}
                </Text>
              ))}
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200 mb-4">
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 py-3 ${activeTab === index ? 'border-b-2 border-black' : ''}`}
                onPress={() => setActiveTab(index)}
              >
                <Text className={`text-center font-semibold ${activeTab === index ? 'text-black' : 'text-gray-500'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 0 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">Description</Text>
              <Text className="text-gray-700 leading-6 mb-4">{event.Event_Description}</Text>
              
              <Text className="text-lg font-bold text-gray-900 mb-3">About this Competition</Text>
              <Text className="text-gray-700 leading-6">
                Join this exciting competition and showcase your skills. Compete with others and win amazing prizes!
              </Text>
            </View>
          )}

          {activeTab === 1 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">Data</Text>
              <Text className="text-gray-700">Competition data will be available here.</Text>
            </View>
          )}

          {activeTab === 2 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">Discussion</Text>
              <Text className="text-gray-700">Join the discussion with other participants.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
