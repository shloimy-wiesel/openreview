import "server-only";

import { env } from "@/lib/env";

export const getGitLabBaseUrl = (): string =>
  (env.GITLAB_URL ?? "https://gitlab.com").replace(/\/$/, "");

export const getGitLabToken = (): string => {
  if (!env.GITLAB_TOKEN) {
    throw new Error("Missing GITLAB_TOKEN environment variable");
  }
  return env.GITLAB_TOKEN;
};

export const postMRNote = async (
  projectId: number | string,
  mrIid: number,
  body: string
): Promise<void> => {
  const token = getGitLabToken();
  const baseUrl = getGitLabBaseUrl();
  const encodedProject = encodeURIComponent(String(projectId));

  const response = await fetch(
    `${baseUrl}/api/v4/projects/${encodedProject}/merge_requests/${mrIid}/notes`,
    {
      body: JSON.stringify({ body }),
      headers: {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": token,
      },
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to post GitLab MR note: ${response.status} ${response.statusText}`
    );
  }
};

export const getMergeRequest = async (
  projectId: number | string,
  mrIid: number
): Promise<{ sourceBranch: string; targetBranch: string }> => {
  const token = getGitLabToken();
  const baseUrl = getGitLabBaseUrl();
  const encodedProject = encodeURIComponent(String(projectId));

  const response = await fetch(
    `${baseUrl}/api/v4/projects/${encodedProject}/merge_requests/${mrIid}`,
    {
      headers: { "PRIVATE-TOKEN": token },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get GitLab MR: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    source_branch: string;
    target_branch: string;
  };

  return {
    sourceBranch: data.source_branch,
    targetBranch: data.target_branch,
  };
};

export const checkGitLabProjectAccess = async (
  projectPath: string
): Promise<{ canPush: boolean; reason?: string }> => {
  const token = getGitLabToken();
  const baseUrl = getGitLabBaseUrl();
  const encodedProject = encodeURIComponent(projectPath);

  const response = await fetch(
    `${baseUrl}/api/v4/projects/${encodedProject}`,
    {
      headers: { "PRIVATE-TOKEN": token },
    }
  );

  if (!response.ok) {
    return {
      canPush: false,
      reason: `Cannot access GitLab project: ${response.status} ${response.statusText}`,
    };
  }

  const data = (await response.json()) as {
    archived: boolean;
    permissions?: {
      group_access?: { access_level: number };
      project_access?: { access_level: number };
    };
  };

  if (data.archived) {
    return {
      canPush: false,
      reason: "Repository is archived and cannot be modified",
    };
  }

  // Developer (30) or higher is required to push branches
  const accessLevel =
    data.permissions?.project_access?.access_level ??
    data.permissions?.group_access?.access_level ??
    0;

  if (accessLevel < 30) {
    return {
      canPush: false,
      reason:
        "Token does not have Developer or higher access to push to this project",
    };
  }

  return { canPush: true };
};

export const parseGitLabThreadId = (
  threadId: string
): { mrIid: number; projectId: string } | null => {
  if (!threadId.startsWith("gitlab:")) {
    return null;
  }

  const parts = threadId.split(":");

  if (parts.length < 3) {
    return null;
  }

  return { mrIid: Number(parts[2]), projectId: parts[1] };
};
