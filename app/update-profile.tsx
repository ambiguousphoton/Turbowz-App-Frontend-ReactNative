import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GetToken, GetUser, SaveUser } from '@/HelperFuncs/localStorage';

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
      
      const response = await fetch(`http://10.0.2.2:8100/get-user?userID=${user.UserID}`);
      const userData = await response.json();
      
      setFormData({
        name: userData.UserHandle || '',
        profile_name: userData.UserProfileName || '',
        email: '',
        bio: userData.UserDescription || '',
        location: userData.FromLocation || '',
        website: ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const handleSave = async () => {
    const token = await GetToken('jwt');
    if (!token) {
      Alert.alert("Error", "Authentication required.");
      return;
    }

    const formBody = new URLSearchParams();
    formBody.append('user_handle', formData.name);
    formBody.append('user_profile_name', formData.profile_name);
    formBody.append('userDescription', formData.bio);
    formBody.append('fromLocation', formData.location);
    formBody.append('gender', '');

    try {
      const response = await fetch("http://10.0.2.2:8100/update-profile", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      if (response.ok) {
        const currentUser = await GetUser();
        console.log('currentUser:', currentUser);
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-blue-500 text-base font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="items-center py-6">
          <View className="w-24 h-24 bg-gray-300 rounded-full mb-3" />
          <TouchableOpacity>
            <Text className="text-blue-500 font-medium">Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2">Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Enter your name"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Username</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.profile_name}
              onChangeText={(text) => setFormData({...formData, profile_name: text})}
              placeholder="Enter username"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter email"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Bio</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Location</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="Enter your location"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Website</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
              placeholder="Enter your website"
              keyboardType="url"
            />
          </View>
        </View>

        <View className="py-6">
          <TouchableOpacity 
            className="bg-primary-200 rounded-lg py-3 items-center"
            onPress={handleSave}
          >
            <Text className="text-white font-semibold">Update Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}