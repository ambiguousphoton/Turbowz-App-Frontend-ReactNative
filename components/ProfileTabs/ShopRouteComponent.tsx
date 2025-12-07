import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import useFetch from '@/Services/useFetch';
import { GetToken } from '@/HelperFuncs/localStorage';
import ShopItem from '../ShopItem';

interface ShopRouteProps {
  userID: number;
}

const fetchUserProducts = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:8200/get-user-products?limit=10&offset=${offset}`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

const fetchPurchaseHistory = async (offset: number = 0) => {
  const token = await GetToken('jwt');
  const response = await fetch(`http://10.0.2.2:8200/get-purchase-history?limit=10&offset=${offset}`, {
    headers: {
      'Authorization': token || ''
    }
  });
  return response.json();
};

export const ShopRoute = ({ userID }: ShopRouteProps) => {
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [isPurchasesExpanded, setIsPurchasesExpanded] = useState(false);
  
  const { data: products, loading: productsLoading } = useFetch(() => fetchUserProducts(0), true);
  const { data: purchases, loading: purchasesLoading } = useFetch(() => fetchPurchaseHistory(0), true);

  const placeholderProducts = [
    { id: '1', name: 'Eco Water Bottle', price: 25.99, image: 'https://via.placeholder.com/150', rating: 4.8, category: 'Lifestyle' },
    { id: '2', name: 'Solar Charger', price: 49.99, image: 'https://via.placeholder.com/150', rating: 4.5, category: 'Electronics' },
    { id: '3', name: 'Bamboo Phone Case', price: 19.99, image: 'https://via.placeholder.com/150', rating: 4.7, category: 'Accessories' },
    { id: '4', name: 'Organic Cotton Tote', price: 15.99, rating: 4.6, category: 'Fashion' },
    { id: '5', name: 'LED Plant Light', price: 35.99, rating: 4.4, category: 'Home & Garden' }
  ];

  const placeholderPurchases = [
    { id: '1', productName: 'Eco Water Bottle', amount: 25.99, date: '2024-01-15' },
    { id: '2', productName: 'Solar Charger', amount: 49.99, date: '2024-01-10' }
  ];

  if (productsLoading || purchasesLoading) return <Text className="px-2">Loading shop...</Text>;

  return (
    <View className="px-2 my-3">
      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2"
        onPress={() => setIsProductsExpanded(!isProductsExpanded)}
      >
        <Text className="text-lg font-semibold">User Products</Text>
        <Text className="text-gray-500">{isProductsExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isProductsExpanded && (
(products || placeholderProducts)?.length > 0 ? (
          <FlatList
            data={products || placeholderProducts}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShopItem 
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                rating={item.rating}
                category={item.category}
                onPress={() => console.log('Product pressed:', item.id)}
              />
            )}
          />
        ) : (
          <Text className="px-2 text-gray-500 mb-4">No products found</Text>
        )
      )}

      <TouchableOpacity 
        className="flex-row items-center justify-between py-2 mb-2 mt-4"
        onPress={() => setIsPurchasesExpanded(!isPurchasesExpanded)}
      >
        <Text className="text-lg font-semibold">Purchase History</Text>
        <Text className="text-gray-500">{isPurchasesExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isPurchasesExpanded && (
(purchases || placeholderPurchases)?.length > 0 ? (
          <FlatList
            data={purchases || placeholderPurchases}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="p-3 mb-2 bg-gray-50 rounded-lg">
                <Text className="font-medium">{item.productName}</Text>
                <Text className="text-gray-600">${item.amount}</Text>
                <Text className="text-xs text-gray-400">{item.date}</Text>
              </View>
            )}
          />
        ) : (
          <Text className="px-2 text-gray-500">No purchases found</Text>
        )
      )}
    </View>
  );
};