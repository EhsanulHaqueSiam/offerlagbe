import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { convex } from "./lib/convex";
import { I18nProvider } from "./lib/i18n";
import { routeTree } from "./routeTree.gen";
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
