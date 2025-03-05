export interface BoxContent {
    spec: string;
    component: {
        jsx: string;
        initialProps: Record<string, unknown>;
    };
    description: string;
}

export interface BoxProps {
    id: string;
    content: BoxContent;
}