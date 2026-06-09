import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  collapsed?: boolean;
  className?: string;
};

export function Logo({ variant = "dark", collapsed = false, className }: LogoProps) {
  const wordmarkClass = variant === "light" ? "text-white" : "text-zinc-900";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative inline-flex items-center justify-center">
        <Image
          src="/logo-adimenai.jpg"
          alt="AdimenAi"
          width={collapsed ? 28 : 32}
          height={collapsed ? 28 : 32}
          sizes="32px"
          unoptimized
          className="block h-auto w-7 min-w-7 rounded-md border border-white object-contain"
          priority
        />
      </span>
      {!collapsed && (
        <span className={cn("text-[15px] tracking-tight", wordmarkClass)}>
          <span className="font-bold">Adimen</span>
          <span className="font-normal">Ai</span>
        </span>
      )}
    </div>
  );
}
