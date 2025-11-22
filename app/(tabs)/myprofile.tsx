// RegisterPage.tsx
import ProfileDataComponent from  "@/components/ProfileDataComponent";
import React, { useState, useEffect } from "react";
import { Text , Image} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetUser } from "@/HelperFuncs/localStorage";
import { UserDataInterface } from "@/interfaces/interfaces";

export default function RegisterPage() {
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
            <SafeAreaView className="flex-1 bg-white">
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return ( 
        <SafeAreaView className="flex-1 bg-white">
            <ProfileDataComponent userID={userID} isMyProfile={true}/>
        </SafeAreaView>
    )
}
