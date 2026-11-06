import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import App from "./App";

/** Renders the full page to static HTML at build time (React 19 static API). */
export async function render() {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  let html = "";
  for await (const chunk of prelude) html += chunk;
  return html;
}
