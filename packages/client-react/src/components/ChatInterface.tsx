import React, { KeyboardEvent, useState } from "react";

const UserIcon = () => (
    <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);

const AIIcon = () => (
    <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
    </svg>
);

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
            setPrompt("");
            await onSubmit(prompt);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
 

    const displayedChatHistory = [
        ...chatHistory,
        ...(isLoading ? [{ message: "Thinking...", isUser: false }] : []),
    ];

    return (
        <div className="w-[400px] flex flex-col">
            <p className="text-4xl font-medium mb-8 text-black tracking-tight">
                Create a web app with AI
            </p>

            <div
                className={`flex-1 bg-white rounded-lg border border-gray-200 p-4 mb-4 h-[500px] overflow-y-auto ${
                    displayedChatHistory.length === 0 ? "hidden" : ""
                }`}
            >
                <div className="space-y-4">
                    {displayedChatHistory.length === 0 ? (
                        <div className="text-sm text-gray-500">
                            Start a conversation by entering a prompt below.
                        </div>
                    ) : (
                        displayedChatHistory.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 ${
                                    msg.isUser ? "flex-row-reverse" : "flex-row"
                                }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        msg.isUser
                                            ? "bg-gray-100"
                                            : "bg-blue-50 border border-blue-100"
                                    }`}
                                >
                                    {msg.isUser ? <UserIcon /> : <AIIcon />}
                                </div>
                                <div
                                    className={`flex-1 p-4 rounded-lg text-sm ${
                                        msg.isUser
                                            ? "bg-gray-100 rounded-tr-none"
                                            : "bg-blue-50 border border-blue-100 rounded-tl-none"
                                    }`}
                                >
                                    {msg.message}
                                    {!msg.isUser &&
                                        msg.message === "Thinking..." && (
                                            <span className="inline-block animate-pulse">
                                                ...
                                            </span>
                                        )}
                                </div>
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
                        placeholder="Create an app..."
                        rows={3}
                    />
                </div>
                <div className="flex gap-2 self-end">
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
