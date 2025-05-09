import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function EditReservationScreen({ route, navigation }) {
  const { reservation } = route.params;

  const [date, setDate] = useState(reservation.date);
  const [time, setTime] = useState(reservation.time);
  const [peopleCount, setPeopleCount] = useState(reservation.people_count.toString());

  const handleUpdate = async () => {
    // Validate inputs
    if (!date || !time || !peopleCount) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
      return;
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Error", "Invalid time format. Use HH:MM or HH:MM:SS");
      return;
    }

    // Validate people_count
    const peopleCountNum = parseInt(peopleCount, 10);
    if (!Number.isInteger(peopleCountNum) || peopleCountNum < 1) {
      Alert.alert("Error", "Number of people must be a positive integer");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.put(
        "/reservations/update",
        {
          reservation_id: reservation.reservation_id,
          date,
          time,
          people_count: peopleCountNum,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );

      Alert.alert("Success", response.data.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("UserReservations", { reservationUpdated: true }),
        },
      ]);
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", err.response?.data?.error || "Failed to update reservation");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Reservation at {reservation.restaurant_name}</Text>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="e.g., 2025-05-15"
      />

      <Text style={styles.label}>Time (HH:MM)</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="e.g., 19:00"
      />

      <Text style={styles.label}>Number of People</Text>
      <TextInput
        style={styles.input}
        value={peopleCount}
        onChangeText={setPeopleCount}
        keyboardType="numeric"
        placeholder="e.g., 4"
      />

      <Button title="Update Reservation" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    fontSize: 16,
  },
});