// RegisterPage.tsx
import ProfileDataComponent from  "@/components/ProfileDataComponent";
import React, { useState, useEffect } from "react";
import { Text , Image, TouchableOpacity, ActivityIndicator, View} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UserDataInterface } from "@/interfaces/interfaces";
import { getUser } from "@/Services/api/userService";

export default function RegisterPage() {
    const router = useRouter();
    const { userID } = useLocalSearchParams<{ userID: string }>();
    const [user, setUser] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchUser = async () => {
            if (userID) {
                try {
                    const userData = await getUser(userID) as UserDataInterface;
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
            <View className="flex-1" style={{ paddingTop: insets.top }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="black" />
                </View>
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1" style={{ paddingTop: insets.top }}>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">User not found</Text>
                </View>
            </View>
        );
    }

    return ( 
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ProfileDataComponent userID={user.UserID} />
        </View>
    )
}
