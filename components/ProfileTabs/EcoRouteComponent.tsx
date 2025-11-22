import { View, Text, FlatList, ActivityIndicator } from "react-native";
import useFetch from "@/Services/useFetch";
import { EcoDataInterface } from "@/interfaces/interfaces";
import { EcoCardComponent } from "@/components/EcoCardComponent";

interface PostsRouteProps {
  userID: number;
  headerComponent?: React.ReactNode;
}

const fetchUserEcos = async (userID: number): Promise<EcoDataInterface[]> => {
  console.log("fetchUserEcos - userID:", userID)
  const response = await fetch(`http://10.0.2.2:8082/search-eco-by-user?userID=${userID}`, {
    headers: { Accept: "application/json" },
  });
  console.log(response);
  
  if (!response.ok) throw new Error("Failed to fetch user ecos");

  const data = await response.json();

  if (!Array.isArray(data)) return [];

  return data.map((eco: any) => ({
    Eco_Id: eco.Eco_Id,
    Eco_Url: eco.Eco_Url,
    Eco_Text: eco.Eco_Text,
    Images_Count: eco.Images_Count,
    Created_At: eco.Created_At,
    View_Count: eco.View_Count,
    Comment_Count: eco.Comment_Count,
    Luv_Count: eco.Luv_Count,
    Tags: eco.Tags || [],
    Uploader_ID: eco.Uploader_ID,
    Uploader_Name: eco.Uploader_Name,
    Uploader_Handle: eco.Uploader_Handle,
    Save_Count: eco.Saves_Count || 0,
    Already_Luved: eco.Already_Luved ?? false,
  }));
};

export const EcoRoute = ({ userID, headerComponent }: PostsRouteProps) => {
  const { data: ecos, loading, error } = useFetch<EcoDataInterface[]>(() => fetchUserEcos(userID), true);
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
        data={ecos}
        keyExtractor={(item) => item.Eco_Id.toString()}
        renderItem={({ item }) => <EcoCardComponent item={item} />}
        ListHeaderComponent={headerComponent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};
