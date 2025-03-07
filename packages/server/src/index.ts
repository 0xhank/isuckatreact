import { OpenAIToolSet } from "composio-core";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { OpenAI } from "openai";
import { z } from "zod";
import {
    ComposioAuthRequiredError,
    setupUserConnectionIfNotExists,
} from "./composio";
import { LAYOUT_PROMPT } from "./lib/prompts/layout";
import { fetchToolData } from "./lib/util/fetchToolData";
import { PROMPT_CLASSIFIER, createSystemPrompt } from "./prompts";

export const models = {
    gpt4oMini: "gpt-4o-mini",
    gpt4: "gpt-4-turbo-preview",
    gpt35: "gpt-3.5-turbo",
} as const;

interface BoxContent {
    spec: string;
    jsx: string;
    initialState: Record<string, unknown>;
    description: string;
}

// Define schema for box content
const boxContentSchema = z.object({
    spec: z.string(),
    jsx: z.string(),
    initialState: z.record(z.string(), z.unknown()),
    description: z.string(),
});

// Define schema for prompt request
const promptSchema = z.object({
    prompt: z.string(),
});

// Add new interface for response types
interface GenerateResponse {
    spec: string;
    jsx: string;
    initialState: Record<string, unknown>;
    description: string;
    type: "GEN" | "UPDATE" | "COMMAND" | "PROMPT";
}

// Add new interface for layout response
interface LayoutPlan {
    grid: {
        rows: number;
        columns: number;
        gap: string;
    };
    components: Array<{
        type: string;
        purpose: string;
        behavior: string;
        gridArea: {
            rowStart: number;
            rowEnd: number;
            columnStart: number;
            columnEnd: number;
        };
        styles?: {
            justifySelf?: string;
            alignSelf?: string;
        };
    }>;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const jwtCheck = auth({
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
});

app.use(jwtCheck);

// API routes
app.post("/api/generate", async (req, res) => {
    try {
        const auth = req.auth!;
        const userId = auth.payload.sub;

        try {
            await setupUserConnectionIfNotExists(userId);
        } catch (error) {
            if (error instanceof ComposioAuthRequiredError) {
                return res.status(401).json({
                    type: "OAUTH_REQUIRED",
                    redirectUrl: error.redirectUrl,
                });
            }
            return res.status(500).json({ error: "Server error" });
        }

        const { prompt } = promptSchema.parse(req.body);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // First, classify the prompt type
        const classifierResponse = await openai.chat.completions.create({
            model: models.gpt4oMini,
            messages: [
                { role: "system", content: PROMPT_CLASSIFIER },
                { role: "user", content: prompt },
            ],
        });

        const promptType =
            classifierResponse.choices[0].message.content?.trim() as
                | "GEN"
                | "UPDATE"
                | "COMMAND"
                | "PROMPT";

        console.log("Prompt Type: ", promptType);

        if (promptType === "PROMPT") {
            return res.json({
                type: "PROMPT",
                description:
                    "I can only help with creating and modifying graphical components. I can't answer general questions.",
                jsx: "",
                spec: "",
                initialState: {},
            });
        }

        // For GEN and UPDATE types, get the layout plan
        let layoutPlan: LayoutPlan | undefined;
        if (promptType === "GEN" || promptType === "UPDATE") {
            const layoutResponse = await openai.chat.completions.create({
                model: models.gpt4oMini,
                messages: [
                    { role: "system", content: LAYOUT_PROMPT },
                    { role: "user", content: prompt },
                ],
            });

            try {
                layoutPlan = JSON.parse(
                    layoutResponse.choices[0].message.content || "{}"
                );
                console.log("Layout Plan:", layoutPlan);
            } catch (error) {
                console.error("Failed to parse layout plan:", error);
            }
        }

        // Continue with normal flow
        const composioToolset = new OpenAIToolSet({
            apiKey: process.env.COMPOSIO_API_KEY,
            entityId: userId,
        });

        const toolData = await fetchToolData(openai, composioToolset, prompt);

        const response = await openai.chat.completions.create({
            model: models.gpt4oMini,
            max_tokens: 4000,
            messages: [
                { role: "system", content: createSystemPrompt(promptType) },
                {
                    role: "system",
                    content: `Here is the layout plan and tool data you will use in your response:
                    ${JSON.stringify({ layout: layoutPlan, tools: toolData })}
                    
                    When implementing the layout, use CSS Grid according to the layout plan.
                    Do not add any functions to fetch remote data in the JavaScript code.`,
                },
                { role: "user", content: prompt },
            ],
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error("Empty response from OpenAI");
        }

        try {
            const cleanedText = content
                .trim()
                .replace(/^\uFEFF/, "")
                .replace(/^\u200B/, "")
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
                .replace(/\\\\n/g, "\\n");

            if (!cleanedText.startsWith("{")) {
                throw new Error("Response does not start with {");
            }

            const parsedJson = JSON.parse(cleanedText);
            const boxContent = boxContentSchema.parse(parsedJson);

            // Add the prompt type to the response
            const response: GenerateResponse = {
                ...boxContent,
                type: promptType,
            };
            console.log("Response: ", response);

            res.json(response);
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
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Send POST requests to http://localhost:${port}/generate`);
});

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
