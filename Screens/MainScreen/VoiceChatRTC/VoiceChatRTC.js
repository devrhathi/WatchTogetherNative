import React, {useEffect, useState, useContext} from 'react';
import {TouchableOpacity, PermissionsAndroid, LogBox} from 'react-native';
import VoiceChatIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {socket} from '../../../SocketContext';
import {CurrSocketIDContext} from '../MainScreen';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';

export default function VoiceChatRTC({roomID}) {
  LogBox.ignoreLogs(['new NativeEventEmitter']);

  const [localStream, setLocalStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentSocketID = useContext(CurrSocketIDContext);

  useEffect(() => {
    socket.on('offerReceive', async offer => {
      setupMic();
      //offer received, create new connection object, set remote description, create ans and set it to local description
      const configuration = {
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
      };
      const peerConnection = new RTCPeerConnection(configuration);

      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answerSend', {roomID, answer});
    });

    socket.on('voiceConnectedReceived', () => {
      setIsConnected(true);
    });
  }, []);

  const setupMic = () => {
    //grab user's mic permission
    if (grabMicrophone()) {
      //set media stream
      mediaDevices
        .getUserMedia({audio: true})
        .then(stream => setLocalStream(stream));
    } else {
      console.log('error grabbing microphone');
    }
  };

  const makeCall = async () => {
    setupMic();

    //begin the peer connection via signaling
    const configuration = {
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    };
    const peerConnection = new RTCPeerConnection(configuration);

    //create an offer
    const offer = await peerConnection.createOffer();
    //set it as local description
    await peerConnection.setLocalDescription(offer);
    //emit event w the offer and roomID
    socket.emit('offerSend', {roomID, offer});

    //add listener for answer
    socket.on('answerReceive', async answer => {
      //answer received, so set it as remote description
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDesc);
      socket.emit('voiceConnected', roomID);
    });
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

  return (
    <TouchableOpacity onPress={makeCall}>
      <VoiceChatIcon
        name="headphones"
        size={38}
        color={isConnected ? 'green' : 'black'}
      />
      {localStream && <RTCView streamURL={localStream.toURL()} />}
    </TouchableOpacity>
  );
}
