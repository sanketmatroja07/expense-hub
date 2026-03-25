"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, getInitials } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

interface RightSidebarProps {
  onSettleUp: () => void;
}

export function RightSidebar({ onSettleUp }: RightSidebarProps) {
  const { balances, monthlySpendingData, categorySpendingData } = useExpenseHub();
  const youOwe = balances.filter((balance) => balance.amount < 0);
  const owedToYou = balances.filter((balance) => balance.amount > 0);

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-6">
        {/* Settle Up Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-neutral-900 mb-4">Settle Up</h3>

          {youOwe.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                You Owe
              </p>
              <div className="space-y-3">
                {youOwe.map((balance) => (
                  <div
                    key={balance.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm">
                        <span>{getInitials(balance.user.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-700">
                        {balance.user.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-danger-600">
                        {formatCurrency(Math.abs(balance.amount))}
                      </span>
                      <button
                        onClick={onSettleUp}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {owedToYou.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Owed to You
              </p>
              <div className="space-y-3">
                {owedToYou.map((balance) => (
                  <div
                    key={balance.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm">
                        <span>{getInitials(balance.user.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-700">
                        {balance.user.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-success-600">
                        {formatCurrency(balance.amount)}
                      </span>
                      <button className="text-xs font-medium px-2.5 py-1 rounded-lg bg-success-50 text-success-600 hover:bg-success-100 transition-colors">
                        Remind
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onSettleUp}
            className="w-full mt-5 btn-primary text-sm py-2.5"
          >
            Settle All Balances
          </button>
        </motion.div>

        {/* Monthly Spending Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-neutral-900 mb-4">
            Monthly Spending
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpendingData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#868e96" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.08)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Spent"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#5c7cfa"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#5c7cfa" }}
                  fill="url(#colorAmount)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-neutral-900 mb-4">
            Category Breakdown
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
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
            <div className="flex-1 space-y-2">
              {categorySpendingData.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-neutral-600 flex-1">
                    {cat.name}
                  </span>
                  <span className="text-xs font-medium text-neutral-900">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
