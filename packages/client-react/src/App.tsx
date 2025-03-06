import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import "./App.css";
import { Box, BoxContent } from "./components/Box";
import { ChatInterface, ChatMessage } from "./components/ChatInterface";
import { LoginButton } from "./components/LoginButton";
import { StateDebugger } from "./components/StateDebugger";
import { dummyBoxContent } from "./utils/dummyBoxContent";

const queryClient = new QueryClient();

// Define response types
type ResponseType = "GEN" | "UPDATE" | "PROMPT";

interface OAuthResponse {
    type: "OAUTH_REQUIRED";
    redirectUrl: string;
}

interface GenerateResponse extends BoxContent {
    type: ResponseType;
}

function AppContent() {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [boxContent, setBoxContent] = useState<BoxContent | null>(
        dummyBoxContent
    );
    const [boxState, setBoxState] = useState<Record<string, unknown>>(
        dummyBoxContent?.initialState || {}
    );
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
            context += `\nCurrent component state:\n${JSON.stringify(
                boxState
            )}\n`;
        }
        return context;
    };

    const handlePromptSubmit = async (prompt: string) => {
        try {
            const contextualPrompt = buildPromptContext() + "\nUser: " + prompt;

            const token = await getAccessTokenSilently();

            setChatHistory((prev) => [
                ...prev,
                { message: prompt, isUser: true },
            ]);

            const response = await fetch("http://localhost:3000/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt: contextualPrompt }),
            });

            const data = (await response.json()) as
                | GenerateResponse
                | OAuthResponse;

            // If we need OAuth, open in a new tab
            if (response.status === 401 && data.type === "OAUTH_REQUIRED") {
                // Store the pending prompt
                localStorage.setItem("pendingPrompt", prompt);
                // Open OAuth flow in a new tab
                window.open(
                    (data as OAuthResponse).redirectUrl,
                    "_blank",
                    "noopener,noreferrer"
                );
                return;
            }

            // Handle different response types
            switch (data.type) {
                case "GEN":
                    // Reset state for new component
                    setBoxState((data as GenerateResponse).initialState || {});
                    setBoxContent(data);
                    break;

                case "UPDATE":
                    // Keep existing state, update component
                    console.log("UPDATED", data);
                    setBoxContent(data);
                    break;

              

                case "PROMPT":
                    // Just show the message, no component changes
                    break;
            }

            setChatHistory((prev) => [
                ...prev,
                {
                    message:
                        data.type === "OAUTH_REQUIRED"
                            ? "OAuth authentication required"
                            : data.type === "PROMPT"
                            ? data.description
                            : data.type == "GEN"
                            ? `Generated component: ${data.description}`
                            : `Updated component: ${data.description}`,
                    isUser: false,
                },
            ]);
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

    const handleCommand = async (command: string) => {
        console.log("Command received", command);
        await handlePromptSubmit(command);
    };

    useEffect(() => {
        const checkPendingOperations = async () => {
            const pendingPrompt = localStorage.getItem("pendingPrompt");
            if (pendingPrompt) {
                localStorage.removeItem("pendingPrompt");
                await handlePromptSubmit(pendingPrompt);
            }
        };

        if (isAuthenticated) {
            checkPendingOperations();
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen min-w-screen flex justify-center bg-gray-50 text-black">
                <div className="w-full max-w-[1200px] flex flex-col p-4 gap-6">
                    <div className="flex justify-end">
                        <LoginButton />
                    </div>

                    {isAuthenticated ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-center gap-6">
                                <ChatInterface
                                    onSubmit={handlePromptSubmit}
                                    chatHistory={chatHistory}
                                />

                                <div
                                    className={`flex-1 ${
                                        !boxContent ? "hidden" : ""
                                    }`}
                                >
                                    <div className="bg-white rounded-lg border border-gray-200 p-6 h-[600px] overflow-y-auto shadow-sm hover:shadow-md transition-shadow">
                                        {boxContent && (
                                            <Box
                                                content={boxContent}
                                                state={boxState}
                                                onStateChange={setBoxState}
                                                onCommand={handleCommand}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {boxContent && (
                                <StateDebugger
                                    state={boxState}
                                    content={boxContent}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-center mt-10">
                            <h1 className="text-2xl mb-4">Welcome to Casper</h1>
                            <p>Please log in to continue</p>
                        </div>
                    )}
                </div>
            </div>
        </QueryClientProvider>
    );
}

export default function App() {
    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
                scope: "openid profile email",
                response_type: "code",
                audience: `https://${
                    import.meta.env.VITE_AUTH0_DOMAIN
                }/api/v2/`,
            }}
            cacheLocation="localstorage"
        >
            <AppContent />
        </Auth0Provider>
    );
}
