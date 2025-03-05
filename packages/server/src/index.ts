import { Composio, OpenAIToolSet } from "composio-core";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { OpenAI } from "openai";
import { z } from "zod";
import { tools as availableTools } from "./tools";

const models = {
    gpt4oMini: "gpt-4o-mini",
    gpt4: "gpt-4-turbo-preview",
    gpt35: "gpt-3.5-turbo",
} as const;

// Define types for our box content
interface BoxContent {
    spec: string;
    html: string;
    js: string;
    description: string;
}

// Define schema for box content
const boxContentSchema = z.object({
    spec: z.string(),
    html: z.string(),
    js: z.string(),
    description: z.string(),
});

// Define schema for prompt request
const promptSchema = z.object({
    prompt: z.string(),
});

const SYSTEM_PROMPT = `You are an AI that generates interactive HTML/JS components. You MUST return ONLY a JSON object with no additional text or explanation. The response must be valid JSON that can be parsed directly.

For reference, the current date and time is ${new Date().toISOString()}. The user's timezone is ${
    Intl.DateTimeFormat().resolvedOptions().timeZone
}. 

Any data from tools will be provided. The JavaScript code should ONLY handle rendering and interactions - DO NOT fetch data in the JavaScript code.

Format:
{
    "spec": "string explaining the high level technical approach behind the design. Be specific about the html and js code you will generate.",
    "html": "string containing the HTML structure",
    "js": ".string containing ONLY rendering and interaction logic - NO data fetching. The initial state object should be the first thing defined in the js section.",
    "description": "string describing what was built"
}

Example 1 - Counter:
{
    "spec": "I will generate a counter component with a button to increment the count and a display of the current count. the initial state object should be the first thing defined in the js section.",
    "html": "<div class='text-center'><span id='count' class='text-2xl font-bold'>0</span><div class='mt-4'><button id='increment' class='bg-blue-500 text-white px-4 py-2 rounded'>+1</button></div></div>",
    "js": "const state = { count: 0 }; document.getElementById('increment').onclick = () => { state.count++; document.getElementById('count').textContent = state.count; }",
    "description": "A simple counter that displays a number and can be incremented by clicking a button. The current count is maintained in state."
}

Example 2 - Calendar Events (with tool data):
{
    "spec": "I will create a component that displays calendar events from the provided tool data. Events will be shown in a list format with times and titles.",
    "html": "<div class='space-y-2'><div id='events-list' class='text-left'></div></div>",
    
    "js": "const state = {
        events: [],
        timezone: 'America/New_York'
    };\n
    const eventsList = document.getElementById('events-list');\nstate.events.forEach(event => {\n  const div = document.createElement('div');\n  div.className = 'p-2 border rounded';\n  div.textContent = \`\${event.title} - \${new Date(event.start).toLocaleTimeString()}\`;\n  eventsList.appendChild(div);\n});",
    "description": "A calendar component that displays events in a list format, showing the title and start time of each event."
}

Rules:
1. Return ONLY the JSON object - no markdown, no explanations, no additional text
2. The style should always fit in a box. Use w-full and h-full to make sure the component takes the full size of the box
3. Use Tailwind CSS for styling
4. Make components interactive and stateful
5. Use unique IDs for elements
6. In the js section, use single backslash for escaping newlines (\\n not \\\\n)
8. Tool data will be provided in the state object - DO NOT fetch data in JavaScript
9. Handle edge cases and errors
10. Always include spec first and description last in your response
11. Keep spec focused on design decisions and implementation approach
12. Keep description concise and focused on features and functionality

Available Libraries:
- Chart.js (via CDN) - You can use the Chart class directly in your JavaScript code`;

const TOOL_SELECTION_PROMPT = `Given a user's request for an interactive component, determine which tools from the available toolset would be helpful.
Available tool categories: ${Object.keys(availableTools).join(", ")}

Respond with a JSON array of tool categories that would be useful for implementing the requested feature.
Only include categories if they would genuinely help implement the functionality.

Example:
User: "Create a calendar that shows all my remaining events for today"
Response: ["google_calendar"]

User: "Create a counter that increments when clicked"
Response: []

Rules:
1. Return ONLY the JSON object - no markdown, no explanations, no additional text
2. If no tools are needed, return an empty array
`;

