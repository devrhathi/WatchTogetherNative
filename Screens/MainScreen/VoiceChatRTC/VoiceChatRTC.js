import React, {useEffect, useState, useContext} from 'react';
import {TouchableOpacity, PermissionsAndroid, LogBox} from 'react-native';
import VoiceChatIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {socket} from '../../../SocketContext';
import {CurrSocketIDContext} from '../MainScreen';
import RNSwitchAudioOutput from 'react-native-switch-audio-output';

import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';

export default function VoiceChatRTC({roomID}) {
  // LogBox.ignoreLogs(['new NativeEventEmitter']);
  LogBox.ignoreAllLogs(true);

  const configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);

    socket.on('voiceConnectedReceived', () => {
      setIsConnected(true);
    });

    socket.on('offerReceive', async offer => {
      //offer received, create new connection object, set remote description, create ans and set it to local description
      const peerConnection = new RTCPeerConnection(configuration);
      const micLocalStream = await setupMic();
      peerConnection.addStream(micLocalStream);

      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      setupListeners(peerConnection);

      socket.emit('answerSend', {roomID, answer});
    });
  }, []);

  const setupMic = async () => {
    //grab user's mic permission
    if (grabMicrophone()) {
      //set media stream
      const micStream = await mediaDevices.getUserMedia({audio: true});
      return micStream;
    } else {
      console.log('error grabbing microphone');
    }
  };

  const makeCall = async () => {
    //begin the peer connection via signaling
    const peerConnection = new RTCPeerConnection(configuration);
    const micLocalStream = await setupMic();
    peerConnection.addStream(micLocalStream);

    //create an offer
    const offer = await peerConnection.createOffer();
    //set it as local description
    await peerConnection.setLocalDescription(offer);

    //add listener for answer
    socket.on('answerReceive', async answer => {
      //answer received, so set it as remote description
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDesc);
      socket.emit('voiceConnected', roomID);
    });

    peerConnection.onconnectionstatechange = function (e) {
      console.log(e.target.connectionState);
    };

    setupListeners(peerConnection);

    //emit event w the offer and roomID
    socket.emit('offerSend', {roomID, offer});
  };

  const setupListeners = async peerConnection => {
    if (peerConnection) {
      //add listener for transmitting ice candidates
      peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
          socket.emit('newIceCandidate', event.candidate);
        }
      };

      //add listener for receiving ice candidates
      socket.on('newIceCandidateReceive', async candidate => {
        await peerConnection.addIceCandidate(candidate);
      });

      //add listener for disconnecting connection
      socket.on('voiceDisconnectedReceived', () => {
        peerConnection.close();
        setIsConnected(false);
      });
    }
  };

  const grabMicrophone = async () => {
    //check whether permission already granted or not
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    if (!isGranted) {
      //ask for permission
      const micPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      //if granted
      if (micPermission === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  const handleCall = () => {
    if (isConnected) {
      socket.emit('voiceDisconnected', roomID);
    } else {
      makeCall();
    }
  };

  return (
    <TouchableOpacity onPress={handleCall}>
      <VoiceChatIcon
        name="headphones"
        size={38}
        color={isConnected ? 'green' : 'black'}
      />
    </TouchableOpacity>
  );
}
