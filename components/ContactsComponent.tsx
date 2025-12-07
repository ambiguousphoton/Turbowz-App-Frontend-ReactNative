import {StyleSheet, Text, View, FlatList, Animated, RefreshControl} from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import UserContactCard from './UserContactCard'
import { getAllRooms, dbEvents } from '@/HelperFuncs/MessageStorage'
import { GetUser } from '@/HelperFuncs/localStorage'

interface ContactsComponentProps {
    shareType?: string;
    shareId?: string;
    shareTitle?: string;
    shareText?: string;
    shareUrl?: string;
}

const ContactsComponent = ({ shareType, shareId, shareTitle, shareText, shareUrl }: ContactsComponentProps = {}) => {
    const { userHandle } = useLocalSearchParams()
    const db = useSQLiteContext()
    const [contacts, setContacts] = useState<{userID: string, roomID: string, latestMessage: string, latestMessageTime: string, unreadCount: number}[]>([])
    const [currentUserID, setCurrentUserID] = useState<number | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const getCurrentUser = async () => {
            const localUser = await GetUser()
            setCurrentUserID(localUser?.UserID || null)
        }
        getCurrentUser()
    }, [])

    useEffect(() => {
        if (currentUserID) {
            fadeAnim.setValue(0)
            fetchRooms()
        }
    }, [currentUserID])

    useEffect(() => {
        const handleRoomUpdated = (roomID?: string) => {
            console.log("🔄 Room updated:", roomID);
            if (roomID) {
                updateSingleRoom(roomID)
            } else {
                fetchRooms()
            }
        }
        
        const subscription = dbEvents.addListener('roomUpdated', handleRoomUpdated)
        return () => subscription.remove()
    }, [currentUserID])

    const updateSingleRoom = useCallback(async (roomID: string) => {
        if (!currentUserID) return
        
        const roomResult = await db.getFirstAsync(
            'SELECT * FROM rooms WHERE Room_ID = ?',
            [roomID]
        )
        
        if (roomResult) {
            const otherUserID = roomResult.Source_ID === currentUserID ? roomResult.Destination_ID : roomResult.Source_ID
            
            const latestMessageResult = await db.getFirstAsync(
                'SELECT Message_Text, Destination_Receive_Time FROM messages WHERE Room_ID = ? ORDER BY Destination_Receive_Time DESC LIMIT 1',
                [roomID]
            )
            
            const updatedContact = {
                userID: otherUserID.toString(),
                roomID: roomID,
                latestMessage: latestMessageResult?.Message_Text || '',
                latestMessageTime: latestMessageResult?.Destination_Receive_Time || '',
                unreadCount: roomResult.is_read === 0 ? 1 : 0
            }
            
            setContacts(prev => {
                const filtered = prev.filter(c => c.roomID !== roomID)
                return [updatedContact, ...filtered]
            })
        }
    }, [currentUserID, db])

    const fetchRooms = async (showRefresh = false) => {
        if (!currentUserID) return
        
        if (showRefresh) setRefreshing(true)
        
        console.log("🔄 Fetching rooms...");
        const result = await getAllRooms(db)
        console.log("🏠 Rooms result:", result);
        if (result.success) {
            const contactsData = await Promise.all(result.data.map(async (room: any) => {
                const otherUserID = room.Source_ID === currentUserID ? room.Destination_ID : room.Source_ID
                
                const latestMessageResult = await db.getFirstAsync(
                    'SELECT Message_Text, Destination_Receive_Time FROM messages WHERE Room_ID = ? ORDER BY Destination_Receive_Time DESC LIMIT 1',
                    [room.Room_ID]
                )
                
                const roomResult = await db.getFirstAsync(
                    'SELECT is_read FROM rooms WHERE Room_ID = ?',
                    [room.Room_ID]
                )
                
                return {
                    userID: otherUserID.toString(),
                    roomID: room.Room_ID,
                    latestMessage: latestMessageResult?.Message_Text || '',
                    latestMessageTime: latestMessageResult?.Destination_Receive_Time || '',
                    unreadCount: roomResult?.is_read === 0 ? 1 : 0
                }
            }))
            console.log("👥 Contacts data:", contactsData);
            setContacts(contactsData)
            
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
        
        if (showRefresh) {
            setTimeout(() => setRefreshing(false), 500)
        }
    }

    return (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <FlatList
                data={contacts}
                keyExtractor={(item) => item.roomID}
                renderItem={({ item }) => (
                    <UserContactCard 
                        userID={item.userID} 
                        roomID={item.roomID} 
                        latestMessage={item.latestMessage} 
                        latestMessageTime={item.latestMessageTime} 
                        unreadCount={item.unreadCount}
                        shareType={shareType}
                        shareId={shareId}
                        shareTitle={shareTitle}
                        shareText={shareText}
                        shareUrl={shareUrl}
                    />
                )}
                scrollEnabled={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchRooms(true)}
                        tintColor="#25D366"
                        colors={['#25D366']}
                    />
                }
            />
        </Animated.View>
    )
}
export default ContactsComponent;