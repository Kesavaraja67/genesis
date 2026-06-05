// instrumentation.ts — Next.js server startup hook
// Runs once when the Node.js server initialises (not in Edge runtime)
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only run in Node.js runtime, not Edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("./lib/workflow/scheduler");
    await startScheduler();
    console.log("[instrumentation] Workflow scheduler started.");
  }
}
