import { Card, CardHeader } from "@/components/ui/card";
import { Message as MessageType } from "ai";
import { Bot, User } from "lucide-react";
import MdRender from "./MdRender";

export default function Message({ message }: { message: MessageType }) {
  const { role, content } = message;
  if (role === "assistant") {
    const { thinking, response } = parseAssistantContent(content);

    return (
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <Bot />
          Assistant:
        </div>
        {thinking && (
          <div className="pl-4 border-l-2 border-gray-300 text-sm text-gray-500 mb-2 whitespace-pre-wrap">
            {thinking}
          </div>
        )}
        {response && <MdRender content={response} />}
      </div>
    );
  }
  return (
    <Card className="whitespace-pre-wrap">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User size={36} />
          {content}
        </div>
      </CardHeader>
    </Card>
  );
}

// Helper function to parse assistant content
function parseAssistantContent(content: string) {
  // Fast check for think tag presence
  if (!content.startsWith("<think>")) {
    return { thinking: "", response: content };
  }

  const endThinkIndex = content.indexOf("</think>");

  // Handle complete think tag
  if (endThinkIndex > -1) {
    const thinking = content.slice(7, endThinkIndex); // 7 is length of '<think>'
    const response = content.slice(endThinkIndex + 8).trimStart(); // +8 for '</think>'
    return { thinking, response };
  }

  // Incomplete think tag case
  return {
    thinking: content.slice(7),
    response: "",
  };
}
