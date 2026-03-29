import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadVideo from "../components/CreateComponent"
import { router } from 'expo-router'
import GliterAlertComponent from '@/components/GliterAlertComponent'

const CreateVideo = () => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [publishFunction, setPublishFunction] = useState<(() => void) | null>(null);
    const [isPublishDisabled, setIsPublishDisabled] = useState(true);

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='px-6 py-4 flex-row items-center bg-white shadow-sm'>
                <TouchableOpacity onPress={() => router.back()} className='mr-4 p-2 bg-gray-100 rounded-full'>
                    <Image source={require('@/assets/images/backIcon.png')} className='w-5 h-5' />
                </TouchableOpacity>
                <Text className='text-xl font-bold flex-1 text-gray-800'>Create Video</Text>
                <TouchableOpacity 
                    className={`px-4 py-2 rounded-xl ${isPublishDisabled ? 'bg-gray-300' : 'bg-primary-150'}`}
                    onPress={publishFunction || (() => {})}
                    disabled={isPublishDisabled}
                >
                    <Text className={`font-bold ${isPublishDisabled ? 'text-gray-500' : 'text-white'}`}>Publish</Text>
                </TouchableOpacity>
            </View>
            <UploadVideo 
                onAlert={(msg) => { setAlertMessage(msg); setAlertVisible(true); }} 
                onPublishChange={(fn, disabled) => { setPublishFunction(() => fn); setIsPublishDisabled(disabled); }}
            />
            <GliterAlertComponent 
                message={alertMessage}
                visible={alertVisible}
                onHide={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

export default CreateVideo;