import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions, Image, TouchableWithoutFeedback, PanResponder, Modal, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';

interface Props {
  videoSource: string;
  style?: any;
  hideProgressBar?: boolean;
}

const VideoPlayer = React.forwardRef<any, Props>(({ videoSource, style, hideProgressBar }, ref) => {
  const [showControls, setShowControls] = useState(true);
  const [showCenterButton, setShowCenterButton] = useState(true);
  const [showSkipBack, setShowSkipBack] = useState(false);
  const [showSkipForward, setShowSkipForward] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lastTapLeft = useRef(0);
  const lastTapRight = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [progressBarFocused, setProgressBarFocused] = useState(false);
  const videoRef = useRef<VideoView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const hideButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isFullscreen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      });
      
      const isVideoHorizontal = videoWidth > videoHeight;
      if (isVideoHorizontal) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      ScreenOrientation.unlockAsync();
    }
  }, [isFullscreen, videoWidth, videoHeight]);
  
  const progressBarRef = useRef<View>(null);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      setProgressBarFocused(true);
      progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const touchX = evt.nativeEvent.pageX - pageX;
        const newProgress = Math.max(0, Math.min(100, (touchX / width) * 100));
        setProgress(newProgress);
        if (player.duration) {
          player.currentTime = (newProgress / 100) * player.duration;
        }
      });
      evt.preventDefault?.();
    },
    onPanResponderMove: (evt) => {
      evt.preventDefault?.();
      progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const touchX = evt.nativeEvent.pageX - pageX;
        const newProgress = Math.max(0, Math.min(100, (touchX / width) * 100));
        setProgress(newProgress);
        if (player.duration) {
          player.currentTime = (newProgress / 100) * player.duration;
        }
      });
    },
    onPanResponderRelease: (evt) => {
      setIsDragging(false);
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      focusTimeoutRef.current = setTimeout(() => {
        setProgressBarFocused(false);
      }, 3000);
      evt.preventDefault?.();
    },
  });

  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });
  
  useEffect(() => {
    if (player) {
      const checkVideoDimensions = () => {
        // Simulated video dimensions - in real app, get from player metadata
        setVideoWidth(1920);
        setVideoHeight(1080);
      };
      checkVideoDimensions();
    }
  }, [player]);
  
  React.useImperativeHandle(ref, () => ({
    player
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      if (player?.currentTime !== undefined && player?.duration && !isDragging) {
        const currentProgress = (player.currentTime / player.duration) * 100;
        setProgress(currentProgress);
        setCurrentTime(player.currentTime);
        setDuration(player.duration);
        if (currentProgress >= 100) {
          setIsPlaying(false);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player, isDragging, isFullscreen]);

  useEffect(() => {
    handleVideoTouch();
  }, []);

  useEffect(() => {
    return () => {
      if (hideButtonTimeoutRef.current) {
        clearTimeout(hideButtonTimeoutRef.current);
      }
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      try {
        player?.pause();
        player?.release();
      } catch (error) {
        console.log('Player cleanup error:', error);
      }
    };
  }, [player]);

  const handleVideoTouch = () => {
    setShowCenterButton(true);
    setShowControls(true);
    
    if (hideButtonTimeoutRef.current) {
      clearTimeout(hideButtonTimeoutRef.current);
    }
    
    hideButtonTimeoutRef.current = setTimeout(() => {
      setShowCenterButton(false);
      setShowControls(false);
    }, 2000);
  };

  const renderControls = () => (
    <>
      <TouchableWithoutFeedback onPress={(event) => {
        const { locationX } = event.nativeEvent;
        const screenWidth = 300;
        const leftZone = screenWidth * 0.3;
        const rightZone = screenWidth * 0.7;
        
        if (locationX < leftZone) {
          const now = Date.now();
          if (now - lastTapLeft.current < 300) {
            const newTime = Math.max(0, player.currentTime - 15);
            player.currentTime = newTime;
            setShowSkipBack(true);
            setTimeout(() => setShowSkipBack(false), 800);
          }
          lastTapLeft.current = now;
        } else if (locationX > rightZone) {
          const now = Date.now();
          if (now - lastTapRight.current < 300) {
            const newTime = Math.min(duration, player.currentTime + 15);
            player.currentTime = newTime;
            setShowSkipForward(true);
            setTimeout(() => setShowSkipForward(false), 800);
          }
          lastTapRight.current = now;
        }
        
        handleVideoTouch();
      }}>
        <View style={{ position: 'absolute', top: 0, left: 20, right: 0, bottom: 0 }} />
      </TouchableWithoutFeedback>
      
      {showSkipBack && (
        <View style={{ position: 'absolute', top: '50%', left: '15%', transform: [{ translateY: -25 }], backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>-15s</Text>
        </View>
      )}
      
      {showSkipForward && (
        <View style={{ position: 'absolute', top: '50%', right: '15%', transform: [{ translateY: -25 }], backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>+15s</Text>
        </View>
      )}
      
      {showCenterButton && (
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: [{ translateX: -25 }, { translateY: -25 }],
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 25
          }}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              if (progress >= 100) {
                setProgress(0);
                player.currentTime = 0;
              }
              player.play();
            }
            setIsPlaying(!isPlaying);
            handleVideoTouch();
          }}
        >
          <Image 
            source={isPlaying ? require("../assets/images/PauseIcon.png") : require("../assets/images/PlayIcon.png")}
            className={isFullscreen ? "w-6 h-6" : "w-5 h-5"}
            resizeMode="contain"
            style={{ tintColor: 'white' }}
          />
        </TouchableOpacity>
      )}
      
      {showControls && (
        <View 
          ref={progressBarRef}
          {...panResponder.panHandlers}
          style={{ 
            position: 'absolute', 
            bottom: showControls ? (isFullscreen ? 80 : 5) : 0, 
            left: 0, 
            right: 0, 
            height: 50, 
            justifyContent: 'center', 
            zIndex: 500,
            paddingHorizontal: 10
          }}
        >
          <TouchableWithoutFeedback
            onPress={(event) => {
              if (!isDragging) {
                setProgressBarFocused(true);
                
                if (focusTimeoutRef.current) {
                  clearTimeout(focusTimeoutRef.current);
                }
                
                focusTimeoutRef.current = setTimeout(() => {
                  setProgressBarFocused(false);
                }, 3000);
                
                progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  const touchX = event.nativeEvent.pageX - pageX;
                  const newProgress = Math.max(0, Math.min(100, (touchX / width) * 100));
                  setProgress(newProgress);
                  if (player.duration) {
                    player.currentTime = (newProgress / 100) * player.duration;
                  }
                });
              }
            }}
          >
            <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {(progressBarFocused || isDragging) && (
                <View style={{ position: 'absolute', top: -30, left: `${progress}%`, marginLeft: -25, backgroundColor:'#05BAFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ color: 'white', fontSize: 12 , fontWeight:'bold'}}>
                    {Math.floor((progress / 100) * duration / 60)}:{(Math.floor((progress / 100) * duration % 60)).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
              <View style={{ height: 4, backgroundColor: 'white', width: '100%', borderRadius: 2, position: 'relative' }}>
                <View style={{ height: 4, backgroundColor: '#05BAFF', width: `${progress}%`, borderRadius: 2 }} />
                {progressBarFocused && (
                  <View 
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: '#05BAFF',
                      borderRadius: 8,
                      position: 'absolute',
                      top: -6,
                      left: `${progress}%`,
                      marginLeft: -8
                    }}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
      
      {showControls && (
        <View style={{ position: 'absolute', bottom: isFullscreen ? 20 : 45, left: 0, right: 0, padding: 10, zIndex: 1000 }}>
          <View className="flex-row items-center">
            <Text className={`text-white ${isFullscreen ? "text-base" : "text-sm"}`}>
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}/{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
            </Text>
            
            <View className="flex-1" />
            
            <TouchableOpacity onPress={() => {
              setIsMuted(!isMuted);
              player.muted = !isMuted;
            }} style={{ marginRight: 15 }}>
              <Image 
                source={isMuted ? require("../assets/images/NoSoundIcon.png") : require("../assets/images/SoundIcon.png")}
                className={isFullscreen ? "w-6 h-6" : "w-5 h-5"}
                resizeMode="contain"
                style={{ tintColor: 'white' }}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={async () => {
              if (isFullscreen) {
                await ScreenOrientation.unlockAsync();
              }
              setIsFullscreen(!isFullscreen);
            }}>
              <Image 
                source={isFullscreen ? require("../assets/images/FullScreenExitIcon.png") : require("../assets/images/FullScreenIcon.png")}
                className={isFullscreen ? "w-6 h-6" : "w-5 h-5"}
                resizeMode="contain"
                style={{ tintColor: 'white' }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  const { width, height } = Dimensions.get('window');
  const isDeviceLandscape = width > height;
  const isVideoHorizontal = videoWidth > videoHeight;
  const shouldRotate = isFullscreen && isVideoHorizontal && !isDeviceLandscape;
  
  return (
    <Animated.View style={[
      isFullscreen ? { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width, 
        height, 
        backgroundColor: 'black',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center'
      } : { position: 'relative' },
      {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim
      }
    ]}>
      <VideoView
        ref={videoRef}
        style={[
          isFullscreen ? { width, height } : style,
          shouldRotate && { transform: [{ rotate: '90deg' }] }
        ]}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture
        nativeControls={false}
      />
      {renderControls()}
    </Animated.View>
  );
});

export default VideoPlayer;