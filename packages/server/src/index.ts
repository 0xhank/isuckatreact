import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { OpenAI } from "openai";
import { z } from "zod";

const models = {
    gpt4oMini: "gpt-4o-mini",
    gpt4: "gpt-4-turbo-preview",
    gpt35: "gpt-3.5-turbo",
} as const;

// Define types for our box content
interface BoxContent {
    spec: string;
    html: string;
    state: Record<string, unknown>;
    js: string;
    description: string;
}

// Define schema for box content
const boxContentSchema = z.object({
    spec: z.string(),
    html: z.string(),
    state: z.record(z.unknown()),
    js: z.string(),
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
    "state": "object containing initial state",
    "js": "string containing the JavaScript code",
    "description": "string describing what was built"
}

Example 1 - Counter:
{
    "spec": "I will generate a counter component with a button to increment the count and a display of the current count. The count will be stored in the state object.",
    "html": "<div class='text-center'><span id='count' class='text-2xl font-bold'>0</span><div class='mt-4'><button id='increment' class='bg-blue-500 text-white px-4 py-2 rounded'>+1</button></div></div>",
    "state": { "count": 0 },
    "js": "state.count = 0; document.getElementById('increment').onclick = () => { state.count++; document.getElementById('count').textContent = state.count; }",
    "description": "A simple counter that displays a number and can be incremented by clicking a button. The current count is maintained in state."
}

Rules:
1. Return ONLY the JSON object - no markdown, no explanations, no additional text
2. The style should always fit in a box. Use w-full and h-full to make sure the component takes the full size of the box
3. Use Tailwind CSS for styling
4. Make components interactive and stateful
5. Use unique IDs for elements
6. In the js section, use single backslash for escaping newlines (\\n not \\\\n)
7. Keep state in the 'state' object. Do not store state in the js object.
8. Handle edge cases and errors
9. Always include spec first and description last in your response
10. Keep spec focused on design decisions and implementation approach
11. Keep description concise and focused on features and functionality

Available Libraries:
- Chart.js (via CDN) - You can use the Chart class directly in your JavaScript code`;

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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

        const response = await openai.chat.completions.create({
            model: models.gpt4oMini,
            max_tokens: 4000,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // Extract the response and parse it as JSON
        const content = response.choices[0].message.content;
        console.log(content);
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
