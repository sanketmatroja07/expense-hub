"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  applyTheme,
  computeBalances,
  computeCategoryBreakdown,
  computeGroups,
  computeMonthlySpending,
  computeSummaryData,
  seedState,
  type AppPreferences,
  type CategoryChartDatum,
  type ChartDatum,
  type CreateGroupInput,
  type ExpenseHubState,
  type ExpenseInput,
  type SettleUpInput,
  type SummaryCardData,
} from "@/lib/expense-hub-core";
import type { Balance, Expense, Group, Notification, Payment, User } from "@/lib/types";

interface ExpenseHubContextValue {
  currentUser: User;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  notifications: Notification[];
  balances: Balance[];
  summaryData: SummaryCardData;
  monthlySpendingData: ChartDatum[];
  categorySpendingData: CategoryChartDatum[];
  preferences: AppPreferences;
  unreadCount: number;
  addExpense: (input: ExpenseInput) => Promise<void>;
  createGroup: (input: CreateGroupInput) => Promise<Group>;
  settleUp: (input: SettleUpInput) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (updates: Partial<AppPreferences>) => Promise<void>;
}

const ExpenseHubContext = createContext<ExpenseHubContextValue | null>(null);

async function requestState<T>(
  input: string,
  init?: RequestInit
): Promise<ExpenseHubState> {
  const response = await fetch(input, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = (await response.json()) as { state?: ExpenseHubState; error?: string };
  if (!response.ok || !payload.state) {
    throw new Error(payload.error || "Unable to sync ExpenseHub state.");
  }

  return payload.state;
}

export function ExpenseHubProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<ExpenseHubState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    requestState("/api/state")
      .then((nextState) => {
        if (active) {
          setState(nextState);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("unauthorized") &&
          pathname !== "/auth"
        ) {
          router.replace("/auth");
          return;
        }

        console.error(error);
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    applyTheme(state.preferences.theme);
  }, [state.preferences.theme]);

  const currentUser =
    state.users.find((user) => user.id === state.currentUserId) ?? state.users[0];

  const balances = useMemo(
    () => computeBalances(currentUser.id, state.users, state.expenses, state.payments),
    [currentUser.id, state.expenses, state.payments, state.users]
  );

  const groups = useMemo(
    () => computeGroups(state.groups, state.expenses, state.payments),
    [state.expenses, state.groups, state.payments]
  );

  const summaryData = useMemo(
    () => computeSummaryData(state.expenses, balances, currentUser.id),
    [balances, currentUser.id, state.expenses]
  );

  const monthlySpendingData = useMemo(
    () => computeMonthlySpending(state.expenses, currentUser.id),
    [currentUser.id, state.expenses]
  );

  const categorySpendingData = useMemo(
    () => computeCategoryBreakdown(state.expenses, currentUser.id),
    [currentUser.id, state.expenses]
  );

  const unreadCount = useMemo(
    () => state.notifications.filter((notification) => !notification.read).length,
    [state.notifications]
  );

  const addExpense = async (input: ExpenseInput) => {
    const nextState = await requestState("/api/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setState(nextState);
  };

  const createGroup = async (input: CreateGroupInput) => {
    const nextState = await requestState("/api/groups", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setState(nextState);
    return computeGroups(nextState.groups, nextState.expenses, nextState.payments)[0];
  };

  const settleUp = async (input: SettleUpInput) => {
    const nextState = await requestState("/api/settlements", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setState(nextState);
  };

  const markAllNotificationsRead = async () => {
    const nextState = await requestState("/api/notifications/read-all", {
      method: "POST",
    });
    setState(nextState);
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    const nextState = await requestState("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setState(nextState);
  };

  const updatePreferences = async (updates: Partial<AppPreferences>) => {
    const nextState = await requestState("/api/preferences", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setState(nextState);
  };

  const value = useMemo<ExpenseHubContextValue>(
    () => ({
      currentUser,
      users: state.users,
      groups,
      expenses: state.expenses,
      payments: state.payments,
      notifications: state.notifications,
      balances,
      summaryData,
      monthlySpendingData,
      categorySpendingData,
      preferences: state.preferences,
      unreadCount,
      addExpense,
      createGroup,
      settleUp,
      markAllNotificationsRead,
      updateCurrentUser,
      updatePreferences,
    }),
    [
      balances,
      categorySpendingData,
      currentUser,
      groups,
      monthlySpendingData,
      state.expenses,
      state.notifications,
      state.payments,
      state.preferences,
      state.users,
      summaryData,
      unreadCount,
    ]
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="card px-6 py-5 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          <span className="text-sm font-medium text-neutral-700">
            Loading ExpenseHub
          </span>
        </div>
      </div>
    );
  }

  return (
    <ExpenseHubContext.Provider value={value}>
      {children}
    </ExpenseHubContext.Provider>
  );
}

export function useExpenseHub() {
  const context = useContext(ExpenseHubContext);
  if (!context) {
    throw new Error("useExpenseHub must be used within ExpenseHubProvider");
  }
  return context;
}
