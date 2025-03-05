import React, { useEffect, useRef } from "react";


export const LLMCodeRenderer: React.FC<{ htmlContent: string }> = ({
    htmlContent
}) => {
    
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;

        // Get access to the iframe document
        const iframe = iframeRef.current;
        const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) return;

        // Write the LLM-generated content to the iframe
        iframeDocument.open();
        iframeDocument.write(htmlContent);
        iframeDocument.close();

        // Optional: Adjust iframe height based on content
        iframe.style.height = `${iframeDocument.body.scrollHeight}px`;
    }, [htmlContent]);


    
    return (
        <iframe
            ref={iframeRef}
            title="LLM Generated Content"
            style={{
                width: "100%",
                border: "none",
                overflow: "hidden",
            }}
            sandbox="allow-scripts"
        />
    );
};

