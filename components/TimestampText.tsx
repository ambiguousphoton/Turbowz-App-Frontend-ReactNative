import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface TimestampTextProps {
  text: string;
  onTimestampPress?: (seconds: number) => void;
}

export const TimestampText: React.FC<TimestampTextProps> = ({ text, onTimestampPress }) => {
  const timestampRegex = /@(\d+)s/g;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTextWithTimestamps = () => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Text key={lastIndex} className="text-gray-700">
            {text.substring(lastIndex, match.index)}
          </Text>
        );
      }

      const seconds = parseInt(match[1]);
      parts.push(
        <TouchableOpacity
          key={match.index}
          onPress={() => onTimestampPress?.(seconds)}
        >
          <Text className="text-blue-600 font-medium">
            {formatTime(seconds)}
          </Text>
        </TouchableOpacity>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Text key={lastIndex} className="text-gray-700">
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return parts;
  };

  return <Text>{renderTextWithTimestamps()}</Text>;
};