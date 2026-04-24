/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppPath =
  | "/"
  | "/login"
  | "/signup"
  | "/forgot-password"
  | "/verify-email"
  | "/platform"
  | "/dashboard"
  | "/profile"
  | "/settings";

interface RouterContextValue {
  path: AppPath;
  navigate: (path: AppPath) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

const validPaths: AppPath[] = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/platform",
  "/dashboard",
  "/profile",
  "/settings",
];

function getPathname(): AppPath {
  const current = window.location.pathname as AppPath;
  return validPaths.includes(current) ? current : "/";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<AppPath>(getPathname);

  useEffect(() => {
    const onPopState = () => setPath(getPathname());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = useMemo<RouterContextValue>(
    () => ({
      path,
      navigate(nextPath) {
        if (nextPath === path) return;
        window.history.pushState({}, "", nextPath);
        setPath(nextPath);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    }),
    [path],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used inside RouterProvider");
  }
  return context;
}
