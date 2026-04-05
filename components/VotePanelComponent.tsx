import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GetUser } from '@/HelperFuncs/localStorage';
import { postVideoVote, postEcoVote } from '@/Services/api/activityService';

interface VotePanelProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  contentId: number;
  contentType: 'video' | 'eco';
}

export default function VotePanelComponent({ isExpanded, setIsExpanded, contentId, contentType }: VotePanelProps) {
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = await GetUser();
      setUserId(user?.UserID || null);
    };
    fetchUser();
  }, []);
  const aiLabels = ['Negligible', 'Minimal', 'Moderate', 'Heavy', 'AI Slop'];
  const ratingEmojis = ['😡', '😞', '😐', '😊', '🤩'];
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [selectedAI, setSelectedAI] = useState<number | null>(null);
  const qualityAnimations = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(0.8))).current;
  const aiAnimations = useRef(aiLabels.map(() => new Animated.Value(0.8))).current;
  const gradients = [
    ['#ff4444', '#cc0000'],
    ['#ff8800', '#ff4400'],
    ['#ffcc00', '#ff8800'],
    ['#88cc00', '#44aa00'],
    ['#44cc44', '#00aa00']
  ];
  
  const animateQualitySelection = (index: number) => {
    qualityAnimations.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0.8,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateAISelection = (index: number) => {
    aiAnimations.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0.8,
        useNativeDriver: true,
      }).start();
    });
  };
  
  return (
    <View className="mb-6 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
      <TouchableOpacity 
        className="flex-row justify-between items-center mb-3"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View>
          <Text className="text-gray-900 text-2xl font-black tracking-wider" style={{ textShadowColor: '#fbbf24', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>VOTE PANEL</Text>
          <Text className="text-gray-500 text-xs mt-1">Rate this video's quality and AI usage</Text>
        </View>
        <Text className="text-gray-500 text-xl">{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <>
          <Text className="text-gray-900 text-lg font-bold mb-3">Rate Quality</Text>
          <View className="flex-row justify-between mb-4">
            {[1, 2, 3, 4, 5].map((rating, index) => (
              <Animated.View
                key={rating}
                style={{ transform: [{ scale: qualityAnimations[index] }] }}
                className="flex-1 mx-1"
              >
                <TouchableOpacity 
                  className={`rounded-lg aspect-[3/4] shadow-lg overflow-hidden relative ${
                    selectedQuality === rating ? 'border-6 border-black' : ''
                  }`}
                  onPress={() => {
                    setSelectedQuality(rating);
                    animateQualitySelection(index);
                  }}
                >
                {selectedQuality === rating ? (
                  <View className="flex-1 justify-center rounded-xl items-center bg-white border-4 border-secondary">
                    <Text className="text-center text-3xl">{ratingEmojis[index]}</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={gradients[index]}
                    className="flex-1 justify-center items-center"
                  >
                    <View className="absolute inset-0 opacity-20">
                      <View className="flex-1 flex-row">
                        {Array.from({length: 6}).map((_, i) => (
                          <View key={i} className="flex-1 border-r border-black/30" />
                        ))}
                      </View>
                      <View className="absolute inset-0 flex-col">
                        {Array.from({length: 8}).map((_, i) => (
                          <View key={i} className="flex-1 border-b border-black/30" />
                        ))}
                      </View>
                    </View>
                    <Text className="text-center text-3xl relative z-10">{ratingEmojis[index]}</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          <Text className="text-gray-900 text-lg font-bold mb-3">AI Usage</Text>
          <View className="flex-row justify-between">
            {aiLabels.map((label, index) => (
              <Animated.View
                key={index}
                style={{ transform: [{ scale: aiAnimations[index] }] }}
                className="flex-1 mx-1"
              >
                <TouchableOpacity 
                  className={`rounded-lg p-2 ${
                    selectedAI === index ? 'bg-black' : 'bg-gray-200'
                  }`}
                  onPress={() => {
                    setSelectedAI(index);
                    animateAISelection(index);
                  }}
                >
                  <Text className={`text-center text-xs ${selectedAI===index ? 'text-white font-semibold': "font-medium"}`}>{label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          <TouchableOpacity 
            className="bg-black rounded-xl py-3 mt-4"
            onPress={async () => {
              if (selectedQuality === null || selectedAI === null) {
                Alert.alert('Error', 'Please select both quality and AI usage');
                return;
              }
              if (!userId) {
                Alert.alert('Error', 'User not found');
                return;
              }
              try {
                const response = contentType === 'video'
                  ? await postVideoVote(contentId, userId, selectedQuality, selectedAI)
                  : await postEcoVote(contentId, userId, selectedQuality, selectedAI);
                if (response.ok) {
                  Alert.alert('Success', 'Vote submitted successfully');
                  setSelectedQuality(null);
                  setSelectedAI(null);
                } else {
                  Alert.alert('Error', 'Failed to submit vote');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to submit vote');
              }
            }}
          >
            <Text className="text-white text-center font-bold">Submit Vote</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}