import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  Kanban,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_LINKS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    to: "/planning",
    label: "Planning Board",
    icon: Kanban,
    ocid: "nav.planning.link",
  },
  {
    to: "/schedule",
    label: "Schedule",
    icon: Calendar,
    ocid: "nav.schedule.link",
  },
];

export function Sidebar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 8)}…` : null;

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/newsroom-logo-transparent.dim_80x80.png"
            alt="Daily Paper"
            className="h-7 w-7 object-contain"
          />
          <span className="font-display font-bold text-sidebar-foreground text-base tracking-tight">
            Daily Paper
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-30 bg-black/60 cursor-default w-full h-full border-0 p-0"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-35 w-60 bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
        `}
      >
        {/* Masthead */}
        <div className="px-5 pt-6 pb-5 masthead-rule">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/newsroom-logo-transparent.dim_80x80.png"
              alt="Daily Paper Newsroom"
              className="h-9 w-9 object-contain"
            />
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-base leading-tight tracking-tight">
                Daily Paper
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-tight">
                Newsroom
              </p>
            </div>
          </div>
        </div>

        {/* Edition date */}
        <div className="px-5 py-3 border-b border-sidebar-border">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-[11px] font-semibold text-sidebar-foreground mt-0.5">
            Morning Edition
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_LINKS.map(({ to, label, icon: Icon, ocid }) => {
            const active =
              to === "/" ? currentPath === "/" : currentPath.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                data-ocid={ocid}
              >
                <motion.div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors relative
                    ${
                      active
                        ? "bg-sidebar-primary/15 text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-sidebar-primary rounded-full"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-2">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-sm">
                <User className="h-3.5 w-3.5 text-sidebar-primary shrink-0" />
                <span className="text-xs font-mono text-sidebar-foreground truncate">
                  {shortPrincipal}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  clear();
                }}
                data-ocid="auth.button"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full text-xs bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
              onClick={() => {
                login();
              }}
              disabled={isLoggingIn || isInitializing}
              data-ocid="auth.button"
            >
              <LogIn className="h-3.5 w-3.5 mr-2" />
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-[9px] text-muted-foreground leading-relaxed font-mono">
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-foreground transition-colors"
            >
              Built with caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
