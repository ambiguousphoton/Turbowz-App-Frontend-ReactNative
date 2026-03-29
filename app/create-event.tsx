import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadEvent from "../components/UploadEvent"
import { router } from 'expo-router'
import GliterAlertComponent from '@/components/GliterAlertComponent'

const CreateEvent = () => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [publishFunction, setPublishFunction] = useState<(() => void) | null>(null);
    const [isPublishDisabled, setIsPublishDisabled] = useState(true);

    const handleAlert = useCallback((msg: string) => {
        setAlertMessage(msg);
        setAlertVisible(true);
    }, []);

    const handlePublishChange = useCallback((fn: () => void, disabled: boolean) => {
        setPublishFunction(() => fn);
        setIsPublishDisabled(disabled);
    }, []);

    return (
        <SafeAreaView className='flex-1 bg-primary-25'>
            <View className='px-6 py-4 flex-row items-center bg-white shadow-sm'>
                <TouchableOpacity onPress={() => router.back()} className='mr-4 p-2 bg-gray-100 rounded-full'>
                    <Image source={require('@/assets/images/backIcon.png')} className='w-5 h-5' />
                </TouchableOpacity>
                <Text className='text-xl font-bold flex-1 text-gray-800'>Create Event</Text>
                <TouchableOpacity 
                    className={`px-4 py-2 rounded-xl ${isPublishDisabled ? 'bg-gray-300' : 'bg-primary-150'}`}
                    onPress={publishFunction || (() => {})}
                    disabled={isPublishDisabled}
                >
                    <Text className={`font-bold ${isPublishDisabled ? 'text-gray-500' : 'text-white'}`}>Publish</Text>
                </TouchableOpacity>
            </View>
            <UploadEvent 
                onAlert={handleAlert}
                onPublishChange={handlePublishChange}
            />
            <GliterAlertComponent 
                message={alertMessage}
                visible={alertVisible}
                onHide={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

export default CreateEvent;
