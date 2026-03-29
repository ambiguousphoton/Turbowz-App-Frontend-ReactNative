import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Animated, Linking, StyleSheet, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { UserDataInterface } from "@/interfaces/interfaces";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMessagesByRoom, dbEvents, saveOutgoingMessage, updateRoomOpenTime, markMessagesAsRead } from "@/HelperFuncs/MessageStorage";
import { useWS } from "@/context/WebSocketConnectionContext";
import { GetUser } from "@/HelperFuncs/localStorage";
import LinkableText from "@/components/LinkableText";
interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  pending?: boolean;
  timestamp?: string;
}

const detectUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  return text.match(urlRegex) || [];
};

const renderTextWithLinks = (text: string, isInput: boolean = false, router?: any) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const isTurbowz = part.includes('turbowz.com');
      const linkColor = isTurbowz ? 'text-secondary' : (isInput ? 'text-blue-600' : 'text-blue-500 underline');
      
      return (
        <Text 
          key={index} 
          className={linkColor}
          onPress={isInput ? undefined : () => {
            if (isTurbowz && router) {
              const url = new URL(part);
              if (url.pathname.includes('/video')) {
                const videoID = url.searchParams.get('id');
                const videoURL = url.searchParams.get('url');
                if (videoID) {
                  router.push({pathname: '/videos/[videoID]', params: {videoID, VideoURL: videoURL || ''}});
                  return;
                }
              } else if (url.pathname.includes('/eco')) {
                const ecoID = url.searchParams.get('id');
                if (ecoID) {
                  router.push(`/ecos/${ecoID}`);
                  return;
                }
              } else if (url.pathname.includes('/profile')) {
                const profileUserID = url.searchParams.get('id');
                if (profileUserID) {
                  router.push(`/users/${profileUserID}`);
                  return;
                }
              }
            }
            const url = part.startsWith('http') ? part : `https://${part}`;
            Linking.openURL(url);
          }}
        >
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};



