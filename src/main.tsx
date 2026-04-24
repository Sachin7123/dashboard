import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import App from "./App.tsx";
import { clerkAppearance, clerkPublishableKey, hasClerkKey } from "./app/clerk";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hasClerkKey ? (
      <ClerkProvider
        publishableKey={clerkPublishableKey!}
        signInForceRedirectUrl="/platform"
        signUpForceRedirectUrl="/platform"
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      >
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
