import { SignIn, SignUp } from "@clerk/react";
import { motion } from "framer-motion";
import { clerkAppearance } from "../../app/clerk";
import { useRouter } from "../../app/router";

type AuthMode = "login" | "signup" | "forgot" | "verify";

export function AuthCard({ mode }: { mode: AuthMode }) {
  const { navigate } = useRouter();

  if (mode === "forgot") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-panel w-full max-w-[460px] p-7"
      >
        <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">Recovery</div>
        <h1 className="mt-4 text-3xl font-semibold text-white">Password reset</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          Use the Clerk sign-in flow to reset your password securely. The reset experience
          is handled directly in the authentication module.
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-2xl border border-accent-live/24 bg-accent-live/12 px-4 py-3 text-sm font-semibold text-accent-live transition hover:bg-accent-live/16"
          >
            Open sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white transition hover:bg-white/[0.05]"
          >
            Create account instead
          </button>
        </div>
      </motion.div>
    );
  }

  if (mode === "verify") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-panel w-full max-w-[460px] p-7"
      >
        <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">Verification</div>
        <h1 className="mt-4 text-3xl font-semibold text-white">Email verification</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          After signing up with Clerk, verify your email in the secure auth flow, then you
          will be redirected back into ReMorph automatically.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/signup")}
            className="w-full rounded-2xl border border-accent-live/24 bg-accent-live/12 px-4 py-3 text-sm font-semibold text-accent-live transition hover:bg-accent-live/16"
          >
            Return to sign up
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-[460px]"
    >
      {mode === "login" ? (
        <SignIn
          routing="hash"
          appearance={clerkAppearance}
          forceRedirectUrl="/platform"
          signUpUrl="/signup"
          fallbackRedirectUrl="/platform"
        />
      ) : (
        <SignUp
          routing="hash"
          appearance={clerkAppearance}
          forceRedirectUrl="/platform"
          signInUrl="/login"
          fallbackRedirectUrl="/platform"
        />
      )}
    </motion.div>
  );
}
