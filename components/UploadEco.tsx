import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GetUser, GetToken } from '@/HelperFuncs/localStorage';
import { ALLOWED_TAGS } from '@/HelperFuncs/constants';
import { router } from 'expo-router';

const UploadEco = ({ onAlert, onPublishChange }: { onAlert?: (message: string) => void, onPublishChange?: (fn: () => void, disabled: boolean) => void }) => {
  const [ecoText, setEcoText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const convertedImages = await Promise.all(
        result.assets.map(async (asset) => {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          return manipulatedImage.uri;
        })
      );
      setImages(convertedImages);
    }
  };

  const uploadEco = async () => {
    if (!ecoText.trim()) {
      onAlert?.('Please add some text');
      return;
    }

    setUploading(true);
    try {
      const user = await GetUser();
      const token = await GetToken('jwt');
      
      if (!user?.UserProfileName || !token) {
        onAlert?.('User data not found');
        return;
      }

      const formData = new FormData();
      formData.append('eco_text', ecoText);
      formData.append('uploader_name', user.UserProfileName);
      formData.append('tags', JSON.stringify(selectedTags.length > 0 ? selectedTags : ['eco', 'nature', 'green']));
      
      if (images.length > 0) {
        images.forEach((uri, index) => {
          formData.append('images', {
            uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          } as any);
        });
      }

      const response = await fetch('http://10.0.2.2:8080/eco-upload', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        onAlert?.('Eco post uploaded successfully!');
        setEcoText('');
        setSelectedTags([]);
        setImages([]);
        router.back();
      } else {
        onAlert?.('Upload failed');
      }
    } catch (error) {
      onAlert?.('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  const isPublishDisabled = !ecoText.trim() || uploading;

  React.useEffect(() => {
    onPublishChange?.(uploadEco, isPublishDisabled);
  }, [ecoText, uploading]);

  return (
    <ScrollView className="flex-1 px-6 pt-6 bg-gray-100" showsVerticalScrollIndicator={false}>
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">🖼️ Add Images</Text>
        
        {images.length === 0 ? (
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary-25 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">📷</Text>
            </View>
            <Text className="text-gray-600 text-center mb-6">Add photos to make your eco post more engaging</Text>
            <TouchableOpacity
              className="bg-primary-150 rounded-2xl px-8 py-4 shadow-sm"
              onPress={pickImages}
            >
              <Text className="text-white text-center font-bold">🖼️ Select Images</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-gray-700">{images.length} image(s) selected</Text>
              <TouchableOpacity
                className="bg-gray-100 rounded-xl px-4 py-2"
                onPress={pickImages}
              >
                <Text className="text-gray-600 font-medium">Change</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="w-24 h-24 rounded-2xl mr-3"
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">🌱 Share Your Eco Story</Text>
        
        <TextInput
          className="border border-gray-200 rounded-2xl p-4 mb-4 min-h-[120px] bg-gray-50"
          placeholder="What's your eco story? Share your thoughts on sustainability..."
          value={ecoText}
          onChangeText={setEcoText}
          multiline
          textAlignVertical="top"
        />

        <EcoTagDropdown selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </View>
    </ScrollView>
  );
};

const EcoTagDropdown = ({ selectedTags, onTagsChange }: { selectedTags: string[], onTagsChange: (tags: string[]) => void }) => {
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

export default UploadEco;