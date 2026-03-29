import { View, Image, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

interface Props {
  onSearchPress: () => void;
  SearchTerm: string;
}

const HeaderBar = ({ onSearchPress, SearchTerm }: Props) => {
  const router = useRouter();
  return (
    <View className='bg-white py-2 flex-row border-b-2 border-select items-center px-4 justify-between'>
      
      {!SearchTerm ? (<Image
        source={require("../assets/images/HomeScreenLogo.png")}
        className="w-12 h-12"
        resizeMode="contain"
      />) : (<TouchableOpacity onPress={() => router.back()} >
          <Image
            source={require("../assets/images/backIcon.png")}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>)
      }


      <TouchableOpacity
        className='ml-3 p-2 py-3 flex-row items-center bg-select  flex-1  rounded-full space-x-2'
        onPress={onSearchPress}
      >
        <Image
          source={require('../assets/images/searchIcon.png')}
          className='w-5 h-5 ml-2'
          resizeMode='contain'
        />
        <Text className='  px-3'>{SearchTerm == '' ? 'Search' : SearchTerm}</Text>




      </TouchableOpacity>

    </View>
  );
};

export default HeaderBar;
