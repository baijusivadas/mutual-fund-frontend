import type { IncomingMessage, ServerResponse } from "http";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_RESPONSE_LENGTH = 4000;

const requests = new Map<string, { count: number; resetAt: number }>();

const SYSTEM_PROMPT = `
You are BrickWealth AI, an expert wealth intelligence and portfolio advisor assistant for the BrickWealth platform.

Your expertise includes:
- Portfolio tracking across mutual funds, direct equity/stocks, real estate, gold, flats, and rental properties.
- Performance metrics: XIRR (extended internal rate of return), CAGR, absolute returns, benchmark comparisons (vs Nifty 50, Sensex).
- Capital gains calculation: Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) according to Indian tax regulations.
- Transaction data uploads: Guiding users to import Excel/CSV files, automapping investors to user portfolios, and handling duplicate checks.
- Liabilities, rentals, and cash flow tracking.
- Navigation of BrickWealth features and role management (SuperAdmin vs Standard User).

Rules:
1. Be concise, professional, warm, and practical.
2. Provide clear financial context and actionable guidance.
3. If discussing tax details, mention current Indian income tax guidelines (e.g. STCG at 20%, LTCG at 12.5% above ₹1.25 lakh exemption limit) and advise consulting a certified tax advisor for official filing.
4. Keep answers readable with markdown bullet points where appropriate.
`;

function getClientKey(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0].trim();
  return req.socket.remoteAddress || "127.0.0.1";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = requests.get(key);
  if (!current || now >= current.resetAt) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  current.count += 1;
  return false;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export async function handleChatApi(
  req: IncomingMessage,
  res: ServerResponse,
  _next: () => void,
  env: Record<string, string>
) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method Not Allowed. Use POST." });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return sendJson(res, 429, { error: "Too many chat requests. Please wait a moment." });
  }

  let body: any;
  try {
    body = await parseBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON request body." });
  }

  const rawMessages = body?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return sendJson(res, 400, { error: "Messages array is required." });
  }

  const safeMessages = rawMessages
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((m) => m.content.length > 0);

  if (safeMessages.length === 0) {
    return sendJson(res, 400, { error: "Please enter a message." });
  }

  // Read environment variables (from Vite loadEnv or process.env)
  const apiKey = env.LLM_API_KEY || process.env.LLM_API_KEY || "";
  const apiUrl =
    env.LLM_API_URL ||
    process.env.LLM_API_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const model = env.LLM_MODEL || process.env.LLM_MODEL || "gemini-2.5-flash";

  // Check if API key is not yet configured or still placeholder
  if (!apiKey || apiKey === "your-llm-api-key") {
    return sendJson(res, 503, {
      error:
        "LLM_API_KEY is not configured yet in .env. Please add your Gemini/OpenAI API key to .env.",
    });
  }

  try {
    const isGoogleDirect = apiUrl.includes("generativelanguage.googleapis.com/v1beta/models");
    let externalRes: Response;

    if (isGoogleDirect) {
      // Direct Google Gemini REST API format
      const fullUrl = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const requestPayload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: safeMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      };

      externalRes = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
    } else {
      // OpenAI-compatible endpoint (works with Gemini OpenAI endpoint, OpenAI, Groq, etc.)
      const requestPayload = {
        model,
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
      };

      externalRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });
    }

    const data: any = await externalRes.json().catch(() => null);

    if (!externalRes.ok) {
      const errorMsg =
        data?.error?.message ||
        data?.message ||
        `AI provider returned status ${externalRes.status}`;
      return sendJson(res, externalRes.status >= 400 && externalRes.status < 600 ? externalRes.status : 502, {
        error: errorMsg,
      });
    }

    // Extract message content
    let extractedText = "";
    if (data?.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
      extractedText = data.choices[0].message.content;
    } else if (
      data?.candidates &&
      Array.isArray(data.candidates) &&
      data.candidates[0]?.content?.parts?.[0]?.text
    ) {
      extractedText = data.candidates[0].content.parts.map((p: any) => p.text).join("");
    }

    if (!extractedText) {
      return sendJson(res, 502, { error: "Empty response received from AI model." });
    }

    return sendJson(res, 200, {
      message: extractedText.trim().slice(0, MAX_RESPONSE_LENGTH),
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      error: `AI assistant error: ${err?.message || "Failed to communicate with LLM provider."}`,
    });
  }
}
