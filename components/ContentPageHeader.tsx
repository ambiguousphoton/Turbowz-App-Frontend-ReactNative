import { View, Image, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

interface Props {
  onSearchPress: () => void;
  SearchTerm: string;
  showBack?: boolean;
}

const ContentPageHeader = ({ onSearchPress, SearchTerm, showBack }: Props) => {
  const router = useRouter();

  return (
    <View className='py-3 flex-row items-center px-4 justify-between bg-white border-b border-gray-200'>
      {SearchTerm ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../assets/images/backIcon.png")}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : showBack ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../assets/images/backIcon.png")}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <Image
          source={require("../assets/images/ContentScreenLogo.png")}
          className="w-10 h-10"
          resizeMode="contain"
        />
      )}

      <TouchableOpacity
        className='bg-gray-100 px-4 py-2 flex-row items-center rounded-full flex-1 ml-4'
        onPress={onSearchPress}
      >
        <Image
          source={require('../assets/images/searchIcon.png')}
          className='w-4 h-4 mr-2'
          resizeMode='contain'
        />
        <Text className='text-gray-600'>{SearchTerm || 'Search'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContentPageHeader;