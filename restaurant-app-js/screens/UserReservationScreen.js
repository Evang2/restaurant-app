import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/api";

export default function UserReservationsScreen({ navigation, route }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced fetch reservations function
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.log("No authentication token found");
        setReservations([]);
        setError("No authentication token found. Please log in again.");
        return;
      }
      
      console.log("Fetching reservations with token:", token.substring(0, 10) + "...");
      
      const response = await api.get("/user/reservations", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      
      console.log("API Response Status:", response.status);
      console.log("Raw Reservations Data:", JSON.stringify(response.data, null, 2));
  
      // Handle both array and single object responses
      const data = Array.isArray(response.data)
        ? response.data
        : response.data && typeof response.data === "object"
        ? [response.data]
        : [];
      
      // Validate and normalize the data structure
      const validData = data.map(item => {
        // Normalize date from ISO (e.g., "2025-05-08T21:00:00.000Z") to YYYY-MM-DD
        const normalizedDate = item.date
          ? new Date(item.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        // Normalize time to HH:MM:SS if it's HH:MM
        const normalizedTime = item.time && item.time.length === 5 ? `${item.time}:00` : item.time;
        return {
          ...item,
          restaurant_name: item.restaurant_name || "Unknown Restaurant",
          restaurant_id: item.restaurant_id || 0,
          reservation_id: item.reservation_id?.toString() || Math.random().toString(),
          date: normalizedDate,
          time: normalizedTime || "12:00:00",
          people_count: item.people_count || 1,
        };
      });
      
      console.log("Validated reservation data:", validData.length, "reservations");
      console.log("Validated data details:", JSON.stringify(validData, null, 2));
      setReservations(validData);
  
    } catch (err) {
      console.error("Error fetching reservations:", err);
      
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        setError(`Server error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.log("No response received:", err.request);
        setError("No response from server. Please check your connection.");
      } else {
        console.log("Error message:", err.message);
        setError(`Error: ${err.message}`);
      }
      
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReservations();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching reservations");
      fetchReservations();
    }, [])
  );
  
  // Check for updates from route params
  useEffect(() => {
    console.log("Route params received:", route.params);
    if (route.params?.reservationAdded || route.params?.reservationUpdated) {
      console.log("Reservation change detected, refreshing list");
      fetchReservations();
      // Clear the params to prevent repeated refreshes
      navigation.setParams({ reservationAdded: undefined, reservationUpdated: undefined });
    }
  }, [route.params]);

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  // Enhanced date formatting
  const formatDate = (dateString) => {
    try {
      console.log("Formatting date:", dateString);
      if (!dateString) return "Invalid date";
      
      const options = { weekday: "short", month: "short", day: "numeric" };
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.error("Invalid date format:", dateString);
        return dateString;
      }
      
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Handle cancellation of reservation
  const handleDeleteReservation = async (reservation_id, restaurantName) => {
    Alert.alert(
      "Cancel Reservation",
      `Are you sure you want to cancel your reservation at ${restaurantName}?`,
      [
        { text: "Keep Reservation", style: "cancel" },
        {
          text: "Cancel Reservation",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem("token");
              await api.delete(`/reservations/${reservation_id}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
              });
              
              setReservations((prev) =>
                prev.filter((res) => res.reservation_id !== reservation_id)
              );
              
              Alert.alert(
                "Reservation Cancelled",
                "Your reservation has been successfully cancelled."
              );
            } catch (err) {
              console.error("Error deleting reservation:", err);
              Alert.alert(
                "Error",
                "Could not cancel your reservation. Please try again later."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle booking again
  const handleBookAgain = (restaurant) => {
    console.log("Booking again at restaurant:", restaurant);
    
    if (!restaurant.restaurant_id) {
      console.error("Missing restaurant_id for booking again:", restaurant);
      Alert.alert("Error", "Cannot book again: missing restaurant information");
      return;
    }
    
    navigation.navigate("RestaurantDetails", { 
      restaurant_id: restaurant.restaurant_id,
      name: restaurant.restaurant_name
    });
  };

  // Enhanced filtering of reservations
  const now = new Date();
  console.log("Current date/time for comparison (UTC):", now.toUTCString());
  
  const upcoming = reservations
    .filter(res => {
      try {
        if (!res.date || !res.time) {
          console.log("Missing date or time in reservation:", res);
          return false;
        }
        
        // Normalize time to HH:MM:SS
        const normalizedTime = res.time.length === 5 ? `${res.time}:00` : res.time;
        
        // Parse date and time in UTC
        const [year, month, day] = res.date.split('-').map(Number);
        const [hours, minutes, seconds] = normalizedTime.split(':').map(Number);
        const resDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds || 0));
        
        console.log(
          `Reservation: ${res.restaurant_name}, Date: ${res.date}, Time: ${normalizedTime}, ` +
          `Parsed (UTC): ${resDateTime.toUTCString()}, Is upcoming: ${resDateTime >= now}`
        );
        
        return !isNaN(resDateTime) && resDateTime >= now;
      } catch (error) {
        console.error("Error filtering upcoming reservation:", error, res);
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time.length === 5 ? `${a.time}:00` : a.time}`);
      const dateB = new Date(`${b.date}T${b.time.length === 5 ? `${b.time}:00` : b.time}`);
      return dateA - dateB;
    });
  
  const past = reservations
    .filter(res => {
      try {
        if (!res.date || !res.time) return false;
        
        const normalizedTime = res.time.length === 5 ? `${res.time}:00` : res.time;
        const [year, month, day] = res.date.split('-').map(Number);
        const [hours, minutes, seconds] = normalizedTime.split(':').map(Number);
        const resDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds || 0));
        
        return !isNaN(resDateTime) && resDateTime < now;
      } catch (error) {
        console.error("Error filtering past reservation:", error, res);
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time.length === 5 ? `${a.time}:00` : a.time}`);
      const dateB = new Date(`${b.date}T${b.time.length === 5 ? `${b.time}:00` : b.time}`);
      return dateB - dateA;
    });

  console.log(`Found ${upcoming.length} upcoming and ${past.length} past reservations`);

  // Render an upcoming reservation
  const renderUpcomingItem = ({ item }) => {
    console.log("Rendering upcoming reservation:", item);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.restaurant_name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Confirmed</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#4A90E2" style={styles.icon} />
            <Text style={styles.infoText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color="#4A90E2" style={styles.icon} />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="people" size={18} color="#4A90E2" style={styles.icon} />
            <Text style={styles.infoText}>
              {item.people_count} {parseInt(item.people_count) === 1 ? "person" : "people"}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditReservation", { reservation: item })}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>Modify</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleDeleteReservation(item.reservation_id, item.restaurant_name)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render a past reservation
  const renderPastItem = ({ item }) => {
    console.log("Rendering past reservation:", item);
    return (
      <View style={[styles.card, styles.pastCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.restaurant_name}</Text>
          <View style={styles.pastStatusBadge}>
            <Text style={styles.pastStatusText}>Completed</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#888" style={styles.icon} />
            <Text style={styles.pastInfoText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color="#888" style={styles.icon} />
            <Text style={styles.pastInfoText}>{item.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="people" size={18} color="#888" style={styles.icon} />
            <Text style={styles.pastInfoText}>
              {item.people_count} {parseInt(item.people_count) === 1 ? "person" : "people"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.bookAgainButton}
          onPress={() => handleBookAgain(item)}
        >
          <Ionicons name="repeat" size={16} color="#fff" />
          <Text style={styles.buttonText}>Book Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Empty state components
  const EmptyUpcoming = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>No upcoming reservations</Text>
      <Text style={styles.emptyStateSubtext}>
        Your upcoming reservations will appear here
      </Text>
      <TouchableOpacity 
        style={styles.findRestaurantButton}
        onPress={() => kitųnavigation.navigate("Home")}
      >
        <Text style={styles.findRestaurantButtonText}>Find Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyPast = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>No past reservations</Text>
      <Text style={styles.emptyStateSubtext}>
        Your reservation history will appear here
      </Text>
    </View>
  );

  // Error state component
  const ErrorDisplay = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
      <Text style={styles.emptyStateText}>Something went wrong</Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity 
        style={styles.findRestaurantButton}
        onPress={onRefresh}
      >
        <Text style={styles.findRestaurantButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders for loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your reservations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reservations</Text>
      </View>
      
      {error ? (
        <ErrorDisplay />
      ) : (
        <FlatList
          data={[]} // Dummy data for the main FlatList
          renderItem={null}
          ListHeaderComponent={
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcoming.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{upcoming.length}</Text>
                  </View>
                )}
              </View>
              
              {upcoming.length > 0 ? (
                <FlatList
                  data={upcoming}
                  keyExtractor={(item) => item.reservation_id}
                  renderItem={renderUpcomingItem}
                  scrollEnabled={false}
                  key={upcoming.length}
                />
              ) : (
                <EmptyUpcoming />
              )}
              
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>History</Text>
                {past.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{past.length}</Text>
                  </View>
                )}
              </View>
              
              {past.length > 0 ? (
                <FlatList
                  data={past}
                  keyExtractor={(item) => item.reservation_id}
                  renderItem={renderPastItem}
                  scrollEnabled={false}
                  key={past.length}
                />
              ) : (
                <EmptyPast />
              )}
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastCard: {
    backgroundColor: "#f9f9f9",
    shadowOpacity: 0.05,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#e1f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#2e7d32",
    fontWeight: "500",
    fontSize: 12,
  },
  pastStatusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pastStatusText: {
    color: "#757575",
    fontWeight: "500",
    fontSize: 12,
  },
  cardContent: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
  },
  pastInfoText: {
    fontSize: 15,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 8,
  },
  bookAgainButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },
  findRestaurantButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  findRestaurantButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});