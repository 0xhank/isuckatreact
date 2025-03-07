import { OpenAI } from "openai";
import { LAYOUT_PROMPT } from "../prompts/layout";
import { models } from "../..";

/**
 * Fetches a layout plan based on the user's prompt
 */
export async function fetchLayoutPlan(
    openai: OpenAI,
    prompt: string,
    layoutStrategy: string
): Promise<string> {
    const defaultResponse = "Use Material UI to make the app look nice.";
    try {
        const layoutResponse = await openai.chat.completions.create({
            model: models.gpt4oMini,
            messages: [
                { role: "system", content: LAYOUT_PROMPT },
                {
                    role: "assistant",
                    content: `Here is the strategy for the layout: ${layoutStrategy}.`,
                },
                { role: "user", content: prompt },
            ],
        });

        try {
            console.log(
                "Layout Response:",
                layoutResponse.choices[0].message.content
            );
            const layoutPlan = layoutResponse.choices[0].message.content;
            return layoutPlan ?? defaultResponse;
        } catch (error) {
            console.error("Failed to parse layout plan:", error);
            return defaultResponse;
        }
    } catch (error) {
        console.error("Error fetching layout plan:", error);
        return defaultResponse;
    }
}