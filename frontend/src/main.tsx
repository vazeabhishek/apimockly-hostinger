import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { initAnalytics } from "./analytics";

void initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
