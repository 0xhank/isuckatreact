import { OpenAIToolSet } from "composio-core";
import OpenAI from "openai";
import { models } from "../..";
import {
    createToolSelectionPrompt,
    createToolUsagePrompt,
} from "../../prompts";
import { tools as availableTools } from "../data/tools";

/**
 * Fetches and processes tool data based on the user's prompt
 */
export async function fetchToolData(
    openai: OpenAI,
    composioToolset: OpenAIToolSet,
    strategy: string
): Promise<unknown> {
    const selectedTools = availableTools.flatMap((tool) => tool.actions);
    const tools = await composioToolset.getTools({
        actions: selectedTools,
    });

    // If no tools were selected, return null
    if (tools.length === 0) {
        return null;
    }

    // Generate the component with tools available
    const toolResponse = await openai.chat.completions.create({
        model: models.gpt4oMini,
        max_tokens: 4000,
        messages: [
            {
                role: "system",
                content: createToolUsagePrompt(),
            },
            {
                role: "user",
                content: strategy,
            },
        ],
        tools: tools,
        tool_choice: "auto",
    });

    console.log(
        "toolResponse",
        JSON.stringify(toolResponse.choices[0].message.content, null, 2)
    );
    const toolData = await composioToolset.handleToolCall(toolResponse);
    console.log("toolData", JSON.stringify(toolData, null, 2));
    return toolData;
}
