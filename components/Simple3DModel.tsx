import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const Simple3DModel = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    };
    startRotation();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="items-center justify-center">
      <Animated.View
        className="w-8 h-8 rounded-md"
        style={{
          backgroundColor: '#05BAFF',
          transform: [
            { rotateY: rotation },
            { rotateX: '15deg' },
          ],
        }}
      >
        <View className="w-full h-full rounded-md opacity-80" style={{ backgroundColor: '#05BAFF' }} />
        <View className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full opacity-60" />
        <View className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FE68E0' }} />
      </Animated.View>
    </View>
  );
};

export default Simple3DModel;