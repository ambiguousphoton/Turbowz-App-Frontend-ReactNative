import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function Layout() {
    const {session}  = useAuth()
    if (!session){
        return <Redirect href='/auth/sign-in'></Redirect>
    }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="user-options" />
    </Stack>
  );
}