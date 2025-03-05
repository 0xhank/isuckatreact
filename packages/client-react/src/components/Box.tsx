import { LLMCodeRenderer } from "../utils/LLMCodeRenderer";

export interface BoxContent {
    spec: string;
    html: string;
    js: string;
    description: string;
}

interface BoxProps {
    content: BoxContent;
}

export const Box: React.FC<BoxProps> = ({ content }) => {
    return (
        <div className="w-full h-full">
            <LLMCodeRenderer html={content.html} js={content.js} />
        </div>
    );
};
