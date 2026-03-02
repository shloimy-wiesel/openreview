import { bot } from "@/lib/bot";

export const startTyping = async (
  threadId: string,
  text: string
): Promise<void> => {
  "use step";

  const adapter = bot.getAdapter("github");
  await adapter.startTyping(threadId, text);
};
