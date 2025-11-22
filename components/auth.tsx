import React, { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import {signUpAccount, signInAccount} from "@/Services/UserAuthMethods";
import { UserSignUpInterface, UserSignInInterface, UserDataInterface } from "@/interfaces/interfaces";
import { DeleteToken, GetToken, SaveToken } from "@/HelperFuncs/localStorage";
import { useAuth } from "@/context/AuthContext";  
import { router,} from "expo-router";


export function SignUpComponent() {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [jwt, setJwt] = useState<string | null>(null);
  const {signInSession} = useAuth();
  const handleSignUp = async () => {
    const user: UserSignUpInterface = {
      user_handle: handle,
      user_profile_name: name,
      userDescription: desc,
      fromLocation: location,
      userDateOfBirth: dob,
      gender,
      email,
      phoneNumber: phone,
      password,
    };
    try {
      const { token, userID } = await signUpAccount(user);
      setJwt(token);
      await SaveToken("jwt", token);
      console.log("JWT Stored:", token);
      console.log("UserID from signup:", userID, typeof userID);
      const parsedUserID = parseInt(userID);
      console.log("Parsed UserID:", parsedUserID, typeof parsedUserID);
      const userData: UserDataInterface = {
        UserID: parsedUserID,
        UserHandle: user.user_handle,
        UserProfileName: user.user_profile_name,
        UserDescription: user.userDescription,
        FromLocation: user.fromLocation,
        Gender: user.gender
      };
      console.log("SignUp - userData:", userData);
      await signInSession(token, userData)
      router.replace("/")
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Handle" value={handle} onChangeText={setHandle} />
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput placeholder="DOB (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
      <TextInput placeholder="Gender" value={gender} onChangeText={setGender} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Sign up" onPress={handleSignUp} />


      {name && <Text> {name} </Text>}
      {jwt && (
        <Text>JWT Present: {  jwt }</Text>
      )
      }
      {!jwt && (

        <Text>NO JWT</Text>
    )}
    </View>
  );
}


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

      // Fetch user details using userID
      console.log("UserID from signin:", userID, typeof userID);
      const userDetailsResponse = await fetch(`http://10.0.2.2:8100/get-user?userID=${userID}`);
      const userDetails = await userDetailsResponse.json();
      console.log("User details from API:", userDetails);
      
      const userData: UserDataInterface = {
        UserID: +userID,
        UserHandle: userDetails.UserHandle || handle,
        UserProfileName: userDetails.UserProfileName,
        UserDescription: userDetails.UserDescription,
        FromLocation: userDetails.FromLocation,
        Gender: userDetails.Gender
      };
      console.log("SignIn - userData:", userData);
      console.log("SignIn - userData.UserID:", userData.UserID, typeof userData.UserID);
      await signInSession(token, userData)
      router.replace("/")
    } catch (err) {
      // console.error("Sign in failed:", err);
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <View className="w-full">
      <Text className="px-4 text-lg font-semibold ">Handle</Text>
      <TextInput 
        className="px-4 py-2 mb-4 bg-white text-xl rounded-2xl  border-2" 
        placeholder="Id bta ladle" 
        placeholderTextColor="#9CA3AF"
        value={handle} 
        onChangeText={setHandle} 
      />
      <Text className="px-4 text-lg font-semibold ">Password</Text>
      <TextInput  
        className="px-4 py-2 mb-4 bg-white text-xl rounded-2xl  border-2" 
        placeholder="password mat share kario bhai" 
        placeholderTextColor="#9CA3AF"
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      {error ? (
        <Text className="text-red-500 font-bold text-center mb-4">{error}</Text>
      ) : null}
      
      <TouchableOpacity 
        className="bg-wierd rounded-2xl mt-4 py-4 items-center justify-center"
        onPress={handleSignIn}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}
      >
        <Text className="text-black text-xl font-bold">Sign in</Text>
      </TouchableOpacity>
      
      <View className="h-8" />
      
      <Text className="text-white text-center text-lg font-medium mb-3">
        Don't have an account?
      </Text>
      
      <TouchableOpacity 
        className="bg-secondary rounded-2xl py-4 items-center justify-center"
        onPress={() => router.push('/auth/sign-up')}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}
      >
        <Text className="text-white text-xl font-bold">Sign up</Text>
      </TouchableOpacity>
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



