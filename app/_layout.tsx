import { Stack, Redirect} from "expo-router";
import  './globals.css'
import { Alert } from "react-native";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import {WebSocketProvider} from "@/context/WebSocketConnectionContext";
import { GetUser } from "@/HelperFuncs/localStorage";
export default function RootLayout() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    const userData = await GetUser();
    setUser(userData);
  }

  return (
    <AuthProvider>
      <WebSocketProvider userID={user?.UserID}>
        <Stack screenOptions={{ headerShown: false ,}}/>
      </WebSocketProvider>
    </AuthProvider>
  )
}
