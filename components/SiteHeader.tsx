import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Map, Menu, MessagesSquare, X } from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/planner", label: "Trip Planner" },
  { to: "/chat", label: "AI Chat" },
  { to: "/recommendations", label: "Discover" },
  { to: "/budget", label: "Budget" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={logo} alt="" width={36} height={36} className="size-9" />
      <span className={cn("font-display text-xl font-semibold tracking-tight", inverted ? "text-ink-foreground" : "text-foreground")}>
        Smart Travel <span className="text-sun">AI</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Traveller";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header
      className={cn(
        "z-40 w-full",
        transparent ? "absolute inset-x-0 top-0" : "sticky top-0 border-b border-border/70 bg-background/85 backdrop-blur-lg",
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Logo inverted={transparent} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                transparent
                  ? "text-ink-foreground/85 hover:bg-ink-foreground/10 hover:text-ink-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              activeProps={{ className: transparent ? "text-ink-foreground bg-ink-foreground/15" : "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-sun/70 ring-offset-2 ring-offset-background" aria-label="Account menu">
                  <Avatar className="size-9">
                    {avatar ? <AvatarImage src={avatar} alt="" /> : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/trips" })}>
                  <Map className="size-4" /> My trips & preferences
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/chat" })}>
                  <MessagesSquare className="size-4" /> My conversations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <Button asChild variant={transparent ? "glass" : "outline"} size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
          ) : null}
          <Button asChild variant="sun" size="sm" className="hidden sm:inline-flex">
            <Link to="/planner">Plan a trip</Link>
          </Button>
          <Button
            variant={transparent ? "glass" : "ghost"}
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold text-primary hover:bg-secondary">
                Sign in
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
