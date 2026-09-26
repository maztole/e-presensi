"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Receipt,
  LogOut,
  Building2,
  Menu,
  X,
  User,
  GraduationCap,
  Settings,
} from "lucide-react";

interface TutorSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function TutorSidebar({ mobileOpen, setMobileOpen }: TutorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, themeColors } = useThemeCMS();
  const [tutorUser, setTutorUser] = useState<any>(null);

  useEffect(() => {
    try {
      const sess = localStorage.getItem("user_session");
      if (sess) {
        setTutorUser(JSON.parse(sess));
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal tentor?")) {
      localStorage.removeItem("user_session");
      router.push("/login");
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/tutor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Jadwal Mengajar",
      href: "/tutor/jadwal",
      icon: CalendarDays,
    },
    {
      name: "Presensi Siswa",
      href: "/tutor/presensi",
      icon: UserCheck,
    },
    {
      name: "Honor & Bulanan",
      href: "/tutor/honor",
      icon: Receipt,
    },
    {
      name: "Pengaturan Akun",
      href: "/tutor/pengaturan",
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${themeColors.logoGradient} flex items-center justify-center shrink-0 shadow-lg ${themeColors.shadow}`}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-white truncate">
              {settings.lesName}
            </span>
            <span className={`text-[11px] ${themeColors.textMuted} font-medium truncate`}>
              Portal Tentor / Pengajar
            </span>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Tutor Profile Pill */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
            {tutorUser?.name ? tutorUser.name.charAt(0).toUpperCase() : "T"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {tutorUser?.name || "Tentor Bimbel"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {tutorUser?.specialization || tutorUser?.nip || "Pengajar Aktif"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
          Menu Pengajar
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? `${themeColors.bg} text-white shadow-sm font-bold`
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      </div>
  );

  return (
    <>
      {/* Desktop Sidenav */}
      <aside className="hidden lg:flex w-64 shrink-0 fixed inset-y-0 left-0 z-30 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
