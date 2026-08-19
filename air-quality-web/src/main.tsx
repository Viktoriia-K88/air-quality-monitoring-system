import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import App from "./App";
import { DistrictProvider } from "./context/DistrictProvider";
import { ThemeProvider } from "./context/ThemeProvider";

import "./styles/globals.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <DistrictProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </DistrictProvider>
    </ThemeProvider>
  </StrictMode>,
);
