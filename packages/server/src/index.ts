import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

const models = {
    sonnet: "claude-3-7-sonnet-20250219",
    haiku: "claude-3-haiku-20240307",
} as const;

// Define types for our box content
interface BoxContent {
    spec: string;
    html: string;
    js: string;
    state: Record<string, unknown>;
    description: string;
}

// Define schema for box content
const boxContentSchema = z.object({
    spec: z.string(),
    html: z.string(),
    js: z.string(),
    state: z.record(z.unknown()),
    description: z.string(),
});

// Define schema for prompt request
const promptSchema = z.object({
    prompt: z.string(),
});

const SYSTEM_PROMPT = `You are an AI that generates interactive HTML/JS components. You MUST return ONLY a JSON object with no additional text or explanation. The response must be valid JSON that can be parsed directly.

Format:
{
    "spec": "string explaining the high level technical approach behind the design. Be specific about the html and js code you will generate.",
    "html": "string containing the HTML structure",
    "js": "string containing the JavaScript code",
    "state": "object containing initial state",
    "description": "string describing what was built"
}

Example 1 - Counter:
{
    "spec": "I will generate a counter component with a button to increment the count and a display of the current count. The count will be stored in the state object.",
    "html": "<div class='text-center'><span id='count' class='text-2xl font-bold'>0</span><div class='mt-4'><button id='increment' class='bg-blue-500 text-white px-4 py-2 rounded'>+1</button></div></div>",
    "js": "state.count = 0; document.getElementById('increment').onclick = () => { state.count++; document.getElementById('count').textContent = state.count; }",
    "state": { "count": 0 },
    "description": "A simple counter that displays a number and can be incremented by clicking a button. The current count is maintained in state."
}

Rules:
1. Return ONLY the JSON object - no markdown, no explanations, no additional text
2. The style should always fit in a box. Use w-full and h-full to make sure the component takes the full size of the box
3. Use Tailwind CSS for styling
4. Make components interactive and stateful
5. Use unique IDs for elements
6. Keep state in the 'state' object
7. Handle edge cases and errors
8. Always include spec first and description last in your response
9. Keep spec focused on design decisions and implementation approach
10. Keep description concise and focused on features and functionality`;

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post("/api/generate", async (req, res) => {
    try {
        const { prompt } = promptSchema.parse(req.body);
        console.log("generating", prompt);

        const response = await anthropic.messages.create({
            model: models.haiku,
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // Extract the response and parse it as JSON
        const content = response.content[0];
        console.log(content);
        if (content.type !== "text") {
            throw new Error("Unexpected response type from Claude");
        }

        try {
            const parsedJson = JSON.parse(content.text);
            const boxContent = boxContentSchema.parse(parsedJson);
            res.json(boxContent);
        } catch (parseError) {
            console.error("Failed to parse Claude response:", parseError);
            console.error("Original response:", content.text);
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
