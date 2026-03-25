"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-primary-200 border-t-primary-500 animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("shimmer rounded-lg", className)} />
  );
}
