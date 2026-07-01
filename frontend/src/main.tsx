import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import "../globals.css";
import "../themes.css";
import { ActiveThemeProvider } from "./components/ui/active-theme";
import { ThemeProvider } from "./context/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ActiveThemeProvider>
        <TooltipProvider>
        <AuthProvider>
          <ProjectProvider>
            <AppRoutes />
          </ProjectProvider>
        </AuthProvider>
        </TooltipProvider>
      </ActiveThemeProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
