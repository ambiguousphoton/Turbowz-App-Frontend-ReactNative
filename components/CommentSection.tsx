import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { fetchComments } from "@/Services/GetCommentsAPI";
import { CommentInterface } from "@/interfaces/interfaces";
import { Link, router } from "expo-router";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import { ScrollView, FlatList } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { TimestampText } from "./TimestampText";
import { GetUser } from "@/HelperFuncs/localStorage";
export default function CommentSectionComponent({videoID, ecoID, onRefresh, onTimestampPress, onCommentsChange, onClose, onReplyStateChange, onReplyToComment, onReplyBack}: {videoID?:number; ecoID?:number; onRefresh?: (refreshFn: () => void) => void; onTimestampPress?: (seconds: number) => void; onCommentsChange?: (comments: any[]) => void; onClose?: () => void; onReplyStateChange?: (isReplying: boolean) => void; onReplyToComment?: (commentId: number) => void; onReplyBack?: () => void}) {
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'contextFlags'>('all');
  const [replyingTo, setReplyingTo] = useState<CommentInterface | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const localUser = await GetUser();
      setCurrentUserID(localUser?.UserID || null);
    };
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    onReplyStateChange?.(!!replyingTo);
  }, [replyingTo, onReplyStateChange]);
  
  const filteredComments = activeTab === 'contextFlags'
    ? (Array.isArray(comments) ? comments.filter(comment => comment.Comment_text.includes('#CF')) : [])
    : (Array.isArray(comments) ? comments.filter(comment => !comment.Comment_text.includes('#CF')) : []);

  // Organize comments hierarchically with 2-level limit
  const organizedComments = filteredComments.reduce((acc, comment) => {
    const parentId = comment.Parent_Comment_ID?.Valid ? comment.Parent_Comment_ID.Int64 : null;
    if (!parentId) {
      // This is a parent comment
      acc.push({ ...comment, replies: [] });
    } else {
      // This is a reply, find its parent
      const parentIndex = acc.findIndex(c => c.Comment_id === parentId);
      if (parentIndex !== -1) {
        acc[parentIndex].replies.push(comment);
      }
    }
    return acc;
  }, []);

  const refreshComments = async () => {
    if (videoID) {
      try {
        const data = await fetchComments(videoID);
        console.log('Video comments fetched:', data);
        const commentsArray = data.comments || data || [];
        setComments(commentsArray);
        onCommentsChange?.(commentsArray);
      } catch (error) {
        console.error('Error fetching video comments:', error);
        setComments([]);
        onCommentsChange?.([]);
      }
    } else if (ecoID) {
      try {
        const response = await fetch(`http://10.0.2.2:7200/get-eco-comment?ecoID=${ecoID}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Eco comments fetched:', data);
          const commentsArray = data.comments || [];
          setComments(commentsArray);
          onCommentsChange?.(commentsArray);
        } else {
          console.error('Eco comments response not ok:', response.status);
          setComments([]);
          onCommentsChange?.([]);
        }
      } catch (error) {
        console.error('Error fetching eco comments:', error);
        setComments([]);
        onCommentsChange?.([]);
      }
    }
  };

  useEffect(() => {
    refreshComments();
  }, [videoID, ecoID]);

  useEffect(() => {
    onRefresh?.(refreshComments);
  }, []);

  const renderCommentText = (text: string) => {
    if (!text.includes('#CF')) {
      return <TimestampText text={text} onTimestampPress={onTimestampPress} />;
    }
    
    const parts = text.split(/(#CF)/g);
    return (
      <Text>
        {parts.map((part, index) => 
          part === '#CF' ? (
            <Text key={index} className="bg-secondary-200 text-secondary px-1 rounded font-semibold">
              {part}
            </Text>
          ) : (
            <TimestampText key={index} text={part} onTimestampPress={onTimestampPress} />
          )
        )}
      </Text>
    );
  };

  if (replyingTo) {
    return (
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center py-3 border-b border-gray-200 px-4">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => {
              setReplyingTo(null);
              onReplyBack?.();
            }}
          >
            <Image 
              source={require('../assets/images/backIcon.png')} 
              className="w-6 h-6 mr-2" 
              resizeMode="contain" 
            />
            <Text className="text-lg font-bold text-gray-900">Back to Comments</Text>
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <View className="flex-row bg-white">
            <View className="w-10 h-10 mr-3 rounded-full bg-primary-25 justify-center items-center">
              <Text className="text-primary text-base font-bold">
                {replyingTo.Commenter_Name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            
            <View className="flex-1">
              <Text className="font-bold text-base mb-2 text-gray-900">
                {replyingTo.Commenter_Name} • {timeAgo(replyingTo.Comment_date)}
              </Text>
              <View className="text-gray-700 text-base leading-6">
                {renderCommentText(replyingTo.Comment_text)}
              </View>
            </View>
          </View>
          
          {replyingTo.replies && replyingTo.replies.length > 0 && (
            <View className="mt-4">
              <Text className="text-gray-600 text-sm font-medium mb-3">
                {replyingTo.replies.length} {replyingTo.replies.length === 1 ? 'reply' : 'replies'}
              </Text>
              {replyingTo.replies.map((reply, index) => (
                <View key={index} className="pb-4 ml-8 flex-row bg-white">
                  <View className="w-6 h-6 mr-2 rounded-full bg-gray-200 justify-center items-center">
                    <Text className="text-gray-600 text-xs font-bold">
                      {reply.Commenter_Name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-xs mb-1 text-gray-700">
                      {reply.Commenter_Name} • {timeAgo(reply.Comment_date)}
                    </Text>
                    <View className="text-gray-600 text-xs leading-5">
                      {renderCommentText(reply.Comment_text)}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
    className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="bg-gray-200 mx-4 mb-4 rounded-2xl p-1">
          <View className="flex-row">
            <TouchableOpacity 
              className={`flex-1 py-3 px-4 rounded-xl ${activeTab === 'all' ? 'bg-white' : ''}`}
              onPress={() => setActiveTab('all')}
            >
              <Text className={`text-center font-bold text-sm ${activeTab === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>
                General ({Array.isArray(comments) ? comments.filter(c => !c.Comment_text.includes('#CF')).length : 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 px-4 rounded-xl ${activeTab === 'contextFlags' ? 'bg-white' : ''}`}
              onPress={() => setActiveTab('contextFlags')}
            >
              <Text className={`text-center font-bold text-sm ${activeTab === 'contextFlags' ? 'text-gray-900' : 'text-gray-600'}`}>
                Community ({Array.isArray(comments) ? comments.filter(c => c.Comment_text.includes('#CF')).length : 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList 
            className="mb-10"
            contentContainerStyle={{ paddingBottom: 100 }}
            data={organizedComments} 
            scrollEnabled={false}
            ListEmptyComponent={
                <View className="items-center py-12">
                    <Text className="text-gray-600 text-base">
                      {activeTab === 'contextFlags' ? 'No context flags yet' : 'No comments yet'}
                    </Text>
                </View>
            }
            renderItem={({ item, index }) => (
                <View key={index}>
                  <View className="pb-6 pt-4 border-b border-gray-100 mx-4 flex-row bg-white"> 
                      <TouchableOpacity 
                        className="w-8 h-8 mr-3 rounded-full bg-primary-25 justify-center items-center"
                        onPress={() => {
                          if (currentUserID && item.Commenter_id === currentUserID) {
                            router.push('/(tabs)/myprofile');
                          } else {
                            router.push(`/users/${item.Commenter_id}`);
                          }
                        }}
                      >
                          <Text className="text-primary text-sm font-bold">
                              {item.Commenter_Name?.[0]?.toUpperCase() || '?'}
                          </Text>
                      </TouchableOpacity>
                      
                      <View className="flex-1">
                          <TouchableOpacity onPress={() => {
                            if (currentUserID && item.Commenter_id === currentUserID) {
                              router.push('/(tabs)/myprofile');
                            } else {
                              router.push(`/users/${item.Commenter_id}`);
                            }
                          }}>
                            <Text className="font-bold text-sm mb-2 text-gray-900">{item.Commenter_Name} • {timeAgo(item.Comment_date)}</Text>
                          </TouchableOpacity>
                          <View className="text-gray-700 text-sm leading-6">
                            {renderCommentText(item.Comment_text)}
                          </View>
                          <TouchableOpacity 
                            className="flex-row items-center mt-2"
                            onPress={() => {
                              setReplyingTo(item);
                              onReplyToComment?.(item.Comment_id);
                            }}
                          >
                            <Image 
                              source={require('../assets/images/ReplyIcon.png')} 
                              className="w-4 h-4 mr-1" 
                              resizeMode="contain" 
                            />
                            <Text className="text-gray-500 text-sm">Reply</Text>
                          </TouchableOpacity>
                          
                          {item.replies && item.replies.length > 0 && (
                            <TouchableOpacity 
                              className="flex-row items-center mt-2"
                              onPress={() => {
                                const newExpanded = new Set(expandedComments);
                                if (expandedComments.has(item.Comment_id)) {
                                  newExpanded.delete(item.Comment_id);
                                } else {
                                  newExpanded.add(item.Comment_id);
                                }
                                setExpandedComments(newExpanded);
                              }}
                            >
                              <Text className="text-blue-500 text-sm font-medium">
                                {expandedComments.has(item.Comment_id) 
                                  ? 'Hide replies' 
                                  : `Show ${item.replies.length} ${item.replies.length === 1 ? 'reply' : 'replies'}`
                                }
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                  </View>
                  
                  {expandedComments.has(item.Comment_id) && item.replies?.map((reply, replyIndex) => (
                    <View key={`${index}-${replyIndex}`} className="pb-4 pt-2 mx-4 ml-12 flex-row bg-white">
                      <TouchableOpacity 
                        className="w-6 h-6 mr-2 rounded-full bg-gray-200 justify-center items-center"
                        onPress={() => {
                          if (currentUserID && reply.Commenter_id === currentUserID) {
                            router.push('/(tabs)/myprofile');
                          } else {
                            router.push(`/users/${reply.Commenter_id}`);
                          }
                        }}
                      >
                        <Text className="text-gray-600 text-xs font-bold">
                          {reply.Commenter_Name?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </TouchableOpacity>
                      
                      <View className="flex-1">
                        <TouchableOpacity onPress={() => {
                          if (currentUserID && reply.Commenter_id === currentUserID) {
                            router.push('/(tabs)/myprofile');
                          } else {
                            router.push(`/users/${reply.Commenter_id}`);
                          }
                        }}>
                          <Text className="font-bold text-xs mb-1 text-gray-700">{reply.Commenter_Name} • {timeAgo(reply.Comment_date)}</Text>
                        </TouchableOpacity>
                        <View className="text-gray-600 text-xs leading-5">
                          {renderCommentText(reply.Comment_text)}
                        </View>
                        <TouchableOpacity 
                          className="flex-row items-center mt-1"
                          onPress={() => {
                            setReplyingTo(item);
                            onReplyToComment?.(item.Comment_id);
                          }}
                        >
                          <Image 
                            source={require('../assets/images/ReplyIcon.png')} 
                            className="w-3 h-3 mr-1" 
                            resizeMode="contain" 
                          />
                          <Text className="text-gray-500 text-xs">Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
            )}
        />
      </ScrollView>
  );
}
