"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CATEGORIES,
  currentUser as seedCurrentUser,
  expenses as seedExpenses,
  groups as seedGroups,
  notifications as seedNotifications,
  payments as seedPayments,
  users as seedUsers,
} from "@/lib/mock-data";
import type {
  Balance,
  Expense,
  ExpenseSplit,
  Group,
  GroupType,
  Notification,
  Payment,
  PaymentMethod,
  SplitType,
  User,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "expense-hub-state-v1";

type ThemeMode = "light" | "dark" | "auto";

interface NotificationPreferences {
  emailExpenses: boolean;
  emailPayments: boolean;
  emailWeeklySummary: boolean;
  pushExpenses: boolean;
  pushPayments: boolean;
  pushReminders: boolean;
}

interface PrivacyPreferences {
  allowAddToGroups: "everyone" | "contacts" | "none";
  showExpenseDetails: boolean;
  showActivity: boolean;
}

interface AppPreferences {
  theme: ThemeMode;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

interface ExpenseHubState {
  currentUserId: string;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  notifications: Notification[];
  preferences: AppPreferences;
}

interface ExpenseInput {
  amount: number;
  description: string;
  category: string;
  date: string;
  paidBy: string;
  splitType: SplitType;
  selectedMembers: string[];
  customAmounts: Record<string, string>;
  receipt?: string | null;
  notes?: string;
  groupId?: string;
}

interface CreateGroupInput {
  name: string;
  emoji: string;
  image?: string | null;
  invitedMembers: Array<{ id?: string; name: string; email: string }>;
  groupType: GroupType;
  currency: string;
  simplifyDebts: boolean;
}

interface SettleUpInput {
  userId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

interface SummaryCardData {
  totalBalance: number;
  youOwe: number;
  youreOwed: number;
  thisMonth: number;
  lastMonth: number;
  trend: number;
}

interface ChartDatum {
  month: string;
  amount: number;
}

interface CategoryChartDatum {
  name: string;
  value: number;
  color: string;
}

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
  markAllNotificationsRead: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  updatePreferences: (updates: Partial<AppPreferences>) => void;
}

const defaultPreferences: AppPreferences = {
  theme: "auto",
  notifications: {
    emailExpenses: true,
    emailPayments: true,
    emailWeeklySummary: false,
    pushExpenses: true,
    pushPayments: true,
    pushReminders: true,
  },
  privacy: {
    allowAddToGroups: "everyone",
    showExpenseDetails: true,
    showActivity: true,
  },
};

const seedState: ExpenseHubState = {
  currentUserId: seedCurrentUser.id,
  users: seedUsers,
  groups: seedGroups,
  expenses: seedExpenses,
  payments: seedPayments,
  notifications: seedNotifications,
  preferences: defaultPreferences,
};

const ExpenseHubContext = createContext<ExpenseHubContextValue | null>(null);

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function dedupeUsers(users: User[]) {
  const byId = new Map<string, User>();
  users.forEach((user) => {
    byId.set(user.id, user);
  });
  return Array.from(byId.values());
}

function evenSplit(amount: number, count: number) {
  if (count <= 0) {
    return [];
  }

  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / count);
  const remainder = cents % count;

  return Array.from({ length: count }, (_, index) =>
    (base + (index < remainder ? 1 : 0)) / 100
  );
}

function buildExpenseStatus(splits: ExpenseSplit[], payerId: string) {
  const owedSplits = splits.filter((split) => split.userId !== payerId);
  if (owedSplits.length === 0 || owedSplits.every((split) => split.settled)) {
    return "settled";
  }
  if (owedSplits.some((split) => split.settled)) {
    return "partial";
  }
  return "pending";
}

function computeBalances(
  currentUserId: string,
  users: User[],
  expenses: Expense[],
  payments: Payment[]
) {
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      if (split.settled || split.userId === expense.paidBy.id) {
        return;
      }

      if (expense.paidBy.id === currentUserId && split.userId !== currentUserId) {
        totals.set(
          split.userId,
          roundCurrency((totals.get(split.userId) ?? 0) + split.amount)
        );
      }

      if (split.userId === currentUserId && expense.paidBy.id !== currentUserId) {
        const peerId = expense.paidBy.id;
        totals.set(
          peerId,
          roundCurrency((totals.get(peerId) ?? 0) - split.amount)
        );
      }
    });
  });

  payments.forEach((payment) => {
    if (payment.fromUser.id === currentUserId) {
      totals.set(
        payment.toUser.id,
        roundCurrency((totals.get(payment.toUser.id) ?? 0) + payment.amount)
      );
    }

    if (payment.toUser.id === currentUserId) {
      totals.set(
        payment.fromUser.id,
        roundCurrency((totals.get(payment.fromUser.id) ?? 0) - payment.amount)
      );
    }
  });

  return Array.from(totals.entries())
    .map(([userId, amount]) => ({
      userId,
      user: users.find((user) => user.id === userId)!,
      amount: roundCurrency(amount),
    }))
    .filter((balance) => Math.abs(balance.amount) >= 0.01)
    .sort((left, right) => Math.abs(right.amount) - Math.abs(left.amount));
}

