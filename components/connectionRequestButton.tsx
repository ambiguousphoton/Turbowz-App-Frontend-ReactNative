import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { GetToken } from "@/HelperFuncs/localStorage";

interface ConnectionRequestButtonProps {
    userID: string;
}

const ConnectionRequestButton = ({ userID }: ConnectionRequestButtonProps) => {
    const { sendMessage, user, wsConnected } = useAuth();

    const sendConnectionRequest = async () => {
        console.log('Button clicked, sending message to userID:', userID);
        const message = {
            Type: "Connection-Request",
            ReceiverID: userID,
        };
        console.log('Message to send:', message);
        sendMessage(message);
    };

    return (
        <TouchableOpacity 
            onPress={sendConnectionRequest}
            className="bg-blue-500 px-2 py-1 rounded-sm self-center ml-auto"
        >
            <Text className="text-white font-medium text-xs">Connect</Text>
        </TouchableOpacity>
    );
};

export default ConnectionRequestButton;