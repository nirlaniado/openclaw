"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type AppNavProps = {
  links: Array<{
    href: Route;
    label: string;
  }>;
};

export function AppNav({ links }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav className="nav-row">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link key={link.href} href={link.href} className={`nav-pill${isActive ? " nav-pill-active" : ""}`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
