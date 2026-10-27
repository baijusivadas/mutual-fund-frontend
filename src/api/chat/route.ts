function jsonResponse(data: unknown, init?: { status?: number; headers?: Record<string, string> }): Response {
    return new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_RESPONSE_LENGTH = 4_000;

const requests = new Map<
    string,
    {
        count: number;
        resetAt: number;
    }
>();

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

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

async function callProvider(
    apiUrl: string,
    body: string,
    headers: Record<string, string>
): Promise<Response> {
    let response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(20_000),
    });

    if (response.status === 429 || response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body,
            signal: AbortSignal.timeout(20_000),
        });
    }

    return response;
}

function getClientKey(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');

    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return request.headers.get('x-real-ip') || 'unknown';
}

function rateLimited(key: string): boolean {
    const now = Date.now();
    const current = requests.get(key);

    if (!current || now >= current.resetAt) {
        requests.set(key, {
            count: 1,
            resetAt: now + WINDOW_MS,
        });

        return false;
    }

    if (current.count >= MAX_REQUESTS_PER_WINDOW) {
        return true;
    }

    current.count += 1;

    return false;
}

type ChatProviderConfig =
    | { provider: 'openai-compatible'; apiKey: string; apiUrl: string; model: string }
    | { provider: 'gemini'; apiKey: string; model: string };

function getEnvironmentVariables(): ChatProviderConfig {
    const apiKey = process.env.LLM_API_KEY;
    const apiUrl = process.env.LLM_API_URL;
    const model = process.env.LLM_MODEL;

    if (apiKey || apiUrl || model) {
        return {
            provider: 'openai-compatible',
            apiKey: apiKey ?? '',
            apiUrl: apiUrl ?? '',
            model: model ?? '',
        };
    }

    return {
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY ?? '',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    };
}

