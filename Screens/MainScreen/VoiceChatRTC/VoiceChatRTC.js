import React, {useState} from 'react';
import {TouchableOpacity, PermissionsAndroid} from 'react-native';
import VoiceChatIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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

export default function VoiceChatRTC() {
  const [localStream, setLocalStream] = useState(null);

  const initiateVoiceChatConnection = async () => {
    const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
    const pc = new RTCPeerConnection(configuration);

    //grab user's mic permission
    if (grabMicrophone()) {
      //set media stream
      mediaDevices
        .getUserMedia({audio: true})
        .then(stream => setLocalStream(stream));
    } else {
      console.log('error grabbing microphone');
    }

    //begin the peer connection via signaling
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
    <TouchableOpacity onPress={initiateVoiceChatConnection}>
      <VoiceChatIcon name="headphones" size={38} color="black" />
      {localStream && <RTCView streamURL={localStream.toURL()} />}
    </TouchableOpacity>
  );
}
