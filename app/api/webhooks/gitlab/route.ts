import { after } from "next/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { start } from "workflow/api";

import { env } from "@/lib/env";
import type { WorkflowParams } from "@/workflow";
import { botWorkflow } from "@/workflow";

interface GitLabNotePayload {
  merge_request: {
    iid: number;
    source_branch: string;
    state: string;
    target_branch: string;
  };
  object_attributes: {
    id: number;
    note: string;
    noteable_type: string;
  };
  object_kind: string;
  project: {
    id: number;
    path_with_namespace: string;
  };
}

const getBotUsername = (): string =>
  env.GITLAB_BOT_USERNAME ?? "openreview";

const isValidWebhook = (request: NextRequest): boolean => {
  if (!env.GITLAB_WEBHOOK_SECRET) {
    return false;
  }
  return request.headers.get("x-gitlab-token") === env.GITLAB_WEBHOOK_SECRET;
};

const isMRMention = (payload: GitLabNotePayload): boolean =>
  payload.object_kind === "note" &&
  payload.object_attributes.noteable_type === "MergeRequest" &&
  payload.object_attributes.note.includes(`@${getBotUsername()}`) &&
  payload.merge_request?.state === "opened";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  if (!env.GITLAB_TOKEN || !env.GITLAB_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "GitLab adapter not configured" },
      { status: 404 }
    );
  }

  if (!isValidWebhook(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = request.headers.get("x-gitlab-event");

  if (event !== "Note Hook") {
    return NextResponse.json({ ok: true });
  }

  const payload = (await request.json()) as GitLabNotePayload;

  if (!isMRMention(payload)) {
    return NextResponse.json({ ok: true });
  }

  const { merge_request: mr, object_attributes: note, project } = payload;
  const threadId = `gitlab:${project.id}:${mr.iid}`;

  after(async () => {
    try {
      await start(botWorkflow, [
        {
          baseBranch: mr.target_branch,
          messages: [{ content: note.note, role: "user" }],
          prBranch: mr.source_branch,
          prNumber: mr.iid,
          provider: "gitlab",
          repoFullName: project.path_with_namespace,
          threadId,
        } satisfies WorkflowParams,
      ]);
    } catch (error) {
      console.error("[gitlab webhook] Failed to start workflow:", error);
    }
  });

  return NextResponse.json({ ok: true });
};
