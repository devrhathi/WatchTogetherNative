import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { styles } from "./HomeScreenStyles";

export default function HomeScreen({ navigation }) {
  const [roomIDText, setRoomIDText] = useState("");
  const [errText, setErrText] = useState("");

  const clearError = () => {
    setTimeout(() => {
      setErrText("");
    }, 5000);
  };

  const handleJoinButton = () => {
    let trailingVideoID = roomIDText.trim().slice(-11);

    if (trailingVideoID === "" || !trailingVideoID) {
      setErrText("Please Enter Video URL");
      clearError();
    } else {
      navigation.navigate("MainScreen", {
        roomIDText: trailingVideoID,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}> Enter Room ID To Join </Text>
      {errText.length > 0 ? (
        <Text style={styles.errText}>{errText} </Text>
      ) : null}
      <TextInput
        style={styles.textInput}
        value={roomIDText}
        placeholder="Or create a room..."
        onChangeText={setRoomIDText}
      />
      <View style={styles.buttonsView}>
        <TouchableOpacity style={styles.buttons} onPress={handleJoinButton}>
          <Text style={styles.buttonText}>Join Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
