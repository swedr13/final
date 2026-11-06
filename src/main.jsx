import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is pre-rendered (scripts/prerender.mjs); dev serves an empty shell.
// (The dev shell only holds the <!--app--> comment, so check for elements, not nodes.)
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
