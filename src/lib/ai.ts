import Anthropic from "@anthropic-ai/sdk";

// Server-only helper. The API key lives in environment variables (Vercel), never in the browser.
export const MODEL = process.env.SAWA_MODEL || "claude-opus-5-5";

export function aiEnabled() {
  if (process.env.DEMO_MODE === "1") return false;
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
export function getClient() {
  if (!client) client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
  return client;
}

/** One call, text out. Returns null on any failure so callers fall back to retrieval-only answers. */
export async function complete(opts: {
  system: string;
  content: Anthropic.Beta.Messages.BetaContentBlockParam[];
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string | null> {
  if (!aiEnabled()) return null;
  try {
    const res = await getClient().beta.messages.create(
      {
        model: MODEL,
        max_tokens: opts.maxTokens ?? 2000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: opts.system,
        messages: [{ role: "user", content: opts.content }],
      },
      { timeout: opts.timeoutMs ?? 12_000 },
    );
    if (res.stop_reason === "refusal") return null;
    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    console.error("[sawa-ai] call failed, using fallback:", err instanceof Error ? err.message : err);
    return null;
  }
}

export function parseJsonObject<T>(text: string | null): T | null {
  if (!text) return null;
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}
