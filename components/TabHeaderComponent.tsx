import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface TabHeaderComponentProps {
    tabs: string[];
    activeTab: number;
    onTabPress: (index: number) => void;
}

const TabHeaderComponent: React.FC<TabHeaderComponentProps> = ({ tabs, activeTab, onTabPress }) => {
    return (
        <View className="h-12 justify-center border-b border-gray-300 bg-white items-center">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
            >
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 border-b-4  ${
                            activeTab === index ? 'border-primary-150' : 'border-transparent'
                        }`}
                        onPress={() => onTabPress(index)}
                    >
                        <Text className={`text-gray-500 ${
                            activeTab === index ? 'font-semibold' : ''
                        }`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default TabHeaderComponent;