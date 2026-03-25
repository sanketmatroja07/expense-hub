"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

export function SummaryCards() {
  const { summaryData } = useExpenseHub();
  const cards = [
    {
      id: "balance",
      label: "Total Balance",
      value: summaryData.totalBalance,
      trend: summaryData.trend,
      icon: Wallet,
      colorClass: "from-primary-500 to-accent-500",
      bgClass: "bg-gradient-to-br from-primary-50 to-accent-50",
    },
    {
      id: "owe",
      label: "You Owe",
      value: summaryData.youOwe,
      negative: true,
      icon: ArrowDownRight,
      colorClass: "from-danger-500 to-danger-600",
      bgClass: "bg-danger-50",
    },
    {
      id: "owed",
      label: "You're Owed",
      value: summaryData.youreOwed,
      positive: true,
      icon: TrendingUp,
      colorClass: "from-success-500 to-success-600",
      bgClass: "bg-success-50",
    },
    {
      id: "month",
      label: "This Month",
      value: summaryData.thisMonth,
      trend: summaryData.trend,
      icon: Calendar,
      colorClass: "from-warning-500 to-warning-600",
      bgClass: "bg-warning-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card p-5 hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                card.bgClass
              )}
            >
              <card.icon
                className={cn(
                  "w-6 h-6",
                  card.id === "owe"
                    ? "text-danger-500"
                    : card.id === "owed"
                    ? "text-success-500"
                    : card.id === "month"
                    ? "text-warning-600"
                    : "text-primary-500"
                )}
              />
            </div>
            {card.trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  card.trend >= 0
                    ? "bg-success-100 text-success-700"
                    : "bg-danger-100 text-danger-700"
                )}
              >
                {card.trend >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(card.trend).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-500 mb-1">{card.label}</p>
          <p
            className={cn(
              "text-2xl font-bold",
              card.negative && "text-danger-600",
              card.positive && "text-success-600",
              !card.negative && !card.positive && "text-neutral-900"
            )}
          >
            {card.negative && "-"}
            {formatCurrency(Math.abs(card.value))}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
