import { useTheme } from "./theme-provider";
import { Switch } from "@/shared/components/ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
      />
    </div>
  );
}
