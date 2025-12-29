"use client";

import React, { useEffect, useRef, useState } from "react";

type ChatMsg = { role: "user" | "assistant"; text: string };
type ApiMsg = { role: "system" | "user" | "assistant"; content: string };

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

type LlmNext =
  | { done: false; question: string }
  | { done: true; brief: Brief };

function firstLetter(name: string): string {
  const clean = name.trim();
  if (!clean) return "U";
  const m = clean.match(/[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : "U";
}

/**
 extract a company name even if the user types a sentence.
 Flls back to null if unclear.
 */
function extractCompanyNameSoft(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  // company/brand name is X
  const m1 = t.match(
    /(?:my\s+)?(?:company|brand)\s+(?:name\s+)?(?:is|=|:)\s*["']?([A-Za-z0-9][A-Za-z0-9&.\- ]{0,60})["']?/i
  );
  if (m1?.[1]) {
    const candidate = m1[1]
      .split(/[,.\n\r]|(?:\s+we\s+are\s+)|(?:\s+it'?s\s+)|(?:\s+its\s+)/i)[0]
      .trim();
    if (candidate) return candidate.replace(/\s{2,}/g, " ");
  }

  // "my <word> is X" (tolerant to typos like "comonay")
  const mTypo = t.match(
    /my\s+\w{3,14}\s+(?:name\s+)?(?:is|=|:)\s*["']?([A-Za-z0-9][A-Za-z0-9&.\- ]{0,60})["']?/i
  );
  if (mTypo?.[1]) {
    const candidate = mTypo[1]
      .split(/[,.\n\r]|(?:\s+we\s+are\s+)|(?:\s+it'?s\s+)|(?:\s+its\s+)/i)[0]
      .trim();
    if (candidate) return candidate.replace(/\s{2,}/g, " ");
  }

  // "we are X" / "our brand is X"
  const m2 = t.match(
    /(?:we\s+are|our\s+(?:company|brand)\s+is)\s*["']?([A-Za-z0-9][A-Za-z0-9&.\- ]{0,60})["']?/i
  );
  if (m2?.[1]) {
    const candidate = m2[1].split(/[,.\n\r]/)[0].trim();
    if (candidate) return candidate.replace(/\s{2,}/g, " ");
  }

  // short input like "Typo" / "Breadbox"
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 3) return t;

  return null;
}

function toApiMessages(chat: ChatMsg[]): ApiMsg[] {
  return chat.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hey I'm Hazel👋, Haze's virtual assistant. Tell me about your company and what this merch is for.",
    },
  ]);

  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("");

  const [turn, setTurn] = useState(0);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [brief, setBrief] = useState<Brief | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showJson, setShowJson] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bootedRef = useRef(false);

  const assistantAvatarLetter = "H";
  const userAvatarLetter = firstLetter(companyName);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function callLlmNext(nextAnswers: Record<string, string>, nextTurn: number, nextAsked: string[]) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/llm-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(messages),
          answers: nextAnswers,
          turn: nextTurn,
          askedQuestions: nextAsked,
        }),
      });

      const raw = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Non-JSON from /api/llm-next (status ${res.status}): ${raw.slice(0, 140)}`);
      }

      if (!res.ok) {
        throw new Error(typeof data === "string" ? data : JSON.stringify(data));
      }

      const out = data as LlmNext;

      if (out.done) {
        setDone(true);
        setBrief(out.brief);
        setMessages((m) => [...m, { role: "assistant", text: "Done. Here is the brief." }]);
        scrollToBottom();
        return;
      }

      const nextQ = out.question;
      setAskedQuestions((prev) => [...prev, nextQ]);
      setMessages((m) => [...m, { role: "assistant", text: nextQ }]);
      scrollToBottom();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", text: `Something broke: ${msg}` }]);
      scrollToBottom();
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    scrollToBottom();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  async function onSend() {
    if (!input.trim() || loading || done) return;

    const userText = input.trim();
    setInput("");

    const nextTurn = turn + 1;
    setTurn(nextTurn);

    // capture company name once
    if (!companyName) {
      const maybe = extractCompanyNameSoft(userText);
      if (maybe) setCompanyName(maybe);
    }

    const lastAssistant =
      [...messages].reverse().find((m) => m.role === "assistant")?.text ?? `q${nextTurn}`;

    const nextAnswers = { ...answers, [lastAssistant]: userText };
    setAnswers(nextAnswers);

    const nextMsgs = [...messages, { role: "user" as const, text: userText }];
    setMessages(nextMsgs);

    const nextAsked = [...askedQuestions];

    scrollToBottom();
    requestAnimationFrame(() => inputRef.current?.focus());

    await callLlmNext(nextAnswers, nextTurn, nextAsked);
  }

  const bubbleBase: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 16,
    maxWidth: "82%",
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 10% 0%, rgba(99,102,241,0.25), transparent 60%)," +
          "radial-gradient(900px 600px at 90% 10%, rgba(236,72,153,0.22), transparent 55%)," +
          "linear-gradient(180deg, #fafafa 0%, #ffffff 55%, #fafafa 100%)",
        padding: 18,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(236,72,153,0.10))",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2 }}>
              Hazel Merch Brief Assistant
            </div>
            <div style={{ opacity: 0.75, marginTop: 4 }}>Quick chat to produce a designer-ready brief.</div>
            {companyName && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Working on merch for <b>{companyName}</b>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 18,
            border: "1px solid rgba(0,0,0,0.07)",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <div ref={listRef} style={{ height: 520, overflowY: "auto", padding: 16 }}>
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-end",
                    margin: "12px 0",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  {!isUser && (
                    <div
                      title="Hazel"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #6366F1, #EC4899)",
                        color: "white",
                        fontWeight: 900,
                        boxShadow: "0 10px 25px rgba(99,102,241,0.25)",
                        flex: "0 0 auto",
                      }}
                    >
                      {assistantAvatarLetter}
                    </div>
                  )}

                  <div
                    style={{
                      ...bubbleBase,
                      background: isUser
                        ? "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(17,24,39,0.88))"
                        : "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(236,72,153,0.08))",
                      color: isUser ? "white" : "#111827",
                      border: isUser ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {m.text}
                  </div>

                  {isUser && (
                    <div
                      title={companyName || "Your company"}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #0EA5E9, #22C55E)",
                        color: "white",
                        fontWeight: 900,
                        fontSize: 14,
                        letterSpacing: 0.5,
                        boxShadow: "0 10px 25px rgba(14,165,233,0.28)",
                        flex: "0 0 auto",
                      }}
                    >
                      {userAvatarLetter}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ margin: "12px 0", color: "#111827", opacity: 0.75 }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={{ padding: 14, borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.85)" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={done ? "Done" : "Type your answer"}
                disabled={done || loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.10)",
                  outline: "none",
                  color: "black",
                  caretColor: "black",
                  background: done ? "rgba(0,0,0,0.03)" : "white",
                }}
              />
              <button
                onClick={onSend}
                disabled={done || loading}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.10)",
                  cursor: done || loading ? "not-allowed" : "pointer",
                  background: done || loading ? "rgba(0,0,0,0.03)" : "linear-gradient(90deg, #6366F1, #EC4899)",
                  color: done || loading ? "rgba(0,0,0,0.45)" : "white",
                  fontWeight: 800,
                  minWidth: 110,
                  boxShadow: done || loading ? "none" : "0 12px 30px rgba(99,102,241,0.22)",
                }}
              >
                Send
              </button>
            </div>

            {/* error is now USED */}
            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 14,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#991B1B",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {brief && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                background: "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(236,72,153,0.10))",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>Merch Brief Summary</div>
                <div style={{ opacity: 0.75, marginTop: 4, color: "#111827" }}>
                  High-level overview for the customer.
                </div>
              </div>

              <button
                onClick={() => setShowJson((v) => !v)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {showJson ? "Hide JSON" : "View JSON"}
              </button>
            </div>

            <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6, color: "#111827" }}>
              {brief.summary}
            </div>

            {showJson && (
              <div style={{ padding: 14, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    fontSize: 12,
                    color: "#111827",
                    background: "rgba(0,0,0,0.03)",
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  {JSON.stringify(brief, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, opacity: 0.8 }}>Debug (answers captured)</summary>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 10, fontSize: 12, color: "#111827" }}>
            {JSON.stringify(answers, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
