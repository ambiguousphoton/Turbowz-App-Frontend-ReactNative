import {Text, View, Image, Pressable} from 'react-native'
import { Link } from 'expo-router';

const TurbowConnectComponent = () => {
    return (
        <Link href={`/chats/${1}`} asChild>
            <Pressable className="flex-row items-center p-4 bg-white rounded-tr-3xl rounded-tl-3xl  border-b border-gray-100">
                    <Image 
                        source={require("../assets/images/TurboiIcon.png")} 
                        className="w-12 h-12 " 
                        resizeMode="cover" 
                    />
        
                <View className="ml-4 flex-1 justify-center">
                    <Text className="text-base font-semibold" numberOfLines={1}>
                       Turboi
                    </Text>
                    <Text className="text-sm text-primary-200" numberOfLines={1}>
                          Connect with Turboi for help.
                    </Text>
                </View>
            </Pressable>
        </Link>
    )
}

export default TurbowConnectComponent;