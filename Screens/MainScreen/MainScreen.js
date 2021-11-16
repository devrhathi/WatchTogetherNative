import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import VideoPlayerScreen from './VideoPlayerScreen/VideoPlayerScreen';
import ChatScreen from './ChatScreen/ChatScreen';
import {socket} from '../../SocketContext';

export default function MainScreen({route, navigation}) {
  // const { roomIDText } = route.params;
  const roomIDText = 'DFWvyP6BOis';
  const [currSocketID, setCurrSocketID] = useState('');

  useEffect(() => {
    //after socket connection, emit a join room request along with the video id to join, backend executes the third arguement which is callback and passes the socket id to it
    socket.emit('joinRoom', roomIDText, socketID => {
      setCurrSocketID(socketID);
    });
  }, []);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
    },
  });

  return (
    <View style={styles.container}>
      <VideoPlayerScreen currRoomID={roomIDText} currSocketID={currSocketID} />
      <ChatScreen currRoomID={roomIDText} currSocketID={currSocketID} />
    </View>
  );
}
