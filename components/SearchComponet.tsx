import React from 'react'
import { Image, TextInput, View } from 'react-native'


interface Props{
placeholderp: string,
// searchQuerry: string,
valuep: string,
onChangeTextp: (text: string) => void
}


const SearchComponent = ({placeholderp, valuep, onChangeTextp}: Props) => {
  return (
    <View className='flex-row items-center bg-primary-100 border rounded-3xl  px-2 py-0 mx-2   flex-1 '>
      <Image source={require('../assets/images/searchIcon.png')} style={{ width: 20, height: 20, opacity:0.45 }} className='ml-4' resizeMode='contain'/>
      <TextInput 
        // className='flex-2 text-black text-base ml-3 ' 
        onPress={() => {}}
        className="w-full px-2 h-12 rounded-lg text-lg text-black"

        placeholder= {placeholderp}
        value= {valuep}
        onChangeText={onChangeTextp}
        placeholderTextColor="#727272"
        >
      </TextInput>

      
    </View>
  )
}



export default SearchComponent