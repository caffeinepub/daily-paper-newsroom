import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sidebar } from "./components/Sidebar";
import { useSeedData } from "./hooks/useSeedData";
import { Dashboard } from "./pages/Dashboard";
import { PlanningBoard } from "./pages/PlanningBoard";
import { Schedule } from "./pages/Schedule";

// Layout with seed data
function RootLayout() {
  useSeedData();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <motion.div
          className="h-full px-6 py-8 max-w-screen-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({ component: RootLayout });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const planningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/planning",
  component: PlanningBoard,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schedule",
  component: Schedule,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  planningRoute,
  scheduleRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
