// ProfileTabs.tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import { PostsRoute } from "./ProfileTabs/PostRouteComponent";
import { UserDataInterface } from "@/interfaces/interfaces";
import TabHeaderComponent from "./TabHeaderComponent";
import { EcoRoute } from "./ProfileTabs/EcoRouteComponent";
import { ActivitiesRoute } from "./ProfileTabs/ActivitiesRouteComponent";
import { ShopRoute } from "./ProfileTabs/ShopRouteComponent";
import { FollowersRoute } from "./ProfileTabs/FollowersRouteComponent";
import { FollowingRoute } from "./ProfileTabs/FollowingRouteComponent";

interface ProfileTabsComponentProps {
    user: UserDataInterface;
    isMyProfile?: boolean;
}

export default function ProfileTabsComponent({ user, isMyProfile }: ProfileTabsComponentProps) {
    const userID = user.UserID;
    const [activeTab, setActiveTab] = useState(0);
    const tabs = isMyProfile ? ['Echos', 'Videos',  'Activities','Shop' ] : ['Ecos', 'Videos', 'Activities', 'Shop'];

    const handleTabPress = (index: number) => {
        setActiveTab(index);
    };

    const renderTabContent = () => {
        if (isMyProfile) {
            switch (activeTab) {
                case 0:
                    return <EcoRoute userID={userID} />;
                case 1:
                    return <PostsRoute userID={userID} />;
                case 2:
                    return <ActivitiesRoute userID={userID} isMyProfile={isMyProfile} />;
                case 3:
                    return <ShopRoute userID={userID} />;   
                default:
                    return <EcoRoute userID={userID} />;
            }
        } else {
            switch (activeTab) {
                case 0:
                    return <EcoRoute userID={userID} />;
                case 1:
                    return <PostsRoute userID={userID} />;
                case 2:
                    return <ActivitiesRoute userID={userID} isMyProfile={isMyProfile} />;
                case 3:
                    return <ShopRoute userID={userID} />;
                default:
                    return <EcoRoute userID={userID} />;
            }
        }
    };

    return (
        <View className="flex-1">
            <TabHeaderComponent 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabPress={handleTabPress} 
            />
            {renderTabContent()}
        </View>
    );
}
