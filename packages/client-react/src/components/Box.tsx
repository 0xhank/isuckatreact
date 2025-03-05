import { useEffect, useState } from "react";
import { BoxProps } from "../types/box";
import { LLMCodeRenderer } from "../utils/LLMCodeRenderer";

export const Box: React.FC<BoxProps> = ({ content }) => {
    const [error, setError] = useState<string | null>(null);
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(
        null
    );

    useEffect(() => {
        try {
            const DynamicComponent = (
                <LLMCodeRenderer htmlContent={content.component.jsx} />
            );
            setComponent(() => DynamicComponent);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create component"
            );
            console.error("Error creating component:", err);
        }
    }, [content]);

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!Component) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full h-full p-4 border rounded shadow">
            <Component {...content.component.initialProps} />
        </div>
    );
};
