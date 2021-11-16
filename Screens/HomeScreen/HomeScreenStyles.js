import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    textAlign: "center",
    color: "white",
  },

  titleText: {
    fontSize: 22,
    margin: 6,
  },

  errText: {
    fontSize: 16,
    color: "red",
  },

  textInput: {
    borderColor: "black",
    borderWidth: 1.5,
    margin: 8,
    padding: 3,
  },

  buttonsView: {
    display: "flex",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    width: 300,
  },

  buttons: {
    width: 100,
    backgroundColor: "#1A73E8",
    padding: 10,
    fontWeight: "500",
  },
});
