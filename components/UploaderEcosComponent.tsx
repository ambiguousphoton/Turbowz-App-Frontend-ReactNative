import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from "react-native";
import { router } from "expo-router";
import useFetch from "@/Services/useFetch";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { timeAgo } from "@/HelperFuncs/timeAgo";

interface MoreEcosFromUploaderProps {
  uploaderID: number;
  uploaderName: string;
  currentEcoID: number;
}

const fetchUserEcos = async (userID: number): Promise<EcoDataInterface[]> => {
  const response = await fetch(`http://10.0.2.2:8082/search-eco-by-user?userID=${userID}`, {
    headers: { Accept: "application/json" },
  });
  
  if (!response.ok) throw new Error("Failed to fetch user ecos");

  const data = await response.json();

  if (!Array.isArray(data)) return [];

  return data.map((eco: any) => ({
    Eco_Id: eco.Eco_Id,
    Eco_Url: eco.Eco_Url,
    Eco_Text: eco.Eco_Text,
    Images_Count: eco.Images_Count,
    Created_At: eco.Created_At,
    View_Count: eco.View_Count,
    Comment_Count: eco.Comment_Count,
    Luv_Count: eco.Luv_Count,
    Tags: eco.Tags || [],
    Uploader_ID: eco.Uploader_ID,
    Uploader_Name: eco.Uploader_Name,
    Uploader_Handle: eco.Uploader_Handle,
    Save_Count: eco.Saves_Count || 0,
    Already_Luved: eco.Already_Luved ?? false,
  }));
};

export default function UploaderEcosComponent({ uploaderID, uploaderName, currentEcoID }: MoreEcosFromUploaderProps) {
  const { data: ecos, loading } = useFetch<EcoDataInterface[]>(() => fetchUserEcos(uploaderID), true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const { width: screenWidth } = Dimensions.get('window');

  const filteredEcos = ecos?.filter(eco => eco.Eco_Id !== currentEcoID)
    .sort((a, b) => b.Luv_Count - a.Luv_Count)
    .slice(0, 10) || [];

  if (loading || !filteredEcos.length) return null;

  const handleImageError = (ecoID: number) => {
    setImageErrors(prev => new Set([...prev, ecoID]));
  };

  const renderEcoItem = ({ item }: { item: EcoDataInterface }) => {
    const hasImage = item.Images_Count > 0 && !imageErrors.has(item.Eco_Id);
    
    return (
      <View>
        <TouchableOpacity
          className="bg-white rounded-xl p-3 mr-4"
          onPress={() => router.push(`/ecos/${item.Eco_Id}`)}
        >
          <Text className={`text-gray-900 font-semibold text-sm ${hasImage ? 'mb-3 w-64' : 'mb-2'}`} numberOfLines={hasImage ? 3 : 5}>
            {item.Eco_Text}
          </Text>
          {hasImage && (
            <View className="self-start">
              <Image 
                source={{ uri: `http://10.0.2.2:8088/e?eco_url=${item.Eco_Url}&index=0` }}
                className="w-16 h-16 rounded-lg mb-2"
                resizeMode="cover"
                onError={() => handleImageError(item.Eco_Id)}
              />
            </View>
          )}
          <Text className="text-gray-600 text-xs">
            {item.Luv_Count} luvs • {timeAgo(item.Created_At)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="mb-6 bg-gray-100 py-4">
      <Text className="text-gray-900 font-black text-xl mb-4 mx-4 tracking-wider" style={{ textShadowColor: '#fbbf24', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>
        MORE ECOS FROM {uploaderName.toUpperCase()}
      </Text>
      <FlatList
        data={filteredEcos}
        renderItem={renderEcoItem}
        keyExtractor={(item) => item.Eco_Id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}