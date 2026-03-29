import {SignOutComponent} from "@/components/auth";
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function logout (){
    const router = useRouter();

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <ScrollView className="flex-1">
                <View className="px-6 py-4">
                    <Text className="text-2xl font-bold mb-6">Settings</Text>
                    
                    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold mb-2">Account</Text>
                        <View className="border-t border-gray-100 pt-4">
                            <Text className="text-gray-600 mb-4">Sign out of your account</Text>
                            <SignOutComponent/>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        className="bg-white rounded-xl p-4 shadow-sm"
                        onPress={() => router.back()}
                    >
                        <Text className="text-red-500 font-semibold text-center">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}