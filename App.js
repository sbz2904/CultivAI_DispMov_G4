import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SelectSembríosScreen from "./src/screens/SelectSemb";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import SembrioDetallesScreen from './src/screens/SembrioDetallesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Iniciar Sesión" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Registrarse" }}
        />
                <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Inicio" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Perfil" }}
        />
        <Stack.Screen
          name="SelectSembríos"
          component={SelectSembríosScreen}
          options={{ title: "Seleccionar Sembríos" }}
        />
        <Stack.Screen
          name="SembríoDetalles"
          component={SembrioDetallesScreen}
          options={{ title: 'Detalles del Sembrío' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "Chatbot" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
