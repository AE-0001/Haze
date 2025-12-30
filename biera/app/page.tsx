"use client";

import Link from "next/link";

import React, { useEffect, useRef, useState } from "react";
import { Send, Menu, User, Sparkles, Mic } from "lucide-react";

import { Brief, ChatMsg, LlmNext } from "@/app/types/chat";
import { extractCompanyNameSoft, firstLetter, toApiMessages } from "@/lib/chat-utils";
import { MessageBubble } from "@/components/chat/message-bubble";
import { BriefDisplay } from "@/components/chat/brief-display";
import { HeroSection } from "@/components/chat/hero-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMsg[]>([]); // Empty initially to show Hero
  const [hasStarted, setHasStarted] = useState(false);

  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("");

  const [turn, setTurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bootedRef = useRef(false);

  // Auto-scroll helper
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  async function callLlmNext(nextAnswers: Record<string, string>, nextTurn: number, nextAsked: string[]) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/llm-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(messages), // Note: we might need to inject the initial greeting if we started empty
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
        throw new Error(`Non-JSON from /api/llm-next`);
      }

      if (!res.ok) {
        throw new Error(typeof data === "string" ? data : JSON.stringify(data));
      }

      const out = data as LlmNext;

      if (out.done) {
        setDone(true);
        setBrief(out.brief);
        setMessages((m) => [...m, { role: "assistant", text: "Done. Here is the brief." }]);
      } else {
        const nextQ = out.question;
        setAskedQuestions((prev) => [...prev, nextQ]);
        setMessages((m) => [...m, { role: "assistant", text: nextQ }]);
      }
      scrollToBottom();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", text: `Something broke: ${msg}` }]);
      scrollToBottom();
    } finally {
      setLoading(false);
      if (!done) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
  }

  // Initial boot
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Handle Send
  async function onSend() {
    if (!input.trim() || loading || done) return;

    // Transition from Hero to Chat
    if (!user) {
      router.push("/login");
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      // Inject the first assistant message if strictly needed by UI, 
      // but backend might handle it.
      // For visual consistency, let's say the Hero IS the first state, 
      // and when user types, we show their message + the *next* assistant question.
      // Wait, the original logic had "Hey I'm Hazel" as msg[0].
      // We should add that to history but maybe not show it in bubble stream if we want "seamless" feel?
      // Actually, let's keep it simple: Add standard greeting to messages if empty.
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          text: "Hey I'm Hazel👋, Haze's virtual assistant. Tell me about your company and what this merch is for."
        }]);
      }
    }

    const userText = input.trim();
    setInput("");

    const nextTurn = turn + 1;
    setTurn(nextTurn);

    // capture company name
    if (!companyName) {
      const maybe = extractCompanyNameSoft(userText);
      if (maybe) setCompanyName(maybe);
    }

    const lastAssistant =
      [...messages].reverse().find((m) => m.role === "assistant")?.text ??
      "Hey I'm Hazel👋, Haze's virtual assistant. Tell me about your company and what this merch is for.";

    const nextAnswers = { ...answers, [lastAssistant]: userText };
    setAnswers(nextAnswers);

    // If this is the FIRST interaction, we need `messages` to include the hidden greeting + user text
    let nextMsgs = [...messages];
    if (messages.length === 0) {
      nextMsgs = [{
        role: "assistant",
        text: "Hey I'm Hazel👋, Haze's virtual assistant. Tell me about your company and what this merch is for."
      }];
    }
    nextMsgs = [...nextMsgs, { role: "user" as const, text: userText }];

    setMessages(nextMsgs);
    scrollToBottom();

    const nextAsked = [...askedQuestions];
    await callLlmNext(nextAnswers, nextTurn, nextAsked);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  const userAvatarLetter = firstLetter(companyName);

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-zinc-900 selection:bg-indigo-100 dark:bg-zinc-950 dark:text-zinc-100">

      {/* Header - Fixed Top */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:bg-zinc-950/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            <Menu className="w-5 h-5" />
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
            {companyName ? companyName : "Beria Agent"}
          </span>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 font-medium text-xs">
                    {userAvatarLetter}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                {user?.email || "No Email"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-red-500 hover:text-red-500 focus:text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="ghost" size="sm" className="font-semibold">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* Conditional View: Hero vs Chat Stream */}
        {!hasStarted && messages.length === 0 ? (
          <HeroSection />
        ) : (
          <ScrollArea className="flex-1 px-4 py-6 md:px-[20%]">
            <div className="space-y-6 pb-20">
              {/* Render messages */}
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  userAvatarLetter={userAvatarLetter}
                  companyName={companyName}
                />
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-sm pl-2 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Thinking...</span>
                </div>
              )}

              {/* Brief Display (Inline) */}
              {brief && <BriefDisplay brief={brief} />}

              <div ref={scrollRef} className="h-px w-full" />
            </div>
          </ScrollArea>
        )}

      </main>

      {/* Floating Input Footer */}
      <div className="p-4 md:px-[20%] md:pb-6 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950 dark:to-transparent">
        <div className="relative flex items-center shadow-lg shadow-zinc-200/50 dark:shadow-black/50 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/20 focus-within:border-indigo-300 dark:focus-within:border-indigo-500/50">

          {/* Plus / Attach Button */}
          <Button variant="ghost" size="icon" className="ml-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full h-10 w-10">
            <span className="text-2xl leading-none pb-1">+</span>
          </Button>

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={done ? "Interview complete" : "Ask me anything..."}
            disabled={done || loading}
            className="flex-1 border-none shadow-none focus-visible:ring-0 px-2 h-12 text-[16px] bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-100"
          />

          <div className="flex items-center pr-2 gap-1">
            {input.trim() ? (
              <Button
                onClick={onSend}
                size="icon"
                className="h-9 w-9 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">
            AI Agent can make mistakes. Check important info.
          </span>
        </div>
      </div>

    </div>
  );
}
