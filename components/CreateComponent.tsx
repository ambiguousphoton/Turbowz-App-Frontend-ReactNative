import React, { useState, useCallback } from "react";
import { View, Button, Text, Alert, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { GetToken } from "@/HelperFuncs/localStorage"; // adjust path to your helper
import { ALLOWED_TAGS } from "@/HelperFuncs/constants";
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer, VideoPlayer } from "expo-video";
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from "react-native-dropdown-picker";
import { router } from 'expo-router';








const UploadVideoPreviewAndInput = ({ player, videoURI }: { player: VideoPlayer, videoURI: string }) => {
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handlePublish = async () => {
    if (uploading) return; // Prevent multiple requests

    // 1. Clean the title: Remove leading and trailing spaces
    const trimmedTitle = title ? title.trim() : "";

    // 2. Validation Check: If the trimmed title is empty, stop and alert
    if (!trimmedTitle) {
      // NOTE: Using Alert.alert as requested by the user, 
      // but in a custom app, this should be a custom modal/toast.
      Alert.alert("Input Error", "The video needs a title and cannot be empty.");
      return; 
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("video", {
        uri: videoURI,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      // 3. Use the trimmed title for the upload
      formData.append("title", trimmedTitle);
      formData.append("info", info);
      formData.append("tags", JSON.stringify(selectedTags));
      

      const token = await GetToken('jwt');
      if (!token) {
        Alert.alert("Error", "Authentication required.");
        return;
      }
      
      const response = await fetch("http://10.0.2.2:8080/upload", {
        method: "POST",
        headers: {
          "Authorization": token,
        },
        body: formData,
      });

      // Check for success status (FastAPI usually returns 200 or 201)
      if (response.ok) {
          Alert.alert("Success", "Video Uploaded!");
      } else {
          // Handle specific API error messages if available
          const errorText = await response.text();
          Alert.alert("Upload Failed", `Server responded with status ${response.status}: ${errorText.substring(0, 100)}...`);
      }

    } catch (err: any) {
      Alert.alert("Upload Failed", "An unexpected network or system error occurred.");
      console.log(err)
    } finally {
      setUploading(false);
    }
  };



  
  
  
  
  
  
  
  
  
  return (
    <View className="flex-1">
      <Text className="text-xl font-bold text-gray-800 mb-4">Preview</Text>
      <VideoView
        style={{ width: "100%", height: 250, backgroundColor: "black", borderRadius: 12 }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />

      <View className="mt-6 space-y-4">
        <TextInput 
          placeholder="Add Title" 
          className="border border-gray-300 rounded-xl p-4 text-base bg-white"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={title}
          onChangeText={setTitle}
          multiline
          scrollEnabled={true}
        />

        <TextInput 
          placeholder="Add more info about the video.." 
          className="border border-gray-300 rounded-xl p-4 text-base bg-white"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={info}
          onChangeText={setInfo}
          multiline
          scrollEnabled={true}
        />
      </View>

      <TagDropdown selectedTags={selectedTags} onTagsChange={setSelectedTags} />

      <TouchableOpacity 
        className={`mt-6 px-6 py-4 rounded-xl ${uploading ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handlePublish}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold text-lg">Publish Video</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}




export default function UploadVideo({ onAlert, onPublishChange }: { onAlert?: (message: string) => void, onPublishChange?: (fn: () => void, disabled: boolean) => void }) {
  const [videoURI, setVideoURI] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setVideoURI(null);
      };
    }, [])
  );

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoURI(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (uploading) return;

    const trimmedTitle = title ? title.trim() : "";

    if (!trimmedTitle) {
      onAlert?.("The video needs a title and cannot be empty.");
      return;
    }

    if (!videoURI) {
      onAlert?.("Please select a video first.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("video", {
        uri: videoURI,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      formData.append("title", trimmedTitle);
      formData.append("info", info);
      formData.append("tags", JSON.stringify(selectedTags));

      const token = await GetToken('jwt');
      if (!token) {
        onAlert?.("Authentication required.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8080/upload", {
        method: "POST",
        headers: {
          "Authorization": token,
        },
        body: formData,
      });

      if (response.ok) {
        onAlert?.("Video Uploaded!");
        setTimeout(() => router.back(), 1000);
      } else {
        const errorText = await response.text();
        onAlert?.("Upload Failed");
      }
    } catch (err: any) {
      onAlert?.("An unexpected network or system error occurred.");
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const player = useVideoPlayer(videoURI, player => {
    player.loop = true;
  });

  const isPublishDisabled = !videoURI || !title.trim() || uploading;

  React.useEffect(() => {
    onPublishChange?.(handlePublish, isPublishDisabled);
  }, [videoURI, title, uploading]);

  return (
    <ScrollView className="flex-1 bg-gray-100 px-6 pt-6" showsVerticalScrollIndicator={false}>
      {videoURI ? (
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Preview</Text>
          <VideoView
            style={{ width: "100%", height: 250, backgroundColor: "black", borderRadius: 16 }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        </View>
      ) : (
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm items-center">
          <View className="w-24 h-24 bg-primary-25 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🎥</Text>
          </View>
          <Text className="text-gray-600 text-center mb-6">Select a video to get started</Text>
          <TouchableOpacity 
            className="bg-primary-150 px-8 py-4 rounded-2xl shadow-sm" 
            onPress={pickVideo}
          >
            <Text className="font-bold text-white text-center text-base">📹 Choose Video</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Video Details</Text>
        <TextInput 
          placeholder="Add Title" 
          className="border border-gray-200 rounded-2xl p-4 text-base bg-gray-50 mb-4"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={title}
          onChangeText={setTitle}
          multiline
          scrollEnabled={true}
        />

        <TextInput 
          placeholder="Add more info about the video.." 
          className="border border-gray-200 rounded-2xl p-4 text-base bg-gray-50"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={info}
          onChangeText={setInfo}
          multiline
          scrollEnabled={true}
        />
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <TagDropdown selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </View>

    </ScrollView>
  );
}



export const TagDropdown = ({ selectedTags, onTagsChange }: { selectedTags: string[], onTagsChange: (tags: string[]) => void }) => {
  const toggleTag = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagValue));
    } else {
      onTagsChange([...selectedTags, tagValue]);
    }
  };

  return (
    <View>
      <Text className="text-lg font-bold text-gray-800 mb-3">
        🏷️ Select Tags
      </Text>

      <View className="flex-row flex-wrap">
        {ALLOWED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.value);
          return (
            <TouchableOpacity
              key={tag.value}
              className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                isSelected ? 'bg-primary-150 border-primary-150' : 'bg-gray-100 border-gray-200'
              }`}
              onPress={() => toggleTag(tag.value)}
            >
              <Text className={`text-sm font-medium ${
                isSelected ? 'text-white' : 'text-gray-600'
              }`}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};






