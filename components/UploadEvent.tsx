import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GetToken } from '@/HelperFuncs/localStorage';
import { ALLOWED_TAGS } from '@/HelperFuncs/constants';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const UploadEvent = ({ onAlert, onPublishChange }: { onAlert?: (message: string) => void, onPublishChange?: (fn: () => void, disabled: boolean) => void }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartTime, setEventStartTime] = useState(new Date());
  const [eventEndTime, setEventEndTime] = useState(new Date(Date.now() + 3600000));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDateMode, setStartDateMode] = useState<'date' | 'time'>('date');
  const [endDateMode, setEndDateMode] = useState<'date' | 'time'>('date');

  const pickImages = async () => {
    if (images.length >= 5) {
      onAlert?.('Maximum 5 images allowed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const remainingSlots = 5 - images.length;
      const selectedImages = result.assets.slice(0, remainingSlots);
      
      const convertedImages = await Promise.all(
        selectedImages.map(async (asset) => {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          return manipulatedImage.uri;
        })
      );
      setImages([...images, ...convertedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadEvent = async () => {
    if (!eventTitle.trim()) {
      onAlert?.('Please add event title');
      return;
    }

    if (!eventDescription.trim()) {
      onAlert?.('Please add event description');
      return;
    }

    setUploading(true);
    try {
      const token = await GetToken('jwt');
      
      if (!token) {
        onAlert?.('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('event_title', eventTitle);
      formData.append('event_description', eventDescription);
      formData.append('event_start_time', eventStartTime.toISOString());
      formData.append('event_end_time', eventEndTime.toISOString());
      formData.append('tags', JSON.stringify(selectedTags));
      
      images.forEach((uri, index) => {
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      const response = await fetch('http://10.0.2.2:8080/event-upload', {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (response.ok) {
        onAlert?.('Event created successfully!');
        setTimeout(() => router.back(), 1000);
      } else {
        onAlert?.('Upload failed');
      }
    } catch (error) {
      onAlert?.('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  const isPublishDisabled = !eventTitle.trim() || !eventDescription.trim() || uploading;

  React.useEffect(() => {
    onPublishChange?.(uploadEvent, isPublishDisabled);
  }, [eventTitle, eventDescription, uploading]);

  return (
    <ScrollView className="flex-1 px-6 pt-6 bg-gray-100" showsVerticalScrollIndicator={false}>
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">📅 Event Details</Text>
        
        <TextInput
          className="border border-gray-200 rounded-2xl p-4 mb-4 bg-gray-50"
          placeholder="Event Title"
          value={eventTitle}
          onChangeText={setEventTitle}
        />

        <TextInput
          className="border border-gray-200 rounded-2xl p-4 mb-4 min-h-[100px] bg-gray-50"
          placeholder="Event Description"
          value={eventDescription}
          onChangeText={setEventDescription}
          multiline
          textAlignVertical="top"
        />

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Start Time</Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
            onPress={() => {
              setStartDateMode('date');
              setShowStartPicker(true);
            }}
          >
            <Text className="text-gray-700">{eventStartTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={eventStartTime}
              mode={startDateMode}
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  setShowStartPicker(false);
                  if (date && startDateMode === 'date') {
                    setEventStartTime(date);
                    setStartDateMode('time');
                    setShowStartPicker(true);
                  } else if (date) {
                    setEventStartTime(date);
                  }
                } else {
                  if (date) setEventStartTime(date);
                }
              }}
              onTouchCancel={() => setShowStartPicker(false)}
            />
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">End Time</Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
            onPress={() => {
              setEndDateMode('date');
              setShowEndPicker(true);
            }}
          >
            <Text className="text-gray-700">{eventEndTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={eventEndTime}
              mode={endDateMode}
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  setShowEndPicker(false);
                  if (date && endDateMode === 'date') {
                    setEventEndTime(date);
                    setEndDateMode('time');
                    setShowEndPicker(true);
                  } else if (date) {
                    setEventEndTime(date);
                  }
                } else {
                  if (date) setEventEndTime(date);
                }
              }}
              onTouchCancel={() => setShowEndPicker(false)}
            />
          )}
        </View>
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">🖼️ Add Images (Max 5)</Text>
        
        {images.length === 0 ? (
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary-25 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">📷</Text>
            </View>
            <TouchableOpacity
              className="bg-primary-150 rounded-2xl px-8 py-4 shadow-sm"
              onPress={pickImages}
            >
              <Text className="text-white text-center font-bold">Select Images</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-gray-700">{images.length}/5 images</Text>
              {images.length < 5 && (
                <TouchableOpacity
                  className="bg-primary-150 rounded-xl px-4 py-2"
                  onPress={pickImages}
                >
                  <Text className="text-white font-medium">Add More</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <View key={index} className="mr-3 relative">
                  <Image source={{ uri }} className="w-24 h-24 rounded-2xl" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Text className="text-white font-bold text-xs">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <EventTagDropdown selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </View>
    </ScrollView>
  );
};

const EventTagDropdown = ({ selectedTags, onTagsChange }: { selectedTags: string[], onTagsChange: (tags: string[]) => void }) => {
  const toggleTag = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagValue));
    } else {
      onTagsChange([...selectedTags, tagValue]);
    }
  };

  return (
    <View>
      <Text className="text-lg font-bold text-gray-800 mb-3">🏷️ Select Tags</Text>
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

export default UploadEvent;
