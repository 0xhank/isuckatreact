import React, { KeyboardEvent, useState } from "react";

interface ChatInterfaceProps {
    onSubmit: (prompt: string) => Promise<void>;
    chatHistory: Array<{ message: string; isUser: boolean }>;
}

export interface ChatMessage {
    message: string;
    isUser: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    onSubmit,
    chatHistory,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState("");

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await onSubmit(prompt);
            setPrompt("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setPrompt("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-[400px] flex flex-col">
            <h1 className="text-[32px] font-medium mb-8 text-black tracking-tight">
                Jasper
            </h1>

            <div
                className={`flex-1 bg-white rounded-lg border border-gray-200 p-4 mb-4 h-[500px] overflow-y-auto ${
                    chatHistory.length === 0 ? "hidden" : ""
                }`}
            >
                <div className="space-y-4">
                    {chatHistory.length === 0 ? (
                        <div className="text-sm text-gray-500">
                            Start a conversation by entering a prompt below.
                        </div>
                    ) : (
                        chatHistory.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg text-sm ${
                                    msg.isUser ? "bg-gray-100" : "bg-blue-50"
                                }`}
                            >
                                {msg.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your prompt..."
                        rows={3}
                    />
                </div>
                <div className="flex gap-2 self-end">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium ${
                            isLoading ? "loading" : ""
                        }`}
                    >
                        {isLoading ? "" : "\u23CE Generate"}
                    </button>
                </div>
            </div>
        </div>
    );
};
