import React, { useState, useCallback } from "react";
import { View, Text, Alert, TouchableOpacity, TextInput, ScrollView, Image } from "react-native";
import { GetToken } from "@/HelperFuncs/localStorage";
import { ALLOWED_TAGS } from "@/HelperFuncs/constants";
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from "expo-video";
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { uploadVideo, pollVideoStatus } from '@/Services/api/uploadService';

let Video: any = null;
try { Video = require('react-native-compressor').Video; } catch {};

async function compressVideo(uri: string): Promise<string> {
  if (!Video) return uri;
  try { return await Video.compress(uri, { compressionMethod: 'auto' }); }
  catch { return uri; }
}

export default function UploadVideo({ onAlert, onPublishChange }: {
  onAlert?: (message: string) => void,
  onPublishChange?: (fn: () => void, disabled: boolean) => void
}) {
  const [videoURI, setVideoURI] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);

  useFocusEffect(useCallback(() => {
    return () => { setVideoURI(null); };
  }, []));

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { alert("Permission to access media library is required!"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false, quality: 1,
    });
    if (!result.canceled) setVideoURI(result.assets[0].uri);
  };

  const handlePublish = async () => {
    if (uploading) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { onAlert?.("Add a title to your video."); return; }
    if (!videoURI) { onAlert?.("Select a video first."); return; }

    router.back();

    compressVideo(videoURI).then(async (finalURI) => {
      const formData = new FormData();
      formData.append("video", { uri: finalURI, type: 'video/mp4', name: 'video.mp4' } as any);
      formData.append("title", trimmedTitle);
      formData.append("info", info);
      formData.append("tags", JSON.stringify(selectedTags));
      const token = await GetToken('jwt');
      if (!token) { Alert.alert("Error", "Authentication required."); return; }
      const response = await uploadVideo(token, formData);
      const data = await response.json();
      if (response.ok) {
        if (data.status === "processing") {
          Alert.alert("Uploaded", "Your video is being processed...");
          pollVideoStatus(data.video_id, () => Alert.alert("Ready", "Your video is now live!"));
        } else { Alert.alert("Success", "Video Uploaded!"); }
      } else { Alert.alert("Upload Failed", `Server responded with status ${response.status}`); }
    }).catch((err) => {
      Alert.alert("Upload Failed", "An unexpected error occurred.");
      console.log(err);
    });
  };

  const player = useVideoPlayer(videoURI, p => { p.loop = true; });
  const isPublishDisabled = !videoURI || !title.trim() || uploading;

  React.useEffect(() => {
    onPublishChange?.(handlePublish, isPublishDisabled);
  }, [videoURI, title, uploading]);

  const toggleTag = (val: string) => {
    setSelectedTags(prev =>
      prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>

      {/* Video preview */}
      {videoURI ? (
        <View className="pb-2 border-b border-gray-100">
          <View className="overflow-hidden bg-black" style={{ height: 260 }}>
            <VideoView
              style={{ width: '100%', height: '100%' }}
              player={player}
              nativeControls
              allowsFullscreen
            />
          </View>
          <TouchableOpacity onPress={pickVideo} activeOpacity={0.7} className="mt-2 items-center">
            <Text className="text-xs text-blue-600 font-medium">Change video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickVideo}
          activeOpacity={0.7}
          className="mb-2 bg-gray-100 items-center justify-center border-b border-gray-200"
          style={{ height: 240 }}
        >
          <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Image source={require('@/assets/images/VideosIcon.png')} className="w-10 h-10" style={{ tintColor: '#6B7280' }} />
          </View>
          <Text className="text-gray-500 text-sm font-medium">Select video</Text>
        </TouchableOpacity>
      )}

      {/* Title */}
      <View className="px-4 py-4 border-b border-gray-100">
        <TextInput
          placeholder="Add a title (required)"
          placeholderTextColor="#9CA3AF"
          className="text-base text-gray-900"
          style={{ textAlignVertical: 'top', minHeight: 44 }}
          value={title}
          onChangeText={t => t.length <= 100 && setTitle(t)}
          multiline
          scrollEnabled
        />
        <Text className="text-xs text-gray-400 self-end mt-1">{title.length}/100</Text>
      </View>

      {/* Description row */}
      <View className="px-4 py-4 border-b border-gray-100">
        <TextInput
          placeholder="Add a description"
          placeholderTextColor="#9CA3AF"
          className="text-sm text-gray-900"
          style={{ textAlignVertical: 'top', minHeight: 60, maxHeight: 120 }}
          value={info}
          onChangeText={t => t.length <= 500 && setInfo(t)}
          multiline
          scrollEnabled
        />
        {info.length > 0 && (
          <Text className="text-xs text-gray-400 self-end mt-1">{info.length}/500</Text>
        )}
      </View>

      {/* Visibility row (static, like YouTube) */}
      <TouchableOpacity className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-900">Visibility</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 mr-1">Public</Text>
          <Text className="text-gray-400 text-xs">›</Text>
        </View>
      </TouchableOpacity>

      {/* Tags row */}
      <TouchableOpacity
        className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between"
        onPress={() => setShowTags(!showTags)}
        activeOpacity={0.6}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-sm text-gray-900">Tags</Text>
          {selectedTags.length > 0 && (
            <Text className="text-xs text-gray-400 ml-2">{selectedTags.length} selected</Text>
          )}
        </View>
        <Text className="text-gray-400 text-base">{showTags ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>

      {/* Tags expanded */}
      {showTags && (
        <View className="px-4 pt-3 pb-4 border-b border-gray-100 bg-gray-50">
          <View className="flex-row flex-wrap">
            {ALLOWED_TAGS.map(tag => {
              const selected = selectedTags.includes(tag.value);
              return (
                <TouchableOpacity
                  key={tag.value}
                  onPress={() => toggleTag(tag.value)}
                  activeOpacity={0.7}
                  className={`mr-2 mb-2 px-3.5 py-1.5 rounded-full border ${
                    selected
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}

export const TagDropdown = ({ selectedTags, onTagsChange }: { selectedTags: string[], onTagsChange: (tags: string[]) => void }) => {
  const toggleTag = (tagValue: string) => {
    onTagsChange(
      selectedTags.includes(tagValue)
        ? selectedTags.filter(t => t !== tagValue)
        : [...selectedTags, tagValue]
    );
  };

  return (
    <View>
      <Text className="text-base font-bold text-gray-800 mb-3">🏷️ Tags</Text>
      <View className="flex-row flex-wrap">
        {ALLOWED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.value);
          return (
            <TouchableOpacity
              key={tag.value}
              className={`px-4 py-2 rounded-full mr-2 mb-2.5 border ${
                isSelected ? 'bg-primary-150 border-primary-150' : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => toggleTag(tag.value)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
