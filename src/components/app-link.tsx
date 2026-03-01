"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/loading-provider";
import { AnchorHTMLAttributes, forwardRef } from "react";

export type AppLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, onClick, className, children, ...props }, ref) => {
    const pathname = usePathname();
    const { showLoading } = useLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      // Don't show loading if it's the exact same page, or if it's opening a new tab
      if (
        pathname !== href && 
        !props.target && 
        !e.ctrlKey && 
        !e.metaKey && 
        !e.altKey && 
        !e.shiftKey
      ) {
        showLoading();
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link href={href} onClick={handleClick} className={className} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);
AppLink.displayName = "AppLink";
