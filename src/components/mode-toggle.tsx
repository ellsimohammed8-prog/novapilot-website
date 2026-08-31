import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-transform rotate-0 scale-100 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 transition-transform rotate-0 scale-100 text-cobalt-700" />
      )}
    </button>
  );
}
