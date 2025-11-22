import { GetToken } from "@/HelperFuncs/localStorage";
import React, { useState, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Alert, Platform, TouchableOpacity, Image, Animated } from "react-native";

export default function EcoCommentInputComponent({ ecoID, onCommentAdded }: { ecoID: number; onCommentAdded?: () => void }) {
    const [text, setText] = useState("");
    const scaleAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (text.trim()) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(scaleAnim, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    }, [text]);

    const handlePost = async () => {
        if (!text.trim()) {
            Alert.alert("Error", "Please enter some text before posting.");
            return;
        }

        try {
            const token = await GetToken('jwt');
            if (!token) {
                Alert.alert("Error", "Authentication required.");
                return;
            }

            const response = await fetch("http://10.0.2.2:7200/push-eco-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": token
                },
                body: `parentEcoID=${ecoID}&commentText=${encodeURIComponent(text)}`,
            });

            if (response.ok) {
                setText("");
                onCommentAdded?.();
            } else {
                Alert.alert("Error", "Failed to post comment.");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        }
    };

    return (
        <View className="absolute bottom-0 left-0 right-0">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View className="p-3">
                    <View className="flex-row items-center bg-white border border-select rounded-2xl px-2 py-1">
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder="Add a comment..."
                            className="flex-1 text-base px-3 py-2"
                            multiline
                        />
                        {text.trim() && (
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <TouchableOpacity 
                                    className="bg-primary-150 rounded-xl p-3 ml-2"
                                    onPress={handlePost}
                                >
                                    <Image 
                                        source={require("../assets/images/sendIcon.png")} 
                                        className="w-5 h-5" 
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}