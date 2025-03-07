import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { SiGmail, SiGooglecalendar } from "react-icons/si";

interface Tool {
    id: string;
    name: string;
    icon: React.ReactNode;
    isConnected: boolean;
}

interface ConnectedToolsProps {
    tools?: Tool[];
}

// Individual Tool component
const Tool = ({
    tool,
    fetchConnections,
}: {
    tool: Tool;
    fetchConnections: () => Promise<void>;
}) => {
    const { getAccessTokenSilently } = useAuth0();

    const handleConnectTool = async (toolId: string) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `http://localhost:3000/api/connect/${toolId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Handle the response which might redirect to OAuth flow
            const data = await response.json();

            if (response.status === 401 && data.type === "OAUTH_REQUIRED") {
                // Open OAuth flow in a new tab
                window.open(data.redirectUrl, "_blank", "noopener,noreferrer");

                // Poll for connection status after a delay
                setTimeout(() => {
                    fetchConnections();
                }, 5000);
            } else if (response.ok) {
                // If connection was successful, refresh connection status
                fetchConnections();
            }
        } catch (error) {
            console.error(`Error connecting to ${toolId}:`, error);
        }
    };

    return (
        <div
            key={tool.id}
            className="relative group flex items-center justify-center cursor-pointer"
            title={`${tool.name} ${
                tool.isConnected ? "(Connected)" : "(Not Connected)"
            }`}
            onClick={() => !tool.isConnected && handleConnectTool(tool.id)}
        >
            <div
                className={`${
                    tool.isConnected ? "text-green-500" : "text-gray-300"
                } transition-colors duration-200`}
            >
                {tool.icon}
            </div>

            {!tool.isConnected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute inset-0 bg-gray-500/50 bg-opacity-70 rounded-full"></div>
                    <FaPlus className="relative z-10 text-blue-600 w-4 h-4" />
                </div>
            )}

            {tool.isConnected && (
                <div className="absolute z-100 -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                        {tool.name} Connected
                    </div>
                </div>
            )}
        </div>
    );
};

export const ConnectedTools: React.FC<ConnectedToolsProps> = ({ tools }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [toolsState, setToolsState] = useState<Tool[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Default tools with icons but connection status will be updated from API
    const defaultTools: Tool[] = [
        {
            id: "googlecalendar",
            name: "Google Calendar",
            icon: <SiGooglecalendar className="w-6 h-6" />,
            isConnected: false,
        },
        {
            id: "gmail",
            name: "Gmail",
            icon: <SiGmail className="w-6 h-6" />,
            isConnected: false,
        },

    ];

    const fetchConnections = async () => {
        try {
            setIsLoading(true);
            const token = await getAccessTokenSilently();
            const response = await fetch(
                "http://localhost:3000/api/connections",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch connections");
            }

            const data = await response.json();

            // Update the tools with connection status from the API
            const updatedTools = defaultTools.map((tool) => {
                const connection = data.connections.find(
                    (conn: { id: string }) => conn.id === tool.id
                );
                return {
                    ...tool,
                    isConnected: connection ? connection.isConnected : false,
                };
            });

            setToolsState(updatedTools);
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const displayedTools = tools || toolsState;

    return (
        <div className="w-full mb-2">   
            <div className="text-sm text-gray-500 font-bold">Connected Tools</div>
            <div className="w-full mb-2 bg-gray-200 rounded-lg p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center p-2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="flex space-x-6">
                        {displayedTools.map((tool) => (
                            <Tool
                                key={tool.id}
                                tool={tool}
                                fetchConnections={fetchConnections}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectedTools;
