export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "travel"
  | "health"
  | "other";

export type SplitType = "equal" | "amount" | "percentage" | "full";

export type ExpenseStatus = "pending" | "partial" | "settled";

export type PaymentMethod = "cash" | "bank" | "paypal" | "venmo" | "other";

export type GroupType = "friends" | "trip" | "home" | "couple" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface GroupMember extends User {
  balance: number;
}

export interface Group {
  id: string;
  name: string;
  image?: string;
  emoji?: string;
  type: GroupType;
  members: GroupMember[];
  currency: string;
  simplifyDebts: boolean;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSplit {
  userId: string;
  user: User;
  amount: number;
  percentage?: number;
  settled: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: Category;
  date: string;
  paidBy: User;
  splits: ExpenseSplit[];
  splitType: SplitType;
  groupId?: string;
  group?: Group;
  receipt?: string;
  notes?: string;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  fromUser: User;
  toUser: User;
  amount: number;
  currency: string;
  method: PaymentMethod;
  date: string;
  note?: string;
  groupId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "expense" | "payment" | "group" | "reminder";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Balance {
  userId: string;
  user: User;
  amount: number;
}

export interface CategoryInfo {
  name: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: "food", label: "Food & Dining", icon: "🍔", color: "#ff922b" },
  { name: "transport", label: "Transport", icon: "🚗", color: "#4c6ef5" },
  { name: "shopping", label: "Shopping", icon: "🛍️", color: "#be4bdb" },
  { name: "bills", label: "Bills & Utilities", icon: "📄", color: "#fd7e14" },
  { name: "entertainment", label: "Entertainment", icon: "🎬", color: "#f06595" },
  { name: "travel", label: "Travel", icon: "✈️", color: "#20c997" },
  { name: "health", label: "Health", icon: "💊", color: "#ff6b6b" },
  { name: "other", label: "Other", icon: "📦", color: "#868e96" },
];

export const GROUP_TYPES: { type: GroupType; label: string; emoji: string }[] = [
  { type: "friends", label: "Friends", emoji: "👥" },
  { type: "trip", label: "Trip", emoji: "🌴" },
  { type: "home", label: "Home", emoji: "🏠" },
  { type: "couple", label: "Couple", emoji: "💑" },
  { type: "other", label: "Other", emoji: "📁" },
];

export const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: string }[] = [
  { method: "cash", label: "Cash", icon: "💵" },
  { method: "bank", label: "Bank Transfer", icon: "🏦" },
  { method: "paypal", label: "PayPal", icon: "💳" },
  { method: "venmo", label: "Venmo", icon: "📱" },
  { method: "other", label: "Other", icon: "💰" },
];
