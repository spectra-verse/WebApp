"use server";

import { insertConversation } from "@/lib/db/conversations";
// import { generateText } from "ai";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to create a conversation");
  }

  const conversationId = randomUUID();
  const conversationName = await generateConversationName(message);

  await insertConversation({
    id: conversationId,
    userId: session.user.id,
    name: conversationName,
    model: model,
  });

  // Base64 encode the message parameter
  const encodedMessage = Buffer.from(message).toString("base64");

  redirect(
    `/conversations/${conversationId}?q=${encodedMessage}&model=${model}`,
  );
}
