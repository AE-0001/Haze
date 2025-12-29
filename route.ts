import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Msg = { role: "system" | "user" | "assistant"; content: string };

type Brief = {
  summary: string;
  core_design_direction: string[];
  visual_language: string[];
  color_and_typography: string[];
  product_specific_notes: {
    tee: string[];
    team_jacket: string[];
    founder_wear: string[];
  };
  dos: string[];
  donts: string[];
  closing_to_customer: string;
};

type LlmNextResponse =
  | { done: false; question: string }
  | { done: true; brief: Brief };

type OpenRouterChatResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY in env" }, { status: 500 });
    }

    const body = (await req.json()) as {
      messages?: Msg[];
      answers?: Record<string, string>;
      turn?: number;
      askedQuestions?: string[];
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const answers = body.answers ?? {};
    const askedQuestions = Array.isArray(body.askedQuestions) ? body.askedQuestions : [];
    const turn = typeof body.turn === "number" ? body.turn : 0;

    const MAX_TURNS = 10;
    const forcedDone = turn >= MAX_TURNS;

    // CLI-only dev progress
    console.log("[llm-next] turn:", turn, "/", MAX_TURNS, "forcedDone:", forcedDone);
    // console.log("[llm-next] answersKeys:", Object.keys(answers));

    const system = `
You are an expert merchandise strategist conducting an intake interview to help designers create merch concepts.

Instructions:
- Start with a greeting and short introduction.
- This is tshirt concept merch for startup founders, and companies in general and their teams.
- Ask only about tshirts, team jackets, and founder wear.
- Ask exactly one question per turn.
- Do not use bullet points or multi-part questions.
- Do not repeat any question already asked.
- Adapt questions based on previous answers and build on them.
- If an answer is vague, ask one clarifying question.
- Slogans/taglines can include punctuation or symbols; that is not gibberish.
- Only flag gibberish if the input is clearly random characters with no readable words.
- Do not end too quickly; gather enough for a premium, designer-ready brief.

When you end, output VALID JSON using this schema:

{
  "summary": string,
  "core_design_direction": string[],
  "visual_language": string[],
  "color_and_typography": string[],
  "product_specific_notes": {
    "tee": string[],
    "team_jacket": string[],
    "founder_wear": string[]
  },
  "dos": string[],
  "donts": string[],
  "closing_to_customer": string
}

Response format (JSON ONLY):
Either:
{ "done": false, "question": "..." }
or:
{ "done": true, "brief": { ... } }
`.trim();

    const promptContext: Msg[] = [
      { role: "system", content: system },
      {
        role: "user",
        content:
          "Known answers so far (JSON):\n" +
          JSON.stringify(answers, null, 2) +
          "\n\nQuestions already asked (exact strings):\n" +
          JSON.stringify(askedQuestions, null, 2),
      },
      ...messages,
      {
        role: "user",
        content: forcedDone
          ? "We are at max turns. End now and return done:true with the brief."
          : "Return the next best question, or end with done:true and the brief if ready.",
      },
    ];

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Merch Brief Assistant",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: promptContext,
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    const data = (await resp.json()) as OpenRouterChatResponse;

    if (!resp.ok) {
      console.error("[llm-next] OpenRouter error body:", data);
      return NextResponse.json(
        { error: "OpenRouter request failed", status: resp.status, data },
        { status: 500 }
      );
    }

    const content =
      Array.isArray(data.choices) && typeof data.choices[0]?.message?.content === "string"
        ? data.choices[0].message.content
        : "";

    if (!content) {
      return NextResponse.json({ error: "Empty LLM content", data }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[llm-next] invalid JSON from LLM:", content);
      return NextResponse.json({ error: "LLM did not return valid JSON", raw: content }, { status: 500 });
    }

    const out = parsed as LlmNextResponse;

    if (out.done === true) {
      console.log("[llm-next] interview completed", { turn, forcedDone });
    }

    return NextResponse.json(out);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[llm-next] handler error:", message);
    return NextResponse.json({ error: "llm-next failed", details: message }, { status: 500 });
  }
}
