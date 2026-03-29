import React, { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import UserCardSquareComponent from "../UserCardSquareComponent";

interface FollowingRouteProps {
    userID: number;
}

export function FollowingRoute({ userID }: FollowingRouteProps) {
    const [following, setFollowing] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://10.0.2.2:8010/get-followees?checkID=${userID}`)
            .then(res => res.json())
            .then(data => setFollowing(data.IsFollowing || []))
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