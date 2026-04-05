import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GetUser, GetToken } from '@/HelperFuncs/localStorage';
import { ALLOWED_TAGS } from '@/HelperFuncs/constants';
import { router } from 'expo-router';
import { uploadEco } from '@/Services/api/uploadService';

const screenWidth = Dimensions.get('window').width;

const UploadEco = ({ onAlert, onPublishChange }: { onAlert?: (message: string) => void, onPublishChange?: (fn: () => void, disabled: boolean) => void }) => {
  const [ecoText, setEcoText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const converted = await Promise.all(
        result.assets.map(async (asset) => {
          const img = await ImageManipulator.manipulateAsync(
            asset.uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          return img.uri;
        })
      );
      setImages(prev => [...prev, ...converted]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!ecoText.trim()) { onAlert?.('Write a caption first'); return; }

    router.back();

    (async () => {
      try {
        const user = await GetUser();
        const token = await GetToken('jwt');
        if (!user?.UserProfileName || !token) { Alert.alert('Error', 'User data not found'); return; }

        const formData = new FormData();
        formData.append('eco_text', ecoText);
        formData.append('uploader_name', user.UserProfileName);
        formData.append('tags', JSON.stringify(selectedTags.length > 0 ? selectedTags : ['eco', 'nature', 'green']));
        images.forEach((uri, index) => {
          formData.append('images', { uri, type: 'image/jpeg', name: `image_${index}.jpg` } as any);
        });

        const response = await uploadEco(token, formData);
        if (response.ok) { Alert.alert('Success', 'Post shared!'); }
        else { Alert.alert('Failed', 'Upload failed'); }
      } catch { Alert.alert('Error', 'Network error'); }
    })();
  };

  const isPublishDisabled = !ecoText.trim() || uploading;

  React.useEffect(() => {
    onPublishChange?.(handleUpload, isPublishDisabled);
  }, [ecoText, uploading]);

  const toggleTag = (val: string) => {
    setSelectedTags(prev =>
      prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>

      {/* Caption input — IG style: text on left, small image thumbnail on right */}
      <View className="flex-row px-4 py-3 border-b border-gray-100">
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor="#999"
          className="flex-1 text-base text-gray-900 mr-3"
          style={{ textAlignVertical: 'top', minHeight: 100 }}
          value={ecoText}
          onChangeText={t => t.length <= 2200 && setEcoText(t)}
          multiline
        />
        {images.length > 0 && (
          <Image source={{ uri: images[0] }} className="w-16 h-16 rounded-md" />
        )}
      </View>

      {/* Image gallery */}
      {images.length > 0 ? (
        <View className="border-b border-gray-100">
          {/* Single image = full width, multiple = horizontal scroll */}
          {images.length === 1 ? (
            <View className="relative">
              <Image source={{ uri: images[0] }} style={{ width: screenWidth, height: screenWidth * 0.75 }} resizeMode="cover" />
              <TouchableOpacity
                className="absolute top-3 right-3 bg-black/60 rounded-full w-7 h-7 items-center justify-center"
                onPress={() => removeImage(0)}
              >
                <Text className="text-white text-sm font-bold">×</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute bottom-3 right-3 bg-black/60 rounded-full px-3 py-1.5"
                onPress={pickImages}
              >
                <Text className="text-white text-xs font-medium">+ Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={false} className="py-3 px-4">
              {images.map((uri, i) => (
                <View key={i} className="mr-2 relative">
                  <Image source={{ uri }} className="rounded-lg" style={{ width: screenWidth * 0.65, height: screenWidth * 0.65 }} resizeMode="cover" />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(i)}
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={pickImages}
                className="rounded-lg bg-gray-100 items-center justify-center"
                style={{ width: screenWidth * 0.3, height: screenWidth * 0.65 }}
              >
                <Text className="text-3xl text-gray-300">+</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImages}
          activeOpacity={0.7}
          className="border-b border-gray-100 items-center justify-center bg-gray-50"
          style={{ height: 200 }}
        >
          <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Image source={require('@/assets/images/EcoPostIcon.png')} className="w-10 h-10" style={{ tintColor: '#C7C7CC' }} />
          </View>
          <Text className="text-gray-400 text-sm">Add photos</Text>
        </TouchableOpacity>
      )}

      {/* Visibility row */}
      <TouchableOpacity className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-sm text-gray-900">Visibility</Text>
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
                    selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
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
};

export default UploadEco;
