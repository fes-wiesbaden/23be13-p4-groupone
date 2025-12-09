import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useMatches,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import SideAppBar from "~/components/sideAppBar";
import React, {useEffect} from "react";
import {AuthProvider, useAuth, isPublicRoute} from "~/contexts/AuthContext";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from "~/theme";


export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <SideAppBar>{children}</SideAppBar>
          </AuthProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ProtectedApp() {
    const {isAuthenticated, isLoading, user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isPublic = isPublicRoute(location.pathname);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated && !isPublic) {
                navigate("/login", {replace: true});
            } else if (
                isAuthenticated
                && user
                && user.needsPasswordChange
                && !isPublic
            ) {
                navigate("/change-password", {replace: true});
            }
        }
    }, [isAuthenticated, isLoading, isPublic, user, navigate]);


    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                Loading...
            </div>
        );
    }

    if (isPublic) {
        return <Outlet/>;
    }

    if (isAuthenticated && user?.needsPasswordChange && location.pathname !== "/change-password") {
        return null;
    }

    return isAuthenticated ? <Outlet/> : null;
}

export default function App() {
  return <ProtectedApp />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
