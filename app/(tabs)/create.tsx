import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadVideo from "../../components/CreateComponent"
import UploadEco from "../../components/UploadEco"

const Create = () => {
    const [activeComponent, setActiveComponent] = useState<'video' | 'eco' | null>(null);

    if (activeComponent === 'video') {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='px-6 py-4 flex-row items-center'>
                    <TouchableOpacity onPress={() => setActiveComponent(null)} className='mr-4'>
                        <Image source={require('@/assets/images/backIcon.png')} className='w-6 h-6' />
                    </TouchableOpacity>
                    <Text className='text-xl font-semibold flex-1'>Create Video</Text>
                </View>
                <UploadVideo/>
            </SafeAreaView>
        );
    }

    if (activeComponent === 'eco') {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='px-6 py-4 flex-row items-center'>
                    <TouchableOpacity onPress={() => setActiveComponent(null)} className='mr-4'>
                        <Image source={require('@/assets/images/backIcon.png')} className='w-6 h-6' />
                    </TouchableOpacity>
                    <Text className='text-xl font-semibold flex-1'>Create Eco Post</Text>
                </View>
                <UploadEco/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='px-6 py-4'>
                <Text className='text-2xl font-semibold'>Create</Text>
            </View>
            <View className='flex-1 justify-center px-6'>
                <TouchableOpacity 
                    className='bg-white rounded-2xl p-8 mb-6 border border-select'
                    onPress={() => setActiveComponent('video')}
                >
                    <View className='items-center'>
                        <View className='bg-primary-25 rounded-full p-4 mb-4'>
                            <Image source={require('@/assets/images/VideosIcon.png')} className='w-8 h-8' />
                        </View>
                        <Text className='text-lg font-semibold mb-2'>Create Video</Text>
                        <Text className='text-gray-600 text-sm text-center'>Share your moments with videos</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    className='bg-white rounded-2xl p-8 border border-select'
                    onPress={() => setActiveComponent('eco')}
                >
                    <View className='items-center'>
                        <View className='bg-primary-25 rounded-full p-4 mb-4'>
                            <Image source={require('@/assets/images/promotion.png')} className='w-8 h-8' />
                        </View>
                        <Text className='text-lg font-semibold mb-2'>Create Eco Post</Text>
                        <Text className='text-gray-600 text-sm text-center'>Share eco-friendly content</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Create;