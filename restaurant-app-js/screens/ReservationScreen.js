import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "../api/api";
import { Ionicons } from "@expo/vector-icons"; // Requires installing expo vector icons

export default function ReservationScreen({ route, navigation }) {
  const { restaurantId, restaurantName } = route.params;

  const [peopleCount, setPeopleCount] = useState("1");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (time) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return time.toLocaleTimeString(undefined, options);
  };

  const handleReservation = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const formattedTime = selectedTime.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

      const response = await api.post(
        "/reservations",
        {
          restaurant_id: restaurantId,
          date: formattedDate,
          time: formattedTime,
          people_count: parseInt(peopleCount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLoading(false);
      Alert.alert(
        "Reservation Confirmed!",
        `Your table for ${peopleCount} at ${restaurantName} is booked for ${formatDate(selectedDate)} at ${formatTime(selectedTime)}.`,
        [{ text: "Great!", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Error during reservation:", error);
      Alert.alert(
        "Reservation Failed",
        error.response?.data?.error || "Could not make reservation. Please try again later."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{restaurantName}</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Make a Reservation</Text>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Guests</Text>
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionValue}>{peopleCount} {peopleCount === "1" ? "person" : "people"}</Text>
                <View style={styles.counterButtons}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => {
                      const current = parseInt(peopleCount);
                      if (current > 1) {
                        setPeopleCount((current - 1).toString());
                      }
                    }}
                    disabled={peopleCount === "1"}
                  >
                    <Text style={[styles.counterButtonText, peopleCount === "1" && styles.disabledText]}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => {
                      const current = parseInt(peopleCount);
                      if (current < 10) {
                        setPeopleCount((current + 1).toString());
                      }
                    }}
                    disabled={peopleCount === "10"}
                  >
                    <Text style={[styles.counterButtonText, peopleCount === "10" && styles.disabledText]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
                <Ionicons name="calendar" size={20} color="#555" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>{formatTime(selectedTime)}</Text>
                <Ionicons name="time" size={20} color="#555" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minuteInterval={15}
                  onChange={(event, time) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (time) setSelectedTime(time);
                  }}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.reserveButton, isLoading && styles.reserveButtonDisabled]}
            onPress={handleReservation}
            disabled={isLoading}
          >
            <Text style={styles.reserveButtonText}>
              {isLoading ? "Processing..." : "Confirm Reservation"}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#666" />
            <Text style={styles.infoText}>
              You can cancel your reservation up to 2 hours before the scheduled time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    padding: 12,
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  counterButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  disabledText: {
    opacity: 0.5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    fontSize: 16,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
  reserveButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  reserveButtonDisabled: {
    backgroundColor: "#a0c0e8",
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});