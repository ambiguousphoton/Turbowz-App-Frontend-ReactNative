// RegisterPage.tsx
import ProfileDataComponent from  "@/components/ProfileDataComponent";
import React, { useState, useEffect } from "react";
import { Text , Image, TouchableOpacity, ActivityIndicator, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UserDataInterface } from "@/interfaces/interfaces";

export default function RegisterPage() {
    const router = useRouter();
    const { userID } = useLocalSearchParams<{ userID: string }>();
    const [user, setUser] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (userID) {
                try {
                    const response = await fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`);
                    const userData = await response.json() as UserDataInterface;
                    userData.UserID = parseInt(userID);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userID]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="black" />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="flex-1">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">User not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return ( 
        <SafeAreaView className="flex-1 bg-white">
            <ProfileDataComponent userID={user.UserID} />
        </SafeAreaView>
    )
}
