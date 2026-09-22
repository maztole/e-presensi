"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS, AccentColor } from "@/context/ThemeContext";
import { X, Palette, Building, Sun, Moon, RotateCcw, Check, Sparkles, Clock } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions: { id: AccentColor; name: string; bgClass: string; borderClass: string }[] = [
  { id: "blue", name: "Royal Blue", bgClass: "bg-blue-600", borderClass: "border-blue-600" },
  { id: "emerald", name: "Emerald Green", bgClass: "bg-emerald-600", borderClass: "border-emerald-600" },
  { id: "indigo", name: "Indigo Purple", bgClass: "bg-indigo-600", borderClass: "border-indigo-600" },
  { id: "violet", name: "Deep Violet", bgClass: "bg-violet-600", borderClass: "border-violet-600" },
  { id: "rose", name: "Crimson Rose", bgClass: "bg-rose-600", borderClass: "border-rose-600" },
  { id: "amber", name: "Warm Amber", bgClass: "bg-amber-500", borderClass: "border-amber-500" },
];

export function ThemeCustomizerModal({ isOpen, onClose }: ModalProps) {
  const { settings, updateSettings, resetSettings } = useThemeCMS();
  const [formState, setFormState] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setFormState(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(formState);
    onClose();
  };

  const handleCancel = () => {
    setFormState(settings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setFormState({
      lesName: "Bimbel Bintang Prestasi",
      lesTagline: "Sistem Presensi & Manajemen Bimbel",
      accentColor: "blue",
      mode: "light",
      lateToleranceMinutes: 15,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Pengaturan Tema & Branding CMS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kustomisasi tampilan & identitas tempat les Anda
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Identitas Tempat Les */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Building size={14} /> Identitas Tempat Les
            </label>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Tempat Les / Bimbel
              </span>
              <input
                type="text"
                value={formState.lesName}
                onChange={(e) => setFormState({ ...formState, lesName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Bimbel Bintang Belajar"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sub-Judul / Tagline Dashboard
              </span>
              <input
                type="text"
                value={formState.lesTagline}
                onChange={(e) => setFormState({ ...formState, lesTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Admin Management System"
              />
            </div>
          </div>

          {/* Mode Tampilan */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mode Tampilan (Theme Mode)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormState({ ...formState, mode: "light" })}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  formState.mode === "light"
                    ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Sun size={16} /> Light Mode
              </button>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, mode: "dark" })}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  formState.mode === "dark"
                    ? "bg-slate-800 border-blue-500 text-blue-400 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Moon size={16} /> Dark Mode
              </button>
            </div>
          </div>

          {/* Warna Aksen Utama */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Warna Aksen Utama Sistem
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormState({ ...formState, accentColor: c.id })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    formState.accentColor === c.id
                      ? `${c.borderClass} bg-slate-50 dark:bg-slate-800 ring-2 ring-blue-500/20`
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${c.bgClass} shrink-0`} />
                  <span className="truncate text-slate-800 dark:text-slate-200">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toleransi Waktu Terlambat */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock size={14} /> Toleransi Keterlambatan Presensi
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="60"
                value={formState.lateToleranceMinutes}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    lateToleranceMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-center text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Menit setelah jam sesi dimulai dianggap <b>Terlambat</b>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw size={14} /> Reset Bawaan
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Check size={14} /> Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
