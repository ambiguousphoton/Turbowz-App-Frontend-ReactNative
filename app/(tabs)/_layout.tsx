import { useAuth } from '@/context/AuthContext'
import {Redirect, Tabs} from 'expo-router'
import { ImageBackground, Image, Text, View, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import CreateBottomSheet from '@/components/CreateBottomSheet'


const TabIcon = ({focused, icon, title, onPress} :any) => {
    const Component = onPress ? TouchableOpacity : View;
    return (
        <Component 
            style={{width: 40, height: 40, borderRadius: 20}} 
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
    <>
    <Tabs 
      backBehavior="none"
      screenOptions={{tabBarShowLabel: false,
            tabBarItemStyle: {
                width: 60,
                height:90,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "#DBFCFF",  // 👈 set your own background (important!)
                borderTopWidth: 0,          // 👈 your custom border
                borderTopColor: "black",
            },
            tabBarStyle:{
               overflow:'hidden',
               position:'absolute',        
               borderTopWidth: 0,       
            //    borderTopColor: 'white',
               height: 79,

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
    </>
  )
}
