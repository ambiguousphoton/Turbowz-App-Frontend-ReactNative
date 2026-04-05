import React, { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserProfileCardTypeSearch from "@/components/UserProfileCardTypeSearch";
import { getFollowers } from "@/Services/api/followService";

export default function FollowersPage() {
    const router = useRouter();
    const { userID } = useLocalSearchParams<{ userID: string }>();
    const [followers, setFollowers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (userID) {
            getFollowers(userID)
                .then(setFollowers)
                .catch(() => setFollowers([]))
                .finally(() => setLoading(false));
        }
    }, [userID]);

    if (loading) {
        return (
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="black" />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Image
                        source={require("@/assets/images/backIcon.png")}
                        className="w-6 h-6"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Followers</Text>
            </View>
            
            {followers.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">No followers yet</Text>
                </View>
            ) : (
                <FlatList
                    data={followers}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                        <UserProfileCardTypeSearch userID={item.toString()} />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}