import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  collapsed?: boolean;
  className?: string;
};

export function Logo({ variant = "light", collapsed = false, className }: LogoProps) {
  const textClass =
    variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative inline-flex size-8 items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-8"
          aria-hidden
        >
          <defs>
            <linearGradient id="adimenai-mark" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#A18CFF" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#adimenai-mark)" />
          <path
            d="M9 23 L16 8 L23 23"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12.2 18 H19.8"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="16" cy="8" r="1.8" fill="white" />
        </svg>
      </span>
      {!collapsed && (
        <span
          className={cn(
            "text-[15px] font-bold tracking-tight",
            textClass
          )}
        >
          Adimen<span className="text-[#A18CFF]">Ai</span>
        </span>
      )}
    </div>
  );
}
