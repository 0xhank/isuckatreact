export const createToolSelectionPrompt = (
    availableCategories: string[]
) => `Given a user's request for an interactive component, determine which tools from the available toolset would be helpful.
Available tool categories: ${availableCategories.join(", ")}

Respond with a JSON array of tool categories that would be useful for implementing the requested feature.

Example:
User: "Create a calendar that shows all my remaining events for today"
Response: ["google_calendar"]

User: "Create a counter that increments when clicked"
Response: []

Rules:
1. Return ONLY the JSON object - no markdown, no explanations, no additional text
2. If no tools are needed, return an empty array`;