function computeGroups(groups: Group[], expenses: Expense[], payments: Payment[]) {
  return groups.map((group) => {
    const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
    const groupPayments = payments.filter((payment) => payment.groupId === group.id);
    const balanceMap = new Map<string, number>();

    group.members.forEach((member) => {
      balanceMap.set(member.id, 0);
    });

    groupExpenses.forEach((expense) => {
      balanceMap.set(
        expense.paidBy.id,
        roundCurrency((balanceMap.get(expense.paidBy.id) ?? 0) + expense.amount)
      );

      expense.splits.forEach((split) => {
        balanceMap.set(
          split.userId,
          roundCurrency((balanceMap.get(split.userId) ?? 0) - split.amount)
        );
      });
    });

    groupPayments.forEach((payment) => {
      balanceMap.set(
        payment.fromUser.id,
        roundCurrency((balanceMap.get(payment.fromUser.id) ?? 0) + payment.amount)
      );
      balanceMap.set(
        payment.toUser.id,
        roundCurrency((balanceMap.get(payment.toUser.id) ?? 0) - payment.amount)
      );
    });

    return {
      ...group,
      totalSpent: roundCurrency(
        groupExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      ),
      updatedAt:
        groupExpenses[0]?.updatedAt ||
        groupPayments[0]?.createdAt ||
        group.updatedAt,
      members: group.members.map((member) => ({
        ...member,
        balance: roundCurrency(balanceMap.get(member.id) ?? 0),
      })),
    };
  });
}

function computeSummaryData(
  expenses: Expense[],
  balances: Balance[],
  currentUserId: string
): SummaryCardData {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonth = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expense.paidBy.id === currentUserId &&
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expense.paidBy.id === currentUserId &&
        expenseDate.getMonth() === lastMonthDate.getMonth() &&
        expenseDate.getFullYear() === lastMonthDate.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const youOwe = balances
    .filter((balance) => balance.amount < 0)
    .reduce((sum, balance) => sum + Math.abs(balance.amount), 0);
  const youreOwed = balances
    .filter((balance) => balance.amount > 0)
    .reduce((sum, balance) => sum + balance.amount, 0);
  const totalBalance = youreOwed - youOwe;
  const trend = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    totalBalance: roundCurrency(totalBalance),
    youOwe: roundCurrency(youOwe),
    youreOwed: roundCurrency(youreOwed),
    thisMonth: roundCurrency(thisMonth),
    lastMonth: roundCurrency(lastMonth),
    trend: Number.isFinite(trend) ? trend : 0,
  };
}

function computeMonthlySpending(expenses: Expense[], currentUserId: string) {
  const now = new Date();
  const keys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return `${date.getFullYear()}-${date.getMonth()}`;
  });

  const totals = new Map<string, number>();
  keys.forEach((key) => totals.set(key, 0));

  expenses.forEach((expense) => {
    if (expense.paidBy.id !== currentUserId) {
      return;
    }
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + expense.amount);
    }
  });

  return keys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month, 1);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      amount: roundCurrency(totals.get(key) ?? 0),
    };
  });
}

function computeCategoryBreakdown(expenses: Expense[], currentUserId: string) {
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    if (expense.paidBy.id !== currentUserId) {
      return;
    }
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  });

  return CATEGORIES.map((category) => ({
    name: category.label,
    value: roundCurrency(totals.get(category.name) ?? 0),
    color: category.color,
  }))
    .filter((category) => category.value > 0)
    .sort((left, right) => right.value - left.value);
}

