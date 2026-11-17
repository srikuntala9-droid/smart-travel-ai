import { Link } from "@tanstack/react-router";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-sm text-sm text-ink-foreground/70">
            Personal itineraries, honest budgets and live weather — your AI travel companion from first idea to boarding pass.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4 text-sun">Plan</p>
          <ul className="space-y-2 text-sm text-ink-foreground/80">
            <li><Link to="/planner" className="hover:text-ink-foreground">AI Trip Planner</Link></li>
            <li><Link to="/chat" className="hover:text-ink-foreground">Travel Chat</Link></li>
            <li><Link to="/budget" className="hover:text-ink-foreground">Budget Calculator</Link></li>
            <li><Link to="/recommendations" className="hover:text-ink-foreground">Recommendations</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4 text-sun">Company</p>
          <ul className="space-y-2 text-sm text-ink-foreground/80">
            <li><Link to="/about" className="hover:text-ink-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-ink-foreground">Contact</Link></li>
            <li><Link to="/trips" className="hover:text-ink-foreground">My trips</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-foreground/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Smart Travel AI</p>
          <p>Weather data by Open-Meteo · AI by Google Gemini</p>
        </div>
      </div>
    </footer>
  );
}

