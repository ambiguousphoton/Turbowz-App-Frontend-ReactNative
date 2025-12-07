import { SignUpComponent } from "@/components/SignUpComponent";
import { Link } from 'expo-router';
import { ScrollView, Text, View, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Auth (){

    return (
        <SafeAreaView className='flex-1 bg-primary-150'>
            {/* Scattered background icons */}
            <Image source={require("../../assets/images/Yuu.png")} className="absolute top-16 left-8 w-8 h-8 opacity-20" resizeMode="contain" />
            <Image source={require("../../assets/images/iEE.png")} className="absolute top-32 right-12 w-6 h-6 opacity-15" resizeMode="contain" />
            <Image source={require("../../assets/images/Eii.png")} className="absolute top-48 left-16 w-10 h-10 opacity-25" resizeMode="contain" />
            <Image source={require("../../assets/images/Aie.png")} className="absolute top-64 right-6 w-7 h-7 opacity-18" resizeMode="contain" />
            <Image source={require("../../assets/images/Oi.png")} className="absolute top-80 left-6 w-9 h-9 opacity-22" resizeMode="contain" />
            <Image source={require("../../assets/images/Yuu.png")} className="absolute bottom-60 right-10 w-8 h-8 opacity-16" resizeMode="contain" />
            <Image source={require("../../assets/images/iEE.png")} className="absolute bottom-40 left-12 w-6 h-6 opacity-20" resizeMode="contain" />
            <Image source={require("../../assets/images/Eii.png")} className="absolute bottom-24 right-16 w-10 h-10 opacity-14" resizeMode="contain" />
            <Image source={require("../../assets/images/Aie.png")} className="absolute bottom-8 left-20 w-7 h-7 opacity-19" resizeMode="contain" />
            <Image source={require("../../assets/images/Oi.png")} className="absolute top-24 right-20 w-6 h-6 opacity-12" resizeMode="contain" />
            <Image source={require("../../assets/images/Yuu.png")} className="absolute top-56 right-24 w-8 h-8 opacity-17" resizeMode="contain" />
            <Image source={require("../../assets/images/iEE.png")} className="absolute top-72 left-24 w-5 h-5 opacity-21" resizeMode="contain" />
            <Image source={require("../../assets/images/Eii.png")} className="absolute bottom-52 left-4 w-9 h-9 opacity-13" resizeMode="contain" />
            <Image source={require("../../assets/images/Aie.png")} className="absolute bottom-32 right-4 w-6 h-6 opacity-18" resizeMode="contain" />
            <Image source={require("../../assets/images/Oi.png")} className="absolute bottom-16 left-32 w-7 h-7 opacity-15" resizeMode="contain" />
            <Image source={require("../../assets/images/Yuu.png")} className="absolute top-40 left-32 w-5 h-5 opacity-23" resizeMode="contain" />
            <Image source={require("../../assets/images/iEE.png")} className="absolute top-88 right-32 w-8 h-8 opacity-11" resizeMode="contain" />
            
            <ScrollView className="flex-1 px-4 sm:px-6" showsVerticalScrollIndicator={false}>
                <View className="items-center pt-2">
                    <Image source={require("../../assets/images/TurbowzPinkIcon.png")} className="w-48 h-48 sm:w-60 sm:h-60 -mb-2 sm:mb-2" resizeMode="contain" />
                    <SignUpComponent/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
