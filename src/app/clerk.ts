export const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export const hasClerkKey = Boolean(clerkPublishableKey);

export const clerkAppearance = {
  variables: {
    colorPrimary: "#49d7ff",
    colorBackground: "#0a0c10",
    colorInputBackground: "#0d1117",
    colorInputText: "#f4f5f7",
    colorText: "#f4f5f7",
    colorTextSecondary: "#a7afc0",
    colorDanger: "#ff5a76",
    colorSuccess: "#39d98a",
    borderRadius: "18px",
    fontFamily: "Outfit, system-ui, sans-serif",
  },
  elements: {
    card: "clerk-card",
    rootBox: "w-full",
    formButtonPrimary: "clerk-primary-button",
    formFieldInput: "clerk-input",
    formFieldLabel: "clerk-label",
    footerActionLink: "clerk-link",
    socialButtonsBlockButton: "clerk-social-button",
    identityPreviewText: "clerk-subtle-text",
    formResendCodeLink: "clerk-link",
    otpCodeFieldInput: "clerk-input",
    footerActionText: "clerk-subtle-text",
  },
} as const;
