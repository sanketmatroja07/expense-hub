"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { AddExpenseModal, SettleUpModal } from "@/components/modals";
import { cn, formatCurrency, formatRelativeDate, getInitials } from "@/lib/utils";
import { expenses as mockExpenses, groups as mockGroups, CATEGORIES } from "@/lib/mock-data";

type StatusFilter = "all" | "pending" | "partial" | "settled";

export default function SharedPage() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // Filter to shared expenses only (splits with multiple people)
  const sharedExpenses = mockExpenses.filter((exp) => exp.splits.length > 1);

  // Apply filters
  const filteredExpenses = sharedExpenses.filter((exp) => {
    const matchesSearch = exp.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || exp.status === statusFilter;
    const matchesGroup =
      selectedGroup === "all" || exp.groupId === selectedGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[7];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "settled":
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case "partial":
        return <Clock className="w-4 h-4 text-warning-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const statusCounts = {
    all: sharedExpenses.length,
    pending: sharedExpenses.filter((e) => e.status === "pending").length,
    partial: sharedExpenses.filter((e) => e.status === "partial").length,
    settled: sharedExpenses.filter((e) => e.status === "settled").length,
  };

  const selectedGroupData =
    selectedGroup === "all"
      ? null
      : mockGroups.find((g) => g.id === selectedGroup);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Shared Expenses
              </h1>
              <p className="text-neutral-500 mt-1">
                Expenses split with friends and groups
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettleUp(true)}
                className="btn-secondary hidden sm:flex"
              >
                Settle Up
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary"
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* Group Toggle and Search */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Group Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  className="input flex items-center justify-between w-full sm:w-64"
                >
                  <div className="flex items-center gap-3">
                    {selectedGroupData ? (
                      <>
                        <span className="text-lg">{selectedGroupData.emoji}</span>
                        <span>{selectedGroupData.name}</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 text-neutral-400" />
                        <span>All Groups</span>
                      </>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-neutral-400 transition-transform",
                      showGroupDropdown && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {showGroupDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setSelectedGroup("all");
                          setShowGroupDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors",
                          selectedGroup === "all" && "bg-primary-50"
                        )}
                      >
                        <Users className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm font-medium">All Groups</span>
                      </button>
                      {mockGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            setSelectedGroup(group.id);
                            setShowGroupDropdown(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors",
                            selectedGroup === group.id && "bg-primary-50"
                          )}
                        >
                          <span className="text-lg">{group.emoji}</span>
                          <span className="text-sm font-medium">{group.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shared expenses..."
                  className="input pl-12"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
              {(["all", "pending", "partial", "settled"] as StatusFilter[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                      statusFilter === status
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {status === "pending" && <AlertCircle className="w-4 h-4" />}
                    {status === "partial" && <Clock className="w-4 h-4" />}
                    {status === "settled" && <CheckCircle className="w-4 h-4" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-xs",
                        statusFilter === status
                          ? "bg-white/20"
                          : "bg-neutral-200"
                      )}
                    >
                      {statusCounts[status]}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenses.length > 0 ? (
            <div className="card divide-y divide-neutral-50">
              {filteredExpenses.map((expense, index) => {
                const category = getCategoryInfo(expense.category);
                const isPaidByMe = expense.paidBy.id === "user-1";
                const myShare = expense.splits.find(
                  (s) => s.userId === "user-1"
                );

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-5 hover:bg-neutral-50/50 transition-colors"
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
                              {expense.group && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                                    <span>{expense.group.emoji}</span>
                                    {expense.group.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-neutral-900">
                              {formatCurrency(expense.amount)}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {isPaidByMe
                                ? "You paid"
                                : `${expense.paidBy.name.split(" ")[0]} paid`}
                            </p>
                          </div>
                        </div>

                        {/* Split Info */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            {/* Avatars */}
                            <div className="flex -space-x-2">
                              {expense.splits.slice(0, 4).map((split, i) => (
                                <div
                                  key={split.userId}
                                  className={cn(
                                    "avatar-sm ring-2 ring-white",
                                    split.settled && "opacity-60"
                                  )}
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

                            <div className="text-sm">
                              <span className="text-neutral-500">
                                Your share:{" "}
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  myShare?.settled
                                    ? "text-success-600"
                                    : "text-danger-600"
                                )}
                              >
                                {formatCurrency(myShare?.amount || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Status */}
                            <span
                              className={cn(
                                "badge flex items-center gap-1.5",
                                expense.status === "settled" &&
                                  "bg-success-100 text-success-700",
                                expense.status === "partial" &&
                                  "bg-warning-100 text-warning-700",
                                expense.status === "pending" &&
                                  "bg-neutral-100 text-neutral-600"
                              )}
                            >
                              {getStatusIcon(expense.status)}
                              {expense.status.charAt(0).toUpperCase() +
                                expense.status.slice(1)}
                            </span>

                            {/* Settle Button */}
                            {expense.status !== "settled" &&
                              !isPaidByMe &&
                              !myShare?.settled && (
                                <button
                                  onClick={() => setShowSettleUp(true)}
                                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                  Settle Up
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Users className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchQuery || statusFilter !== "all" || selectedGroup !== "all"
                  ? "No expenses found"
                  : "No shared expenses yet"}
              </h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all" || selectedGroup !== "all"
                  ? "Try adjusting your filters"
                  : "Add an expense and split it with friends"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onAddExpense={() => setShowAddExpense(true)} />

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => setShowSettleUp(false)}
      />

      {/* Click outside to close dropdown */}
      {showGroupDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowGroupDropdown(false)}
        />
      )}
    </div>
  );
}
