import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  collapsed?: boolean;
  className?: string;
};

export function Logo({ variant = "dark", collapsed = false, className }: LogoProps) {
  const wordmarkClass =
    variant === "light" ? "text-white" : "text-zinc-900";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative inline-flex size-7 items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-7"
          aria-hidden
        >
          <rect width="32" height="32" rx="7" fill="#6C47FF" />
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
          <circle cx="16" cy="7.2" r="1.7" fill="white" />
        </svg>
      </span>
      {!collapsed && (
        <span
          className={cn(
            "text-[15px] tracking-tight",
            wordmarkClass
          )}
        >
          <span className="font-bold">Adimen</span>
          <span className="font-normal">Ai</span>
        </span>
      )}
    </div>
  );
}
