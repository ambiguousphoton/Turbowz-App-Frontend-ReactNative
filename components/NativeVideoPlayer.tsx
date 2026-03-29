import React, { useRef, useState, useEffect } from 'react';
import { VideoView, useVideoPlayer } from 'expo-video';
import { View, TouchableOpacity, Text, Image, Clipboard } from 'react-native';

interface Props {
  videoSource: string;
  style?: any;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onTimestampCopy?: (timestamp: string) => void;
}

const NativeVideoPlayer = React.forwardRef<any, Props>(({ videoSource, style, onFullscreenChange, onTimestampCopy }, ref) => {
  const videoRef = useRef<VideoView>(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (player?.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player]);
  
  const handleCopyTimestamp = () => {
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;
    const timestampText = `@${Math.floor(currentTime)}s`;
    
    try {
      Clipboard.setString(timestampText);
      onTimestampCopy?.(timestamp);
    } catch (error) {
      console.error('Failed to copy timestamp');
    }
  };
  
  React.useImperativeHandle(ref, () => ({
    player
  }));
  
  return (
    <View style={{ position: 'relative' }}>
      <VideoView
        ref={videoRef}
        style={style}
        player={player}
        allowsFullscreen={true}
        allowsPictureInPicture={true}
        nativeControls={true}
      />
      <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <TouchableOpacity 
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
          onPress={handleCopyTimestamp}
        >
          <Image 
            source={require('../assets/images/TimeStampIcon.png')}
            style={{ width: 16, height: 16, marginRight: 4, tintColor: 'white' }}
            resizeMode="contain"
          />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            Copy Time
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default NativeVideoPlayer;