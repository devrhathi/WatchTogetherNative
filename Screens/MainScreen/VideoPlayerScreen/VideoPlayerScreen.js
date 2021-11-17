import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {socket} from '../../../SocketContext';
import {styles} from './VideoPlayerStyles';

//Player Controls
import PlayIcon from 'react-native-vector-icons/Entypo';
import PauseIcon from 'react-native-vector-icons/FontAwesome';

export default function VideoPlayerScreen({currRoomID}) {
  const youtubePlayerRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const sliderRef = useRef();
  const [videoDuration, setVideoDuration] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sliderInterval, setSliderInterval] = useState(0);
  const [widthOfSlider, setWidthOfSlider] = useState(1);

  useEffect(() => {
    socket.on('playVideo', () => {
      playVideo();
    });

    socket.on('pauseVideo', (timeElapsedOnOtherDevice, duration) => {
      pauseVideo();
      seekToSeconds(duration);
      setTimeElapsed(timeElapsedOnOtherDevice);
    });

    socket.on('seekVideo', videoDurationSeekTo => {
      seekToSeconds(videoDurationSeekTo);
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (sliderRef) {
        setSliderInterval(
          setInterval(() => {
            setTimeElapsed(prev => prev + 1);
          }, 1000),
        );
      }
    } else {
      clearInterval(sliderInterval);
    }
  }, [isPlaying]);

  const initializeVideoSlider = () => {
    if (youtubePlayerRef && youtubePlayerRef.current) {
      youtubePlayerRef.current.getDuration().then(duration => {
        setVideoDuration(duration);
      });
    }
  };

  const playVideo = () => {
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    setIsPlaying(false);
  };

  const seekToSeconds = secs => {
    if (youtubePlayerRef && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(secs);
      setTimeElapsed(Math.round(secs));
    }
  };

  return (
    <View style={styles.container}>
      <YoutubePlayer
        ref={youtubePlayerRef}
        videoId={currRoomID}
        width={'100%'}
        height={'86%'}
        initialPlayerParams={{controls: false}}
        play={isPlaying}
        onReady={initializeVideoSlider}
      />
      <View style={styles.videoControlsContainer}>
        <TouchableOpacity
          onPress={() => {
            socket.emit('playClicked', currRoomID);
          }}>
          <PlayIcon name="controller-play" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            youtubePlayerRef?.current?.getCurrentTime().then(duration =>
              socket.emit('pauseClicked', {
                timeElapsed,
                currRoomID,
                duration,
              }),
            );
          }}>
          <PauseIcon name="pause" size={26} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoSlider}
          onPressOut={e => {
            //grab percentage of slider area clicked
            let percentOfAreaClicked =
              (e.nativeEvent.locationX * 100) / widthOfSlider;
            let videoDurationSeekTo =
              (percentOfAreaClicked * videoDuration) / 100;

            //emit the event that we are seeking the video
            socket.emit('videoSeeked', {videoDurationSeekTo, currRoomID});
          }}>
          <View
            style={{
              ...styles.videoSliderTrackerBox,
              left: `${(timeElapsed * 100) / videoDuration}%`,
            }}
            ref={sliderRef}
          />
          <View
            style={styles.videoSliderHorizontalLine}
            onLayout={e => {
              setWidthOfSlider(e.nativeEvent.layout.width);
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
