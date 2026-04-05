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

import { searchEcosByUser } from "@/Services/api/searchService";
import { ecoImageUrl } from "@/Services/api/imageService";

export default function UploaderEcosComponent({ uploaderID, uploaderName, currentEcoID }: MoreEcosFromUploaderProps) {
  const { data: ecos, loading } = useFetch<EcoDataInterface[]>(() => searchEcosByUser(uploaderID), true);
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
                source={{ uri: ecoImageUrl(item.Eco_Url, 0) }}
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