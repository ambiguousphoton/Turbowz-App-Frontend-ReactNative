import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Animated, Linking } from "react-native";
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
  return (
    <View>
      {showDateSeparator && (
        <View className="items-center my-4">
          <Text className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
            {formatTimestamp(message.timestamp || '')}
          </Text>
        </View>
      )}
      <View
        className={`px-4 py-3 rounded-2xl mb-3 max-w-4/5 ${
          message.sender === "me" 
            ? `${message.pending ? "bg-primary-100" : "bg-primary-25"} self-end` 
            : "bg-gray-100 self-start"
        }`}
      >
        <Text 
          className={`text-base text-black ${message.pending ? "opacity-70" : ""}`}
        >
          {renderTextWithLinks(message.text, false, router)}
        </Text>
        <Text className="text-xs mt-1 text-gray-500">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
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
  }, [userID]);

  useEffect(() => {
    if (shareType && shareId) {
      setHasSharedContent(true);
      const sharedContent = shareType === 'video' 
        ? `Check out this video: ${shareTitle}\nhttps://turbowz.com/video?id=${encodeURIComponent(shareId)}&url=${encodeURIComponent(shareUrl || '')}`
        : `Check out this eco: ${shareText}\nhttps://turbowz.com/eco?id=${encodeURIComponent(shareId)}`;
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
        console.log("🔄 New message for current room, refreshing...");
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
      console.error("❌ Failed to send message");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center bg-white border-b border-select">
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
            <Text className="text-lg font-semibold">
              {user?.UserProfileName || "Chat"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <View className="flex-1 relative">
          <FlatList
            ref={flatListRef}
            className="flex-1 px-4 py-2"
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
        <View className="p-3">
          {hasSharedContent && (
            <View className="bg-blue-50 border border-blue-200 mb-2 p-2 rounded-lg">
              <Text className="text-blue-800 font-semibold text-xs mb-1">Sharing:</Text>
              <Text className="text-blue-600 text-xs">
                {shareType === 'video' ? `Video: ${shareTitle}` : `Eco: ${shareText?.substring(0, 50)}...`}
              </Text>
            </View>
          )}
          <View className="flex-row items-center bg-white border border-select rounded-2xl px-2 py-1">
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
                  className="bg-primary-150 rounded-xl p-3 ml-2"
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

export default ChatPage;
