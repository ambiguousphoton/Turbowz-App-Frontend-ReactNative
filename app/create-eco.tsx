import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import UploadEco from "../components/UploadEco"
import { router } from 'expo-router'
import GliterAlertComponent from '@/components/GliterAlertComponent'

const CreateEco = () => {
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
        <SafeAreaView className='flex-1 bg-white'>
            <View className='px-4 h-14 flex-row items-center border-b border-gray-200'>
                <TouchableOpacity onPress={() => router.back()} className='p-2 -ml-2'>
                    <Image source={require('@/assets/images/CrossIcon.png')} className='w-5 h-5' />
                </TouchableOpacity>
                <Text className='flex-1 text-base font-medium text-gray-900 ml-4'>Add details</Text>
                <TouchableOpacity 
                    onPress={publishFunction || (() => {})}
                    disabled={isPublishDisabled}
                    className='py-1.5 px-4'
                >
                    <Text className={`font-semibold text-sm ${isPublishDisabled ? 'text-gray-400' : 'text-blue-600'}`}>
                        UPLOAD
                    </Text>
                </TouchableOpacity>
            </View>
            <UploadEco 
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

export default CreateEco;
