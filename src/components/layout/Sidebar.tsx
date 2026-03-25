"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Filter,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

const quickFilters = [
  { id: "all", label: "All", count: 12 },
  { id: "you-owe", label: "You Owe", count: 3 },
  { id: "you-owed", label: "You're Owed", count: 4 },
  { id: "settled", label: "Settled", count: 5 },
];

interface SidebarProps {
  onAddExpense: () => void;
  onCreateGroup: () => void;
}

export function Sidebar({ onAddExpense, onCreateGroup }: SidebarProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const { groups, currentUser } = useExpenseHub();

  return (
    <aside className="w-72 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAddExpense}
            className="btn-primary w-full justify-center text-base py-3.5 shadow-xl shadow-primary-500/30"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
          <button
            onClick={onCreateGroup}
            className="btn-secondary w-full justify-center"
          >
            <Users className="w-4 h-4" />
            Create Group
          </button>
        </div>

        {/* My Groups */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900">My Groups</h3>
              <span className="badge-primary">{groups.length}</span>
            </div>
            <Link
              href="/groups"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-1">
            {groups.map((group, index) => {
              const userBalance = group.members.find(
                (m) => m.id === currentUser.id
              )?.balance;
              const isPositive = userBalance && userBalance > 0;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-lg">
                      {group.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {group.members.length} members
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isPositive
                            ? "text-success-600"
                            : userBalance && userBalance < 0
                            ? "text-danger-600"
                            : "text-neutral-400"
                        )}
                      >
                        {userBalance && userBalance !== 0
                          ? isPositive
                            ? `+${formatCurrency(userBalance)}`
                            : formatCurrency(userBalance)
                          : "Settled"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold text-neutral-900">Quick Filters</h3>
          </div>

          <div className="space-y-1">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeFilter === filter.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    activeFilter === filter.id
                      ? "bg-primary-200 text-primary-800"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Settle Widget */}
        <div className="card p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Settle</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar-sm">
                  <span>{getInitials("Sarah Williams")}</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  Sarah
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-danger-600">
                  -$22.75
                </span>
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Settle
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar-sm">
                  <span>{getInitials("Emma Davis")}</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  Emma
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-danger-600">
                  -$52.33
                </span>
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Settle
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar-sm">
                  <span>{getInitials("Mike Chen")}</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  Mike
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-success-600">
                  +$16.75
                </span>
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Request
                </button>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 btn-secondary text-sm py-2">
            Settle All
          </button>
        </div>
      </div>
    </aside>
  );
}