function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "auto" && prefersDark);
  document.documentElement.classList.toggle("dark", shouldUseDark);
}

export function ExpenseHubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExpenseHubState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ExpenseHubState>;
        setState((current) => ({
          ...current,
          ...parsed,
          preferences: {
            ...defaultPreferences,
            ...parsed.preferences,
            notifications: {
              ...defaultPreferences.notifications,
              ...parsed.preferences?.notifications,
            },
            privacy: {
              ...defaultPreferences.privacy,
              ...parsed.preferences?.privacy,
            },
          },
        }));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

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
    const amount = roundCurrency(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Enter a valid expense amount.");
    }

    const description = input.description.trim();
    if (!description) {
      throw new Error("Add a description for the expense.");
    }

    const paidBy = state.users.find((user) => user.id === input.paidBy);
    if (!paidBy) {
      throw new Error("Select who paid for this expense.");
    }

    const selectedGroup = input.groupId
      ? groups.find((group) => group.id === input.groupId)
      : undefined;

    let memberIds = input.selectedMembers.filter(Boolean);
    if (selectedGroup) {
      const allowedIds = new Set(selectedGroup.members.map((member) => member.id));
      memberIds = memberIds.filter((memberId) => allowedIds.has(memberId));
    } else {
      memberIds = [currentUser.id];
    }

    if (!memberIds.includes(paidBy.id)) {
      memberIds = [...memberIds, paidBy.id];
    }

    memberIds = Array.from(new Set(memberIds));

    if (!memberIds.length) {
      throw new Error("Choose at least one member for the split.");
    }

    const participants = memberIds
      .map((memberId) => state.users.find((user) => user.id === memberId))
      .filter((user): user is User => Boolean(user));

    let splitAmounts: number[] = [];

    if (input.splitType === "equal") {
      splitAmounts = evenSplit(amount, participants.length);
    }

    if (input.splitType === "amount") {
      splitAmounts = participants.map((participant) => {
        const customValue = Number.parseFloat(input.customAmounts[participant.id] || "0");
        return roundCurrency(customValue);
      });
      const total = roundCurrency(splitAmounts.reduce((sum, value) => sum + value, 0));
      if (Math.abs(total - amount) > 0.01) {
        throw new Error("Custom split amounts must add up to the total.");
      }
    }

    if (input.splitType === "percentage") {
      const percentages = participants.map((participant) =>
        Number.parseFloat(input.customAmounts[participant.id] || "0")
      );
      const totalPercent = roundCurrency(
        percentages.reduce((sum, value) => sum + value, 0)
      );
      if (Math.abs(totalPercent - 100) > 0.1) {
        throw new Error("Percentages must add up to 100%.");
      }
      splitAmounts = percentages.map((percentage, index) => {
        if (index === percentages.length - 1) {
          const subtotal = splitAmounts.reduce((sum, value) => sum + value, 0);
          return roundCurrency(amount - subtotal);
        }
        return roundCurrency((amount * percentage) / 100);
      });
    }

    if (input.splitType === "full") {
      splitAmounts = [amount];
    }

    const splits = participants.map((participant, index) => ({
      userId: participant.id,
      user: participant,
      amount: splitAmounts[index] ?? 0,
      settled: participant.id === paidBy.id,
    }));

    const now = new Date().toISOString();
    const timestamp = new Date(
      `${input.date || now.slice(0, 10)}T12:00:00`
    ).toISOString();
    const group = selectedGroup
      ? groups.find((item) => item.id === selectedGroup.id)
      : undefined;

    const expense: Expense = {
      id: generateId(),
      description,
      amount,
      currency: group?.currency || "USD",
      category: input.category as Expense["category"],
      date: timestamp,
      paidBy,
      splits,
      splitType: input.splitType,
      groupId: group?.id,
      group,
      receipt: input.receipt ?? undefined,
      notes: input.notes?.trim() || undefined,
      status: buildExpenseStatus(splits, paidBy.id),
      createdAt: now,
      updatedAt: now,
    };

    setState((current) => ({
      ...current,
      expenses: [expense, ...current.expenses],
      notifications: [
        {
          id: generateId(),
          type: "expense",
          title: "Expense added",
          message: `${description} was added for ${amount.toFixed(2)}.`,
          read: false,
          actionUrl: group ? `/groups/${group.id}` : "/",
          createdAt: now,
        },
        ...current.notifications,
      ],
    }));
  };

  const createGroup = async (input: CreateGroupInput) => {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Give the group a name.");
    }

    const existingUsers = new Map(state.users.map((user) => [user.id, user]));
    const usersByEmail = new Map(
      state.users.map((user) => [user.email.toLowerCase(), user])
    );

    const newMembers = input.invitedMembers.map((member) => {
      if (member.id && existingUsers.has(member.id)) {
        return existingUsers.get(member.id)!;
      }

      const existingByEmail = usersByEmail.get(member.email.toLowerCase());
      if (existingByEmail) {
        return existingByEmail;
      }

      return {
        id: generateId(),
        name: member.name.trim(),
        email: member.email.trim().toLowerCase(),
      };
    });

    const allUsers = dedupeUsers([...state.users, ...newMembers]);
    const now = new Date().toISOString();

    const group: Group = {
      id: generateId(),
      name,
      emoji: input.emoji,
      image: input.image ?? undefined,
      type: input.groupType,
      members: [currentUser, ...newMembers]
        .filter(
          (member, index, members) =>
            members.findIndex((item) => item.id === member.id) === index
        )
        .map((member) => ({
          ...member,
          balance: 0,
        })),
      currency: input.currency,
      simplifyDebts: input.simplifyDebts,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
    };

    setState((current) => ({
      ...current,
      users: allUsers,
      groups: [group, ...current.groups],
      notifications: [
        {
          id: generateId(),
          type: "group",
          title: "Group created",
          message: `${name} is ready for shared expenses.`,
          read: false,
          actionUrl: `/groups/${group.id}`,
          createdAt: now,
        },
        ...current.notifications,
      ],
    }));

    return group;
  };

  const settleUp = async (input: SettleUpInput) => {
    const user = state.users.find((candidate) => candidate.id === input.userId);
    const amount = roundCurrency(input.amount);

    if (!user) {
      throw new Error("Pick someone to settle up with.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Enter a valid payment amount.");
    }

    const now = new Date().toISOString();
    const payment: Payment = {
      id: generateId(),
      fromUser: currentUser,
      toUser: user,
      amount,
      currency: "USD",
      method: input.paymentMethod,
      date: new Date(`${input.date}T12:00:00`).toISOString(),
      note: input.note?.trim() || undefined,
      createdAt: now,
    };

    setState((current) => ({
      ...current,
      payments: [payment, ...current.payments],
      notifications: [
        {
          id: generateId(),
          type: "payment",
          title: "Settlement recorded",
          message: `Recorded ${amount.toFixed(2)} paid to ${user.name}.`,
          read: false,
          createdAt: now,
        },
        ...current.notifications,
      ],
    }));
  };

  const markAllNotificationsRead = () => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setState((current) => {
      const nextUsers = current.users.map((user) =>
        user.id === current.currentUserId ? { ...user, ...updates } : user
      );

      const nextGroups = current.groups.map((group) => ({
        ...group,
        members: group.members.map((member) =>
          member.id === current.currentUserId ? { ...member, ...updates } : member
        ),
      }));

      const nextExpenses = current.expenses.map((expense) => ({
        ...expense,
        paidBy:
          expense.paidBy.id === current.currentUserId
            ? { ...expense.paidBy, ...updates }
            : expense.paidBy,
        splits: expense.splits.map((split) => ({
          ...split,
          user:
            split.user.id === current.currentUserId
              ? { ...split.user, ...updates }
              : split.user,
        })),
      }));

      const nextPayments = current.payments.map((payment) => ({
        ...payment,
        fromUser:
          payment.fromUser.id === current.currentUserId
            ? { ...payment.fromUser, ...updates }
            : payment.fromUser,
        toUser:
          payment.toUser.id === current.currentUserId
            ? { ...payment.toUser, ...updates }
            : payment.toUser,
      }));

      return {
        ...current,
        users: nextUsers,
        groups: nextGroups,
        expenses: nextExpenses,
        payments: nextPayments,
      };
    });
  };

  const updatePreferences = (updates: Partial<AppPreferences>) => {
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...updates,
        notifications: {
          ...current.preferences.notifications,
          ...updates.notifications,
        },
        privacy: {
          ...current.preferences.privacy,
          ...updates.privacy,
        },
      },
    }));
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
