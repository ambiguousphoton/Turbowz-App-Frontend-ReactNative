import {SignOutComponent} from "@/components/auth";
import { Link } from 'expo-router';
import { ScrollView, Text, View, } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function logout (){

    return (
        <SafeAreaView className='flex-1'>
            <Text>SingOut?</Text>
            <SignOutComponent/>
            <Link className="text-primary-300 font-bold" href='/'>Cancel</Link>
        </SafeAreaView>
    )
}