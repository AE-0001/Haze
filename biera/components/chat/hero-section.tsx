import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[400px] text-center p-6 space-y-8 animate-in fade-in zoom-in duration-700">

            {/* Orb Container */}
            <div className="relative flex items-center justify-center">
                {/* Glowing blur behind */}
                <div className="absolute w-40 h-40 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />

                {/* The Orb */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent)]" />
                    {/* "Eyes" for character */}
                    <div className="flex gap-3 translate-y-1">
                        <div className="w-2 h-3 bg-white rounded-full shadow-lg" />
                        <div className="w-2 h-3 bg-white rounded-full shadow-lg" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                    Where ideas meet designers and become merch.
                </h2>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {[
                        "Design a T-Shirt",
                        "Create Founder Wear",
                        "Team Jacket Concepts"
                    ].map((label, i) => (
                        <div
                            key={i}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-50 cursor-default transition-colors"
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
