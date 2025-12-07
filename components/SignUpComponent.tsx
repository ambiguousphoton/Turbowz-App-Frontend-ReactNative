import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { signUpAccount } from "@/Services/UserAuthMethods";
import { UserSignUpInterface, UserDataInterface } from "@/interfaces/interfaces";
import { SaveToken } from "@/HelperFuncs/localStorage";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

export function SignUpComponent() {
  const [phase, setPhase] = useState(0);
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const { signInSession } = useAuth();

  const filterAlphanumeric = (text: string) => text.replace(/[^a-zA-Z0-9]/g, '');
  const filterAlphanumericSpace = (text: string) => text.replace(/[^a-zA-Z0-9 ]/g, '');

  const handleSignUp = async () => {
    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const user: UserSignUpInterface = {
      user_handle: handle,
      user_profile_name: name,
      userDescription: "",
      fromLocation: "",
      userDateOfBirth: dob,
      gender,
      email,
      phoneNumber: "",
      password,
    };
    try {
      const { token, userID } = await signUpAccount(user);
      await SaveToken("jwt", token);
      const parsedUserID = parseInt(userID);
      const userData: UserDataInterface = {
        UserID: parsedUserID,
        UserHandle: user.user_handle,
        UserProfileName: user.user_profile_name,
        UserDescription: "",
        FromLocation: "",
        Gender: user.gender
      };
      await signInSession(token, userData);
      router.replace("/");
    } catch (err) {
      console.error("Registration failed:", err);
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
      <Text className="text-2xl sm:text-3xl font-bold text-black text-center mb-2">
        {phase === 0 ? "Verify Email" : phase === 1 ? "Get Started" : "Almost There!"}
      </Text>
      <Text className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
        {phase === 0 ? "Enter your email address" : phase === 1 ? "Choose your credentials" : "Complete your profile"}
      </Text>

      {phase === 0 ? (
        <>
          <View className="mb-3 sm:mb-4">
            <Text className="text-black text-sm sm:text-base font-medium mb-2">Email Address</Text>
            <TextInput 
              className="px-3 sm:px-4 py-3 sm:py-4 bg-white text-base sm:text-lg rounded-xl border border-gray-200" 
              placeholder="Enter your email address" 
              placeholderTextColor="#9CA3AF"
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity 
            className={`rounded-xl py-3 sm:py-4 items-center justify-center mb-3 sm:mb-4 ${!email ? 'bg-gray-400' : 'bg-secondary'}`}
            onPress={() => setPhase(1)}
            style={{ elevation: 3 }}
            disabled={!email}
          >
            <Text className="text-white text-base sm:text-lg font-semibold">Verify Email</Text>
          </TouchableOpacity>
        </>
      ) : phase === 1 ? (
        <>
          <View className="mb-3 sm:mb-4">
            <Text className="text-black text-sm sm:text-base font-medium mb-2">Handle</Text>
            <TextInput 
              className="px-3 sm:px-4 py-3 sm:py-4 bg-white text-base sm:text-lg rounded-xl border border-gray-200" 
              placeholder="Choose your unique handle" 
              placeholderTextColor="#9CA3AF"
              value={handle} 
              onChangeText={(text) => setHandle(filterAlphanumeric(text))} 
            />
          </View>
          <View className="mb-4 sm:mb-6">
            <Text className="text-black text-sm sm:text-base font-medium mb-2">Password</Text>
            <TextInput 
              className="px-3 sm:px-4 py-3 sm:py-4 bg-white text-base sm:text-lg rounded-xl border border-gray-200" 
              placeholder="Create a secure password" 
              placeholderTextColor="#9CA3AF"
              secureTextEntry 
              value={password} 
              onChangeText={(text) => setPassword(filterAlphanumeric(text))} 
            />
          </View>
          <TouchableOpacity 
            className={`rounded-xl py-3 sm:py-4 items-center justify-center mb-3 sm:mb-4 ${!handle || !password ? 'bg-gray-400' : 'bg-secondary'}`}
            onPress={() => setPhase(2)}
            style={{ elevation: 3 }}
            disabled={!handle || !password}
          >
            <Text className="text-white text-base sm:text-lg font-semibold">Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white rounded-xl py-3 sm:py-4 items-center justify-center border border-gray-200"
            onPress={() => setPhase(0)}
            style={{ elevation: 2 }}
          >
            <Text className="text-black text-sm sm:text-base font-semibold">Back</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput 
            className="px-3 sm:px-4 py-3 sm:py-4 mb-3 sm:mb-4 bg-white text-sm sm:text-base rounded-xl border border-gray-200" 
            placeholder="Full Name" 
            value={name} 
            onChangeText={(text) => setName(filterAlphanumericSpace(text))} 
          />
          
          <Text className="text-black text-sm sm:text-base font-medium mb-2">Date of Birth</Text>
          <View className="flex-row mb-3 sm:mb-4 gap-1 sm:gap-2">
            <View className="flex-1 bg-white rounded-xl border border-gray-200">
              <Picker selectedValue={day} onValueChange={setDay}>
                <Picker.Item label="Day" value="" />
                {Array.from({length: 31}, (_, i) => (
                  <Picker.Item key={i+1} label={String(i+1)} value={String(i+1)} />
                ))}
              </Picker>
            </View>
            <View className="flex-1 bg-white rounded-xl border border-gray-200">
              <Picker selectedValue={month} onValueChange={setMonth}>
                <Picker.Item label="Month" value="" />
                {Array.from({length: 12}, (_, i) => (
                  <Picker.Item key={i+1} label={String(i+1)} value={String(i+1)} />
                ))}
              </Picker>
            </View>
            <View className="flex-1 bg-white rounded-xl border border-gray-200">
              <Picker selectedValue={year} onValueChange={setYear}>
                <Picker.Item label="Year" value="" />
                {Array.from({length: 80}, (_, i) => (
                  <Picker.Item key={2024-i} label={String(2024-i)} value={String(2024-i)} />
                ))}
              </Picker>
            </View>
          </View>
          
          <Text className="text-black text-sm sm:text-base font-medium mb-2">Gender</Text>
          <View className="bg-white rounded-xl mb-3 sm:mb-4 border border-gray-200">
            <Picker selectedValue={gender} onValueChange={setGender}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Intersex" value="Intersex" />
              <Picker.Item label="Other" value="Other" />
              <Picker.Item label="Prefer not to say" value="Prefer not to say" />
            </Picker>
          </View>

          <TouchableOpacity 
            className={`rounded-xl py-3 sm:py-4 items-center justify-center mb-3 sm:mb-4 ${!name || !day || !month || !year || !gender ? 'bg-gray-400' : 'bg-secondary'}`}
            onPress={handleSignUp}
            style={{ elevation: 3 }}
            disabled={!name || !day || !month || !year || !gender}
          >
            <Text className="text-white text-base sm:text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white rounded-xl py-3 sm:py-4 items-center justify-center border border-gray-200"
            onPress={() => setPhase(1)}
            style={{ elevation: 2 }}
          >
            <Text className="text-black text-sm sm:text-base font-semibold">Back</Text>
          </TouchableOpacity>
        </>
      )}

      <View className="items-center mt-3 sm:mt-4">
        <Text className="text-black text-sm sm:text-base font-medium mb-2 sm:mb-3">
          Already have an account?
        </Text>
        <TouchableOpacity 
          className="bg-wierd rounded-xl py-3 sm:py-4 items-center justify-center w-full"
          onPress={() => router.push('/auth/sign-in')}
          style={{ elevation: 3 }}
        >
          <Text className="text-black text-base sm:text-lg font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}