import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

export interface CellState {
  id: string;
  freeform: string;
  status: "freeform" | "candidate" | "filling" | "executed" | "done";
  patternId?: string;
  actionId?: string;
}

const root = createRoot(document.getElementById("app"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
