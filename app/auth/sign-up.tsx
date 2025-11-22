import {SignUpComponent} from "@/components/auth";
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
export default function Auth (){
    return (
        <SafeAreaView className='flex-1'>
            <View>
                <Text className='text-primary'>
                    Create Your Account !
                </Text>
                <SignUpComponent/>  
                <Text>Already have an Account? <Link className="text-secondary font-bold" href='/auth/sign-in'>Sign in</Link></Text>
            </View>
        </SafeAreaView>
    )
}
