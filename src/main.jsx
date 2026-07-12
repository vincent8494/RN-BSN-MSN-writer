import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Fade out the branded preloader once React has painted its first frame.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById("preloader")?.classList.add("done");
  });
});