export async function POST(request: Request) {
    try {
        /*
         * ---------------------------------------------------------
         * 1. Rate limiting
         * ---------------------------------------------------------
         */

        const clientKey = getClientKey(request);

        if (rateLimited(clientKey)) {
            return jsonResponse(
                {
                    error:
                        'Too many chat requests. Please try again shortly.',
                },
                {
                    status: 429,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * 2. Read request body
         * ---------------------------------------------------------
         */

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return jsonResponse(
                {
                    error: 'Invalid request body.',
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * 3. Validate messages
         * ---------------------------------------------------------
         */

        const messages = (
            body as {
                messages?: unknown;
                locale?: unknown;
            }
        )?.messages;

        const rawLocale = (
            body as {
                locale?: unknown;
            }
        )?.locale;
        const locale = typeof rawLocale === 'string' ? rawLocale.trim().toLowerCase() : 'en';

        const LANGUAGE_NAMES: Record<string, string> = {
            en: 'English',
            fr: 'French (Français)',
            de: 'German (Deutsch)',
            it: 'Italian (Italiano)',
            ro: 'Romanian (Română)',
        };

        const targetLanguage = LANGUAGE_NAMES[locale] || 'English';

        if (
            !Array.isArray(messages) ||
            messages.length === 0 ||
            messages.length > MAX_MESSAGES
        ) {
            return jsonResponse(
                {
                    error: 'Invalid message format.',
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * 4. Sanitize messages
         * ---------------------------------------------------------
         */

        const safeMessages = messages
            .filter(
                (
                    message: unknown
                ): message is {
                    role: 'user' | 'assistant';
                    content: string;
                } => {
                    if (!message || typeof message !== 'object') {
                        return false;
                    }

                    const item = message as {
                        role?: unknown;
                        content?: unknown;
                    };

                    return (
                        (item.role === 'user' ||
                            item.role === 'assistant') &&
                        typeof item.content === 'string'
                    );
                }
            )
            .slice(-MAX_MESSAGES)
            .map((message) => ({
                role: message.role,
                content: message.content
                    .trim()
                    .slice(0, MAX_MESSAGE_LENGTH),
            }))
            .filter(
                (message) => message.content.length > 0
            );

        if (safeMessages.length === 0) {
            return jsonResponse(
                {
                    error: 'Please enter a message.',
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * 5. Environment variables
         * ---------------------------------------------------------
         */

        const config = getEnvironmentVariables();

        if (!config.apiKey) {
            console.error(
                config.provider === 'openai-compatible'
                    ? 'LLM_API_KEY is not configured.'
                    : 'GEMINI_API_KEY is not configured.'
            );

            return jsonResponse(
                {
                    error:
                        'The AI assistant is not configured yet.',
                },
                {
                    status: 503,
                }
            );
        }

        if (config.provider === 'openai-compatible' && !config.apiUrl) {
            console.error('LLM_API_URL is not configured.');

            return jsonResponse(
                {
                    error:
                        'The AI service URL is not configured.',
                },
                {
                    status: 503,
                }
            );
        }

        if (!config.model) {
            console.error(
                config.provider === 'openai-compatible'
                    ? 'LLM_MODEL is not configured.'
                    : 'GEMINI_MODEL is not configured.'
            );

            return jsonResponse(
                {
                    error: 'The AI model is not configured.',
                },
                {
                    status: 503,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * 6. Call the configured LLM provider
         * ---------------------------------------------------------
         */

        const dynamicSystemPrompt = `${SYSTEM_PROMPT}

CRITICAL LANGUAGE REQUIREMENT:
The user has selected the website language: ${targetLanguage}.
You MUST respond entirely, naturally, and fluently in ${targetLanguage}.
All greetings, explanations, lists, advice, and closing questions (such as asking if they want to book a demo) MUST be written in ${targetLanguage}.`;

        let lastError: { status: number; message: string } | null = null;
        let extractedMessage: string | null = null;
        const candidateModels = [
            config.model,
            'gemini-flash-latest',
            'gemini-3.7-flash',
            'gemini-3.1-flash-lite',
        ].filter((model, index, models) => models.indexOf(model) === index);

        for (const currentModel of candidateModels) {
            try {
                const isOpenAiCompatible = config.provider === 'openai-compatible';
                const apiUrl = isOpenAiCompatible
                    ? config.apiUrl
                    : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(currentModel)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
                const requestBody = isOpenAiCompatible
                    ? {
                        model: currentModel,
                        temperature: 0.3,
                        messages: [
                            { role: 'system', content: dynamicSystemPrompt },
                            ...safeMessages,
                        ],
                    }
                    : {
                        systemInstruction: { parts: [{ text: dynamicSystemPrompt }] },
                        contents: safeMessages.map((message) => ({
                            role: message.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: message.content }],
                        })),
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 1000,
                        },
                    };

                const response = await callProvider(
                    apiUrl,
                    JSON.stringify(requestBody),
                    {
                        'Content-Type': 'application/json',
                        ...(isOpenAiCompatible
                            ? { Authorization: `Bearer ${config.apiKey}` }
                            : {}),
                    }
                );

                const data: unknown = await response.json().catch(() => null);

                if (!response.ok) {
                    const errorContainer = Array.isArray(data)
                        ? asRecord(data[0])?.error
                        : asRecord(data)?.error;
                    const providerError = asRecord(errorContainer)?.message;
                    const errMsg =
                        typeof providerError === 'string'
                            ? providerError
                            : `Provider returned HTTP ${response.status}`;
                    console.warn(`Chat provider returned ${response.status}: ${errMsg}`);

                    lastError = { status: response.status, message: errMsg };
                    if (
                        response.status === 404 ||
                        response.status === 429 ||
                        response.status === 503
                    ) {
                        continue;
                    }
                } else {
                    const dataRecord = asRecord(data);
                    const choiceMsg = isOpenAiCompatible
                        ? asRecord(
                            Array.isArray(dataRecord?.choices) ? dataRecord.choices[0] : null
                        )?.message
                        : asRecord(
                            Array.isArray(dataRecord?.candidates)
                                ? dataRecord.candidates[0]
                                : null
                        )?.content;
                    const output = isOpenAiCompatible
                        ? asRecord(choiceMsg)?.content
                        : (() => {
                            const parts = asRecord(choiceMsg)?.parts;
                            return Array.isArray(parts)
                                ? parts
                                    .map((part) => asRecord(part)?.text)
                                    .filter((text): text is string => typeof text === 'string')
                                    .join('')
                                : null;
                        })();

                    if (typeof output === 'string' && output.trim().length > 0) {
                        extractedMessage = output.trim().slice(0, MAX_RESPONSE_LENGTH);
                        break;
                    }

                    lastError = { status: 502, message: 'The AI provider returned an empty response.' };
                    break;
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Connection error';
                console.warn('Chat provider request failed:', errorMessage);
                lastError = {
                    status: 502,
                    message: 'Unable to reach the AI service. Please try again later.',
                };
                break;
            }
        }

        if (!extractedMessage) {
            const isOverload = lastError?.status === 503 || lastError?.status === 429;
            return jsonResponse(
                {
                    error: isOverload
                        ? 'The AI assistant is temporarily experiencing high demand. Please try again in a few moments.'
                        : lastError?.message || 'The AI assistant is temporarily unavailable.',
                },
                { status: lastError?.status && lastError.status >= 400 && lastError.status < 600 ? lastError.status : 502 }
            );
        }

        return jsonResponse({
            message: extractedMessage,
        });
    } catch (error) {
        /*
         * ---------------------------------------------------------
         * 11. Unexpected errors
         * ---------------------------------------------------------
         */

        console.error(
            'Chat API error:',
            error
        );

        return jsonResponse(
            {
                error:
                    'Unable to process the chat request. Please try again.',
            },
            {
                status: 500,
            }
        );
    }
}