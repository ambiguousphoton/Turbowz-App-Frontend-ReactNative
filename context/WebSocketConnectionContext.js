import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { GetToken } from "@/HelperFuncs/localStorage";
import { saveMessage } from "@/HelperFuncs/MessageStorage";

const WebSocketContext = createContext(null);
export const useWS = () => useContext(WebSocketContext);

function WebSocketProviderInner({ userID, children }) {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const db = useSQLiteContext();

  useEffect(() => {
    if (!userID) return;

    const connectWithAuth = async () => {
      const token = await GetToken('jwt');
      if (!token) return;

      const WS_BASE = process.env.EXPO_PUBLIC_TURBOWZ_ENV === 'test'
        ? 'ws://10.0.2.2:8280'
        : 'wss://turbowz.com/api/chat';
      const WS_URL = `${WS_BASE}/connect-with-socket-server?user=${userID}`;

      const connect = () => {
        ws.current = new WebSocket(WS_URL, [], {
          headers: {
            'Authorization': token
          }
        });

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onmessage = async (msg) => {
        const parsedMsg = JSON.parse(msg.data);
        setMessages(prev => [...prev, parsedMsg]);
        
        try {
          await saveMessage(parsedMsg, db);
        } catch (error) {
          // Error saving message
        }
      };

      ws.current.onerror = (err) => {
        // WebSocket error
      };

      ws.current.onclose = () => {
        setConnected(false);

        // Auto reconnect after 2 sec
        setTimeout(() => {
          connect();
        }, 2000);
      };
    };

      connect();
    };

    connectWithAuth();

    return () => {
      ws.current?.close();
    };
  }, [userID]);

    const sendMessage = (data) => {
    if (ws.current && connected) {
      ws.current.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws: ws.current, connected, messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function WebSocketProvider({ userID, children }) {
  return (
    <SQLiteProvider databaseName="messages.db">
      <WebSocketProviderInner userID={userID}>
        {children}
      </WebSocketProviderInner>
    </SQLiteProvider>
  );
}
