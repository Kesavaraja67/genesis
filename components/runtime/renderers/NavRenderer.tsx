"use client";

import React from "react";
import { UIComponent } from "@/lib/config/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavRendererProps {
  config: UIComponent;
}

export function NavRenderer({ config }: NavRendererProps) {
  const pathname = usePathname();
  const links = Array.isArray(config.props?.links) ? config.props.links : [];

  return (
    <nav className="flex items-center space-x-4 border-b border-white/10 px-6 py-3 bg-[#0a0a0f]">
      {config.title && (
        <div className="font-display font-bold text-lg text-white mr-4">
          {config.title}
        </div>
      )}
      <ul className="flex space-x-1">
        {links.map((link: { href?: string; label?: string }, index: number) => {
          const isActive = pathname === link.href;
          return (
            <li key={index}>
              <Link 
                href={link.href || "#"} 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
