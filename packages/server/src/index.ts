import { OpenAIToolSet } from "composio-core";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { OpenAI } from "openai";
import { z } from "zod";
import {
    ComposioAuthRequiredError,
    doesUserHaveConnection,
    setupUserConnectionIfNotExists,
} from "./composio";
import { fetchLayoutPlan } from "./lib/util/fetchLayout";
import { fetchToolData } from "./lib/util/fetchToolData";
import { PROMPT_CLASSIFIER, createSystemPrompt } from "./prompts";

export const models = {
    gpt4oMini: "gpt-4o-mini",
    gpt4: "gpt-4-turbo-preview",
    gpt35: "gpt-3.5-turbo",
} as const;

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
app.get("/api/connections", async (req, res) => {
    try {
        const auth = req.auth!;
        const userId = auth.payload.sub;

        const services = ["googlecalendar", "gmail", "slack"];
        const connections = await Promise.all(
            services.map(async (service) => {
                const isConnected = await doesUserHaveConnection(
                    userId,
                    service
                );
                return {
                    id: service,
                    isConnected,
                };
            })
        );

        return res.status(200).json({ connections });
    } catch (error) {
        console.error("Error checking connections:", error);
        return res.status(500).json({ error: "Failed to check connections" });
    }
});

// Add new endpoint to connect to a specific tool
app.post("/api/connect/:toolId", async (req, res) => {
    try {
        const auth = req.auth!;
        const userId = auth.payload.sub;
        const { toolId } = req.params;

        // Validate tool ID
        const validToolIds = ["google-calendar", "gmail", "slack"];
        if (!validToolIds.includes(toolId)) {
            return res.status(400).json({ error: "Invalid tool ID" });
        }

        try {
            // Attempt to setup connection
            await setupUserConnectionIfNotExists(userId, toolId);
            return res.status(200).json({ success: true });
        } catch (error) {
            if (error instanceof ComposioAuthRequiredError) {
                return res.status(401).json({
                    type: "OAUTH_REQUIRED",
                    redirectUrl: error.redirectUrl,
                });
            }
            throw error;
        }
    } catch (error) {
        console.error(`Error connecting to ${req.params.toolId}:`, error);
        return res.status(500).json({ error: "Failed to connect to tool" });
    }
});

app.post("/api/generate", async (req, res) => {
    try {
        const auth = req.auth!;
        const userId = auth.payload.sub;

        const { prompt } = promptSchema.parse(req.body);
        console.log("Prompt: ", prompt);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // First, classify the prompt type
        const classifierResponse = await openai.chat.completions.create({
            model: models.gpt4oMini,
            messages: [
                { role: "system", content: PROMPT_CLASSIFIER },
                { role: "user", content: prompt },
            ],
        });

        // Parse the JSON response from the classifier
        const classifierContent =
            classifierResponse.choices[0].message.content?.trim() || "{}";
        let classification: {
            type: string;
            toolStrategy: string;
            layoutStrategy: string;
        };

        try {
            classification = JSON.parse(classifierContent);
        } catch (error) {
            console.error("Failed to parse classifier response:", error);
            // Fallback to treating the response as just the type string for backward compatibility
            classification = {
                type: classifierContent as
                    | "GEN"
                    | "UPDATE"
                    | "COMMAND"
                    | "PROMPT",
                toolStrategy: "Use tools when possible.",
                layoutStrategy: "Use Material UI to make the app look nice.",
            };
        }

        const promptType = classification.type as
            | "GEN"
            | "UPDATE"
            | "COMMAND"
            | "PROMPT";
        const toolStrategy = classification.toolStrategy || "";
        const layoutStrategy = classification.layoutStrategy || "";

        console.log("Prompt Type:", promptType);
        console.log("Tool Strategy:", toolStrategy);
        console.log("Layout Strategy:", layoutStrategy);

        if (promptType === "PROMPT") {
            return res.json({
                type: "PROMPT",
                description:
                    "I can only help with creating and modifying graphical components. I can't answer general questions.",
                jsx: "",
                spec: "",
                initialState: {},
                toolStrategy: toolStrategy,
                layoutStrategy: layoutStrategy,
            });
        }

        // For GEN and UPDATE types, get the layout plan
        let layoutPlanPromise: Promise<string> = Promise.resolve(
            "Use Material UI to make the app look nice."
        );
        if (promptType === "GEN" || promptType === "UPDATE") {
            layoutPlanPromise = fetchLayoutPlan(openai, prompt, layoutStrategy);
        }

        // Continue with normal flow
        const composioToolset = new OpenAIToolSet({
            apiKey: process.env.COMPOSIO_API_KEY,
            entityId: userId,
        });

        // Run layout plan generation and tool data fetching in parallel
        const toolDataPromise = fetchToolData(
            openai,
            composioToolset,
            toolStrategy
        );

        // Wait for both promises to resolve
        const [layoutPlan, toolData] = await Promise.all([
            layoutPlanPromise,
            toolDataPromise,
        ]);

        const response = await openai.chat.completions.create({
            model: models.gpt4oMini,
            max_tokens: 4000,
            messages: [
                { role: "system", content: createSystemPrompt(promptType) },
                {
                    role: "system",
                    content: `Here is the layout plan and tool data you will use in your response:
                    ${JSON.stringify({ layout: layoutPlan, tools: toolData })}
                    
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
                console.error(
                    "Response doesn't start with '{'. Content:",
                    cleanedText
                );
                throw new Error("Response does not start with {");
            }

            try {
                const parsedJson = JSON.parse(cleanedText);
                const boxContent = boxContentSchema.parse(parsedJson);

                // Add the prompt type to the response
                const response: GenerateResponse = {
                    ...boxContent,
                    type: promptType,
                };
                console.log("Response: ", response);

                res.json(response);
            } catch (jsonParseError) {
                console.error("JSON parsing error:", jsonParseError);
                console.error(
                    "Cleaned text that failed to parse:",
                    cleanedText
                );
                throw jsonParseError;
            }
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
