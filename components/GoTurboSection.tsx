import React from 'react';
import { View, Text } from 'react-native';

const GoTurboSection: React.FC = () => {
  return (
    <View className="flex-1 bg-gradient-to-b from-primary-50 to-white">
      <View className="px-4 py-3 bg-primary-200/10">
        <Text className="text-xl font-bold text-primary-200">⚡ Go Turbo</Text>
        <Text className="text-sm text-primary-150 mt-1">Supercharged content mix</Text>
      </View>
    </View>
  );
};

export default GoTurboSection;