"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Bell, Search, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { name: "Brief", href: "/brief", icon: Newspaper },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Ask", href: "/ask", icon: Search },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] bg-[#14171C]/95 backdrop-blur-md border-t border-[#23272F] px-4 py-2 z-50 flex justify-around items-center">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors",
              isActive ? "text-[#2DD4BF]" : "text-[#8A9099] hover:text-[#E8EAED]"
            )}
          >
            <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium tracking-tight">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

