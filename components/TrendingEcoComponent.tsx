import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface TrendingEcoComponentProps {
  item: any;
  itemWidth: number;
}

export default function TrendingEcoComponent({ item, itemWidth }: TrendingEcoComponentProps) {
  const [imageHeight, setImageHeight] = useState(200);

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = height / width;
    const calculatedHeight = itemWidth * aspectRatio;
    setImageHeight(calculatedHeight);
  };

  return (
    <TouchableOpacity 
      className="mb-3"
      onPress={() => {
        router.push(`/ecos/${item.Eco_Id}`);
      }}
    >
      <View className="bg-white rounded-xl shadow-sm border border-gray-100" style={{ width: itemWidth }}>
        {item.Images_Count > 0 ? (
          <>
            <Image 
              source={{ uri: `http://10.0.2.2:8088/e?eco_url=${item.Eco_Url}&index=0` }} 
              className="w-full rounded-t-xl" 
              style={{ height: imageHeight }}
              resizeMode="cover"
              onLoad={handleImageLoad}
            />
            <View className="p-3">
              <Text className="font-bold text-sm" numberOfLines={2}>{item.Eco_Title}</Text>
              <Text className="text-xs text-gray-500 mt-1">{item.Uploader_Handle}</Text>
            </View>
          </>
        ) : (
          <View className="p-2">
            <Text className="font-bold text-sm text-blue-600" numberOfLines={2}>{item.Eco_Title}</Text>
            <Text className="text-sm text-black font-bold mt-2" numberOfLines={4}>{item.Eco_Text}</Text>
            <Text className="text-xs text-gray-500 mt-2">{item.Uploader_Handle}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}