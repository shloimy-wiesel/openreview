import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  experimental__runtimeEnv: {},
  server: {
    GITHUB_APP_ID: z.string().min(1).optional(),
    GITHUB_APP_INSTALLATION_ID: z.coerce.number().int().positive().optional(),
    GITHUB_APP_PRIVATE_KEY: z.string().min(1).optional(),
    GITHUB_APP_WEBHOOK_SECRET: z.string().min(1).optional(),
    GITLAB_BOT_USERNAME: z.string().min(1).optional(),
    GITLAB_TOKEN: z.string().min(1).optional(),
    GITLAB_URL: z.string().url().optional(),
    GITLAB_WEBHOOK_SECRET: z.string().min(1).optional(),
    REDIS_URL: z.string().url().optional(),
  },
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
