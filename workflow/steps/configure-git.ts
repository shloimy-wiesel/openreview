import { Sandbox } from "@vercel/sandbox";

import { parseError } from "@/lib/error";
import { getGitLabBaseUrl } from "@/lib/gitlab";

const configureRemoteAndIdentity = async (
  sandbox: Sandbox,
  authenticatedUrl: string,
  token: string,
  provider: "github" | "gitlab"
): Promise<void> => {
  await sandbox.runCommand("git", [
    "remote",
    "set-url",
    "origin",
    authenticatedUrl,
  ]);

  await sandbox.runCommand("git", [
    "config",
    "--local",
    "core.hooksPath",
    "/dev/null",
  ]);

  await sandbox.runCommand("git", ["config", "user.name", "openreview[bot]"]);

  const emailHost =
    provider === "gitlab" ? "users.noreply.gitlab.com" : "users.noreply.github.com";

  await sandbox.runCommand("git", [
    "config",
    "user.email",
    `openreview[bot]@${emailHost}`,
  ]);

  if (provider === "github") {
    await sandbox.runCommand("bash", [
      "-c",
      `export PATH="$HOME/.local/bin:$PATH" && echo "${token}" | gh auth login --with-token`,
    ]);
  } else {
    const gitlabHost = new URL(getGitLabBaseUrl()).hostname;
    await sandbox.runCommand("bash", [
      "-c",
      `export PATH="$HOME/.local/bin:$PATH" && glab auth login --hostname ${gitlabHost} --token ${token}`,
    ]);
  }
};

export const configureGit = async (
  sandboxId: string,
  repoFullName: string,
  token: string,
  provider: "github" | "gitlab" = "github"
): Promise<void> => {
  "use step";

  const sandbox = await Sandbox.get({ sandboxId }).catch((error: unknown) => {
    throw new Error(
      `[configureGit] Failed to get sandbox: ${parseError(error)}`,
      { cause: error }
    );
  });

  let authenticatedUrl: string;

  if (provider === "gitlab") {
    const baseUrl = getGitLabBaseUrl();
    authenticatedUrl = `${baseUrl.replace("://", `://oauth2:${token}@`)}/${repoFullName}.git`;
  } else {
    authenticatedUrl = `https://x-access-token:${token}@github.com/${repoFullName}.git`;
  }

  try {
    await configureRemoteAndIdentity(sandbox, authenticatedUrl, token, provider);
  } catch (error) {
    throw new Error(`Failed to configure git: ${parseError(error)}`, {
      cause: error,
    });
  }
};
