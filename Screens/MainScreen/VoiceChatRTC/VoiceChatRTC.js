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

  // const configuration = {
  //   iceServers: [
  //     {
  //       urls: [
  //         'stun.l.google.com:19302',
  //         'stun1.l.google.com:19302',
  //         'stun2.l.google.com:19302',
  //         'stun3.l.google.com:19302',
  //         'stun4.l.google.com:19302',
  //       ],
  //     },
  //   ],
  //   iceCandidatePoolSize: 10,
  // };

  // 'stun:stun1.l.google.com:19302',
  // 'stun:stun2.l.google.com:19302',

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

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const currentSocketID = useContext(CurrSocketIDContext);

  useEffect(() => {
    socket.on('offerReceive', async offer => {
      setupMic();
      //offer received, create new connection object, set remote description, create ans and set it to local description
      const peerConnection = new RTCPeerConnection(configuration);

      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answerSend', {roomID, answer});

      setupListeners(peerConnection);
    });

    socket.on('voiceConnectedReceived', () => {
      setIsConnected(true);
    });
  }, []);

  const setupMic = async () => {
    //grab user's mic permission
    if (grabMicrophone()) {
      //set media stream
      const micStream = await mediaDevices.getUserMedia({audio: true});
      setLocalStream(micStream);
      return micStream;
      // console.log(micStream);
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
    //emit event w the offer and roomID
    socket.emit('offerSend', {roomID, offer});

    //add listener for answer
    socket.on('answerReceive', async answer => {
      //answer received, so set it as remote description
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDesc);
      socket.emit('voiceConnected', roomID);
    });

    setupListeners(peerConnection);

    peerConnection.onconnectionstatechange = function (e) {
      console.log(e.target.connectionState);
    };

    // peerConnection.oniceconnectionstatechange = function (e) {
    //   console.log(e.target.iceConnectionState);
    // };

    // peerConnection.onicegatheringstatechange = function (e) {
    //   console.log(e.target.iceGatheringState);
    // };

    // peerConnection.onsignalingstatechange = function (e) {
    //   console.log(e.target.signalingState);
    // };
  };

  const setupListeners = async peerConnection => {
    const tempStream = peerConnection.getLocalStreams();
    setRemoteStream(tempStream[0]);

    //add listener for receiving and transmitting ice candidates
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        socket.emit('newIceCandidate', event.candidate);
      }
    };

    socket.on('newIceCandidateReceive', async candidate => {
      await peerConnection.addIceCandidate(candidate);
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
      {remoteStream && <RTCView streamURL={remoteStream.toURL()} />}
    </TouchableOpacity>
  );
}
