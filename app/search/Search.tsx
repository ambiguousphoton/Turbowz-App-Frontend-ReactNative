import { View, TextInput, Image, Keyboard, FlatList,Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { saveSearch, getSearchHistory, removeSearch } from '../../HelperFuncs/localStorage';


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const clearingRef = useRef(false);
  const searchingRef = useRef(false);

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

  const handleClearSearch = () => {
    clearingRef.current = true;
    setSearchQuery('');
    inputRef.current?.blur();
    setTimeout(() => { clearingRef.current = false; }, 100);
  };

  const handleDeleteHistory = async (item: string) => {
    await removeSearch(item);
    const updatedHistory = await getSearchHistory();
    setHistory(updatedHistory);
  };

  const handleSearch = async (searchTerm: string) => {
    if (searchingRef.current) return;
    searchingRef.current = true;
    
    if (searchTerm.trim()) {
      await saveSearch(searchTerm.trim());
    }
    Keyboard.dismiss(); 
    router.replace({
      pathname: "/(tabs)",
      params: { q: searchTerm }
    });
    
    setTimeout(() => { searchingRef.current = false; }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className='bg-white py-2 border-b-2 border-secondary flex-row items-center px-4'>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
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
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              setIsSearchFocused(false);
            }}
            autoFocus
          />
          {(searchQuery.length > 0 || isSearchFocused) && (
            <TouchableOpacity
              onPress={handleClearSearch}
              className="p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={require("../../assets/images/CrossIcon.png")}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Render search results here */}
      <View className="flex-1">
        <FlatList
        data={history.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity
              className="flex-1 flex-row items-center"
              onPress={() => handleSearch(item)}
              activeOpacity={0.7}>
              <Image
                source={require("../../assets/images/RetryIcon.png")}
                className="w-4 h-4 mr-3"
                resizeMode="contain"
              />
              <Text className="text-base text-black">{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteHistory(item)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={require("../../assets/images/CrossIcon.png")}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
        />
      </View>
    </SafeAreaView>
  );
}
