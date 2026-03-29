import { getBot } from "@/lib/bot";

export const startTyping = async (
  threadId: string,
  text: string
): Promise<void> => {
  "use step";

  // GitLab doesn't have a typing indicator - skip
  if (threadId.startsWith("gitlab:")) {
    return;
  }

  const bot = await getBot();
  const adapter = bot.getAdapter("github");
  await adapter.startTyping(threadId, text);
};
