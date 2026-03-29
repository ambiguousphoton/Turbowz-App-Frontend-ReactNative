import { Stack } from 'expo-router';

export default function ChatStackLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[userID]" 
        options={{ 
            headerShown: false
        }} 
      />
    </Stack>
  );
}