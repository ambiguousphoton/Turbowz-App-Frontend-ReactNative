import React, { useState, useCallback } from "react";
import { View, Button, Text, Alert, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { GetToken } from "@/HelperFuncs/localStorage"; // adjust path to your helper
import { ALLOWED_TAGS } from "@/HelperFuncs/constants";
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer, VideoPlayer } from "expo-video";
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from "react-native-dropdown-picker";








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




export default function UploadVideo() {
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
      Alert.alert("Input Error", "The video needs a title and cannot be empty.");
      return;
    }

    if (!videoURI) {
      Alert.alert("Input Error", "Please select a video first.");
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

      if (response.ok) {
        Alert.alert("Success", "Video Uploaded!");
      } else {
        const errorText = await response.text();
        Alert.alert("Upload Failed", `Server responded with status ${response.status}: ${errorText.substring(0, 100)}...`);
      }
    } catch (err: any) {
      Alert.alert("Upload Failed", "An unexpected network or system error occurred.");
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const player = useVideoPlayer(videoURI, player => {
    player.loop = true;
  });

  return (
    <View className="flex-1 bg-white px-6">
      <View className="mb-6">
        <TextInput 
          placeholder="Add Title" 
          className="border border-select rounded-2xl p-4 text-base bg-white mb-4"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={title}
          onChangeText={setTitle}
          multiline
          scrollEnabled={true}
        />

        <TextInput 
          placeholder="Add more info about the video.." 
          className="border border-select rounded-2xl p-4 text-base bg-white"
          style={{ maxHeight: 80, textAlignVertical: 'top' }}
          value={info}
          onChangeText={setInfo}
          multiline
          scrollEnabled={true}
        />
      </View>

      <TagDropdown selectedTags={selectedTags} onTagsChange={setSelectedTags} />

      {videoURI ? (
        <View className="flex-1 mt-6">
          <Text className="text-lg font-semibold mb-4">Preview</Text>
          <VideoView
            style={{ width: "100%", height: 250, backgroundColor: "black", borderRadius: 16 }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        </View>
      ) : (
        <View className="items-center mt-6">
          <TouchableOpacity 
            className="bg-select px-8 py-4 rounded-2xl" 
            onPress={pickVideo}
          >
            <Text className="font-semibold text-center text-base">Choose Video</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        className={`mt-6 px-6 py-4 rounded-2xl ${uploading ? 'bg-gray-400' : 'bg-primary-150'}`}
        onPress={handlePublish}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">Publish Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}



export const TagDropdown = ({ selectedTags, onTagsChange }: { selectedTags: string[], onTagsChange: (tags: string[]) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="py-4">
      <Text className="text-base font-semibold mb-3">
        Select Tags
      </Text>

      <DropDownPicker
        multiple={true}
        open={open}
        value={selectedTags}
        items={ALLOWED_TAGS}
        setOpen={setOpen}
        setValue={onTagsChange}
        setItems={() => {}}
        placeholder="Choose tags..."
        style={{
          backgroundColor: "#fff",
          borderColor: "#EEEEEE",
          borderRadius: 16,
        }}
        dropDownContainerStyle={{
          backgroundColor: "#fff",
          borderColor: "#EEEEEE",
          borderRadius: 16,
        }}
        listItemLabelStyle={{
          color: "#000",
        }}
        selectedItemLabelStyle={{
          fontWeight: "600",
          color: "#69E2FF",
        }}
        labelStyle={{
          color: "#666",
        }}
        arrowIconStyle={{
          tintColor: "#69E2FF",
        }}
        tickIconStyle={{
          tintColor: "#69E2FF",
        }}
      />

      {selectedTags.length > 0 && (
        <View className="flex-row flex-wrap mt-4">
          {selectedTags.map((tag) => (
            <View
              key={tag}
              className="bg-primary-25 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-primary-150 text-sm font-medium">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};






