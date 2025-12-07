import React, { useState, useEffect } from 'react';
import { View, Text, Image,TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { UserDataInterface } from "@/interfaces/interfaces";
import PrimaryButtonComponent, {SecondaryButtonComponent, DescriptionComponent} from './Buttons';
import { useRouter } from 'expo-router';
import { GetUser, GetToken } from '@/HelperFuncs/localStorage';
import ProfileHeadBanner from './ProfileHeadBanner';

interface ProfileHeaderComponentProps {
    user: UserDataInterface;
    isMyProfile?: boolean;
}

const ProfileHeaderComponent: React.FC<ProfileHeaderComponentProps> = ({ user, isMyProfile }) => {
    const router = useRouter();
    const [currentUserID, setCurrentUserID] = useState<number | null>(null);
    const [followInfo, setFollowInfo] = useState<{FollowerCount: number, FolloweeCount: number, AlreadyFollowed: boolean} | null>(null);
    
    useEffect(() => {
        const getCurrentUser = async () => {
            const localUser = await GetUser();
            setCurrentUserID(localUser?.UserID || null);
        };
        getCurrentUser();
    }, []);
    
    useEffect(() => {
        const getFollowInfo = async () => {
            if (currentUserID && user?.UserID) {
                try {
                    const response = await fetch(`http://10.0.2.2:8010/get-following-info?userID=${user.UserID}&requesterID=${currentUserID}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFollowInfo(data);
                    }
                } catch (error) {
                    console.error('Error fetching follow info:', error);
                }
            }
        };
        getFollowInfo();
    }, [currentUserID, user?.UserID]);
    
    const makeDuoRoom = (user1ID: string, user2ID: string) => {
        return user1ID < user2ID ? `${user1ID}_${user2ID}` : `${user2ID}_${user1ID}`;
    };
    
    const handleFollow = async () => {
        try {
            const authToken = await GetToken('jwt');
            const isUnfollow = followInfo?.AlreadyFollowed;
            const endpoint = isUnfollow ? 'http://10.0.2.2:8010/unfollow' : 'http://10.0.2.2:8010/follow';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authToken || ''
                },
                body: `followeeID=${user.UserID}`
            });
            
            if (response.ok) {
                console.log(isUnfollow ? 'Unfollow successful' : 'Follow successful');
                setFollowInfo(prev => prev ? {...prev, AlreadyFollowed: !prev.AlreadyFollowed, FollowerCount: prev.AlreadyFollowed ? prev.FollowerCount - 1 : prev.FollowerCount + 1} : null);
            } else {
                console.error(isUnfollow ? 'Unfollow failed:' : 'Follow failed:', response.status);
            }
        } catch (error) {
            console.error('Follow/Unfollow error:', error);
        }
    };
    
    console.log('ProfileHeader - user data:', user);
    console.log('ProfileHeader - UserDescription:', user?.UserDescription);
    return (
        <View className="bg-white">
        <View className="flex-row items-center justify-between px-4 pt-4">
       
        <View className="flex-row items-center">
            {!isMyProfile && (
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Image
                    source={require("../assets/images/backIcon.png")}
                    className="w-6 h-6"
                    resizeMode="contain"
                />
                </TouchableOpacity>
            )}

            <Text className="font-semibold text-xl " numberOfLines={1}>
            @{user?.UserHandle}
            </Text>
        </View>

    
        {isMyProfile ? (
            <Link href={"/settings/user-options"}>
            <Image
                source={require("../assets/images/MenuIcon.png")}
                className="w-5 h-5"
                resizeMode="contain"
            />
            </Link>
        ) : (
            <View className="w-5 h-5" /> // keeps spacing consistent
        )}
        </View>

            <ProfileHeadBanner user={user} followInfo={followInfo} />


                {!isMyProfile ?(
                <View  className="flex-row flex-wrap justify-center my-2 px-6 gap-2">
                
                <View className="w-28"><PrimaryButtonComponent text={followInfo?.AlreadyFollowed ? 'Following' : 'Follow'} onPress={handleFollow} clicked={followInfo?.AlreadyFollowed} fullWidth={false}/></View>
                <View className="w-28"><SecondaryButtonComponent text='Message' onPress={() => {
                    if (currentUserID) {
                        const roomID = makeDuoRoom(currentUserID.toString(), user.UserID.toString());
                        router.push(`/chats/${user.UserID}?roomID=${roomID}`);
                    }
                }} fullWidth={false}/></View>
                </View>)
                :<View  className="flex-row flex-wrap justify-center my-2 px-6"><SecondaryButtonComponent text='Edit Profile' onPress={() => router.push('/update-profile')} fullWidth={false}/> </View>}


        </View>
    );
};

export default ProfileHeaderComponent;
