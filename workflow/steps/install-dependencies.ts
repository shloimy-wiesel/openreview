import { Sandbox } from "@vercel/sandbox";

import { parseError } from "@/lib/error";

const detectInstallCommand = async (
  sandbox: Sandbox
): Promise<{ args: string[]; cmd: string }> => {
  const checks = [
    {
      args: ["install", "--frozen-lockfile"],
      cmd: "bun",
      lockfile: "bun.lock",
    },
    {
      args: ["install", "--frozen-lockfile"],
      cmd: "pnpm",
      lockfile: "pnpm-lock.yaml",
    },
    {
      args: ["install", "--frozen-lockfile"],
      cmd: "yarn",
      lockfile: "yarn.lock",
    },
  ];

  for (const { args, cmd, lockfile } of checks) {
    const result = await sandbox.runCommand("test", ["-f", lockfile]);
    if (result.exitCode === 0) {
      return { args, cmd };
    }
  }

  return { args: ["install"], cmd: "npm" };
};

const installGitHubCLI = async (sandbox: Sandbox): Promise<void> => {
  const result = await sandbox.runCommand("bash", [
    "-c",
    "command -v gh >/dev/null 2>&1 || (" +
      "curl -sLO https://github.com/cli/cli/releases/download/v2.62.0/gh_2.62.0_linux_amd64.tar.gz &&" +
      " tar xzf gh_2.62.0_linux_amd64.tar.gz &&" +
      " mkdir -p ~/.local/bin &&" +
      " cp -f gh_2.62.0_linux_amd64/bin/gh ~/.local/bin/ &&" +
      " rm -rf gh_2.62.0_linux_amd64*)",
  ]);

  if (result.exitCode !== 0) {
    const stderr = await result.stderr();
    const stdout = await result.stdout();
    throw new Error(
      `Failed to install GitHub CLI (exit ${result.exitCode}): ${stderr || stdout}`
    );
  }
};

const installGitLabCLI = async (sandbox: Sandbox): Promise<void> => {
  const result = await sandbox.runCommand("bash", [
    "-c",
    "command -v glab >/dev/null 2>&1 || (" +
      "curl -sLO https://gitlab.com/gitlab-org/cli/-/releases/v1.47.0/downloads/glab_1.47.0_linux_amd64.tar.gz &&" +
      " tar xzf glab_1.47.0_linux_amd64.tar.gz &&" +
      " mkdir -p ~/.local/bin &&" +
      " cp -f bin/glab ~/.local/bin/ &&" +
      " rm -rf glab_1.47.0_linux_amd64.tar.gz bin)",
  ]);

  if (result.exitCode !== 0) {
    const stderr = await result.stderr();
    const stdout = await result.stdout();
    throw new Error(
      `Failed to install GitLab CLI (exit ${result.exitCode}): ${stderr || stdout}`
    );
  }
};

export const installDependencies = async (
  sandboxId: string,
  provider: "github" | "gitlab" = "github"
): Promise<void> => {
  "use step";

  let sandbox: Sandbox | null = null;

  try {
    sandbox = await Sandbox.get({ sandboxId });
  } catch (error) {
    throw new Error(
      `[installDependencies] Failed to get sandbox: ${parseError(error)}`,
      { cause: error }
    );
  }

  try {
    if (provider === "gitlab") {
      await installGitLabCLI(sandbox);
    } else {
      await installGitHubCLI(sandbox);
    }

    // Install project dependencies
    const { cmd, args } = await detectInstallCommand(sandbox);

    if (cmd !== "npm") {
      await sandbox.runCommand("npm", ["install", "-g", cmd]);
    }

    await sandbox.runCommand(cmd, args);
  } catch (error) {
    throw new Error(
      `Failed to install project dependencies: ${parseError(error)}`,
      { cause: error }
    );
  }
};
