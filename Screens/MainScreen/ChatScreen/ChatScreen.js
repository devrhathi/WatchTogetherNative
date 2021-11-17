import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  Text,
  TextInput,
  View,
  FlatList,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {CurrSocketIDContext} from '../MainScreen';
import {socket} from '../../../SocketContext';
import {styles} from './ChatScreenStyles';
import VoiceChatRTC from '../VoiceChatRTC/VoiceChatRTC';

export default function ChatScreen({currRoomID}) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const flatListRef = useRef();
  const currSocketID = useContext(CurrSocketIDContext);

  useEffect(() => {
    socket.on('messageReceived', msgObj => {
      addNewMessage(msgObj);
    });

    Keyboard.addListener('keyboardDidShow', () => {
      if (flatListRef) {
        flatListRef.current.scrollToEnd();
      }
    });
  }, []);

  const sendMessage = e => {
    e.preventDefault();
    let tempMsgObj = {
      roomID: currRoomID,
      sender: currSocketID,
      msg: msg,
    };
    socket.emit('sendMessage', tempMsgObj);
    addNewMessage(tempMsgObj);
    setMsg('');
  };

  const addNewMessage = msgObj => {
    setMessages(prev => {
      return [...prev, msgObj];
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <FlatList
          keyboardDismissMode={false}
          keyboardShouldPersistTaps="always"
          ref={flatListRef}
          onContentSizeChange={() => {
            // flatListRef.current.scrollToEnd();
          }}
          data={messages}
          keyExtractor={(element, index) => index.toString()}
          renderItem={element => {
            if (element.item.sender === currSocketID) {
              return (
                <View style={styles.senderTextBubble}>
                  <Text style={styles.chatText}>{element.item.msg}</Text>
                </View>
              );
            } else {
              return (
                <View style={styles.receiverChatBubble}>
                  <Text style={styles.chatText}>{element.item.msg}</Text>
                </View>
              );
            }
          }}
        />
      </View>
      <View style={styles.sendMessageContainer}>
        <View style={styles.voiceChatRTC}>
          <VoiceChatRTC roomID={currRoomID} />
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Enter a message..."
          value={msg}
          onChangeText={setMsg}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
