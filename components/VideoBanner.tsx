import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';

interface VideoBannerProps {
  videos: any[];
}

const VideoBanner: React.FC<VideoBannerProps> = ({ videos }) => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (videos.length >= 3) {
      const interval = setInterval(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setBannerIndex(prev => (prev + 1) % 3);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [videos]);

  if (videos.length < 3) return null;

  return (
    <View className="h-48 mx-4 mb-4 rounded-xl overflow-hidden bg-black">
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image 
          source={{ uri: `http://10.0.2.2:8088/i?img=${videos[bannerIndex]?.Video_Url}` }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <Text className="text-white text-lg font-bold" numberOfLines={2} style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }}>
            {videos[bannerIndex]?.Title}
          </Text>
          <Text className="text-white/90 text-sm mt-1" style={{ textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>
            {videos[bannerIndex]?.Views} views • {videos[bannerIndex]?.Uploader_Name}
          </Text>
        </View>
      </Animated.View>
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
  );
};

export default VideoBanner;