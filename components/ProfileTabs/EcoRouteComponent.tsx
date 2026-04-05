import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import useFetch from "@/Services/useFetch";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { EcoCardComponent } from "@/components/EcoCardComponent";
import { useState, useMemo } from "react";
import { searchEcosByUser } from "@/Services/api/searchService";

interface PostsRouteProps {
  userID: number;
  headerComponent?: React.ReactNode;
}

const fetchUserEcos = searchEcosByUser;

export const EcoRoute = ({ userID, headerComponent }: PostsRouteProps) => {
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popularity'>('recent');
  const { data: ecos, loading, error } = useFetch<EcoDataInterface[]>(() => fetchUserEcos(userID), true);

  const sortedEcos = useMemo(() => {
    if (!ecos) return [];
    return [...ecos].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime();
        case 'oldest':
          return new Date(a.Created_At).getTime() - new Date(b.Created_At).getTime();
        case 'popularity':
          return b.Luv_Count - a.Luv_Count;
        default:
          return 0;
      }
    });
  }, [ecos, sortBy]);
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  const SortButtons = () => (
    <View className="flex-row justify-end items-center mt-3 mb-4 px-3">
      <View className="flex-row bg-gray-100 rounded-2xl p-0.5 shadow-sm">
        {(['recent', 'oldest', 'popularity'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortBy(option)}
            className={`px-3 py-2 mx-0.5 rounded-xl transition-all duration-200 ${
              sortBy === option 
                ? 'bg-black shadow-lg' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`text-sm font-medium capitalize ${
              sortBy === option 
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!ecos || ecos.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {headerComponent}
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No posts yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedEcos}
        keyExtractor={(item) => item.Eco_Id.toString()}
        renderItem={({ item }) => <EcoCardComponent item={item} />}
        ListHeaderComponent={
          <>
            {headerComponent}
            <SortButtons />
          </>
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};
