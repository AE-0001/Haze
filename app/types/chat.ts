export type ChatMsg = { role: "user" | "assistant"; text: string };
export type ApiMsg = { role: "system" | "user" | "assistant"; content: string };

export type Brief = {
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
    customerEmail?: string;
    closing_to_customer: string;
};

export type LlmNext =
    | { done: false; question: string }
    | { done: true; brief: Brief };
