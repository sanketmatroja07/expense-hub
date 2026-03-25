"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  User,
  Users,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  Menu,
  X,
  Wallet,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { useExpenseHub } from "@/lib/expense-hub-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/personal", label: "Personal", icon: User },
  { href: "/shared", label: "Shared", icon: Users },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/reports", label: "Reports", icon: PieChart },
];

const userMenuItems = [
  { label: "Profile", icon: UserCircle, href: "/settings" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Payment Methods", icon: CreditCard, href: "/settings?tab=payments" },
  { label: "Help & Support", icon: HelpCircle, href: "/help" },
];

export function Navbar() {
  const pathname = usePathname();
  const { notifications, currentUser, markAllNotificationsRead, unreadCount } =
    useExpenseHub();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent hidden sm:block">
                ExpenseHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-primary-700"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary-50 rounded-xl"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="notification-dot">{unreadCount}</span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                        <h3 className="font-semibold text-neutral-900">
                          Notifications
                        </h3>
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            className={cn(
                              "px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-50 last:border-0",
                              !notif.read && "bg-primary-50/50"
                            )}
                          >
                            <div className="flex gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                  notif.type === "expense" &&
                                    "bg-primary-100 text-primary-600",
                                  notif.type === "payment" &&
                                    "bg-success-100 text-success-600",
                                  notif.type === "group" &&
                                    "bg-accent-100 text-accent-600",
                                  notif.type === "reminder" &&
                                    "bg-warning-100 text-warning-600"
                                )}
                              >
                                {notif.type === "expense" && (
                                  <Wallet className="w-5 h-5" />
                                )}
                                {notif.type === "payment" && (
                                  <CreditCard className="w-5 h-5" />
                                )}
                                {notif.type === "group" && (
                                  <Users className="w-5 h-5" />
                                )}
                                {notif.type === "reminder" && (
                                  <Bell className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50">
                        <button className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-neutral-100 transition-all"
                >
                  <div className="avatar-md">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(currentUser.name)}</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-neutral-500 transition-transform hidden sm:block",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="avatar-lg">
                            <span>{getInitials(currentUser.name)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {currentUser.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4 text-neutral-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-neutral-100 py-2">
                        <button className="dropdown-item w-full text-danger-600 hover:bg-danger-50">
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-neutral-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Click outside to close menus */}
      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </>
  );
}
