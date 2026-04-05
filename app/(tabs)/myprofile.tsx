import ProfileDataComponent from  "@/components/ProfileDataComponent";
import React, { useState, useEffect } from "react";
import { Text , Image, View} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GetUser } from "@/HelperFuncs/localStorage";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const insets = useSafeAreaInsets();
    const [userID, setUserID] = useState<number | null>(null);
    const { signOutSession } = useAuth();

    useEffect(() => {
        const getUserID = async () => {
            const localUser = await GetUser();
            if (!localUser?.UserID) {
                console.log("[myprofile] No valid UserID, signing out. localUser:", JSON.stringify(localUser));
                await signOutSession();
                router.replace("/auth/sign-in");
                return;
            }
            setUserID(localUser.UserID);
        };
        getUserID();
    }, []);

    if (!userID) {
        return (
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
                <View className="flex-1 items-center justify-center">
                    <Text>Loading...</Text>
                </View>
            </View>
        );
    }

    return ( 
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ProfileDataComponent userID={userID} isMyProfile={true}/>
        </View>
    )
}
