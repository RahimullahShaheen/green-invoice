import { cn } from "@/lib/utils";
import logo from "@/Assets/logo.png";
import { AlignCenter } from "lucide-react";
interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 logo2", className)} >
      {/* ✅ Logo Image */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl overflow-hidden",
          sizeClasses[size]
        )}
      >
        <img
          src={logo}
          alt="Mazzari Logo"
          className="h-full w-full object-contain"
        />
      </div>

      {/* ✅ Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-semibold tracking-tight text-foreground",
              textSizeClasses[size]
            )}
          >
            Mazzari
          </span>
          <span className="text-xs text-muted-foreground -mt-0.5">
            Landscape Management
          </span>
        </div>
      )}
    </div>
  );
}
