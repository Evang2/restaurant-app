// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ReservationScreen from './screens/ReservationScreen';
import EditReservationScreen from "./screens/EditReservationScreen";
import UserReservationScreen from "./screens/UserReservationScreen";
// import UserReservationScreen from './restaurant-app-js/screens/UserReservationSreen.js';  // Import the new screen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="EditReservation" component={EditReservationScreen} />
        <Stack.Screen name="UserReservations" component={UserReservationScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}


