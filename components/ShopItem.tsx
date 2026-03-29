import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface ShopItemProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  category?: string;
  onPress?: () => void;
}

export default function ShopItem({ id, name, price, image, rating = 4.5, category = "Eco", onPress }: ShopItemProps) {
  return (
    <TouchableOpacity 
      className="p-4 mb-3 bg-white rounded-xl shadow-sm border border-gray-100 flex-row items-center"
      onPress={onPress}
    >
      <View className="w-16 h-16 bg-gray-100 rounded-xl mr-4 items-center justify-center">
        {image ? (
          <Image 
            source={{ uri: image }} 
            className="w-14 h-14 rounded-lg"
          />
        ) : (
          <Text className="text-2xl">📦</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-black text-base mb-1">{name}</Text>
        <Text className="text-xs text-gray-500 mb-2">{category}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-green-600">${price}</Text>
          <View className="flex-row items-center">
            <Text className="text-yellow-500 mr-1">⭐</Text>
            <Text className="text-xs text-gray-600">{rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}