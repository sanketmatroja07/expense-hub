"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  Download,
  Grid3X3,
  List,
  Calendar,
  ChevronDown,
  X,
  Receipt,
  Edit2,
  Trash2,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { AddExpenseModal } from "@/components/modals";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { expenses as mockExpenses, CATEGORIES } from "@/lib/mock-data";

type ViewMode = "list" | "grid" | "calendar";
type SortBy = "date" | "amount" | "category";

export default function PersonalPage() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Filter to personal expenses only (no splits with others)
  const personalExpenses = mockExpenses.filter(
    (exp) => exp.splits.length === 1 && exp.paidBy.id === "user-1"
  );

  // Apply filters
  let filteredExpenses = personalExpenses.filter((exp) => {
    const matchesSearch = exp.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(exp.category);
    const matchesDateStart =
      !dateRange.start || new Date(exp.date) >= new Date(dateRange.start);
    const matchesDateEnd =
      !dateRange.end || new Date(exp.date) <= new Date(dateRange.end);
    const matchesAmountMin =
      !amountRange.min || exp.amount >= parseFloat(amountRange.min);
    const matchesAmountMax =
      !amountRange.max || exp.amount <= parseFloat(amountRange.max);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDateStart &&
      matchesDateEnd &&
      matchesAmountMin &&
      matchesAmountMax
    );
  });

  // Sort expenses
  filteredExpenses = filteredExpenses.sort((a, b) => {
    if (sortBy === "date")
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[7];
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setDateRange({ start: "", end: "" });
    setAmountRange({ min: "", max: "" });
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    dateRange.start ||
    dateRange.end ||
    amountRange.min ||
    amountRange.max;

  // Calculate totals
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Personal Expenses
              </h1>
              <p className="text-neutral-500 mt-1">
                Track your individual spending
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn-secondary hidden sm:flex">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary"
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="input pl-12"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "btn-secondary",
                  hasActiveFilters && "border-primary-300 bg-primary-50"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    {selectedCategories.length +
                      (dateRange.start ? 1 : 0) +
                      (dateRange.end ? 1 : 0) +
                      (amountRange.min ? 1 : 0) +
                      (amountRange.max ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="select"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "list"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "calendar"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-neutral-100 space-y-4">
                    {/* Categories */}
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-2 block">
                        Categories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => toggleCategory(cat.name)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                              selectedCategories.includes(cat.name)
                                ? "text-white"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            )}
                            style={
                              selectedCategories.includes(cat.name)
                                ? { backgroundColor: cat.color }
                                : {}
                            }
                          >
                            <span>{cat.icon}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range and Amount Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Date Range
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                            className="input py-2"
                          />
                          <span className="text-neutral-400">to</span>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                end: e.target.value,
                              }))
                            }
                            className="input py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-2 block">
                          Amount Range
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={amountRange.min}
                            onChange={(e) =>
                              setAmountRange((prev) => ({
                                ...prev,
                                min: e.target.value,
                              }))
                            }
                            placeholder="Min"
                            className="input py-2"
                          />
                          <span className="text-neutral-400">to</span>
                          <input
                            type="number"
                            value={amountRange.max}
                            onChange={(e) =>
                              setAmountRange((prev) => ({
                                ...prev,
                                max: e.target.value,
                              }))
                            }
                            placeholder="Max"
                            className="input py-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1 ? "s" : ""} found
            </p>
            <p className="text-sm font-medium text-neutral-900">
              Total: {formatCurrency(totalSpent)}
            </p>
          </div>

          {/* Expenses List/Grid */}
          {filteredExpenses.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map((expense, index) => {
                  const category = getCategoryInfo(expense.category);
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card p-4 hover:shadow-card-hover group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {expense.receipt && (
                            <Receipt className="w-4 h-4 text-neutral-400" />
                          )}
                          <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                            <Edit2 className="w-4 h-4 text-neutral-400" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-danger-50 transition-colors">
                            <Trash2 className="w-4 h-4 text-danger-400" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-medium text-neutral-900 truncate mb-1">
                        {expense.description}
                      </h3>
                      <p className="text-xs text-neutral-500 mb-3">
                        {formatDate(expense.date)}
                      </p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatCurrency(expense.amount)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="card divide-y divide-neutral-50">
                {filteredExpenses.map((expense, index) => {
                  const category = getCategoryInfo(expense.category);
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-4 p-4 hover:bg-neutral-50/50 group"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900 truncate">
                            {expense.description}
                          </h3>
                          {expense.receipt && (
                            <Receipt className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {formatDate(expense.date)} · {category.label}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-neutral-900 flex-shrink-0">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-primary-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-400 hover:text-danger-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Receipt className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {hasActiveFilters || searchQuery
                  ? "No expenses found"
                  : "No personal expenses yet"}
              </h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                {hasActiveFilters || searchQuery
                  ? "Try adjusting your filters or search"
                  : "Add your first personal expense to start tracking"}
              </p>
              {!hasActiveFilters && !searchQuery && (
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="btn-primary"
                >
                  Add Your First Expense
                </button>
              )}
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
    </div>
  );
}
