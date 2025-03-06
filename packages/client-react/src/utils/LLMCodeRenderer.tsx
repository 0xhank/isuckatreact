import React, { useEffect, useRef, useState } from "react";

interface LLMCodeRendererProps {
    html: string;
    js: string;
    initialState: Record<string, unknown>;
    onStateChange: (state: Record<string, unknown>) => void;
}

// Extend Window interface to include our custom properties
declare global {
    interface Window {
        state: Record<string, unknown>;
        initComponent?: () => void;
    }
}

export const LLMCodeRenderer: React.FC<LLMCodeRendererProps> = ({
    html,
    js,
    initialState,
    onStateChange,
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const headRef = useRef<HTMLHeadElement | null>(null);
    const bodyRef = useRef<HTMLBodyElement | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Setup iframe structure once
    useEffect(() => {
        if (!iframeRef.current) return;

        const iframe = iframeRef.current;
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) return;

        const initialize = async () => {
            // Get existing head and body elements
            headRef.current = iframeDocument.head;
            bodyRef.current = iframeDocument.body as HTMLBodyElement;

            // Add state management script once
            const stateScript = iframeDocument.createElement("script");
            stateScript.textContent = `
                // State management
                let state = ${JSON.stringify(initialState)};

                function setState(newState) {
                    const updatedState = typeof newState === 'function'
                        ? newState(state)
                        : { ...state, ...newState };
                    
                    state = updatedState;
                    
                    // Notify parent
                    window.parent.postMessage({ 
                        type: 'STATE_UPDATE', 
                        state: state 
                    }, '*');
                    
                    // Re-run component logic with new state
                    if (typeof initComponent === 'function') {
                        initComponent();
                    }
                }

                function mergeState(partialState) {
                    setState(current => ({
                        ...current,
                        ...partialState
                    }));
                }
            `;
            headRef.current.appendChild(stateScript);

            // Create a promise-based script loader with check for existing script
            const loadScript = (src: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    if (!headRef.current) return reject();

                    // Check if script is already loaded
                    const existingScript = iframeDocument.querySelector(
                        `script[src="${src}"]`
                    );
                    if (existingScript) {
                        resolve();
                        return;
                    }

                    const script = iframeDocument.createElement("script");
                    script.src = src;
                    script.onload = () => resolve();
                    script.onerror = () => reject();
                    headRef.current.appendChild(script);
                });
            };

            // Only load scripts if needed
            const requiredScripts = [
                "https://cdn.tailwindcss.com",
                "https://cdn.jsdelivr.net/npm/chart.js",
            ];

            for (const src of requiredScripts) {
                await loadScript(src);
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
            setInitialized(true);
        };

        initialize();
    }, []); // Empty dependency array - only run once

    // Handle content updates
    useEffect(() => {
        if (!bodyRef.current || !iframeRef.current || !initialized) return;

        const iframe = iframeRef.current;
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) return;

        const renderContent = async () => {
            try {
                // Update HTML content
                bodyRef.current!.innerHTML = html;

                // Add only the component script
                const componentScript = iframeDocument.createElement("script");
                componentScript.textContent = `
                    // Update state with new initial state
                    state = ${JSON.stringify(initialState)};
                    
                    // Component initialization function
                    function initComponent() {
                        ${js}
                    }

                    initComponent();
                `;
                bodyRef.current!.appendChild(componentScript);
            } catch (error) {
                console.error("Error initializing content:", error);
            }
        };

        // Start the initialization process
        renderContent();

        // Handle state updates from iframe
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "STATE_UPDATE") {
                onStateChange(event.data.state);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [html, js, initialState, onStateChange, initialized]);

    return (
        <iframe
            ref={iframeRef}
            title="LLM Generated Content"
            style={{
                width: "100%",
                height: "300px",
                border: "none",
                overflow: "hidden",
            }}
            sandbox="allow-scripts allow-same-origin allow-popups"
        />
    );
};
