import { ChatMsg, ApiMsg } from "@/app/types/chat";

export function firstLetter(name: string): string {
    const clean = name.trim();
    if (!clean) return "U";
    const m = clean.match(/[A-Za-z0-9]/);
    return m ? m[0].toUpperCase() : "U";
}

/**
 * extract a company name even if the user types a sentence.
 * Falls back to null if unclear.
 */
export function extractCompanyNameSoft(raw: string): string | null {
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

export function toApiMessages(chat: ChatMsg[]): ApiMsg[] {
    return chat.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
    }));
}
