import { Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadVideo from "../components/CreateComponent"
import { router } from 'expo-router'

const CreateVideo = () => {
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='px-6 py-4 flex-row items-center'>
                <TouchableOpacity onPress={() => router.back()} className='mr-4'>
                    <Image source={require('@/assets/images/backIcon.png')} className='w-6 h-6' />
                </TouchableOpacity>
                <Text className='text-xl font-semibold flex-1'>Create Video</Text>
            </View>
            <UploadVideo/>
        </SafeAreaView>
    );
}

export default CreateVideo;