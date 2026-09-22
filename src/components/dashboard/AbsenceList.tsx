import React from "react";
import { AlertCircle, CheckCircle, Phone, MessageSquare, ChevronRight, UserX } from "lucide-react";
import Link from "next/link";

interface AbsenceItem {
  id: string;
  name: string;
  role: "siswa" | "tutor";
  classOrSubject: string;
  status: "izin" | "sakit" | "alpa";
  reason: string;
  parentPhone?: string;
}

const mockAbsenceList: AbsenceItem[] = [
  {
    id: "1",
    name: "Budi Santoso",
    role: "siswa",
    classOrSubject: "Kelas 9 SMP - Persiapan ASPD",
    status: "izin",
    reason: "Acara keluarga di luar kota",
    parentPhone: "6281234567890",
  },
  {
    id: "2",
    name: "Clarissa Putri",
    role: "siswa",
    classOrSubject: "Private 1-on-1 SD",
    status: "sakit",
    reason: "Demam & flu, istirahat dokter",
    parentPhone: "6289876543210",
  },
  {
    id: "3",
    name: "Rendy Pratama",
    role: "siswa",
    classOrSubject: "Kelas 12 SMA - UTBK",
    status: "alpa",
    reason: "Belum ada keterangan / konfirmasi",
    parentPhone: "6285678901234",
  },
];

export function AbsenceList() {
  const getBadge = (status: AbsenceItem["status"]) => {
    switch (status) {
      case "izin":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Izin
          </span>
        );
      case "sakit":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Sakit
          </span>
        );
      case "alpa":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Alpha
          </span>
        );
    }
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
                Siswa & tentor berstatus Izin, Sakit, atau Alpha
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {mockAbsenceList.length} Orang
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {mockAbsenceList.map((item) => (
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
                  href={`https://wa.me/${item.parentPhone}?text=Halo%20Bapak/Ibu,%20mengonfirmasi%20kehadiran%20les...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-semibold"
                  title="Hubungi Orang Tua via WhatsApp"
                >
                  <MessageSquare size={13} />
                  <span className="hidden sm:inline">Hubungi WA</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 text-right">
        <Link
          href="/admin/presensi/riwayat?filter=tidak-hadir"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 inline-flex items-center gap-1"
        >
          Lihat Semua Ketidakhadiran <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
