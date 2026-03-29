import { useAuth } from '@/context/AuthContext'
import {Redirect, Tabs} from 'expo-router'
import { ImageBackground, Image, Text, View, TouchableOpacity, SafeAreaView } from 'react-native'
import { useState } from 'react'
import CreateBottomSheet from '@/components/CreateBottomSheet'


const TabIcon = ({focused, icon, title, onPress} :any) => {
    const Component = onPress ? TouchableOpacity : View;
    return (
        <Component 
            style={{width: 60, height: 40, borderRadius: 20}} 
            className={`mt-4 justify-center items-center ${
                focused ? 'bg-white ' : 'bg-transparent'
            }`}
            onPress={onPress}
        >
            <Image source={icon} style={{width: 27, height: 27}} />
        </Component>
    )
}




export default function RootLayout() {
    const {session}  = useAuth()
    const [showCreateSheet, setShowCreateSheet] = useState(false)
    
    if (!session){
        return <Redirect href='/auth/Welcome'></Redirect>
    }
  
  
    return (
    <SafeAreaView style={{ flex: 1 }}>
    <Tabs 
      backBehavior="none"
      screenOptions={{
        tabBarShowLabel: false,
            tabBarItemStyle: {
                // borderTopWidth:1,
                width: 60,
                height: 90,
                paddingBottom: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "#DBFCFF",  // 👈 set your own background (important!)
                // borderTopWidth: 0,          // 👈 your custom border
                // borderTopColor: "black",
            },
            tabBarStyle:{
               overflow:'hidden',
               borderTopWidth: 0,
                // elevation: 0,
            },

    }} >

        <Tabs.Screen
            name='enrich'
            options={{
                title: 'Enrich',
                headerShown: false,
                tabBarIcon: ({focused}) => (<TabIcon
                focused={focused}
                icon={require('../../assets/images/ExploreIcon.png')}
                title="Enrich"
                />)
            }}
        />

        <Tabs.Screen
            name='index'
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({focused}) => (<TabIcon
                focused={focused}
                icon={require('../../assets/images/VideosIcon.png')}
                title="Home"
                />)
            }}
        />



        <Tabs.Screen
            name='create'
            options={{
                title: 'Create',
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <TabIcon
                        focused={focused}
                        icon={require('../../assets/images/CreateIcon.png')}
                        title="Create"
                        onPress={() => setShowCreateSheet(true)}
                    />
                )
            }}
        />

        <Tabs.Screen
            name='chats'
            options={{
                title: 'Chats',
                headerShown: false,
                tabBarIcon: ({focused}) => (<TabIcon
                focused={focused}
                icon={require('../../assets/images/ChatsIcon.png')}
                title="Chats"
                />)
            }}
        />

        <Tabs.Screen
            name='myprofile'
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({focused}) => (<TabIcon
                focused={focused}
                icon={require('../../assets/images/ProfileIcon.png')}
                title="Profile"
                />)
            }}
        />
    </Tabs>
    
    <CreateBottomSheet 
        visible={showCreateSheet} 
        onClose={() => setShowCreateSheet(false)} 
    />
    </SafeAreaView>
  )
}
