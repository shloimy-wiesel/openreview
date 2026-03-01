const steps = [
  {
    description:
      "Click the button above to deploy this template to your Vercel account.",
    title: "Deploy to Vercel",
  },
  {
    description:
      "Create a GitHub App with pull_request and issue_comment webhook permissions, then add the credentials to your environment variables.",
    title: "Connect a GitHub App",
  },
  {
    description:
      "OpenReview automatically reviews PRs when opened or when you mention @openreview in a comment.",
    title: "Get AI reviews",
  },
];

const features = [
  "Automated reviews on every PR",
  "Mention @openreview for on-demand reviews",
  "Runs in a sandboxed environment with full repo access",
  "Powered by Claude via the AI SDK",
  "Built on Vercel Workflow for durable execution",
];

const Page = () => (
  <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
    <main className="flex w-full max-w-xl flex-col gap-16 px-6 py-24">
      <div className="flex flex-col gap-6">
        <p className="font-mono text-sm tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          Vercel Template
        </p>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          OpenReview
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          An open-source, self-hosted AI code review bot. Deploy to Vercel,
          connect a GitHub App, and get automated PR reviews powered by Claude.
        </p>
        <div className="flex gap-3">
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhaydenbleasel%2Fopenreview"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              className="size-4"
              fill="currentColor"
              viewBox="0 0 76 65"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            Deploy to Vercel
          </a>
          <a
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            href="https://github.com/haydenbleasel/openreview"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          How it works
        </h2>
        <ol className="flex flex-col gap-6">
          {steps.map((step, index) => (
            <li className="flex gap-4" key={step.title}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {step.title}
                </p>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          Features
        </h2>
        <ul className="flex flex-col gap-2">
          {features.map((feature) => (
            <li
              className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400"
              key={feature}
            >
              <span className="text-zinc-300 dark:text-zinc-700">&mdash;</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </main>
  </div>
);

export default Page;
