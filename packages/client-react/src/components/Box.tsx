import { LLMCodeRenderer } from "../utils/LLMCodeRenderer";

export interface BoxContent {
    spec: string;
    html: string;
    js: string;
    initialState: Record<string, unknown>;
    description: string;
}

interface BoxProps {
    content: BoxContent;
    state: Record<string, unknown>;
    onStateChange: (state: Record<string, unknown>) => void;
    onCommand?: (command: string) => void;
}

export const Box: React.FC<BoxProps> = ({
    content,
    state,
    onStateChange,
    onCommand,
}) => {
    return (
        <div className="w-full h-full">
            <LLMCodeRenderer
                html={content.html}
                js={content.js}
                initialState={state}
                onStateChange={onStateChange}
                onCommand={onCommand}

            />
        </div>
    );
};
