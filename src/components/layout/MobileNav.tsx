"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddExpense: () => void;
}

export function MobileNav({ onAddExpense }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Home" },
    { href: "/personal", icon: User, label: "Personal" },
    { type: "add" as const },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/settings", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 backdrop-blur-xl border-t border-neutral-100 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          if (item.type === "add") {
            return (
              <button
                key="add"
                onClick={onAddExpense}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl shadow-primary-500/40">
                  <Plus className="w-7 h-7 text-white" />
                </div>
              </button>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-primary-500 rounded-b-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-primary-600" : "text-neutral-400"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium mt-1 transition-colors",
                  isActive ? "text-primary-600" : "text-neutral-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
