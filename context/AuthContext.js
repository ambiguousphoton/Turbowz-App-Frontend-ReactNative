import { useContext, createContext, useState, useEffect, useRef } from "react";
import { SafeAreaView, Text } from "react-native";
import { SaveToken, GetToken, DeleteToken, SaveUser, GetUser } from "@/HelperFuncs/localStorage";
const AuthContext = createContext()

const AuthProvider = ({children})=> {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(false );
    const [user, setUser] = useState(false);
    const ws = useRef(null);



    useEffect(() => {
        const checkAuthStatus = async () => {
        const token = await GetToken('jwt');
        if (token) {
            const userData = await GetUser();
            setSession(true);

        } else {
            setSession(false);
            setUser(null);
        }
        setLoading(false);
        console.log("jwt received")
        };
        checkAuthStatus();
    }, []);

  





    const signInSession = async (token, userData) => {
        console.log('AuthContext signInSession called with:', userData);
        console.log('AuthContext - about to call SaveUser with:', userData);
        await SaveToken('jwt', token);
        await SaveUser(userData);
        console.log('AuthContext - SaveUser completed');
        setSession(true);
        setUser(userData);
        console.log('AuthContext signInSession completed');
    };

    const signOutSession = async () => {
        await DeleteToken('jwt');
        await DeleteToken('userData');
        setSession(false);
        setUser(null);
    };

    const getUserFromStorage = async () => {
        return await GetUser();
    };

    const constexData = {
        session, 
        user, 
        signInSession, 
        signOutSession, 
        getUserFromStorage,

    }
    return (
    <AuthContext.Provider value={constexData}>
        {loading ? (<SafeAreaView><Text>Loading...</Text></SafeAreaView>) : (children)}
    </AuthContext.Provider>
    )
} 


const useAuth = () => {
    return useContext(AuthContext);
}


export {AuthProvider, useAuth, AuthContext}