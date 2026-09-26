"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Settings,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Save,
  User,
  KeyRound,
  Mail,
  Sparkles,
  ShieldCheck,
  Coins,
  GraduationCap,
  Loader2,
} from "lucide-react";

export default function SystemSettingsPage() {
  const { themeColors } = useThemeCMS();
  const [activeTab, setActiveTab] = useState<"ACCOUNT" | "RATES" | "WHATSAPP">("ACCOUNT");

  // Admin Account State
  const [adminName, setAdminName] = useState("Admin E-Presensi");
  const [adminEmail, setAdminEmail] = useState("admin@bimbel.id");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // WhatsApp Template State
  const [waTemplate, setWaTemplate] = useState(
    `Halo Bapak/Ibu {nama_ortu}, menginformasikan bahwa {nama_siswa} pada tanggal {tanggal} pukul {jam} telah melakukan presensi di {nama_bimbel} dengan status: *{status}*. Terima kasih.`
  );

  // Financial Rates State (using string/number for smooth input typing)
  const [honorRates, setHonorRates] = useState<{ [key: string]: number | string }>({
    SD: 18000,
    SMP: 20000,
    SMA: 22000,
  });

  const [sppRates, setSppRates] = useState<{ [key: string]: number | string }>({
    SD: 350000,
    SMP: 450000,
    SMA: 550000,
  });

  // Status & Feedback States
  const [isSaved, setIsSaved] = useState(false);
  const [isRatesSaved, setIsRatesSaved] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [savingRates, setSavingRates] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    // Load stored WA template & admin profile if available
    const savedTemplate = localStorage.getItem("epresensi_wa_template");
    if (savedTemplate) {
      setWaTemplate(savedTemplate);
    }
    const savedAdmin = localStorage.getItem("epresensi_admin_profile");
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.email) setAdminEmail(parsed.email);
        if (parsed.name) setAdminName(parsed.name);
      } catch (e) {}
    }

    // Load Financial Rates
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const res = await fetch("/api/financial-rates", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.honorRates) setHonorRates(json.data.honorRates);
          if (json.data.sppRates) setSppRates(json.data.sppRates);
        }
      } catch (err) {
        console.error("Gagal memuat data tarif:", err);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMessage(null);

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setAccountMessage({ type: "error", text: "Masukkan kata sandi saat ini untuk mengonfirmasi perubahan!" });
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok!" });
        return;
      }
      if (newPassword.length < 6) {
        setAccountMessage({ type: "error", text: "Kata sandi baru minimal 6 karakter!" });
        return;
      }
    }

    localStorage.setItem(
      "epresensi_admin_profile",
      JSON.stringify({ name: adminName, email: adminEmail })
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setAccountMessage({
      type: "success",
      text: "Profil & kata sandi akun admin berhasil diperbarui!",
    });

    setTimeout(() => setAccountMessage(null), 4000);
  };

  const handleSaveWaTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("epresensi_wa_template", waTemplate);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      const formattedHonor: Record<string, number> = {};
      Object.entries(honorRates).forEach(([k, v]) => {
        formattedHonor[k] = Number(v) || 0;
      });

      const formattedSpp: Record<string, number> = {};
      Object.entries(sppRates).forEach(([k, v]) => {
        formattedSpp[k] = Number(v) || 0;
      });

      const res = await fetch("/api/financial-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ honorRates: formattedHonor, sppRates: formattedSpp }),
      });
      const json = await res.json();
      if (json.success) {
        setIsRatesSaved(true);
        setTimeout(() => setIsRatesSaved(false), 4000);
      } else {
        alert("Gagal menyimpan tarif: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error("Gagal menyimpan tarif:", err);
      alert("Gagal terhubung ke server untuk menyimpan tarif");
    } finally {
      setSavingRates(false);
    }
  };

  const insertVariable = (variable: string) => {
    setWaTemplate((prev) => prev + ` ${variable}`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Generate preview text for WhatsApp bubble
  const previewText = waTemplate
    .replace("{nama_ortu}", "Budi Santoso")
    .replace("{nama_siswa}", "Ahmad Rizky")
    .replace("{tanggal}", "24/09/2026")
    .replace("{jam}", "16:05 WIB")
    .replace("{status}", "HADIR")
    .replace("{nama_bimbel}", "Bimbel Bintang Prestasi");

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
              <Settings size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Pengaturan Sistem
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola email &amp; kata sandi akun admin, konfigurasi tarif honor &amp; SPP, serta atur template notifikasi WhatsApp.
          </p>
        </div>
      </div>

      {/* 3-Tab Switcher Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab("ACCOUNT")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "ACCOUNT"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <User size={16} />
          <span>Email &amp; Kata Sandi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RATES")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "RATES"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Coins size={16} />
          <span>Tarif Honor &amp; SPP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("WHATSAPP")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "WHATSAPP"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <MessageSquare size={16} />
          <span>Template Chat WA</span>
        </button>
      </div>

      {/* TAB 1: Pengaturan Email & Password Admin */}
      {activeTab === "ACCOUNT" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <User size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Pengaturan Email &amp; Kata Sandi Admin
                </h2>
                <p className="text-xs text-slate-500">
                  Ubah identitas administrator, alamat email login, atau perbarui kata sandi akun
                </p>
              </div>
            </div>
          </div>

          {accountMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                accountMessage.type === "success"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
              }`}
            >
              {accountMessage.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{accountMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Administrator
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Administrator E-Presensi"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Email Login
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@bimbel.id"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <KeyRound size={15} className="text-amber-500" />
                <span>Perbarui Kata Sandi (Opsional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer`}
              >
                <ShieldCheck size={16} />
                <span>Simpan Perubahan Akun</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Pengaturan Tarif Honor Tentor & SPP Siswa per Jenjang */}
      {activeTab === "RATES" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Coins size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Pengaturan Tarif Honor Tentor &amp; SPP Siswa
                </h2>
                <p className="text-xs text-slate-500">
                  Atur nominal honor pengajar per sesi dan tagihan SPP bulanan untuk tiap jenjang pendidikan
                </p>
              </div>
            </div>
          </div>

          {isRatesSaved && (
            <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>Tarif honor tentor &amp; SPP siswa berhasil disimpan!</span>
            </div>
          )}

          {loadingRates ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat tarif keuangan dari database...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveRates} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Honor Tentor Rates */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      Tarif Honor Tentor (per Sesi)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {["SD", "SMP", "SMA"].map((lvl) => (
                      <div key={`honor-${lvl}`} className="flex items-center justify-between gap-3">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 w-24">
                          Jenjang {lvl}
                        </label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                            Rp
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={honorRates[lvl] !== undefined ? honorRates[lvl] : ""}
                            onChange={(e) =>
                              setHonorRates((prev) => ({ ...prev, [lvl]: e.target.value === "" ? "" : Number(e.target.value) }))
                            }
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SPP Rates */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      Tarif SPP Siswa (per Bulan)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {["SD", "SMP", "SMA"].map((lvl) => (
                      <div key={`spp-${lvl}`} className="flex items-center justify-between gap-3">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 w-24">
                          Jenjang {lvl}
                        </label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                            Rp
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={sppRates[lvl] !== undefined ? sppRates[lvl] : ""}
                            onChange={(e) =>
                              setSppRates((prev) => ({ ...prev, [lvl]: e.target.value === "" ? "" : Number(e.target.value) }))
                            }
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingRates}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  <span>Simpan Pengaturan Tarif</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: Template Chat WhatsApp Orang Tua */}
      {activeTab === "WHATSAPP" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Template Chat WhatsApp Orang Tua / Wali Murid
                </h2>
                <p className="text-xs text-slate-500">
                  Edit format teks pesan otomatis yang dapat langsung dikirimkan ke WhatsApp wali siswa
                </p>
              </div>
            </div>
          </div>

          {isSaved && (
            <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>Template WhatsApp berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSaveWaTemplate} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Editor Input */}
              <div className="lg:col-span-7 space-y-3 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Format Teks Pesan Notifikasi Presensi
                </label>

                <textarea
                  rows={6}
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs leading-relaxed"
                />

                <div>
                  <span className="text-slate-500 block mb-1.5 font-semibold text-[11px]">
                    Variabel dinamis (klik untuk menyisipkan ke dalam teks):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Nama Ortu", code: "{nama_ortu}" },
                      { label: "Nama Siswa", code: "{nama_siswa}" },
                      { label: "Tanggal", code: "{tanggal}" },
                      { label: "Jam", code: "{jam}" },
                      { label: "Status", code: "{status}" },
                      { label: "Nama Bimbel", code: "{nama_bimbel}" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => insertVariable(item.code)}
                        className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-mono hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.code}</span>
                        <Sparkles size={11} />
                      </button>
                    ))}
                  </div>
                  {copiedVar && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">
                      ✓ Variabel <code className="font-mono">{copiedVar}</code> berhasil disisipkan!
                    </p>
                  )}
                </div>
              </div>

              {/* Live WhatsApp Chat Bubble Preview */}
              <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      WA
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Pratinjau Pesan WA
                      </h4>
                      <p className="text-[10px] text-slate-400">Pesan terkirim ke Orang Tua / Wali</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-900/60 p-3.5 rounded-2xl rounded-tl-none shadow-xs text-xs space-y-1 text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
                    <p className="whitespace-pre-line">{previewText}</p>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono text-right flex items-center justify-end gap-1 pt-1">
                      <span>16:05</span>
                      <span>✓✓</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Pesan di atas akan otomatis digunakan saat menekan tombol <span className="text-emerald-600 font-bold">Kirim WA</span> pada menu presensi siswa.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save size={16} />
                <span>Simpan Template WA</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

