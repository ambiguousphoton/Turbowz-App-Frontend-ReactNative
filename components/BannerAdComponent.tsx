import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Image, Dimensions } from 'react-native';
import { adImageUrl } from '@/Services/api/imageService';


interface BannerAdProps {
  ad_id: number;
  title: string;
  redirect_url: string;
}

const BannerAdComponent = ({ ad_id, title, redirect_url }: BannerAdProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageHeight, setImageHeight] = useState(200);
  const { width: screenWidth } = Dimensions.get('window');

  return (
    <TouchableOpacity 
      className="border-b border-gray-100"
      onPress={() => Linking.openURL(redirect_url)}
    >
      <View className="px-2 py-1 bg-primary-25">
        <Text className="text-xs text-gray-600">Promoted Content</Text>
      </View>
      {!imageError && (
        <Image 
          source={{ uri: adImageUrl(ad_id) }}
          style={{ width: screenWidth, height: imageHeight }}
          resizeMode="contain"
          onError={(error) => {
            setImageError(true);
          }}
          onLoad={(event) => {
            const { width, height } = event.nativeEvent.source;
            const aspectRatio = height / width;
            const calculatedHeight = screenWidth * aspectRatio;
            setImageHeight(calculatedHeight);
          }}
        />
      )}
      <View className="p-4 mb-8">
        <Text className="text-xl">{title}</Text>
        {/* <Text className="text-xs text-gray-500 mt-1">Advertisement</Text> */}
        <TouchableOpacity 
          className="  py-2  rounded-lg  flex-row items-center"
          onPress={() => Linking.openURL(redirect_url)}
        >
          <Text className="text-gray-500  ">Learn More </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default BannerAdComponent;