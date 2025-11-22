import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) => (
  <TouchableOpacity 
    className="bg-white border border-gray-200 rounded-full flex-row items-center px-4 py-2 mr-3 shadow-sm"
    onPress={onPress}
  >
    <Image source={icon} className="w-5 h-5 mr-2" resizeMode="contain" />
    <Text className="text-gray-700 text-sm font-medium">{label}</Text>
  </TouchableOpacity>
);

const ImagePage = ({ pageNumber }: { pageNumber: number }) => (
  <View className="mb-4 rounded-xl overflow-hidden bg-gray-100" style={{ width: width - 32, aspectRatio: 3/4 }}>
    <View className="flex-1 justify-center items-center">
      <Text className="text-gray-500 text-lg font-medium">Page {pageNumber}</Text>
    </View>
  </View>
);

export default function ImageBoardPage() {
  const actions = [
    { icon: require("../../assets/images/AgreeIcon.png"), label: "Agree" },
    { icon: require("../../assets/images/DisagreeIcon.png"), label: "Disagree" },
    { icon: require("../../assets/images/ShareIcon.png"), label: "Share" },
  ];

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView 
        className='flex-1' 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-4 pt-4 pb-6 bg-white">
          <View className="flex-row items-center mb-3">
            <Image 
              source={require("../../assets/images/ProfileIcon.png")} 
              className="w-12 h-12 mr-3 rounded-full" 
              resizeMode="cover" 
            />
            <View className="flex-1">
              <Text className="text-black text-lg font-semibold">Ram</Text>
              <Text className="text-gray-500 text-sm">@rama</Text>
            </View>
          </View>
          
          <Text className='text-xl font-bold text-gray-900 mb-2'>
            Narayan Narayan Narayan Narayan
          </Text>
          <Text className='text-gray-600 leading-5'>
            Narayan Narayan Narayan Narayan
          </Text>
        </View>

        <View className="px-4 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((pageNum) => (
            <ImagePage key={pageNum} pageNumber={pageNum} />
          ))}
        </View>
      </ScrollView>
      
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {actions.map((action, index) => (
            <ActionButton 
              key={index}
              icon={action.icon}
              label={action.label}
            />
          ))}
        </ScrollView>
        
        <TouchableOpacity className="bg-blue-500 rounded-full py-3 justify-center items-center">
          <Text className="text-white font-semibold text-base">💬 View Comments</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}