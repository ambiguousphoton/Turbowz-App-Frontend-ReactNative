import { View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

const UserContactCardPlaceholder = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, []);

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
      {/* Profile placeholder */}
      <Animated.View 
        className="w-12 h-12 rounded-full bg-gray-200"
        style={{
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
        }}
      />
      
      {/* Content placeholder */}
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between items-center mb-2">
          <Animated.View 
            className="h-4 bg-gray-200 rounded flex-1 mr-4"
            style={{
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            }}
          />
          <Animated.View 
            className="h-3 w-12 bg-gray-200 rounded"
            style={{
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            }}
          />
        </View>
        <Animated.View 
          className="h-3 bg-gray-200 rounded w-3/4"
          style={{
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
          }}
        />
      </View>
    </View>
  );
};

export default UserContactCardPlaceholder;