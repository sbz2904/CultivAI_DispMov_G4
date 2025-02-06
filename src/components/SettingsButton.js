import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SettingsButton = ({ userId }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile", { userId })}
      >
        <Ionicons name="settings" size={30} color="green" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  button: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
  },
});

export default SettingsButton;