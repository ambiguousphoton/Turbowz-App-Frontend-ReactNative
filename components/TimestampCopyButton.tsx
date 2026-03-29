import React from 'react';
import { TouchableOpacity, Text, Alert, View, Image } from 'react-native';
import { Clipboard } from 'react-native';

interface TimestampCopyButtonProps {
  getCurrentTime: () => number;
  videoTitle?: string;
}

export const TimestampCopyButton: React.FC<TimestampCopyButtonProps> = ({ 
  getCurrentTime, 
  videoTitle 
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTimestamp = async () => {
    const currentTime = getCurrentTime();
    const timestamp = formatTime(currentTime);
    const timestampText = `@${Math.floor(currentTime)}s`;
    
    try {
      Clipboard.setString(timestampText);
      Alert.alert('Copied!', `Timestamp ${timestamp} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy timestamp');
    }
  };

  return (
    <View className="absolute top-4 right-4 z-10">
      <TouchableOpacity 
        className="bg-black/70 px-3 py-2 rounded-lg flex-row items-center"
        onPress={handleCopyTimestamp}
      >
        <Image 
          source={require('../assets/images/TimeStampIcon.png')}
          className="w-4 h-4 mr-1"
          resizeMode="contain"
          style={{ tintColor: 'white' }}
        />
        <Text className="text-white text-sm font-medium">
          Copy Time
        </Text>
      </TouchableOpacity>
    </View>
  );
};