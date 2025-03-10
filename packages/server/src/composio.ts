import { Composio, OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const composioToolset = new OpenAIToolSet();

export class ComposioAuthRequiredError extends Error {
    redirectUrl: string;

    constructor(redirectUrl: string) {
        super("Authentication required");
        this.redirectUrl = redirectUrl;
        this.name = "ComposioAuthRequiredError";
    }
}

export async function doesUserHaveConnection(entityId = "default", appName: string) {
    const entity = client.getEntity(entityId);
    try {
        await entity.getConnection({
            app: appName,
        });
        return true;
    } catch {
        return false;
    }
}

export async function setupUserConnectionIfNotExists(entityId = "default", appName: string) {
    const entity = client.getEntity(entityId);
    try {
        const connection = await entity.getConnection({
            app: appName,
        });
        return connection;
    } catch {
        const newConnection = await entity.initiateConnection({
            appName: appName,
        });
        if (!newConnection.redirectUrl) {
            throw new Error("No redirect URL found");
        }
        throw new ComposioAuthRequiredError(newConnection.redirectUrl);
    }
}

// Create completion with instruction

// Execute the tool call
// const result = await composioToolset.handleToolCall(response);
// console.log(result);

async function createGoogleCalendarEvent(params: {
    title: string;
    description: string;
    start: Date;
    end: Date;
}) {
    // Get connection first, then initialize tools
    await setupUserConnectionIfNotExists("default", "googlecalendar");

    // Get GitHub star action
    const tools = await composioToolset.getTools({
        actions: ["GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_FIND_EVENT"],
    });

    const instruction = `Create an event in Google Calendar for ${params.title} on ${params.start} until ${params.end}.`;
    const response = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: instruction }],
        tools: tools,
        tool_choice: "auto",
    });
    const result = await composioToolset.handleToolCall(response);
    console.log(result);
}

async function listGoogleCalendarEvents() {
    // Get connection first, then initialize tools
    await setupUserConnectionIfNotExists("default", "googlecalendar");

    // Get GitHub star action
    const tools = await composioToolset.getTools({
        actions: ["GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_FIND_EVENT"],
    });

    const now = new Date();
    const midnightEastern = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
    );
    const instruction = `Fetch my events from ${now} until ${midnightEastern}.`;
    const response = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: instruction }],
        tools: tools,
        tool_choice: "auto",
    });

    console.log(
        "tool call response",
        JSON.stringify(response.choices[0].message)
    );
    const result = await composioToolset.handleToolCall(response);
    console.log("tool call result", result);
}

if (require.main === module) {
    listGoogleCalendarEvents().catch(console.error);
    createGoogleCalendarEvent({
        title: "Getting coffee with John Doe",
        description: "Getting coffee with John Doe",
        start: new Date(Date.now() + 1000 * 60 * 60 * 2),
        end: new Date(Date.now() + 1000 * 60 * 60 * 2 + 1000 * 60 * 15),
    }).catch(console.error);
}

export { createGoogleCalendarEvent, listGoogleCalendarEvents };
