import { createRoot } from "react-dom/client";
import { InvestorProvider } from "./contexts/InvestorContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <InvestorProvider>
    <App />
  </InvestorProvider>
);
