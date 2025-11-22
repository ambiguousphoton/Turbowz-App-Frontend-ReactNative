// app/(tabs)/home/_layout.tsx

import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack>
      {/* This is the initial screen for the stack, pointing to home/index.tsx.
        It must be defined first to be the base of the stack.
      */}
      <Stack.Screen 
        name="index" 
        options={{ 
            headerShown: false // Or remove if you don't want a header
        }} 
      />
      
      {/* This is the User Profile screen, which will be pushed on top of the Home Stack.
        It will appear on the 'Home' tab, and the tab bar will remain visible.
      */}
      <Stack.Screen 
        name="users/[userID]" 
        options={{ 
            headerShown: false // Or set a dynamic title
        }} 
      />
    </Stack>
  );
}