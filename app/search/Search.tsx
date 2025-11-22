import { View, TextInput, Image, Keyboard, FlatList,Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { saveSearch, getSearchHistory } from '../../HelperFuncs/localStorage';


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const h = await getSearchHistory();
      setHistory(h);
    }
    loadHistory();
    
    // Focus input after component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.trim()) {
      await saveSearch(searchTerm.trim());
    }
    Keyboard.dismiss(); 
    router.push({
      pathname: "/",
      params: { q: searchTerm }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className='bg-white py-2 border-b-2 border-secondary flex-row items-center px-4'>
        <TouchableOpacity onPress={() => router.back()}>
          <Image 
            source={require('../../assets/images/backIcon.png')} 
            className="w-6 h-6 mr-4" 
          />
        </TouchableOpacity>
        <View className='flex-row items-center rounded-3xl px-3 py-1 flex-1 border border-gray-300'>
          <TextInput
            ref={inputRef}
            className="flex-1 px-2 py-2 text-base text-black"
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#727272"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
          />
        </View>
      </View>

      {/* Render search results here */}
      <View className="flex-1">
        <FlatList
        data={history}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 py-3 border-b border-gray-200"
            onPress={() => handleSearch(item)}>
            <Text className="text-base text-black">{"# " + item}</Text>
          </TouchableOpacity>
        )}
        />
      </View>
    </SafeAreaView>
  );
}
