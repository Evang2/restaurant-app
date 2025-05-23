import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { register } from "../api/api";  // Use the register function from api.js

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await register({ name, email, password });  // Use the register function
      Alert.alert("Success", "User registered!");
      navigation.navigate("Login");
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 10, borderWidth: 1, padding: 10 },
});
