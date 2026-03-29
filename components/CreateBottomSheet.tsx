import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CreateBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateBottomSheet({ visible, onClose }: CreateBottomSheetProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleVideoPress = () => {
    onClose();
    router.push('/create-video');
  };

  const handleEcoPress = () => {
    onClose();
    router.push('/create-eco');
  };

  const handleEventPress = () => {
    onClose();
    router.push('/create-event');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View 
        className="flex-1 justify-end"
        style={{
          backgroundColor: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
          })
        }}
      >
        <TouchableOpacity 
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="w-6" />
            <Text className="text-xl font-bold">Create</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

            
            <TouchableOpacity 
              className="flex-row items-center mb-4 rounded-xl overflow-hidden"
              onPress={handleVideoPress}
            >
              <View className="bg-blue-100 p-4">
                <Image source={require('@/assets/images/VideoPostIcon.png')} className="w-16 h-16" />
              </View>
              <View className="flex-1 bg-gray-100 p-4">
                <Text className="text-lg font-semibold">Create Video</Text>
                <Text className="text-gray-600 text-sm">Share your moments with videos</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center mb-4 rounded-xl overflow-hidden"
              onPress={handleEcoPress}
            >
              <View className="bg-green-100 p-4">
                <Image source={require('@/assets/images/EcoPostIcon.png')} className="w-16 h-16" />
              </View>
              <View className="flex-1 bg-gray-100 p-4">
                <Text className="text-lg font-semibold">Create Eco </Text>
                <Text className="text-gray-600 text-sm">Share content Image or Text Posts</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center mb-6 rounded-xl overflow-hidden"
              onPress={handleEventPress}
            >
              <View className="bg-purple-100 p-4">
                <Text className="text-5xl">📅</Text>
              </View>
              <View className="flex-1 bg-gray-100 p-4">
                <Text className="text-lg font-semibold">Create Event</Text>
                <Text className="text-gray-600 text-sm">Create competitions and events</Text>
              </View>
            </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}