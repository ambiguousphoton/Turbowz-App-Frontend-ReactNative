import { SQLiteDatabase } from "expo-sqlite";
import { MessageData } from "@/interfaces/interfaces";
import { EventEmitter } from "fbemitter";

// Global event emitter for database updates
export const dbEvents = new EventEmitter();

const transformMessage = (rawMsg: any): Omit<MessageData, "Message_ID"> => {
  return {
    Message_Text: rawMsg.messageText,
    Source_ID: Number(rawMsg.sourceID),
    Destination_ID: Number(rawMsg.destinationID),
    Source_Sent_Time: "",
    links: rawMsg.links || "",
    Destination_Receive_Time: new Date().toISOString(),
    Room_ID: rawMsg.roomID
  };
};

export const initializeTables = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        Message_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Message_Text TEXT NOT NULL,
        Source_ID INTEGER NOT NULL,
        Destination_ID INTEGER NOT NULL,
        Source_Sent_Time TEXT,
        links TEXT,
        Destination_Receive_Time TEXT NOT NULL,
        Room_ID TEXT NOT NULL,
        is_read INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS rooms (
        Room_ID TEXT PRIMARY KEY,
        Source_ID INTEGER NOT NULL,
        Destination_ID INTEGER NOT NULL,
        last_opened_time TEXT,
        is_read INTEGER DEFAULT 1
      );
    `);
    
    // Add columns if they don't exist
    try {
      await db.execAsync('ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0');
    } catch (alterError) {
      // Column already exists, ignore error
    }
    
    try {
      await db.execAsync('ALTER TABLE rooms ADD COLUMN last_opened_time TEXT');
    } catch (alterError) {
      // Column already exists, ignore error
    }
    
    try {
      await db.execAsync('ALTER TABLE rooms ADD COLUMN is_read INTEGER DEFAULT 1');
    } catch (alterError) {
      // Column already exists, ignore error
    }
    
    console.log("💾 Database tables initialized");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to initialize tables:", error);
    return { success: false, error };
  }
};

export const getAllRooms = async (db: SQLiteDatabase) => {
  try {
    await initializeTables(db);
    const result = await db.getAllAsync(`
      SELECT r.*, 
             MAX(m.Destination_Receive_Time) as latest_message_time
      FROM rooms r
      LEFT JOIN messages m ON r.Room_ID = m.Room_ID
      GROUP BY r.Room_ID
      ORDER BY latest_message_time DESC
    `);
    console.log("🏠 Retrieved", result.length, "rooms");
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to get rooms:", error);
    return { success: false, error };
  }
};

export const getMessagesByRoom = async (db: SQLiteDatabase, roomID: string) => {
  try {
    await initializeTables(db);
    const result = await db.getAllAsync(
      'SELECT * FROM messages WHERE Room_ID = ? ORDER BY Destination_Receive_Time ASC',
      [roomID]
    );
    console.log("💬 Retrieved", result.length, "messages for room", roomID);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to get messages for room:", error);
    return { success: false, error };
  }
};

export const saveOutgoingMessage = async (msg: any, currentUserID: string, db: SQLiteDatabase) => {
  const outgoingMsg = {
    messageText: msg.messageText,
    sourceID: currentUserID,
    destinationID: msg.destinationID,
    roomID: msg.roomID,
    links: msg.links || ""
  };
  return await saveMessage(outgoingMsg, db);
};

export const saveMessage = async (msg: any, db: SQLiteDatabase) => {
  console.log("🔄 saveMessage called with:", msg);
  
  if (!msg?.messageText || !msg?.sourceID || !msg?.destinationID) {
    console.error("❌ Missing required fields:", { messageText: !!msg?.messageText, sourceID: !!msg?.sourceID, destinationID: !!msg?.destinationID });
    return { success: false, error: "Missing required fields" };
  }
  
  const transformedMsg = transformMessage(msg);
  console.log("💾 Saving message:", { 
    text: transformedMsg.Message_Text?.substring(0, 50) + '...', 
    from: transformedMsg.Source_ID, 
    to: transformedMsg.Destination_ID 
  });
  
  try {

    // Schema matching MessageData
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        Message_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Message_Text TEXT NOT NULL,
        Source_ID INTEGER NOT NULL,
        Destination_ID INTEGER NOT NULL,
        Source_Sent_Time TEXT,
        links TEXT,
        Destination_Receive_Time TEXT NOT NULL,
        Room_ID TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS rooms (
        Room_ID TEXT PRIMARY KEY,
        Source_ID INTEGER NOT NULL,
        Destination_ID INTEGER NOT NULL
      );
    `);

    // Use transformed message
    const messageToStore: Omit<MessageData, "Message_ID"> = {
      Message_Text: transformedMsg.Message_Text,
      Source_ID: transformedMsg.Source_ID,
      Destination_ID: transformedMsg.Destination_ID,
      Source_Sent_Time: transformedMsg.Source_Sent_Time,
      links: transformedMsg.links,
      Destination_Receive_Time: transformedMsg.Destination_Receive_Time,
      Room_ID: transformedMsg.Room_ID,
    };

    // Save room if roomID exists
    if (msg.roomID) {
      await db.runAsync(
        `INSERT OR IGNORE INTO rooms (Room_ID, Source_ID, Destination_ID, is_read) VALUES (?, ?, ?, ?)`,
        [msg.roomID, messageToStore.Source_ID, messageToStore.Destination_ID, msg.isOutgoing ? 1 : 0]
      );
      
      // Mark room as unread if it's an incoming message
      if (!msg.isOutgoing) {
        await db.runAsync(
          'UPDATE rooms SET is_read = 0 WHERE Room_ID = ?',
          [msg.roomID]
        );
      }
    }

    const result = await db.runAsync(
      `
      INSERT INTO messages
      (Message_Text, Source_ID, Destination_ID, Source_Sent_Time, links, Destination_Receive_Time, Room_ID, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        messageToStore.Message_Text,
        messageToStore.Source_ID,
        messageToStore.Destination_ID,
        messageToStore.Source_Sent_Time,
        messageToStore.links,
        messageToStore.Destination_Receive_Time,
        messageToStore.Room_ID,
        0
      ]
    );

    console.log("✅ Message saved with ID:", result.lastInsertRowId);
    
    // Emit events for database updates
    dbEvents.emit('messageAdded', { roomID: messageToStore.Room_ID, messageID: result.lastInsertRowId });
    dbEvents.emit('roomUpdated', { roomID: messageToStore.Room_ID });
    
    return { success: true, data: messageToStore };
  } catch (error) {
    console.error("❌ Failed to save message:", error);
    return { success: false, error };
  }
};

export const updateRoomOpenTime = async (db: SQLiteDatabase, roomID: string, currentUserID: number) => {
  try {
    await db.runAsync(
      'UPDATE rooms SET last_opened_time = ?, is_read = 1 WHERE Room_ID = ?',
      [new Date().toISOString(), roomID]
    );
    console.log("✅ Room open time updated for:", roomID);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to update room open time:", error);
    return { success: false, error };
  }
};

export const markMessagesAsRead = async (db: SQLiteDatabase, roomID: string, currentUserID: number) => {
  try {
    await db.runAsync(
      'UPDATE messages SET is_read = 1 WHERE Room_ID = ? AND Destination_ID = ? AND is_read = 0',
      [roomID, currentUserID]
    );
    console.log("✅ Messages marked as read for room:", roomID);
    dbEvents.emit('roomUpdated', { roomID });
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to mark messages as read:", error);
    return { success: false, error };
  }
};
