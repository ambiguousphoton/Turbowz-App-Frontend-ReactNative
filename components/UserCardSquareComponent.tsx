import { Text, View, ActivityIndicator, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import React, { useState, useEffect } from "react";
import { UserDataInterface } from '@/interfaces/interfaces';
import { GetUser } from '@/HelperFuncs/localStorage';
import { LinearGradient } from 'expo-linear-gradient';

const UserCardSquareComponent = ({ userID, onDismiss }: { userID: string; onDismiss?: () => void }) => {
    const [data, setData] = useState<UserDataInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImageError, setProfileImageError] = useState(false);
    const [currentUserID, setCurrentUserID] = useState<number | null>(null);
    const [isTurboVerified, setIsTurboVerified] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const getUserID = async () => {
            const localUser = await GetUser();
            setCurrentUserID(localUser?.UserID || null);
        };
        getUserID();

        fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`)
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));

        fetch(`http://10.0.2.2:8100/get-turbomax-status?userID=${userID}`)
            .then(res => res.json())
            .then(result => setIsTurboVerified(result.turbomax_active || false))
            .catch(() => setIsTurboVerified(false));
    }, [userID]);

    if (dismissed) return null;

    if (loading) return (
        <View style={styles.card}>
            <ActivityIndicator size="small" color="#05BAFF" />
        </View>
    );

    if (!data) return (
        <View style={styles.card}>
            <Text className="text-gray-400 text-xs">No user found</Text>
        </View>
    );

    const handlePress = () => {
        if (currentUserID && parseInt(userID) === currentUserID) {
            router.push('/(tabs)/myprofile');
        } else {
            router.push(`/users/${userID}`);
        }
    };

    return (
        <Pressable style={styles.card} onPress={handlePress}>
            {/* Colored header band */}
            <LinearGradient
                colors={['#05BAFF', '#69E2FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerBand}
            />

            {/* Dismiss */}
            <TouchableOpacity
                onPress={() => { setDismissed(true); onDismiss?.(); }}
                style={styles.dismissBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>✕</Text>
            </TouchableOpacity>

            {/* Avatar — fixed position, won't overlap text */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarRing}>
                    {profileImageError ? (
                        <View style={styles.avatarFallback}>
                            <Text style={{ color: '#05BAFF', fontSize: 22, fontWeight: '700' }}>
                                {data.UserHandle?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${userID}` }}
                            style={styles.avatar}
                            resizeMode="cover"
                            onError={() => setProfileImageError(true)}
                        />
                    )}
                </View>
            </View>

            {/* Info — fixed height block pinned to bottom */}
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {data.UserProfileName}
                    </Text>
                    {isTurboVerified && (
                        <Image
                            source={require('../assets/images/TurboVerifiedIcon.png')}
                            style={{ width: 12, height: 12, marginLeft: 2 }}
                            resizeMode="contain"
                        />
                    )}
                </View>
                <Text style={styles.handle} numberOfLines={1}>
                    @{data.UserHandle}
                </Text>
                <Text style={styles.bio} numberOfLines={1}>
                    {data.UserDescription || data.FromLocation || "Hey there! 👋"}
                </Text>
            </View>
        </Pressable>
    );
};

const CARD_WIDTH = 130;
const CARD_HEIGHT = 160;
const AVATAR_SIZE = 64;
const HEADER_HEIGHT = 48;
const INFO_HEIGHT = 46;

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        alignItems: 'center',
    },
    headerBand: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
    },
    dismissBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 10,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSection: {
        marginTop: HEADER_HEIGHT - AVATAR_SIZE / 2,
        alignItems: 'center',
    },
    avatarRing: {
        width: AVATAR_SIZE + 4,
        height: AVATAR_SIZE + 4,
        borderRadius: (AVATAR_SIZE + 4) / 2,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarFallback: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: '#DBFCFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        height: INFO_HEIGHT,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 8,
        width: '100%',
        marginTop: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A2E',
        maxWidth: 100,
    },
    handle: {
        fontSize: 10,
        color: '#8EAAB8',
        marginTop: 1,
    },
    bio: {
        fontSize: 9,
        color: '#B0C4CE',
        marginTop: 2,
        textAlign: 'center',
        lineHeight: 12,
    },
});

export default UserCardSquareComponent;
