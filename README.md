# Haze
Hazel is an AI-powered conversational assistant that intelligently interviews users to generate a designer-ready merchandise brief.

Instead of static forms or predefined questionnaires, Hazel adapts each question based on prior answers, brand context, and emotional intent. The result is a high-quality brief suitable for designers, developers, and internal stakeholders.

---

## What This Project Does

- Conducts a natural, adaptive conversation with a user
- Asks one smart question at a time
- Avoids repeating questions or paraphrasing previous ones
- Detects vague answers and asks clarifying follow-ups
- Accepts slogans and taglines with special characters
- Extracts brand/company name from free-text input
- Produces:
  - A customer-facing text summary
  - A structured JSON brief for designers and developers

---

## Key Features

- LLM-driven adaptive questioning (no fixed question list)
- Context-aware follow-up logic
- Emotion-aware brand discovery
- Robust company name extraction from sentences
- Clear separation between customer-facing output and developer JSON
- Modern chat-style UI
- CLI-only progress logging (no progress indicators shown to users)
- Type-safe Next.js App Router architecture

---

## Tech Stack

- Next.js 14 (App Router)
- React (Client Components)
- TypeScript
- OpenRouter API
- GPT-4o-mini (via OpenRouter)

---

## Project Structure

app/
├─ page.tsx
│ └─ Conversational UI and state management
│
└─ api/
└─ llm-next/
└─ route.ts
└─ LLM orchestration, prompt logic, and validation


---

## Environment Setup

Create a `.env.local` file in the project root:

'''bash
npm install
npm run dev

open:
http://localhost:3000




