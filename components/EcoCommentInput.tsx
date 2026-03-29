import { GetToken } from "@/HelperFuncs/localStorage";
import React, { useState, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Alert, Platform, TouchableOpacity, Image, Animated, Text } from "react-native";

export default function EcoCommentInputComponent({ ecoID, onCommentAdded, parentCommentID }: { ecoID: number; onCommentAdded?: () => void; parentCommentID?: string | number }) {
    const [text, setText] = useState("");
    const scaleAnim = useState(new Animated.Value(0))[0];
    const hasContextFlag = text.includes('#CF');

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

            const bodyParams = new URLSearchParams({
                parentEcoID: ecoID.toString(),
                commentText: text,
                hasContextFlag: hasContextFlag.toString()
            });
            
            if (parentCommentID) {
                bodyParams.append('parentCommentID', parentCommentID.toString());
            }

            const response = await fetch("http://10.0.2.2:7200/push-eco-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": token
                },
                body: bodyParams.toString(),
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
                    {hasContextFlag && (
                        <View className="bg-secondary-100 border border-secondary-300 rounded-lg p-2 mb-2">
                            <Text className="text-secondary text-xs font-medium">Context Flag detected</Text>
                        </View>
                    )}
                    <View className="flex-row items-center bg-white border border-select rounded-2xl px-2 py-1">
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder={parentCommentID ? "Reply to comment... (Use #CF to highlight)" : "Add a comment... (Use #CF to highlight)"}
                            className="flex-1 text-base px-3 py-2"
                            multiline
                        />
                        {text.trim() && (
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <TouchableOpacity 
                                    className={`${hasContextFlag ? 'bg-secondary' : 'bg-primary-150'} rounded-xl p-3 ml-2`}
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