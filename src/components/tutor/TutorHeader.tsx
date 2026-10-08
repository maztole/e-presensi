"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  Calendar,
  Clock,
  Palette,
  CheckCheck,
  UserCheck,
  AlertTriangle,
  Info,
  Trash2,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";

interface TutorHeaderProps {
  mobileOpen?: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onOpenThemeModal?: () => void;
  onOpenManualAttendanceModal?: () => void;
  onOpenAddUserModal?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  createdAt?: string;
  isRead: boolean;
  type: "attendance" | "warning" | "info";
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function TutorHeader({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  onOpenThemeModal,
}: TutorHeaderProps) {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState({ name: "Tentor Utama", email: "tentor@lesku.id" });

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
      localStorage.removeItem("user_session");
      router.push("/login");
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user_session");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser?.name || "Tentor Utama",
          email: parsedUser?.email || "tentor@lesku.id",
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      } catch {
        // Fallback to static items if offline
      }
    };

    updateDateTime();
    fetchNotifications();

    const interval = setInterval(updateDateTime, 1000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    } catch {
      // offline
    }
  };

  const toggleReadStatus = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // offline
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await fetch("/api/notifications", { method: "DELETE" });
    } catch {
      // offline
    }
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "TT";

  const getNotifIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "attendance":
        return <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Sidenav Toggle Button (Far Left) */}
      <div className="flex items-center gap-3">
        {/* Toggle button for both Mobile and Desktop */}
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(!mobileOpen);
            } else if (setCollapsed) {
              setCollapsed((prev) => !prev);
            }
          }}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-95"
          aria-label="Toggle Navigation Sidebar"
          title="Buka / Tutup Sidebar"
        >
          <Menu size={20} className="stroke-[2.2]" />
        </button>
      </div>

      {/* Right: Live Clock, Theme & Notifications, and Far Right Login Info */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live Clock & Date badge */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/40">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Calendar size={14} />
            <span>{date || "Memuat tanggal..."}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
            <Clock size={14} />
            <span>{time || "--:--:--"}</span>
          </div>
        </div>

        {/* Theme CMS Button */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pengaturan Tema & CMS Tempat Les"
          >
            <Palette size={19} />
          </button>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifikasi"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Notifikasi
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      Tandai Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Hapus Semua"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleReadStatus(item.id)}
                      className={`p-3.5 px-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !item.isRead
                          ? "bg-blue-50/40 dark:bg-blue-950/20"
                          : ""
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {item.time || formatTimeAgo(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.message}
                        </p>
                      </div>
                      {!item.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-0.5" />

        {/* User Info Badge & Log Out - Far Right */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/70 px-2.5 py-1.5 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
              {initials}
            </div>
            <div className="hidden sm:flex min-w-0 flex-col leading-tight pr-0.5">
              <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Keluar / Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
