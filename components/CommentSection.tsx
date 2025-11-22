import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { fetchComments } from "@/Services/GetCommentsAPI";
import { CommentInterface } from "@/interfaces/interfaces";
import { Link } from "expo-router";
import { timeAgo } from "@/HelperFuncs/timeAgo";
import { ScrollView, FlatList } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
export default function CommentSectionComponent({videoID, ecoID, onRefresh}: {videoID?:number; ecoID?:number; onRefresh?: (refreshFn: () => void) => void}) {
  const [comments, setComments] = useState<CommentInterface[]>([]);

  const refreshComments = async () => {
    if (videoID) {
      fetchComments(videoID).then(setComments);
    } else if (ecoID) {
      try {
        const response = await fetch(`http://10.0.2.2:7200/get-eco-comment?ecoID=${ecoID}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching eco comments:', error);
      }
    }
  };

  useEffect(() => {
    refreshComments();
  }, [videoID, ecoID]);

  useEffect(() => {
    onRefresh?.(refreshComments);
  }, []);

  return (
    // <View>
    // {/* <Text className="text-xl font-semibold py-2 border-b border-gray-200 px-2">Comments</Text> */}
      
    <ScrollView 
    className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>
        
        <FlatList 
            className="mb-10"
            contentContainerStyle={{ paddingBottom: 100 }}
            data={comments} 
            scrollEnabled={false}
            ListEmptyComponent={
                <View className="items-center py-10">
                    <Text className="text-gray-500 ">No comments yet</Text>
                </View>
            }
            renderItem={({ item }) => (
                <View className=" my-1 mx-1 p-2 pr-5 flex-row rounded-2xl bg-white text-secondary " key={item.Comment_id}> 
                    <View className="w-6 h-6 mr-2 rounded-full bg-primary-25 justify-center items-center">
                        <Text className="text-primary text-xs font-semibold">
                            {item.Commenter_Name?.[0]?.toUpperCase() || '?'}
                        </Text>
                    </View>
                    
                    <View className="flex-1">
                        <Text className="text-secondary text-xs mb-1 ">{item.Commenter_Name} |  {timeAgo(item.Comment_date)} </Text>
                        <Text className="text-sm">{item.Comment_text}</Text>
                    </View>

                </View>
            )}
        />
    </ScrollView>
    // </View>

  )
}
