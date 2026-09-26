"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, UserX, Loader2 } from "lucide-react";

interface AbsenceItem {
  id: string;
  name: string;
  role: "siswa" | "tutor";
  classOrSubject: string;
  status: "tidak_hadir";
  reason: string;
  parentPhone?: string;
}

export function AbsenceList() {
  const [absenceList, setAbsenceList] = useState<AbsenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/today", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.absenceList) {
          setAbsenceList(json.data.absenceList);
        }
      } catch (e) {
        console.error("Gagal memuat data ketidakhadiran:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getBadge = (status: AbsenceItem["status"]) => {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
        Tidak Hadir
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <UserX size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Daftar Ketidakhadiran Hari Ini
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Siswa & tentor berstatus Tidak Hadir
              </p>
            </div>
          </div>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {absenceList.length} Orang
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : absenceList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Tidak ada siswa atau tentor yang absen/izin hari ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {absenceList.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                    {getBadge(item.status)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {item.classOrSubject}
                  </p>
                  <p className="text-[10px] italic text-slate-400 dark:text-slate-500 truncate">
                    &ldquo;{item.reason}&rdquo;
                  </p>
                </div>

                {item.parentPhone && (
                  <a
                    href={`https://wa.me/${item.parentPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Bapak/Ibu wali dari ${item.name}, mengonfirmasi kehadiran di bimbel hari ini.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-semibold"
                    title={`Hubungi via WhatsApp (${item.parentPhone})`}
                  >
                    <MessageSquare size={13} />
                    <span className="hidden sm:inline">Hubungi WA</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
