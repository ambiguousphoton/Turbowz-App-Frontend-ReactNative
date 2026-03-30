import React, { useState, useCallback } from 'react';
import { View, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import TurboVideoCard from './TurboVideoCard';

const sampleVideo = require('../HBchoubay.mp4');

const feed = [
  { id: '1', source: sampleVideo, caption: 'First vibe 🔥', handle: '@choubay' },
  { id: '2', source: sampleVideo, caption: 'Second wave 🌊', handle: '@choubay' },
  { id: '3', source: sampleVideo, caption: 'Third drop 💧', handle: '@choubay' },
  { id: '4', source: sampleVideo, caption: 'First vibe 🔥', handle: '@choubay' },
  { id: '5', source: sampleVideo, caption: 'Second wave 🌊', handle: '@choubay' },
  { id: '6', source: sampleVideo, caption: 'Third drop 💧', handle: '@choubay' },
];

export default function GoTurboSection() {
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeId, setActiveId] = useState(feed[0].id);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!containerHeight) return;
    const index = Math.round(e.nativeEvent.contentOffset.y / containerHeight);
    const nextId = feed[index]?.id;
    if (nextId) setActiveId(nextId);
  }, [containerHeight]);

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
      {containerHeight > 0 && (
        <FlatList
          data={feed}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TurboVideoCard
              source={item.source}
              caption={item.caption}
              handle={item.handle}
              isActive={activeId === item.id}
              height={containerHeight}
            />
          )}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          getItemLayout={(_, i) => ({ length: containerHeight, offset: containerHeight * i, index: i })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
      )}
    </View>
  );
}
