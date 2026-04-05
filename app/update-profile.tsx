import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GetToken, GetUser, SaveUser } from '@/HelperFuncs/localStorage';
import * as ImagePicker from 'expo-image-picker';
import { getUser, updateProfile } from '@/Services/api/userService';
import { pfpUrl } from '@/Services/api/imageService';
import { uploadProfilePicture } from '@/Services/api/uploadService';

export default function UpdateProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    profile_name: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  const [userID, setUserID] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await GetUser();
      if (!user?.UserID) {
        Alert.alert('Error', 'User not found');
        return;
      }
      
      setUserID(user.UserID);
      const userData = await getUser(user.UserID);
      
      setFormData({
        name: userData.UserHandle || '',
        profile_name: userData.UserProfileName || '',
        email: '',
        bio: userData.UserDescription || '',
        location: userData.FromLocation || '',
        website: ''
      });
      setProfileImage(pfpUrl(user.UserID));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const token = await GetToken('jwt');
    if (!token) {
      Alert.alert('Error', 'Authentication required.');
      return;
    }

    const formData = new FormData();
    formData.append('images', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    try {
      const response = await uploadProfilePicture(token, formData);

      if (response.ok) {
        setProfileImage(`${uri}?t=${Date.now()}`);
        Alert.alert('Success', 'Profile photo updated!');
      } else {
        Alert.alert('Error', 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const handleSave = async () => {
    const token = await GetToken('jwt');
    if (!token) {
      Alert.alert("Error", "Authentication required.");
      return;
    }

    try {
      const response = await updateProfile(token, {
        user_handle: formData.name,
        user_profile_name: formData.profile_name,
        userDescription: formData.bio,
        fromLocation: formData.location,
        gender: '',
      });

      if (response.ok) {
        const currentUser = await GetUser();
        // Current user data
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            UserHandle: formData.name,
            UserProfileName: formData.profile_name,
            UserDescription: formData.bio,
            FromLocation: formData.location
          };
          await SaveUser(updatedUser);
        }
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base font-medium">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-primary text-base font-bold">Save</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/90 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          {profileImage && (
            <Image 
              source={{ uri: profileImage }}
              className="w-full h-96"
              resizeMode="contain"
            />
          )}
          <TouchableOpacity 
            className="absolute top-12 right-6 bg-white/20 rounded-full p-2"
            onPress={() => setShowImageModal(false)}
          >
            <Text className="text-white text-2xl font-bold">×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white items-center py-8 mb-6">
          <TouchableOpacity onPress={() => profileImage && setShowImageModal(true)}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-28 h-28 rounded-full mb-4" />
            ) : (
              <View className="w-28 h-28 bg-gray-200 rounded-full mb-4" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Text className="text-primary font-semibold text-base">Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white px-6 py-6 mb-6">
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-2 text-base">Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-2 text-base">Username</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.profile_name}
              onChangeText={(text) => setFormData({...formData, profile_name: text})}
              placeholder="Enter username"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-2 text-base">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
            />
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-900 font-semibold text-base">Bio</Text>
              <Text className="text-gray-400 text-sm">{formData.bio.length}/150</Text>
            </View>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.bio}
              onChangeText={(text) => {
                if (text.length <= 150) {
                  setFormData({...formData, bio: text})
                }
              }}
              placeholder="Tell us about yourself"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={150}
              style={{ minHeight: 100 }}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-2 text-base">Location</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="Enter your location"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-gray-900 font-semibold mb-2 text-base">Website</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
              placeholder="Enter your website"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
            />
          </View>
        </View>

        <View className="px-6 pb-8">
          <TouchableOpacity 
            className="bg-black rounded-xl py-4 items-center shadow-sm"
            onPress={handleSave}
          >
            <Text className="text-white font-bold text-base">Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}