import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PaletteIcon } from "@phosphor-icons/react";
import { useThemeConfig } from "./ui/active-theme";

const THEMES = [
  { name: "Default", value: "default" },
  { name: "Ocean Breeze", value: "blue" },
  { name: "Midnight Navy", value: "dark-blue" },
  { name: "Rose Garden", value: "rose" },
  { name: "Sunset Glow", value: "sunset" },
  { name: "Forest Mist", value: "forest" },
  { name: "Mint Frost", value: "mint" },
  { name: "Slate Calm", value: "slate" },
  { name: "Lavender Haze", value: "lavender" },
] as const;

export default function ThemeChanger({
  className,
}: React.ComponentProps<"div">) {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  // Find the display name of the currently active theme
  const currentThemeLabel =
    [...THEMES].find(
      (theme) => theme.value === activeTheme,
    )?.name || "Default";

  // Helper function to get theme color class
  const getThemeColorClass = (themeValue: string): string => {
    const themeColors: Record<string, string> = {
      default: "bg-gray-500",
      blue: "bg-sky-500",
      "dark-blue": "bg-blue-700",
      rose: "bg-rose-500",
      sunset: "bg-orange-400",
      forest: "bg-emerald-500",
      mint: "bg-teal-400",
      slate: "bg-slate-500",
      lavender: "bg-violet-400",
    };
    return themeColors[themeValue] || "bg-gray-500";
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:text-primary text-muted-foreground hover:border hover:bg-transparent"
          >
            <PaletteIcon className="h-4 w-4" color="currentColor" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-40 overflow-auto w-fit">
          <DropdownMenuLabel className="text-xs">
            {currentThemeLabel}
          </DropdownMenuLabel>
          {THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onSelect={() => {
                setActiveTheme(theme.value);
              }}
            >
              <div
                className={`mr-2 w-4 h-4 rounded-full ${getThemeColorClass(
                  theme.value,
                )}`}
              ></div>
              {theme.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
