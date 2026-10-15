"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  UserCheck,
  UserX,
  History,
  GraduationCap,
  Users,
  HeartHandshake,
  FileSpreadsheet,
  Receipt,
  Settings,
  X,
  Building2,
  CalendarDays,
  UserCog,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  onOpenThemeModal?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed: externalCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
  const { settings, themeColors } = useThemeCMS();
  const isSidebarLight = settings.sidebarMode === "light";

  const collapsed = externalCollapsed ?? false;

  const toggleGroup = (groupIndex: number) => {
    setOpenGroups((prev) => {
      const currentOpen = prev[groupIndex] ?? false;
      const nextState: Record<number, boolean> = {};

      Object.keys(prev).forEach((key) => {
        nextState[Number(key)] = false;
      });

      nextState[groupIndex] = !currentOpen;
      return nextState;
    });
  };

  const sidebarShellClass = isSidebarLight
    ? "bg-white text-slate-800 border-slate-200 shadow-sm"
    : "bg-slate-900 text-slate-100 border-slate-800";

  const sidebarHeaderTextClass = isSidebarLight ? "text-slate-900" : "text-white";
  const sidebarGroupTitleClass = isSidebarLight ? "text-slate-500" : "text-slate-400";
  const sidebarItemIdleClass = isSidebarLight
    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60";
  const sidebarItemIconIdleClass = isSidebarLight
    ? "text-slate-500 group-hover:text-slate-700"
    : "text-slate-400 group-hover:text-slate-200";
  const sidebarBadgeClass = isSidebarLight
    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";

  const menuGroups: MenuGroup[] = [
    {
      title: "Manajemen Presensi",
      items: [
        {
          name: "Presensi Siswa",
          href: "/admin/presensi/siswa",
          icon: UserCheck,
        },
        {
          name: "Presensi Tentor",
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
          name: "Data Tentor",
          href: "/admin/pengguna/tutor",
          icon: GraduationCap,
        },
        {
          name: "Data Siswa",
          href: "/admin/pengguna/siswa",
          icon: Users,
        },
        {
          name: "Jadwal Siswa",
          href: "/admin/pengguna/jadwal-siswa",
          icon: CalendarDays,
        },
        {
          name: "Data Orang Tua",
          href: "/admin/pengguna/orang-tua",
          icon: HeartHandshake,
        },
        {
          name: "Data Cabang",
          href: "/admin/cabang",
          icon: Building2,
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
          name: "Manajemen Akun",
          href: "/admin/akun",
          icon: UserCog,
        },
        {
          name: "Pengaturan Sistem",
          href: "/admin/pengaturan",
          icon: Settings,
        },
      ],
    },
  ];

  const handleMenuClick = (groupIndex: number) => {
    setOpenGroups((prev) => {
      const nextState: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        nextState[Number(key)] = false;
      });
      nextState[groupIndex] = true;
      return nextState;
    });
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full border-r transition-all duration-300 ${sidebarShellClass}`}>
      {/* Brand Header */}
      <div className={`h-16 flex items-center ${collapsed && !mobileOpen ? "justify-center" : "justify-between"} px-4 border-b transition-all duration-300 ease-in-out ${isSidebarLight ? "border-slate-200" : "border-slate-800"}`}>
        <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${collapsed && !mobileOpen ? "gap-0" : "gap-3"}`}>
          <Image
            src="/images/logo-ahe.png"
            alt="Logo Bimbel Anak Hebat"
            width={40}
            height={40}
            className="w-10 h-10 object-contain shrink-0 transition-all duration-300 ease-in-out"
            priority
          />
          <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${collapsed && !mobileOpen ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[220px] translate-x-0 opacity-100"}`} aria-hidden={collapsed && !mobileOpen}>
            <span className={`font-bold text-[14px] tracking-tight truncate whitespace-nowrap ${sidebarHeaderTextClass}`}>
              {settings.lesName}
            </span>
            <span className={`text-[11px] ${isSidebarLight ? "text-slate-500" : themeColors.textMuted} font-medium truncate whitespace-nowrap`}>
              {settings.lesTagline}
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className={`md:hidden p-1.5 rounded-lg ${isSidebarLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"}`}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <div className={`flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin ${isSidebarLight ? "scrollbar-thumb-slate-300" : "scrollbar-thumb-slate-800"}`}>
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          title={collapsed && !mobileOpen ? "Dashboard" : undefined}
          className={`flex items-center ${collapsed && !mobileOpen ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-500 group relative ${
            pathname === "/admin/dashboard"
              ? `${themeColors.bg} text-white shadow-md ${themeColors.shadow}`
              : sidebarItemIdleClass
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 shrink-0 transition-transform duration-500 ${
              pathname === "/admin/dashboard" ? "text-white" : sidebarItemIconIdleClass
            }`}
          />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${collapsed && !mobileOpen ? "max-w-0 flex-none opacity-0 -translate-x-2" : "max-w-[180px] flex-1 opacity-100 translate-x-0"}`} aria-hidden={collapsed && !mobileOpen}>Dashboard</span>
          {collapsed && !mobileOpen && (
            <div className={`absolute left-full ml-3 px-3 py-1.5 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-500 ${isSidebarLight ? "bg-slate-800 text-white" : "bg-slate-800 text-slate-100"}`}>
              Dashboard
            </div>
          )}
        </Link>

        {menuGroups.map((group, groupIdx) => {
          const hasActiveItem = group.items.some((item) => pathname === item.href);
          const isGroupOpen = openGroups[groupIdx] ?? false;
          const shouldShowItems = mobileOpen || (!collapsed && isGroupOpen) || (collapsed && hasActiveItem);

          return (
            <div key={groupIdx} className="space-y-1">
              {(
                <button
                  type="button"
                  onClick={() => toggleGroup(groupIdx)}
                  title={collapsed && !mobileOpen ? group.title : undefined}
                  className={`w-full flex items-center ${collapsed && !mobileOpen ? "justify-center px-0" : "justify-between px-3"} py-2 rounded-xl text-left transition-all duration-500 ${
                    isSidebarLight
                      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
                  }`}
                >
                  <div className={`flex items-center ${collapsed && !mobileOpen ? "gap-0" : "gap-2"}`}>
                    <span className={`inline-flex h-4 w-4 items-center justify-center ${sidebarGroupTitleClass}`}>
                      {group.title === "Manajemen Presensi" && <UserCheck className="w-3.5 h-3.5" />}
                      {group.title === "Manajemen Pengguna" && <Users className="w-3.5 h-3.5" />}
                      {group.title === "Laporan & Rekap" && <FileSpreadsheet className="w-3.5 h-3.5" />}
                      {group.title === "Pengaturan" && <Settings className="w-3.5 h-3.5" />}
                    </span>
                    <span className={`overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 ease-in-out ${sidebarGroupTitleClass} ${collapsed && !mobileOpen ? "max-w-0 opacity-0 -translate-x-2" : "max-w-[180px] opacity-100 translate-x-0"}`} aria-hidden={collapsed && !mobileOpen}>
                      {group.title}
                    </span>
                  </div>
                  <span className={`overflow-hidden text-xs transition-all duration-300 ease-in-out ${collapsed && !mobileOpen ? "w-0 opacity-0" : "w-3 opacity-100"} ${shouldShowItems ? "rotate-90" : "rotate-0"}`} aria-hidden={collapsed && !mobileOpen}>
                    ▸
                  </span>
                </button>
              )}

              <div
                className={`space-y-1 ${collapsed && !mobileOpen ? "pl-0" : "pl-5"} transition-all duration-500 ease-in-out overflow-hidden ${
                  shouldShowItems ? "max-h-96 opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleMenuClick(groupIdx)}
                      className={`flex items-center ${collapsed && !mobileOpen ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-500 group relative ${
                        isActive
                          ? `${themeColors.bg} text-white shadow-md ${themeColors.shadow}`
                          : sidebarItemIdleClass
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${
                          isActive ? "bg-white" : isSidebarLight ? "bg-slate-400" : "bg-slate-500"
                        }`}
                      />

                      <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${collapsed && !mobileOpen ? "max-w-0 flex-none opacity-0 -translate-x-2" : "max-w-[180px] flex-1 opacity-100 translate-x-0"}`} aria-hidden={collapsed && !mobileOpen}>{item.name}</span>

                      {item.badge && (!collapsed || mobileOpen) && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${sidebarBadgeClass}`}>
                          {item.badge}
                        </span>
                      )}

                      {collapsed && !mobileOpen && (
                        <div className={`absolute left-full ml-3 px-3 py-1.5 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-500 ${isSidebarLight ? "bg-slate-800 text-white" : "bg-slate-800 text-slate-100"}`}>
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 z-30 ${
          collapsed ? "w-24" : "w-72"
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
        className={`fixed top-0 bottom-0 left-0 w-80 z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
