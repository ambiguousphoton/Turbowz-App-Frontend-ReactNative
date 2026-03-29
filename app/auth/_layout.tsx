import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function Layout() {
  const {session} = useAuth()
  if (session){
  return <Redirect href={'/'}></Redirect> }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="Welcome" />
    </Stack>
  );
}