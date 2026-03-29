import { Text, View } from 'react-native';
import React from 'react';

const getTagStyle = (tag: string): string => {
  const firstChar = tag.charAt(0).toLowerCase();
  const charCode = firstChar.charCodeAt(0);
  
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700',
    'bg-red-100 text-red-700',
    'bg-green-100 text-green-700',
    'bg-teal-100 text-teal-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-lime-100 text-lime-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
  ];
  
  const index = charCode % colors.length;
  return colors[index];
};

interface TagsDisplayProps {
  tags: string[];
}

export const TagsDisplay = ({ tags }: TagsDisplayProps) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <View className="flex-row flex-wrap">
      {tags.slice(0, 3).map((tag, index) => (
        <Text key={index} className={`text-xs rounded-full px-2 py-0.5 mr-1 mb-1 ${getTagStyle(tag)}`}>
          {tag}
        </Text>
      ))}
    </View>
  );
};
