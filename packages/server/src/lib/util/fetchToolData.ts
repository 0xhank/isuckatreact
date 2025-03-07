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
    prompt: string
): Promise<unknown> {
    // Get relevant tools based on the prompt
    const selectedTools = await openai.chat.completions.create({
        model: models.gpt4oMini,
        messages: [
            {
                role: "system",
                content: createToolSelectionPrompt(Object.keys(availableTools)),
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    const toolCategories = JSON.parse(
        selectedTools.choices[0].message.content || "[]"
    ) as string[];

    const tools =
        toolCategories.length > 0
            ? await composioToolset.getTools({
                  actions: toolCategories.flatMap(
                      (category) =>
                          availableTools[
                              category as keyof typeof availableTools
                          ] || []
                  ),
              })
            : [];

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
                content: prompt,
            },
        ],
        tools: tools,
        tool_choice: "auto",
    });

    return await composioToolset.handleToolCall(toolResponse);
}
