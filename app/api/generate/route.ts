import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/validation";
import type { GenerateRequest, GenerateResponse, GenerateErrorResponse } from "@/lib/types";

// Google Gemini OpenAI-compatible endpoint
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const DEFAULT_MODEL = "gemini-3.8-flash";
const MAX_TOKENS = 2048;
const TEMPERATURE = 0.75;

function buildSystemPrompt(): string {
  return `You are a practical marketing assistant for small Indian businesses (kirana stores, home-based sellers, artisans, and micro-entrepreneurs).

Your job is to generate ready-to-use marketing content. Follow these rules strictly:

CONTENT RULES:
- Use ONLY the product facts provided by the user. Never invent details.
- Do NOT fabricate discounts, specifications, availability windows, guarantees, certifications, or customer reviews that are not supplied.
- If an offer is provided, mention it clearly; if not, do not invent one.
- Keep WhatsApp messages concise (under 200 words ideally). Include a clear call to action where appropriate.
- For product listings, write a clear headline, 3–5 bullet features, and a price line.
- For customer replies, be warm, helpful, and brief.
- Avoid excessive emojis (use at most 2–3 tastefully).
- Avoid generic filler phrases like "world-class", "best quality", "number one" unless explicitly provided.

LANGUAGE RULES:
- English: Use clear, simple English appropriate for Indian consumers.
- Hindi: Write naturally in Devanagari script. Keep it warm and conversational.
- Hinglish: Mix Hindi and English naturally, as used in everyday Indian conversation. Write mostly in Roman script.

TONE RULES:
- Friendly: Warm, approachable, personal.
- Professional: Clean, factual, confident.
- Festive: Celebratory, enthusiastic, occasion-appropriate.

OUTPUT FORMAT:
- Return ONLY the final marketing content. No explanations, no meta-commentary, no "Here is your content:".
- Do not wrap output in quotes or code blocks.
- Generate COMPLETE, polished, ready-to-publish marketing copy with no unfinished sentences. Never cut off mid-sentence or mid-thought.
- Every sentence must end with appropriate punctuation (such as a period, exclamation mark, question mark, or emoji).
- Ensure all sections, bullet points, calls to action, and offers are fully articulated and complete.`;
}

function buildUserPrompt(req: GenerateRequest): string {
  const contentTypeMap: Record<string, string> = {
    whatsapp: "WhatsApp promotion message",
    listing: "product listing (with headline, bullet points, and price)",
    reply: "customer enquiry reply message",
  };

  const lines = [
    `Generate a complete, ready-to-publish ${contentTypeMap[req.contentType]} in ${req.language} language with a ${req.tone} tone. Ensure all sentences and thoughts are fully completed.`,
    ``,
    `PRODUCT DETAILS:`,
    `Name: ${req.productName}`,
    `Description: ${req.description}`,
    `Price: ${req.price}`,
  ];

  if (req.offer && req.offer.trim()) {
    lines.push(`Current Offer: ${req.offer}`);
  }

  lines.push(`Target Audience: ${req.targetAudience}`);
  return lines.join("\n");
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
  // Validate API key — support both GEMINI_API_KEY and legacy HF_TOKEN variable names
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.HF_TOKEN;
  if (!apiKey) {
    console.error("[generate] No API key configured (GEMINI_API_KEY or HF_TOKEN).");
    return NextResponse.json(
      { error: "Server configuration error: AI API key is not set. Please add GEMINI_API_KEY to your .env.local." },
      { status: 503 }
    );
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const { valid, errors } = validateRequest(body);
  if (!valid) {
    const firstError = Object.values(errors)[0] ?? "Validation failed.";
    return NextResponse.json({ error: firstError }, { status: 422 });
  }

  const data = body as GenerateRequest;
  const model = process.env.GEMINI_MODEL ?? process.env.HF_MODEL ?? DEFAULT_MODEL;

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(data);

  try {
    const requestPayload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
      signal: AbortSignal.timeout(30_000),
    };

    let response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, requestPayload);

    // If Gemini encounters a transient 503 high-demand spike, retry once after a short delay
    if (response.status === 503) {
      console.warn("[generate] Gemini returned 503 (high demand spike). Retrying once in 1.5s...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, requestPayload);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown upstream error");
      console.error(`[generate] Gemini API error ${response.status}:`, errorText);

      // For 400 and 404, surface the upstream message to help diagnose
      if (response.status === 400 || response.status === 404) {
        try {
          const errJson = JSON.parse(errorText);
          // Gemini wraps errors in an array sometimes
          const errObj = Array.isArray(errJson) ? errJson[0] : errJson;
          const msg = errObj?.error?.message ?? errorText;
          return NextResponse.json(
            { error: `AI service error: ${msg}` },
            { status: 502 }
          );
        } catch {
          return NextResponse.json(
            { error: `AI service error (${response.status}). Please try again.` },
            { status: 502 }
          );
        }
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Authentication failed. Your GEMINI_API_KEY may be invalid. " +
              "Get a free key at aistudio.google.com → Get API Key.",
          },
          { status: 502 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "AI service is rate-limited. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (response.status === 503) {
        return NextResponse.json(
          { error: "The AI service is temporarily unavailable. Please try again in a moment." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: `AI service returned an error (${response.status}). Please try again.` },
        { status: 502 }
      );
    }

    const json = await response.json();
    const choice = json?.choices?.[0];

    if (!choice) {
      console.error("[generate] Unexpected response structure (no choices):", JSON.stringify(json).slice(0, 300));
      return NextResponse.json(
        { error: "The AI model returned an empty or unexpected response. Please try again." },
        { status: 502 }
      );
    }

    const finishReason: string | undefined = choice.finish_reason;

    // Reject incomplete or truncated generation so it is never silently presented
    if (finishReason === "length") {
      console.warn("[generate] Model output was cut off due to token limit ('length').");
      return NextResponse.json(
        {
          error: "The generated content exceeded the token limit and was cut off. Please try again or provide a slightly shorter description.",
        },
        { status: 422 }
      );
    }

    if (finishReason === "content_filter") {
      console.warn("[generate] Model output was blocked by content filter ('content_filter').");
      return NextResponse.json(
        {
          error: "The generated content was blocked by safety filters. Please adjust your product description and try again.",
        },
        { status: 422 }
      );
    }

    // Safely extract content (handles both string and content part arrays)
    let content = "";
    if (typeof choice.message?.content === "string") {
      content = choice.message.content;
    } else if (Array.isArray(choice.message?.content)) {
      content = choice.message.content
        .map((part: { type?: string; text?: string }) => (typeof part?.text === "string" ? part.text : ""))
        .join("");
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      console.error("[generate] Unexpected response structure (empty content):", JSON.stringify(json).slice(0, 300));
      return NextResponse.json(
        { error: "The AI model returned an empty or unexpected response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      content: trimmedContent,
      model,
      finishReason: finishReason ?? "stop",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "The request timed out after 30 seconds. Please try again." },
        { status: 504 }
      );
    }

    const cause = (err as { cause?: { code?: string } })?.cause;
    if (
      cause?.code === "ENOTFOUND" ||
      cause?.code === "ECONNREFUSED" ||
      cause?.code === "ENETUNREACH" ||
      (err instanceof TypeError && err.message === "fetch failed")
    ) {
      console.error("[generate] Network error:", err);
      return NextResponse.json(
        { error: "Network error: the server could not reach the AI API. Check your internet connection." },
        { status: 502 }
      );
    }

    console.error("[generate] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating content. Please try again." },
      { status: 500 }
    );
  }
}