const TOOL_USAGE_PROMPT = `You are an AI assistant that fetches real-time data using available tools. Your task is to gather relevant data based on the user's request.

The current time is ${new Date().toLocaleString()} in timezone ${
    Intl.DateTimeFormat().resolvedOptions().timeZone
}. This can also be written as ${new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneName: "longOffset",
})}

When interacting with a calendar, always use the user's timezone.

When using calendar tools:
1. Always consider the user's current timezone
2. For "today", fetch events from now until midnight
3. For specific times, use ISO format
4. Handle empty results gracefully

Example responses:
1. Calendar request: "Show my events for today"
- Use GOOGLECALENDAR_FIND_EVENT to fetch events from now until midnight
- Return all found events or indicate if none exist

2. Weather request: "Show current weather"
- Use appropriate weather tools to get current conditions
- Include all relevant weather data in response

Rules:
1. Only use tools that are provided to you
2. Always return data in a structured JSON format
3. Include error handling for failed requests
4. Consider timezone differences in all datetime operations
5. For calendar events, always include start time, end time, and title at minimum
`;

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
const composioToolset = new OpenAIToolSet();
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getRelevantTools(prompt: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
        model: models.gpt4oMini,
        messages: [
            {
                role: "system",
                content: TOOL_SELECTION_PROMPT,
            },
            {
                role: "user",
                content: `User: ${prompt}`,
            },
        ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
        return [];
    }

    try {
        const selectedCategories = JSON.parse(content) as string[];
        // Flatten all selected tool categories into a single array of tool names
        const selectedTools = selectedCategories.flatMap(
            (category) =>
                availableTools[category as keyof typeof availableTools] || []
        );
        return selectedTools;
    } catch (error) {
        console.error("Failed to parse tool selection response:", error);
        return [];
    }
}

// API routes
app.post("/api/generate", async (req, res) => {
    try {
        const { prompt } = promptSchema.parse(req.body);
        // console.log("generating", prompt);

        // Step 1: Get relevant tools based on the prompt
        const selectedTools = await getRelevantTools(prompt);
        // console.log("Selected tools:", selectedTools);

        // Step 2: Initialize tools if any were selected
        const tools =
            selectedTools.length > 0
                ? await composioToolset.getTools({
                      actions: selectedTools,
                  })
                : [];

        // Step 3: Generate the component with tools available
        console.log("generating tools response", TOOL_USAGE_PROMPT);
        const toolResponse = await openai.chat.completions.create({
            model: models.gpt4oMini,
            max_tokens: 4000,
            messages: [
                {
                    role: "system",
                    content: TOOL_USAGE_PROMPT,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            ...(tools.length > 0 && {
                tools: tools,
                tool_choice: "auto",
            }),
        });

        console.log("tool response", JSON.stringify(toolResponse));
        // Extract the response and parse it as JSON
        const toolData = await composioToolset.handleToolCall(toolResponse);

        // console.log("tool data", toolData);
        const response = await openai.chat.completions.create({
            model: models.gpt4oMini,
            max_tokens: 4000,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "system",
                    content: `Here is the data you will use in your response. Do not fetch data in the JavaScript code!!!
                     ${JSON.stringify(toolData)}`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const content = response.choices[0].message.content;
        console.log("Content: ", content);
        if (!content) {
            throw new Error("Empty response from OpenAI");
        }

        try {
            // Clean the response text
            const cleanedText = content
                .trim() // Remove leading/trailing whitespace
                .replace(/^\uFEFF/, "") // Remove BOM if present
                .replace(/^\u200B/, "") // Remove zero-width space if present
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
                .replace(/\\\\n/g, "\\n"); // Fix double-escaped newlines

            // Ensure we're starting with a valid JSON object
            if (!cleanedText.startsWith("{")) {
                throw new Error("Response does not start with {");
            }

            const parsedJson = JSON.parse(cleanedText);
            const boxContent = boxContentSchema.parse(parsedJson);
            res.json(boxContent);
        } catch (parseError) {
            console.error("Failed to parse OpenAI response:", parseError);
            console.error("Original response:", content);
            res.status(500).json({ error: "Invalid response format from AI" });
        }
    } catch (error) {
        console.error("Error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: "Invalid request format",
                details: error.errors,
            });
        } else {
            res.status(500).json({ error: "Server error" });
        }
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📝 Send POST requests to http://localhost:${port}/generate`);
});

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
