import React, { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import UserCardSquareComponent from "../UserCardSquareComponent";
import { getFollowees } from "@/Services/api/followService";

interface FollowingRouteProps {
    userID: number;
}

export function FollowingRoute({ userID }: FollowingRouteProps) {
    const [following, setFollowing] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFollowees(userID)
            .then(setFollowing)
            .catch(() => setFollowing([]))
            .finally(() => setLoading(false));
    }, [userID]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    if (following.length === 0) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-gray-500">Not following anyone yet</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 p-4">
            <FlatList
                data={following}
                keyExtractor={(item) => item.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                    <UserCardSquareComponent userID={item.toString()} />
                )}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}