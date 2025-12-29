import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMsg } from "@/app/types/chat";

interface MessageBubbleProps {
    message: ChatMsg;
    assistantAvatarLetter?: string;
    userAvatarLetter?: string;
    companyName?: string;
}

export function MessageBubble({
    message,
    assistantAvatarLetter = "H",
}: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex w-full gap-4 animate-in slide-in-from-bottom-2 duration-500",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-zinc-100 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-bold">
                        {assistantAvatarLetter}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn("flex flex-col max-w-[85%] md:max-w-[75%]", isUser ? "items-end" : "items-start")}>
                <div
                    className={cn(
                        "px-5 py-3 text-[15px] leading-relaxed",
                        isUser
                            ? "bg-zinc-900 text-zinc-50 rounded-[20px] rounded-br-sm shadow-sm"
                            : "text-zinc-800 p-0 pt-1.5" // Minimalist: Assistant text is just plain text next to avatar
                    )}
                >
                    <div className="whitespace-pre-wrap word-break-break-word">
                        {message.text}
                    </div>
                </div>
            </div>
        </div>
    );
}
