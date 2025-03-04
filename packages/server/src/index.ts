import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Hello World route
app.get("/", (req, res) => {
    res.json({ message: "Hello World! The Four Boxes server is running." });
});

// Validation schema for the prompt request
const promptSchema = z.object({
    prompt: z.string(),
    boxId: z.string(),
});

// Route to handle LLM requests
app.post("/api/generate", async (req, res) => {
    try {
        const { prompt, boxId } = promptSchema.parse(req.body);

        // Example response (replace with actual LLM integration)
        const emailViewerContent = {
            html: `
        <div id="email-container">
          <div id="email-list" class="space-y-2">
            <h3 class="font-bold">Emails</h3>
            <div class="space-y-1" id="email-items"></div>
          </div>
          <div id="email-detail" class="hidden space-y-4">
            <button onclick="showEmailList()" class="text-blue-500">← Back</button>
            <h3 id="email-subject" class="font-bold"></h3>
            <div id="email-from" class="text-sm text-gray-600"></div>
            <div id="email-body" class="border-t pt-2"></div>
          </div>
        </div>
      `,
            js: `
        // Initialize state
        state.emails = [
          { subject: "Meeting Tomorrow", from: "boss@company.com", body: "Let's discuss the project..." },
          { subject: "Weekly Update", from: "team@company.com", body: "Here's what we accomplished..." }
        ];
        state.currentEmail = null;

        // Render email list
        function renderEmails() {
          const container = box.querySelector('#email-items');
          container.innerHTML = state.emails.map((email, i) => 
            '<div class="p-2 border rounded cursor-pointer hover:bg-gray-50" onclick="showEmail(' + i + ')">' +
            email.subject +
            '</div>'
          ).join('');
        }

        // Show email detail
        window.showEmail = function(index) {
          state.currentEmail = state.emails[index];
          box.querySelector('#email-list').classList.add('hidden');
          box.querySelector('#email-detail').classList.remove('hidden');
          box.querySelector('#email-subject').textContent = state.currentEmail.subject;
          box.querySelector('#email-from').textContent = 'From: ' + state.currentEmail.from;
          box.querySelector('#email-body').textContent = state.currentEmail.body;
        }

        // Show email list
        window.showEmailList = function() {
          state.currentEmail = null;
          box.querySelector('#email-list').classList.remove('hidden');
          box.querySelector('#email-detail').classList.add('hidden');
        }

        // Initial render
        renderEmails();
      `,
            state: {},
        };

        res.json(emailViewerContent);
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({ error: "Invalid request" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
