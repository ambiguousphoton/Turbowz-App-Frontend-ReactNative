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

      const WS_URL = `ws://10.0.2.2:8280/connect-with-socket-server?user=${userID}`;

      const connect = () => {
        console.log("🔌 Connecting WebSocket:", WS_URL);

        ws.current = new WebSocket(WS_URL, [], {
          headers: {
            'Authorization': token
          }
        });

      ws.current.onopen = () => {
        console.log("🟢 WS Connected!");
        setConnected(true);
      };

      ws.current.onmessage = async (msg) => {
        console.log("📩 WS Message:", msg.data);
        const parsedMsg = JSON.parse(msg.data);
        setMessages(prev => [...prev, parsedMsg]);
        
        try {
          await saveMessage(parsedMsg, db);
        } catch (error) {
          console.error("❌ Error saving message:", error);
        }
      };

      ws.current.onerror = (err) => {
        console.log("❌ WS ERROR:", err.message);
      };

      ws.current.onclose = () => {
        console.log("🔴 WS Closed");
        setConnected(false);

        // Auto reconnect after 2 sec
        setTimeout(() => {
          console.log("♻️ Reconnecting WebSocket…");
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
      console.log("📤 Sending message:", data);
      ws.current.send(JSON.stringify(data));
      return true;
    } else {
      console.error("❌ Cannot send message: WebSocket not connected");
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
