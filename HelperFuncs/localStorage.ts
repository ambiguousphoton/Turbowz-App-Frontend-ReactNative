import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { UserDataInterface } from "@/interfaces/interfaces";




export async function SaveToken(key: string, value: string) {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(key, stringValue);
  } else {
    // fallback for web
    localStorage.setItem(key, stringValue);
  }
}

export async function SaveUser(userData: UserDataInterface) {
  console.log('SaveUser - storing userData:', userData);
  await SaveToken('userData', JSON.stringify(userData));
}

export async function GetUser(): Promise<UserDataInterface | null> {
  const userData = await GetToken('userData');
  console.log('GetUser - raw userData from storage:', userData);
  const parsed = userData ? JSON.parse(userData) : null;
  console.log('GetUser - parsed userData:', parsed);
  return parsed;
}

export async function GetToken(key: string): Promise<string | null> {
  if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
    return await SecureStore.getItemAsync(key);
  } else {
    // fallback for web
    return localStorage.getItem(key);
  }
}


export async function DeleteToken(key: string) {
  if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(key);
  } else {
    // fallback for web
    localStorage.removeItem(key);
  }
}


const SEARCH_KEY = "search_history";

// Save a new search
export const saveSearch = async (query: string) => {
  try {
    const history = await getSearchHistory();
    const updated = [query, ...history.filter(item => item !== query)]; // avoid dupes
    await SecureStore.setItemAsync(SEARCH_KEY, JSON.stringify(updated.slice(0, 10))); // limit 10
  } catch (e) {
    console.error("Error saving search", e);
  }
};

// Get search history
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const data = await SecureStore.getItemAsync(SEARCH_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading search history", e);
    return [];
  }
};

// Remove single item
export const removeSearch = async (query: string) => {
  const history = await getSearchHistory();
  const updated = history.filter(item => item !== query);
  await SecureStore.setItemAsync(SEARCH_KEY, JSON.stringify(updated));
};

// Clear all
export const clearSearchHistory = async () => {
  await SecureStore.deleteItemAsync(SEARCH_KEY);
};