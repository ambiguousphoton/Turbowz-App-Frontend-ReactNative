import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GetUser, GetToken } from '@/HelperFuncs/localStorage';

const UploadEco = () => {
  const [ecoText, setEcoText] = useState('');
  const [tags, setTags] = useState('');
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
      Alert.alert('Error', 'Please add some text');
      return;
    }

    setUploading(true);
    try {
      const user = await GetUser();
      const token = await GetToken('jwt');
      
      if (!user?.UserProfileName || !token) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const formData = new FormData();
      formData.append('eco_text', ecoText);
      formData.append('uploader_name', user.UserProfileName);
      formData.append('tags', tags || '["eco","nature","green"]');
      
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
        Alert.alert('Success', 'Eco post uploaded successfully!');
        setEcoText('');
        setTags('');
        setImages([]);
      } else {
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 px-6 bg-white">
      <Text className="text-lg font-semibold mb-6">Share Eco</Text>
      
      <TextInput
        className="border border-select rounded-2xl p-4 mb-4 min-h-[100px] bg-white"
        placeholder="Enter eco text..."
        value={ecoText}
        onChangeText={setEcoText}
        multiline
        textAlignVertical="top"
      />

      <TextInput
        className="border border-select rounded-2xl p-4 mb-6 bg-white"
        placeholder='Tags (e.g., ["eco","nature","green"])'
        value={tags}
        onChangeText={setTags}
      />

      <TouchableOpacity
        className="bg-select rounded-2xl p-4 mb-6"
        onPress={pickImages}
      >
        <Text className="text-center font-semibold">Select Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View className="mb-6">
          <Text className="font-semibold mb-3">{images.length} image(s) selected</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                className="w-20 h-20 rounded-2xl mr-3"
              />
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        className={`rounded-2xl p-4 ${uploading ? 'bg-gray-400' : 'bg-primary-150'}`}
        onPress={uploadEco}
        disabled={uploading}
      >
        <Text className="text-white text-center font-semibold">
          {uploading ? 'Uploading...' : 'Share Eco'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UploadEco;