import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import api from '../api/api';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle search with backend
  useEffect(() => {
    const searchRestaurants = async () => {
      if (searchQuery.trim() === '') {
        // Fetch all restaurants if query is empty
        try {
          const response = await api.get('/restaurants');
          setRestaurants(response.data);
        } catch (err) {
          console.error('Fetch error:', err);
        }
      } else {
        // Search using backend endpoint
        try {
          const response = await api.get('/restaurants/search', {
            params: { query: searchQuery },
          });
          setRestaurants(response.data);
        } catch (err) {
          console.error('Search error:', err);
        }
      }
    };

    // Debounce search to avoid too many requests
    const debounce = setTimeout(() => {
      searchRestaurants();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Reservation', {
      restaurantId: restaurant.restaurant_id,
      restaurantName: restaurant.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <TouchableOpacity
          style={styles.reservationsButton}
          onPress={() => navigation.navigate('UserReservations')}
        >
          <Text style={styles.reservationsButtonText}>My Reservations</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.restaurant_id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRestaurantPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.location}>{item.location}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  reservationsButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reservationsButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  searchInput: {
    backgroundColor: '#F1F3F4',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#212121',
  },
  location: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});