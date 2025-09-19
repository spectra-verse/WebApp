import { db } from "./init";
import { MessageData } from "./types";

export function insertConversationMessages(messages: MessageData[]) {
  const stmt = db.prepare(
    "INSERT INTO messages (id, content, conversationId, role) VALUES (?, ?, ?, ?)"
  );

  const insertMessages = db.transaction((msgs: MessageData[]) => {
    for (const msg of msgs)
      stmt.run(msg.id, msg.content, msg.conversationId, msg.role);
  });
  return insertMessages(messages);
}
