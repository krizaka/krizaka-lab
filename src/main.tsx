import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { cleanSpaRedirect } from "./core/router";

// A deep link that went through GitHub Pages' 404.html comes back as ?/<route>: show the REST path again.
const restored = cleanSpaRedirect(window.location);
if (restored) window.history.replaceState(null, "", restored);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
