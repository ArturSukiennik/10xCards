import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export type LinkProps = ComponentPropsWithoutRef<"a">;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a ref={ref} className={cn("cursor-pointer", className)} {...props}>
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";
