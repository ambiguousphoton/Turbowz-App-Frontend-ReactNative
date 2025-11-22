import { Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadEco from "../components/UploadEco"
import { router } from 'expo-router'

const CreateEco = () => {
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='px-6 py-4 flex-row items-center'>
                <TouchableOpacity onPress={() => router.back()} className='mr-4'>
                    <Image source={require('@/assets/images/backIcon.png')} className='w-6 h-6' />
                </TouchableOpacity>
                <Text className='text-xl font-semibold flex-1'>Create Eco Post</Text>
            </View>
            <UploadEco/>
        </SafeAreaView>
    );
}

export default CreateEco;