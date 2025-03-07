import React, { useEffect } from "react";
import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";

// Extend Window interface to include mergeState
declare global {
    interface Window {
        mergeState: (state: Record<string, unknown>) => void;
    }
}

interface ReactLiveRendererProps {
    code: string;
    scope?: Record<string, unknown>;
    props?: Record<string, unknown>;
    noInline?: boolean;
    showEditor?: boolean;
}

export interface BoxContent {
    spec: string;
    jsx: string;
    initialState: Record<string, unknown>;
    description: string;
}

export const ReactLiveRenderer: React.FC<ReactLiveRendererProps> = ({
    code,
    scope = {},
    props = {},
    noInline = false,
    showEditor = false,
}) => {
    // Create a combined scope with React and the props
    const combinedScope = {
        ...scope,
        React,
        ...props,
    };

    // Add mergeState to window if it doesn't exist
    useEffect(() => {
        if (!window.mergeState) {
            window.mergeState = (state: Record<string, unknown>) => {
                console.log("State updated:", state);
            };
        }
    }, []);

    return (
        <LiveProvider code={code} scope={combinedScope} noInline={noInline}>
            <div className="w-full h-full bg-white p-4 rounded-lg shadow-md">
                <LivePreview className="w-full h-full" />
                {showEditor && (
                    <div className="mt-4 rounded overflow-hidden">
                        <LiveEditor className="mt-4 rounded overflow-hidden" />
                        <LiveError className="text-red-500 mt-2" />
                    </div>
                )}
            </div>
        </LiveProvider>
    );
};
