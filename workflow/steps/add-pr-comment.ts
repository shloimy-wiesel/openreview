import { getBot } from "@/lib/bot";
import { parseGitLabThreadId, postMRNote } from "@/lib/gitlab";

export const addPRComment = async (
  threadId: string,
  body: string
): Promise<void> => {
  "use step";

  const gitlab = parseGitLabThreadId(threadId);

  if (gitlab) {
    await postMRNote(gitlab.projectId, gitlab.mrIid, body);
    return;
  }

  const bot = await getBot();
  const adapter = bot.getAdapter("github");
  await adapter.postMessage(threadId, { markdown: body });
};
