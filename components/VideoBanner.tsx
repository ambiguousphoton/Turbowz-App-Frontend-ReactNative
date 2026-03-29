import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';

interface VideoBannerProps {
  videos: any[];
}

const VideoBanner: React.FC<VideoBannerProps> = ({ videos }) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (videos.length >= 3) {
      const interval = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % 3);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [videos]);

  if (videos.length < 3) return null;

  return (
    <View className="mx-4 mb-4 rounded-xl bg-white shadow-lg overflow-hidden">
      <View className="relative">
          <Image 
            source={{ uri: `http://10.0.2.2:8088/i?img=${videos[bannerIndex]?.Video_Url}` }} 
            className="w-full h-40"
            resizeMode="cover"
          />
          <View className="absolute top-4 right-4 flex-row">
            {[0, 1, 2].map((index) => (
              <View 
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === bannerIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </View>
        </View>
        <View className="p-4 bg-white">
          <Text className="text-gray-900 text-lg font-bold" numberOfLines={2}>
            {videos[bannerIndex]?.Title}
          </Text>
          <Text className="text-gray-600 text-sm mt-2">
            {videos[bannerIndex]?.Views} views • {videos[bannerIndex]?.Uploader_Name}
          </Text>
        </View>
    </View>
  );
};

export default VideoBanner;