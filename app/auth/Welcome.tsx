import PrimaryButtonComponent from "@/components/Buttons";
import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { logger } from "react-native-reanimated/lib/typescript/logger";

export default function App() {


  return (
    <SafeAreaView className="flex-1 bg-primary-150">
      {/* Decorative circles */}
      <View className="absolute top-20 right-10 w-20 h-20 bg-white opacity-10 rounded-full" />
      <View className="absolute top-40 left-8 w-12 h-12 bg-white opacity-20 rounded-full" />
      <View className="absolute bottom-60 right-6 w-16 h-16 bg-white opacity-15 rounded-full" />
      
      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-5xl font-bold text-white text-center">Welcome!</Text>
        <Text className="text-lg text-white opacity-80 mb-2 text-center">Join our community today</Text>

        <View className="rounded-3xl">
          <Image
            source={require("../../assets/images/NarayanNarayanNarayanNarayan.png")}
            style={{ width: 405, height:405 }}
            resizeMode="contain"
          />
        </View>
        
        {/* Info Section */}
        <View className="px-4 opacity-70">
          <Text className="text-white text-center text-lg font-semibold">Get Started Today</Text>
          <Text className="text-white text-center opacity-90 text-sm leading-4">
            Create your account to access exclusive content, connect with others, and unlock amazing features.
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View className="px-6 pb-20">
        <TouchableOpacity 
          className="bg-secondary items-center justify-center rounded-xl py-5 mb-4 shadow-lg "
          style={{ elevation: 8 }}
           onPress={() =>  router.push('/auth/sign-up')
          }
        >
          <Text className="text-xl font-bold text-white">Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white items-center justify-center rounded-xl py-5 border-2 border-white "
          style={{ elevation: 4 }}
          onPress={() =>  router.push('/auth/sign-in')
          }
        >
          <Text className="text-xl font-bold text-primary-150">Log In</Text>
          
        </TouchableOpacity>
      </View>



    </SafeAreaView>
  );
}

 