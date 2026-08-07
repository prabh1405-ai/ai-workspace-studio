import { Link } from "@tanstack/react-router";
import { Bell, Sun, ChevronDown, LayoutGrid, Table2, Wand2, History } from "lucide-react";
import logo from "@/assets/dolphin-logo.png";

const NAV = [
  { label: "Workspace", icon: LayoutGrid, to: "/" },
  { label: "Database Designer", icon: Table2, to: "/database-designer" },
  { label: "Practice Mode", icon: Wand2, to: "/" },
  { label: "History", icon: History, to: "/" },
] as const;

export function TopNav() {
  return (
    <header className="flex h-[68px] shrink-0 items-center gap-6 border-b border-border bg-panel px-5">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Dolphin AI Studio logo" width={40} height={40} className="h-10 w-10" />
        <span className="text-[21px] font-bold tracking-tight">Dolphin AI Studio</span>
      </Link>

      <nav className="flex flex-1 items-center justify-center gap-1">
        {NAV.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            activeOptions={{ exact: true }}
            className="relative flex items-center gap-2 rounded-md px-4 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            {({ isActive }) => (
              <>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {label}
                {isActive ? (
                  <span className="absolute -bottom-[21px] left-2 right-2 h-[2.5px] rounded-full bg-primary" />
                ) : null}
              </>
            )}
          </Link>
        ))}
      </nav>


      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Toggle theme"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
            AK
          </span>
          <span className="text-[15px] font-medium">Akshay</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
