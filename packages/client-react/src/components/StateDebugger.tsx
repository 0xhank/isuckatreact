import React, { useState } from "react";
import { BoxContent } from "./Box";

interface StateDebuggerProps {
    state: Record<string, unknown>;
    content: BoxContent;
}

type DebugTab = "state" | "html" | "js";

export const StateDebugger: React.FC<StateDebuggerProps> = ({
    state,
    content,
}) => {
    const [activeTab, setActiveTab] = useState<DebugTab>("state");

    const TabButton: React.FC<{ tab: DebugTab; label: string }> = ({
        tab,
        label,
    }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded-t-lg ${
                activeTab === tab
                    ? "bg-white border-gray-200 border-t border-l border-r text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "state":
                return JSON.stringify(state, null, 2);
            case "html":
                return content.html;
            case "js":
                return content.js;
            default:
                return "";
        }
    };

    return (
        <div className="mt-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex gap-2">
                    <TabButton tab="state" label="State" />
                    <TabButton tab="html" label="HTML" />
                    <TabButton tab="js" label="JavaScript" />
                </div>
                <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
            <div className="p-4 pt-0">
                <pre className="mt-4 text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-[200px] font-mono">
                    {renderContent()}
                </pre>
            </div>
        </div>
    );
};
