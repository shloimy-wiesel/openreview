import { Sandbox } from "@vercel/sandbox";

import { parseError } from "@/lib/error";
import { getGitLabBaseUrl } from "@/lib/gitlab";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const createSandbox = async (
  repoFullName: string,
  token: string,
  branch: string,
  provider: "github" | "gitlab" = "github"
): Promise<string> => {
  "use step";

  try {
    const isGitLab = provider === "gitlab";
    const repoBaseUrl = isGitLab
      ? getGitLabBaseUrl()
      : "https://github.com";
    const username = isGitLab ? "oauth2" : "x-access-token";

    const sandbox = await Sandbox.create({
      source: {
        depth: 1,
        password: token,
        revision: branch,
        type: "git",
        url: `${repoBaseUrl}/${repoFullName}.git`,
        username,
      },
      timeout: FIVE_MINUTES_MS,
    });

    return sandbox.sandboxId;
  } catch (error) {
    throw new Error(`Failed to create sandbox: ${parseError(error)}`, {
      cause: error,
    });
  }
};
