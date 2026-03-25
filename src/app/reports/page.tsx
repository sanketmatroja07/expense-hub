"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import { Navbar, MobileNav } from "@/components/layout";
import { AddExpenseModal } from "@/components/modals";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import {
  monthlySpendingData,
  categorySpendingData,
  expenses as mockExpenses,
  users,
} from "@/lib/mock-data";

type DateRange = "week" | "month" | "year" | "custom";

// Extended data for reports
const weeklyData = [
  { day: "Mon", amount: 45 },
  { day: "Tue", amount: 78 },
  { day: "Wed", amount: 23 },
  { day: "Thu", amount: 95 },
  { day: "Fri", amount: 156 },
  { day: "Sat", amount: 234 },
  { day: "Sun", amount: 100 },
];

const monthlyComparison = [
  { month: "Aug", personal: 320, shared: 200 },
  { month: "Sep", personal: 380, shared: 300 },
  { month: "Oct", personal: 290, shared: 300 },
  { month: "Nov", personal: 420, shared: 300 },
  { month: "Dec", personal: 500, shared: 350 },
  { month: "Jan", personal: 431, shared: 300 },
];

const topPeople = [
  { name: "Sarah", amount: 245.50, transactions: 8 },
  { name: "Mike", amount: 189.00, transactions: 5 },
  { name: "Emma", amount: 156.33, transactions: 7 },
  { name: "James", amount: 98.25, transactions: 3 },
];

const topExpenses = mockExpenses
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5);

export default function ReportsPage() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const dateRangeOptions = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const selectedRangeLabel = dateRangeOptions.find(
    (r) => r.value === dateRange
  )?.label;

  // Summary stats
  const totalSpent = 731.23;
  const avgDaily = totalSpent / 30;
  const topCategory = "Food & Dining";
  const savingsRate = 18.5;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
              <p className="text-neutral-500 mt-1">
                Analyze your spending patterns
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="btn-secondary"
                >
                  <Calendar className="w-4 h-4" />
                  {selectedRangeLabel}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      showDateDropdown && "rotate-180"
                    )}
                  />
                </button>

                {showDateDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden z-10">
                    {dateRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateRange(option.value as DateRange);
                          setShowDateDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors",
                          dateRange === option.value &&
                            "bg-primary-50 text-primary-700"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-secondary hidden sm:flex">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <p className="text-sm text-neutral-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(totalSpent)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-success-600 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>12% less than last month</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-5"
            >
              <p className="text-sm text-neutral-500 mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(avgDaily)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-danger-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>5% higher than usual</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <p className="text-sm text-neutral-500 mb-1">Top Category</p>
              <p className="text-2xl font-bold text-neutral-900">
                {topCategory}
              </p>
              <p className="text-sm text-neutral-500 mt-2">38% of spending</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card p-5"
            >
              <p className="text-sm text-neutral-500 mb-1">Savings Rate</p>
              <p className="text-2xl font-bold text-success-600">
                {savingsRate}%
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Based on budget target
              </p>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                Spending Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySpendingData}>
                    <defs>
                      <linearGradient
                        id="colorSpending"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9ecef"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e9ecef",
                        borderRadius: "12px",
                        boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.08)",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Spent",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#5c7cfa"
                      strokeWidth={3}
                      fill="url(#colorSpending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                Category Breakdown
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categorySpendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e9ecef",
                          borderRadius: "12px",
                          boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.08)",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {categorySpendingData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-neutral-600 flex-1">
                        {cat.name}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Personal vs Shared */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                Personal vs Shared Spending
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9ecef"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e9ecef",
                        borderRadius: "12px",
                        boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.08)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="personal"
                      name="Personal"
                      fill="#5c7cfa"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="shared"
                      name="Shared"
                      fill="#845ef7"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top People You Shared With */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                Top People You Shared With
              </h3>
              <div className="space-y-4">
                {topPeople.map((person, index) => (
                  <div key={person.name} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-neutral-300 w-6">
                      {index + 1}
                    </span>
                    <div className="avatar-md">
                      <span>{getInitials(person.name)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {person.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {person.transactions} transactions
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {formatCurrency(person.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Expenses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6 lg:col-span-2"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                Top Expenses
              </h3>
              <div className="space-y-4">
                {topExpenses.map((expense, index) => {
                  const maxAmount = topExpenses[0].amount;
                  const percentage = (expense.amount / maxAmount) * 100;

                  return (
                    <div key={expense.id} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-neutral-300 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-neutral-900">
                            {expense.description}
                          </p>
                          <p className="font-semibold text-neutral-900">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="progress">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className="progress-bar"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Weekly Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="card p-6 lg:col-span-2"
            >
              <h3 className="font-semibold text-neutral-900 mb-6">
                This Week's Spending
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9ecef"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#868e96" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e9ecef",
                        borderRadius: "12px",
                        boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.08)",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Spent",
                      ]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                    >
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === weeklyData.length - 1
                              ? "#5c7cfa"
                              : "#bac8ff"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onAddExpense={() => setShowAddExpense(true)} />

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />

      {/* Click outside to close dropdown */}
      {showDateDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDateDropdown(false)}
        />
      )}
    </div>
  );
}
