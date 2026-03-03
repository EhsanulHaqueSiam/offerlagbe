import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider } from "convex/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { convex } from "./lib/convex";
import { routeTree } from "./routeTree.gen";
import { I18nProvider } from "./lib/i18n";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </ConvexProvider>
  </StrictMode>,
);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
