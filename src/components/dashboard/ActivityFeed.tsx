"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Edit2,
  Trash2,
  Receipt,
} from "lucide-react";
import { cn, formatCurrency, formatRelativeDate, getInitials } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";
import { Expense } from "@/lib/types";
import { useExpenseHub } from "@/lib/expense-hub-store";

interface ActivityFeedProps {
  expenses?: Expense[];
  limit?: number;
  showLoadMore?: boolean;
}

export function ActivityFeed({
  expenses,
  limit = 6,
  showLoadMore = true,
}: ActivityFeedProps) {
  const { expenses: storedExpenses, currentUser } = useExpenseHub();
  const [visibleCount, setVisibleCount] = useState(limit);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeExpenses = expenses ?? storedExpenses;
  const visibleExpenses = activeExpenses.slice(0, visibleCount);

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[7];
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="font-semibold text-neutral-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-neutral-50">
        <AnimatePresence>
          {visibleExpenses.map((expense, index) => {
            const category = getCategoryInfo(expense.category);
            const isPaidByMe = expense.paidBy.id === currentUser.id;
            const splitCount = expense.splits.length;

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(expense.id)}
                onMouseLeave={() => {
                  setHoveredId(null);
                }}
                className="relative px-5 py-4 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-neutral-900 truncate">
                            {expense.description}
                          </h4>
                          {expense.receipt && (
                            <Receipt className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-500">
                            {formatRelativeDate(expense.date)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }}
                          >
                            {category.label}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-neutral-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {isPaidByMe ? "You paid" : `${expense.paidBy.name.split(" ")[0]} paid`}
                        </p>
                      </div>
                    </div>

                    {/* Split info and avatars */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        {/* Avatars */}
                        <div className="flex -space-x-2">
                          {expense.splits.slice(0, 4).map((split, i) => (
                            <div
                              key={split.userId}
                              className="avatar-sm ring-2 ring-white"
                              style={{ zIndex: 10 - i }}
                            >
                              <span className="text-[10px]">
                                {getInitials(split.user.name)}
                              </span>
                            </div>
                          ))}
                          {expense.splits.length > 4 && (
                            <div className="avatar-sm ring-2 ring-white bg-neutral-200 text-neutral-600">
                              <span className="text-[10px]">
                                +{expense.splits.length - 4}
                              </span>
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-neutral-500">
                          Split with {splitCount}{" "}
                          {splitCount === 1 ? "person" : "people"}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span
                        className={cn(
                          "badge",
                          expense.status === "settled" &&
                            "bg-success-100 text-success-700",
                          expense.status === "partial" &&
                            "bg-warning-100 text-warning-700",
                          expense.status === "pending" &&
                            "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {expense.status === "settled" && "Settled"}
                        {expense.status === "partial" && "Partial"}
                        {expense.status === "pending" && "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <AnimatePresence>
                    {hoveredId === expense.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-4 top-4 flex items-center gap-1"
                      >
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-neutral-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-success-600">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-primary-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-danger-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showLoadMore && visibleCount < activeExpenses.length && (
        <div className="px-5 py-4 border-t border-neutral-100">
          <button
            onClick={() => setVisibleCount((c) => c + 5)}
            className="w-full btn-ghost text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
