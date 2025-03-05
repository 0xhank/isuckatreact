import React, { useEffect, useRef } from "react";

interface LLMCodeRendererProps {
    html: string;
    js: string;
}

export const LLMCodeRenderer: React.FC<LLMCodeRendererProps> = ({
    html,
    js,
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;

        // Get access to the iframe document
        const iframe = iframeRef.current;
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) return;

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
                        ${js}
                    </script>
                </body>
            </html>
        `);
        iframeDocument.close();

        // Wait for content to load before adjusting height
        setTimeout(() => {
            if (iframeDocument.body) {
                iframe.style.height = `${iframeDocument.body.scrollHeight}px`;
            }
        }, 100);
    }, [html, js]);

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
