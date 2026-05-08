import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CAREERY — AI-powered career & recruitment ecosystem" },
      { name: "description", content: "Find the career that truly matches you. AI-driven career guidance, smart job matching, and recruitment for students, job seekers and employers." },
      { property: "og:title", content: "CAREERY — Find the career that truly matches you" },
      { property: "og:description", content: "AI career guidance, smart job matching, and recruitment in one intelligent ecosystem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This page wandered off its career path.</p>
        <a href="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Go home</a>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    console.error(error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-display">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
