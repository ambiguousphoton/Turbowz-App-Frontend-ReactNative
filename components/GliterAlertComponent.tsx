import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface GliterAlertProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const GliterAlertComponent: React.FC<GliterAlertProps> = ({ message, visible, onHide }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#22C55E',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default GliterAlertComponent
