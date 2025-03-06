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
    const [iframeId, setIframeId] = useState<number>(0);

    useEffect(() => {
        if (!iframeRef.current) return;
        console.log("useEffect with state", initialState, html, js);

        // Get access to the iframe document
        const iframe = iframeRef.current;
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) return;

        const newIframeId = Math.random();
        setIframeId(newIframeId);
        // Only initialize the iframe once
        // Write the complete HTML document with embedded JavaScript
        iframeDocument.open();
        iframeDocument.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                    </head>
                    <body>
                        ${html}
                        <script>
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
                                initComponent();
                            }

                            function mergeState(partialState) {
                                setState(current => ({
                                    ...current,
                                    ...partialState
                                }));
                            }

                            // Component initialization function
                            function initComponent() {
                                ${js}
                            }

                            initComponent();
                        </script>
                    </body>
                </html>
            `);
        iframeDocument.close();

        // Handle state updates from iframe
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "STATE_UPDATE") {
                onStateChange(event.data.state);
            }
        };

        window.addEventListener("message", handleMessage);

        // Wait for content to load before adjusting height
        setTimeout(() => {
            if (iframeDocument.body) {
                iframe.style.height = `${iframeDocument.body.scrollHeight}px`;
            }
        }, 100);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [html, js, initialState, onStateChange]);

    return (
        <iframe
            key={`iframe-${iframeId}`}
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
