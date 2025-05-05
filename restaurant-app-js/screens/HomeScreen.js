import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.184:3000/api/restaurants')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setRestaurants(data))
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.restaurant_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.location}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  item: { marginBottom: 12, borderBottomWidth: 1, paddingBottom: 8 },
  name: { fontWeight: 'bold' },
});
