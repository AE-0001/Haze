# Beria (formerly Haze)

Beria is an AI-powered conversational assistant designed to help founders and teams create professional merchandise briefs. It intelligently interviews users to generate high-quality, designer-ready outputs.

## Features

-   **Agentic UI**: A professional, mobile-responsive chat interface featuring a "Hero" start screen and minimalist message bubbles.
-   **Adaptive Interview**: Uses LLM (GPT-4o-mini via OpenRouter) to ask context-aware questions.
-   **Structured Output**: Generates both a customer-facing summary and a JSON technical brief.
-   **Modern Stack**: Built with Next.js 16 (App Router), Tailwind CSS v4, custom Shadcn UI components, and Framer Motion.

## Prerequisites

-   Node.js 18+ installed.
-   An [OpenRouter](https://openrouter.ai/) API Key.

## Installation

1.  Navigate to the project directory:
    ```bash
    cd biera
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    -   Create a `.env.local` file in the `biera` directory.
    -   Add your API key:
        ```env
        OPENROUTER_API_KEY=sk-or-your-key-here
        ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
biera/
├── app/
│   ├── api/llm-next/   # Backend API route for LLM interaction
│   ├── page.tsx        # Main application UI (Hero & Chat)
│   ├── types/          # TypeScript definitions (ChatMsg, Brief, etc.)
│   └── globals.css     # Tailwind CSS configuration
├── components/
│   ├── chat/           # Application-specific chat components
│   │   ├── hero-section.tsx    # "Orb" start screen
│   │   ├── message-bubble.tsx  # Chat message UI
│   │   └── brief-display.tsx   # Final brief result card
│   └── ui/             # Shadcn primitives (Card, Button, Input, etc.)
└── lib/                # Utility functions
```

## Tech Stack

-   **Framework**: Next.js 16
-   **Styling**: Tailwind CSS v4
-   **UI Library**: Shadcn UI (Radix Primitives) + Framer Motion
-   **AI**: OpenRouter API
