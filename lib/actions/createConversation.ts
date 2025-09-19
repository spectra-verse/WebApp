"use server";

import { insertConversation } from "@/lib/db/conversations";
import { coreUserMessageSchema } from "ai";
// import { generateText } from "ai";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
// import { ollama } from "../ollama/client";

async function generateConversationName(userMessage: string) {
  return `${userMessage.substring(0, 15)}...`;
  // we need a fast model for this
  // const model = "llama3.2";
  // const nameResult = await generateText({
  //   model: ollama(model),
  //   prompt: `You are an assistant that interacts with a ai chat applications, your job is to assign a short title/name to conversations, based on the user question
  //    The title should be in from perspective of the user asking the question, return only the title, in plain text without ""
  //    User Question : ${userMessage}
  //   `,
  // });
  // return nameResult.text;
}

export async function createConversation(message: string, model: string) {
  const conversationId = randomUUID();
  const conversationName = await generateConversationName(message);

  insertConversation({
    id: conversationId,
    name: conversationName,
    model: model,
  });

  // Base64 encode the message parameter
  const encodedMessage = Buffer.from(message).toString("base64");

  redirect(
    `/conversations/${conversationId}?q=${encodedMessage}&model=${model}`
  );
}
