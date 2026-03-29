import { env } from "@/lib/env";

export const getGitLabToken = async (): Promise<string> => {
  "use step";

  if (!env.GITLAB_TOKEN) {
    throw new Error("Missing GITLAB_TOKEN environment variable");
  }

  return env.GITLAB_TOKEN;
};
