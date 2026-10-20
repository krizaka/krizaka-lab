import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { cleanSpaRedirect } from "./core/router";
import "./index.css";

// A deep link that went through GitHub Pages' 404.html comes back as ?/<route>: show the REST path again.
const restored = cleanSpaRedirect(window.location);
if (restored) window.history.replaceState(null, "", restored);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
