import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer, type VideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

type TurboVideoCardProps = {
  source: any;
  caption: string;
  handle: string;
  isActive: boolean;
  height: number;
};

export default function TurboVideoCard({ source, caption, handle, isActive, height }: TurboVideoCardProps) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.timeUpdateEventInterval = 0.25; });

  useEffect(() => {
    if (!isActive) { player.pause(); setPaused(false); setProgress(0); return; }
    paused ? player.pause() : player.play();
  }, [isActive, paused]);

  useEffect(() => {
    const sub = player.addListener('timeUpdate', ({ currentTime, currentLiveTimestamp, currentOffsetFromLive, bufferedPosition }: { currentTime: number; currentLiveTimestamp: number; currentOffsetFromLive: number; bufferedPosition: number }) => {
      if (player.duration > 0) setProgress(currentTime / player.duration);
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View style={{ height, backgroundColor: 'black' }}>
      <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} />

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Pressable onPress={() => setPaused((p) => !p)} style={styles.content}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={[StyleSheet.absoluteFillObject, styles.gradient]}
        />

        {paused && (
          <Image source={require('../assets/images/PlayIcon.png')} style={styles.playIcon} resizeMode="contain" />
        )}

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text className="text-white font-bold text-base mb-1">{handle}</Text>
            <Text className="text-white text-sm">{caption}</Text>
          </View>
          <View style={styles.actions}>
            <Image source={require('../assets/images/ToLuvIcon.png')} style={styles.icon} resizeMode="contain" />
            <Image source={require('../assets/images/ShareIcon.png')} style={styles.icon} resizeMode="contain" />
            <Image source={require('../assets/images/SaveIcon.png')} style={styles.icon} resizeMode="contain" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  progressFill: { height: '100%', backgroundColor: '#fff' },
  content: { flex: 1, padding: 10, justifyContent: 'flex-end' },
  gradient: { top: '50%' },
  playIcon: { width: 60, height: 60, tintColor: 'rgba(255,255,255,0.6)', position: 'absolute', alignSelf: 'center', top: '45%' },
  footer: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 40 },
  actions: { gap: 16, alignItems: 'center' },
  icon: { width: 30, height: 30, tintColor: 'white' },
});
