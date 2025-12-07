import React, { useState, useEffect } from "react";
import { View, Button, Text, Alert, ActivityIndicator, FlatList, Image, ScrollView } from "react-native";
import { Link, Redirect, useFocusEffect } from "expo-router";
import { UserDataInterface } from "@/interfaces/interfaces";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProfileHeaderComponent from "./ProfileHeaderComponent";
import ProfileTabs from "./ProfileTabsComponent";


interface ProfileDataComponentProps {
  userID: number;
  isMyProfile?: boolean;
}




export default function ProfileDataComponent({ userID, isMyProfile }: ProfileDataComponentProps) {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        try {
            console.log("userID", userID)
            const response  = await fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`);
            const userData  = await response.json() as UserDataInterface;
            userData.UserID = userID;
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userID]);

    useFocusEffect(
        React.useCallback(() => {
            fetchUser();
        }, [userID])
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    return (
        <View className="flex-1 ">
            {user?.UserID ? (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <ProfileHeaderComponent user={user} isMyProfile={isMyProfile} />
                    <ProfileTabs user={user} isMyProfile={isMyProfile}/>
                </ScrollView>
            ) : (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">User not found</Text>
                </View>
            )}
        </View>
    )
}