interface MessageComponentProps {
  message: Message;
  showDateSeparator: boolean;
  formatTimestamp: (timestamp: string) => string;
  router: any;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, showDateSeparator, formatTimestamp, router }) => {
  const isMe = message.sender === "me";
  return (
    <View>
      {showDateSeparator && (
        <View className="items-center my-4">
          <View style={bubbleStyles.datePill}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 0.2 }}>
              {formatTimestamp(message.timestamp || '')}
            </Text>
          </View>
        </View>
      )}
      <View
        className={`mb-1 max-w-4/5 ${isMe ? 'self-end' : 'self-start'}`}
        style={[
          bubbleStyles.bubble,
          isMe
            ? {
                backgroundColor: message.pending ? '#B8E8FC' : '#DBFCFF',
                borderTopLeftRadius: 8,
                borderTopRightRadius: isMe ? 2 : 8,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }
            : {
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 2,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              },
        ]}
      >
        <View style={{ paddingLeft: 9, paddingRight: 9, paddingTop: 6, paddingBottom: 18, position: 'relative' }}>
          <Text
            style={{
              fontSize: 15.5,
              lineHeight: 21,
              color: isMe ? '#023c69' : '#1C1C2E',
              opacity: message.pending ? 0.6 : 1,
            }}
          >
            {renderTextWithLinks(message.text, false, router)}
          </Text>
          <View style={{ position: 'absolute', bottom: 4, right: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: isMe ? '#6BAFCF' : '#A0AEB5' }}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ChatPage = () => {
  const { userID, roomID, shareType, shareId, shareTitle, shareText, shareUrl } = useLocalSearchParams<{ 
    userID: string; 
    roomID?: string;
    shareType?: string;
    shareId?: string;
    shareTitle?: string;
    shareText?: string;
    shareUrl?: string;
  }>();
  const db = useSQLiteContext();
  const { sendMessage: wsSendMessage } = useWS();
  const router = useRouter();
  const [user, setUser] = useState<UserDataInterface | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [hasSharedContent, setHasSharedContent] = useState(false);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isTurboVerified, setIsTurboVerified] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];
  const flatListRef = useRef<FlatList>(null);

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return messageDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg || !currentMsg.timestamp) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp || '').toDateString();
    return currentDate !== prevDate;
  };

  useEffect(() => {
    fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`)
      .then(res => res.json())
      .then(setUser)
      .catch(() => setUser(null));

    fetch(`http://10.0.2.2:8100/get-turbomax-status?userID=${userID}`)
      .then(res => res.json())
      .then(result => setIsTurboVerified(result.turbomax_active || false))
      .catch(() => setIsTurboVerified(false));
  }, [userID]);

  useEffect(() => {
    if (shareType && shareId) {
      setHasSharedContent(true);
      const sharedContent = shareType === 'video' 
        ? `Check out this video: ${shareTitle}\nhttps://turbowz.com/video?id=${encodeURIComponent(shareId)}&url=${encodeURIComponent(shareUrl || '')}`
        : shareType === 'eco'
        ? `Check out this eco: ${shareText}\nhttps://turbowz.com/eco?id=${encodeURIComponent(shareId)}`
        : `Check out this profile: ${shareTitle}\nhttps://turbowz.com/profile?id=${encodeURIComponent(shareId)}`;
      setInputText(sharedContent);
    }
  }, [shareType, shareId, shareTitle, shareText, shareUrl]);

  useEffect(() => {
    if (roomID) {
      loadMessages();
      updateRoomAndMarkRead();
    }
  }, [roomID]);
  
  const updateRoomAndMarkRead = async () => {
    if (!roomID) return;
    const currentUser = await GetUser();
    if (currentUser?.UserID) {
      await updateRoomOpenTime(db, roomID, currentUser.UserID);
      await markMessagesAsRead(db, roomID, currentUser.UserID);
    }
  };

  useEffect(() => {
    if (!roomID) return;
    
    const handleMessageAdded = (data: { roomID: string; messageID: number }) => {
      if (data.roomID === roomID) {
        loadMessages();
      }
    };
    
    const subscription = dbEvents.addListener('messageAdded', handleMessageAdded);
    return () => subscription.remove();
  }, [roomID]);

  const loadMessages = async () => {
    if (!roomID) return;
    const result = await getMessagesByRoom(db, roomID);
    if (result.success) {
      const prevLength = messages.length;
      const dbMessages: Message[] = result.data
        .sort((a: any, b: any) => new Date(a.Created_At || 0).getTime() - new Date(b.Created_At || 0).getTime())
        .map((msg: any) => ({
          id: msg.Message_ID.toString(),
          text: msg.Message_Text,
          sender: msg.Source_ID.toString() === userID ? "other" : "me",
          timestamp: msg.Destination_Receive_Time || msg.Created_At || new Date().toISOString()
        }));
      setMessages(dbMessages);
      
      // Auto-scroll to bottom
      if (prevLength === 0 || dbMessages.length > prevLength) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  useEffect(() => {
    if (inputText.trim()) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [inputText]);

  const sendMessage = async () => {
    if (!inputText.trim() || !roomID) return;

    const tempId = Date.now().toString();
    const messageText = inputText.trim();
    
    // Add message immediately with pending state
    const tempMessage: Message = {
      id: tempId,
      text: messageText,
      sender: "me",
      pending: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    setInputText("");
    setHasSharedContent(false);
    setShowNewMessages(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const messageData = {
      messageText,
      destinationID: userID,
      roomID: roomID,
      links: ""
    };

    // Save message locally
    const currentUser = await GetUser();
    if (currentUser?.UserID) {
      await saveOutgoingMessage(messageData, currentUser.UserID.toString(), db);
    }

    // Send via WebSocket
    const success = wsSendMessage(messageData);
    if (!success) {
      // Remove temp message on failure
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setHasSharedContent(false);
      setShowNewMessages(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center" style={bubbleStyles.header}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={require('@/assets/images/backIcon.png')} className="w-6 h-6" />
          </TouchableOpacity>
          {profileImageError ? (
            <View className="w-10 h-10 rounded-full bg-primary-25 justify-center items-center mr-3">
              <Text className="text-primary text-lg font-semibold">
                {user?.UserHandle?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          ) : (
            <Image 
              source={{ uri: `http://10.0.2.2:8088/pfp?user_id=${userID}` }} 
              className="w-10 h-10 rounded-full mr-3" 
              resizeMode="cover" 
              onError={() => setProfileImageError(true)}
            />
          )}
          <TouchableOpacity 
            className="flex-1" 
            onPress={() => router.push(`/users/${userID}`)}
          >
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold" style={{ color: '#1C1C2E' }}>
                {user?.UserProfileName || "Chat"}
              </Text>
              {isTurboVerified && (
                <Image 
                  source={require('@/assets/images/TurboVerifiedIcon.png')} 
                  className="w-4 h-4 ml-1" 
                  resizeMode="contain" 
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <View className="flex-1 relative" style={{ backgroundColor: '#F0FAFE' }}>
          <FlatList
            ref={flatListRef}
            className="flex-1 px-3 py-2"
            data={messages}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
              if (isAtBottom) setShowNewMessages(false);
            }}
            renderItem={({ item, index }) => {
              const prevItem = index > 0 ? messages[index - 1] : undefined;
              const showDateSeparator = shouldShowDateSeparator(item, prevItem);
              
              return (
                <MessageComponent 
                  message={item} 
                  showDateSeparator={showDateSeparator} 
                  formatTimestamp={formatTimestamp}
                  router={router}
                />
              );
            }}
          />
          {showNewMessages && (
            <TouchableOpacity
              className="absolute bottom-4 right-4 bg-primary-150 rounded-full p-3 shadow-lg"
              onPress={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                setShowNewMessages(false);
              }}
            >
              <Text className="text-white text-xs font-semibold">↓</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Input Box */}
        <View className="px-3 py-2" style={{ backgroundColor: '#F0FAFE' }}>
          {hasSharedContent && (
            <View className="bg-blue-50 border border-blue-200 mb-2 p-2 rounded-lg">
              <Text className="text-blue-800 font-semibold text-xs mb-1">Sharing:</Text>
              <Text className="text-blue-600 text-xs">
                {shareType === 'video' ? `Video: ${shareTitle}` : `Eco: ${shareText?.substring(0, 50)}...`}
              </Text>
            </View>
          )}
          <View className="flex-row items-center px-2 py-1" style={bubbleStyles.inputContainer}>
            <View className="flex-1">
              {inputText ? (
                <Text className="text-base px-3 py-2 min-h-[40px]">
                  {renderTextWithLinks(inputText, true)}
                </Text>
              ) : null}
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message..."
                className={`text-base px-3 py-2 ${inputText ? 'absolute top-0 opacity-0' : ''}`}
                multiline
              />
            </View>
            {inputText.trim() && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity 
                  className="rounded-full p-3 ml-2"
                  style={{ backgroundColor: '#05BAFF' }}
                  onPress={sendMessage}
                >
                  <Image 
                    source={require('@/assets/images/sendIcon.png')} 
                    className="w-5 h-5" 
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
   );
};

const bubbleStyles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#DBFCFF',
  },
  datePill: {
    backgroundColor: '#05BAFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#05BAFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#DBFCFF',
  },
});

export default ChatPage;
