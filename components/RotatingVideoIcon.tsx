import React, { useEffect, useRef } from 'react';
import { Animated, Image } from 'react-native';

const RotatingVideoIcon = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Image
      source={require('@/assets/images/VideoPostIcon.png')}
      className="w-16 h-16"
      style={{
        transform: [{ rotate: rotation }],
      }}
    />
  );
};

export default RotatingVideoIcon;