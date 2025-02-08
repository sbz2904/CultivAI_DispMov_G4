import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ChatScreen from "./src/screens/ChatScreen";
import SelectSembríosScreen from "./src/screens/SelectSembriosScreen";
import SembrioDetallesScreen from "./src/screens/SembrioDetallesScreen";
import CultivAIVisionScreen from "./src/screens/CultivAIVisionScreen";
import { Ionicons } from "@expo/vector-icons"; // Importamos los íconos para las tabs


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Chat") {
            iconName = "chatbubbles";
          } else if (route.name === "CultiveAI") {
            iconName = "camera";
          }    
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#388E3C",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chatbot" }} />
      <Tab.Screen name="CultiveAI" component={CultivAIVisionScreen} options={{ title: "CultiveAI" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="SelectSembríos" component={SelectSembríosScreen} options={{ title: "Seleccionar Sembríos" }} />
        <Stack.Screen name="SembríoDetalles" component={SembrioDetallesScreen} options={{ title: "Detalles del Sembrío" }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
