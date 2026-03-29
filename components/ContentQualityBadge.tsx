import React from 'react';
import { View, Text, Image } from 'react-native';

interface ContentQualityBadgeProps {
  quality: number;
  aiUsage: number;
}

export default function ContentQualityBadge({ quality, aiUsage }: ContentQualityBadgeProps) {
  if (quality === 0 && aiUsage === 0) return null;

  const avgScore = (quality + aiUsage) / 2;
  let label, bgColor, textColor;

  if (avgScore >= 4.5) {
    label = 'wow';
    bgColor = 'bg-purple-200';
    textColor = 'text-purple-900';
  } else if (avgScore >= 3.5) {
    label = 'lit';
    bgColor = 'bg-cyan-200';
    textColor = 'text-cyan-900';
  } else if (avgScore >= 2.5) {
    label = 'chill';
    bgColor = 'bg-lime-200';
    textColor = 'text-lime-900';
  } else if (avgScore >= 1.5) {
    label = 'meh';
    bgColor = 'bg-amber-200';
    textColor = 'text-amber-900';
  } else {
    label = 'slop';
    bgColor = 'bg-rose-200';
    textColor = 'text-rose-900';
  }

  return (
    <>
      <View className='bg-yellow-200 rounded-l-lg px-2 py-0.5 flex-row items-center'>
        <Image source={require('../assets/images/VoteIcon.png')} className="w-3 h-3" resizeMode="contain" />
      </View>
      <Text className={`${bgColor} ${textColor} px-2 rounded-r-lg font-semibold text-sm`}>{label}</Text>
    </>
  );
}
