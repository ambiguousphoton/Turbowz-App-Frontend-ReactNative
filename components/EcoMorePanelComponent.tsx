import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import VotePanelComponent from './VotePanelComponent';

interface EcoMorePanelProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  contentId: number;
  contentType: 'eco';
  ecoText?: string;
  tags?: string[];
}

export default function EcoMorePanelComponent({ isExpanded, setIsExpanded, contentId, contentType, ecoText, tags }: EcoMorePanelProps) {
  const [showMoreInfo, setShowMoreInfo] = useState(true);
  
  const getTagColor = (tag: string) => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100', 'bg-yellow-100', 'bg-red-100', 'bg-indigo-100', 'bg-orange-100'];
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  return (
    <ScrollView className="bg-white rounded-2xl max-h-[600px]" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <TouchableOpacity onPress={() => setShowMoreInfo(!showMoreInfo)} className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-900 text-base font-semibold">More Info</Text>
          <Text className="text-gray-500 text-xl">{showMoreInfo ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {showMoreInfo && (
          <View className="mb-4">
            {ecoText && (
              <View className="mb-4">
                <Text className="text-gray-900 text-sm font-bold mb-2">Text</Text>
                <Text className="text-gray-700 text-sm leading-5">{ecoText}</Text>
              </View>
            )}
            
            {tags && tags.length > 0 && (
              <View className="mb-4">
                <Text className="text-gray-900 text-sm font-bold mb-2">Tags</Text>
                <View className="flex-row flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Text key={index} className={`text-xs ${getTagColor(tag)} text-gray-700 rounded-lg px-2 py-1 font-medium`}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            
            <View className="bg-black rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-sm font-bold">Quality Score</Text>
                <View className="bg-green-500 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-bold">94%</Text>
                </View>
              </View>
              <View className="bg-gray-200 rounded-full h-2 mb-2">
                <View className="bg-green-500 rounded-full h-2" style={{width: '94%'}}></View>
              </View>
              <Text className="text-white text-xs">Excellent content quality</Text>
            </View>
          </View>
        )}
      </View>
      
      <View className="px-4 pb-4">
        <VotePanelComponent isExpanded={isExpanded} setIsExpanded={setIsExpanded} contentId={contentId} contentType={contentType} />
      </View>
    </ScrollView>
  );
}
