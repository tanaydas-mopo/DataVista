import React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, src, fallback, size = "md", ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const sizes = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-blue-600 text-white font-bold",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt="User avatar"
          onError={() => setImgError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : fallback ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold uppercase shadow-inner">
          {fallback}
        </div>
      ) : (
        <img
          src="/assets/images/avatars/avatar-default.svg"
          alt="User avatar placeholder"
          className="aspect-square h-full w-full object-cover"
        />
      )}
    </div>
  );
}
