import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Extend Window interface to include React and ReactDOM


createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
