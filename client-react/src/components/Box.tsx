import { useEffect, useState } from "react";
import { createComponent } from "../../../packages/client-react/src/utils/LLMCodeRenderer";
import { BoxProps } from "../types/box";

export const Box: React.FC<BoxProps> = ({ id, content }) => {
    const [error, setError] = useState<string | null>(null);
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(
        null
    );

    useEffect(() => {
        try {
            const DynamicComponent = createComponent(content.component.jsx);
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
