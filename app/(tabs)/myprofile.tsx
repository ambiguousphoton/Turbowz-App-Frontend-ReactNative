import ProfileDataComponent from  "@/components/ProfileDataComponent";
import React, { useState, useEffect } from "react";
import { Text , Image, View} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GetUser } from "@/HelperFuncs/localStorage";
import { UserDataInterface } from "@/interfaces/interfaces";

export default function RegisterPage() {
    const insets = useSafeAreaInsets();
    const [userID, setUserID] = useState<number | null>(null);

    useEffect(() => {
        const getUserID = async () => {
            const localUser = await GetUser();
            setUserID(localUser?.UserID || null);
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
