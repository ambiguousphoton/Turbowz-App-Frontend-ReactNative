import React, { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import {signUpAccount, signInAccount} from "@/Services/UserAuthMethods";
import { UserSignUpInterface, UserSignInInterface, UserDataInterface } from "@/interfaces/interfaces";
import { DeleteToken, GetToken, SaveToken } from "@/HelperFuncs/localStorage";
import { useAuth } from "@/context/AuthContext";  
import { router,} from "expo-router";
import { getUser } from "@/Services/api/userService";



export function SignInComponent() {
  // local input states
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const {signInSession} = useAuth();
  const handleSignIn = async () => {
    // build the user object only when submit is clicked
    const user: UserSignInInterface = {
      user_handle: handle,
      password,
    };

    try {
      setError("");
      const { token, userID } = await signInAccount(user);
      setJwt(token);
      await SaveToken("jwt", token);

      const userDetails = await getUser(userID);
      
      const userData: UserDataInterface = {
        UserID: +userID,
        UserHandle: userDetails.UserHandle || handle,
        UserProfileName: userDetails.UserProfileName,
        UserDescription: userDetails.UserDescription,
        FromLocation: userDetails.FromLocation,
        Gender: userDetails.Gender
      };
      await signInSession(token, userData)
      router.replace("/")
    } catch (err) {
      // console.error("Sign in failed:", err);
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <View className="w-full max-w-md mx-auto bg-white/90 rounded-2xl p-4 sm:p-6" style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5
    }}>
      <View className="mb-4 sm:mb-6">
        <Text className="text-black text-sm sm:text-base font-medium mb-2">Username</Text>
        <TextInput 
          className="px-3 sm:px-4 py-3 sm:py-4 bg-white text-base sm:text-lg rounded-xl border border-gray-200" 
          placeholder="Enter your username" 
          placeholderTextColor="#9CA3AF"
          value={handle} 
          onChangeText={setHandle}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View className="mb-4 sm:mb-6">
        <Text className="text-black text-sm sm:text-base font-medium mb-2">Password</Text>
        <TextInput  
          className="px-3 sm:px-4 py-3 sm:py-4 bg-white text-base sm:text-lg rounded-xl border border-gray-200" 
          placeholder="Enter your password" 
          placeholderTextColor="#9CA3AF"
          secureTextEntry 
          value={password} 
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>
      {error ? (
        <Text className="text-red-500 font-bold text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</Text>
      ) : null}
      
      <TouchableOpacity 
        className="bg-wierd rounded-xl py-3 sm:py-4 items-center justify-center mb-4 sm:mb-6"
        onPress={handleSignIn}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}
      >
        <Text className="text-black text-base sm:text-lg font-semibold">Sign In</Text>
      </TouchableOpacity>
      
      <View className="items-center">
        <Text className="text-black text-sm sm:text-base font-medium mb-2 sm:mb-3">
          Don't have an account?
        </Text>
        
        <TouchableOpacity 
          className="bg-secondary rounded-xl py-3 sm:py-4 items-center justify-center w-full"
          onPress={() => router.push('/auth/sign-up')}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }}
        >
          <Text className="text-white text-base sm:text-lg font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export function SignOutComponent() {
  // local input states
  const [handle, setHandle] = useState("");

  const [password, setPassword] = useState("");

  const {signOutSession} = useAuth();
  const handleSignIn = async () => {
    // build the user object only when submit is clicked
    const user: UserSignInInterface = {
      user_handle: handle,
      password,
    };

    try {
      const token = await GetToken('jwt');
      await DeleteToken("jwt");

      await signOutSession(token, handle)
      router.replace("/auth/sign-in")
    } catch (err) {
      console.error("SignOut Failed", err);
    }
  };

  return (
      <Button title="Sign Out" onPress={handleSignIn} />
      
  );
}



