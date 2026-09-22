"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  UserCheck,
  UserX,
  History,
  CalendarDays,
  School,
  BookOpen,
  GraduationCap,
  Users,
  HeartHandshake,
  FileSpreadsheet,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X,
  Building2,
  Palette,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenThemeModal?: () => void;
}

export function Sidebar({ mobileOpen, setMobileOpen, onOpenThemeModal }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { settings, themeColors } = useThemeCMS();

  const menuGroups = [
    {
      title: "Utama",
      items: [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Manajemen Presensi",
      items: [
        {
          name: "Presensi Siswa",
          href: "/admin/presensi/siswa",
          icon: UserCheck,
          badge: "Live",
        },
        {
          name: "Presensi Pengajar",
          href: "/admin/presensi/tutor",
          icon: UserX,
        },
        {
          name: "Riwayat & Rekap",
          href: "/admin/presensi/riwayat",
          icon: History,
        },
      ],
    },
    {
      title: "Manajemen Pengguna",
      items: [
        {
          name: "Data Pengajar / Tutor",
          href: "/admin/pengguna/tutor",
          icon: GraduationCap,
        },
        {
          name: "Data Siswa",
          href: "/admin/pengguna/siswa",
          icon: Users,
        },
        {
          name: "Data Orang Tua",
          href: "/admin/pengguna/orang-tua",
          icon: HeartHandshake,
        },
      ],
    },
    {
      title: "Laporan & Rekap",
      items: [
        {
          name: "Laporan Kehadiran",
          href: "/admin/laporan/kehadiran",
          icon: FileSpreadsheet,
        },
        {
          name: "Laporan Honor & SPP",
          href: "/admin/laporan/keuangan",
          icon: Receipt,
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        {
          name: "Pengaturan Sistem",
          href: "/admin/pengaturan",
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${themeColors.logoGradient} flex items-center justify-center shrink-0 shadow-lg ${themeColors.shadow}`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                {settings.lesName}
              </span>
              <span className={`text-[11px] ${themeColors.textMuted} font-medium truncate`}>
                {settings.lesTagline}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                {group.title}
              </h3>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? `${themeColors.bg} text-white shadow-md ${themeColors.shadow}`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {item.badge && (!collapsed || mobileOpen) && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for Collapsed Sidebar */}
                  {collapsed && !mobileOpen && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 ${
            collapsed && !mobileOpen ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm shrink-0">
            AD
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 truncate">
                Admin Utama
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                admin@lesku.id
              </span>
            </div>
          )}
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-1">
              {onOpenThemeModal && (
                <button
                  onClick={onOpenThemeModal}
                  title="Kustomisasi Tema & CMS"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                >
                  <Palette size={16} />
                </button>
              )}
              <button
                title="Keluar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
