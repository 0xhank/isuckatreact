import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "./App.css";
import { Box } from "./components/Box";
import { ChatInterface } from "./components/ChatInterface";
import { BoxContent } from "./types/box";
import { ChatMessage } from "./types/chat";

const queryClient = new QueryClient();

function App() {
    const [boxContent, setBoxContent] = useState<BoxContent | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const buildPromptContext = () => {
        let context = "Chat history:\n";
        chatHistory.forEach((entry) => {
            context += `${entry.isUser ? "User" : "Assistant"}: ${
                entry.message
            }\n`;
        });

        if (boxContent) {
            context += "\nCurrent component code:\n";
            context += `HTML:\n${boxContent.html}\n`;
            context += `JavaScript:\n${boxContent.js}\n`;
        }
        return context;
    };

    const handlePromptSubmit = async (prompt: string) => {
        try {
            const contextualPrompt = buildPromptContext() + "\nUser: " + prompt;

            setChatHistory((prev) => [
                ...prev,
                { message: prompt, isUser: true },
            ]);

            const response = await fetch("http://localhost:3000/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: contextualPrompt }),
            });

            const content = await response.json();

            setChatHistory((prev) => [
                ...prev,
                {
                    message: `Generated component: ${content.description}`,
                    isUser: false,
                },
            ]);

            setBoxContent(content);
        } catch (error) {
            console.error("Error generating component:", error);
            setChatHistory((prev) => [
                ...prev,
                {
                    message: "Error: Failed to generate content",
                    isUser: false,
                },
            ]);
        }
    };

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen min-w-screen flex justify-center bg-gray-50 text-black">
                <div className="w-full max-w-[1200px] flex justify-center p-4 gap-6">
                    <ChatInterface
                        onSubmit={handlePromptSubmit}
                        chatHistory={chatHistory}
                    />

                    <div className={`flex-1 ${!boxContent ? "hidden" : ""}`}>
                        <div className="bg-white rounded-lg border border-gray-200 p-6 h-[600px] overflow-y-auto shadow-sm hover:shadow-md transition-shadow">
                            {boxContent && <Box content={boxContent} />}
                        </div>
                    </div>
                </div>
            </div>
        </QueryClientProvider>
    );
}

export default App;
