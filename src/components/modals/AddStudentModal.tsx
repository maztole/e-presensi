"use client";

import React, { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AddStudentModal({ isOpen, onClose, onSave }: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [nis, setNis] = useState("");
  const [gender, setGender] = useState("Laki-laki");
  const [gradeLevel, setGradeLevel] = useState("");
  const [schoolOrigin, setSchoolOrigin] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetch("/api/branches")
        .then((r) => r.json())
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setBranches(res.data);
            const nongkosawit = res.data.find((b: any) => b.code === "CBG-002");
            if (nongkosawit) {
              setBranchId(nongkosawit.id);
            } else if (res.data.length > 0) {
              setBranchId(res.data[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setNis("");
    setGender("Laki-laki");
    setGradeLevel("");
    setSchoolOrigin("");
    setParentName("");
    setParentPhone("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nis: nis || undefined,
          gender,
          gradeLevel: gradeLevel || "12 SMA",
          schoolOrigin: schoolOrigin || undefined,
          branchId: branchId || undefined,
          parentName: parentName || undefined,
          parentPhone: parentPhone || undefined,
        }),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        resetForm();
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Tambah Siswa Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pendaftaran siswa baru bimbingan belajar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <Check size={28} />
            </div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              Siswa Berhasil Terdaftar!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data {name} telah tersimpan ke dalam sistem
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Rizky"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cabang / Tempat Bimbel
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                >
                  {branches.length === 0 ? (
                    <option value="">Belum ada cabang</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kelas / Jenjang Siswa
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="">-- Pilih Kelas --</option>
                  <optgroup label="Sekolah Dasar (SD)">
                    <option value="1 SD">Kelas 1 SD</option>
                    <option value="2 SD">Kelas 2 SD</option>
                    <option value="3 SD">Kelas 3 SD</option>
                    <option value="4 SD">Kelas 4 SD</option>
                    <option value="5 SD">Kelas 5 SD</option>
                    <option value="6 SD">Kelas 6 SD</option>
                  </optgroup>
                  <optgroup label="Sekolah Menengah Pertama (SMP)">
                    <option value="7 SMP">Kelas 7 SMP</option>
                    <option value="8 SMP">Kelas 8 SMP</option>
                    <option value="9 SMP">Kelas 9 SMP</option>
                  </optgroup>
                  <optgroup label="Sekolah Menengah Atas/Kejuruan (SMA/SMK)">
                    <option value="10 SMA">Kelas 10 SMA</option>
                    <option value="11 SMA">Kelas 11 SMA</option>
                    <option value="12 SMA">Kelas 12 SMA</option>
                    <option value="10 SMK">Kelas 10 SMK</option>
                    <option value="11 SMK">Kelas 11 SMK</option>
                    <option value="12 SMK">Kelas 12 SMK</option>
                    <option value="Alumni / UTBK">Alumni / Intensif UTBK</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sekolah Asal
                </label>
                <input
                  type="text"
                  value={schoolOrigin}
                  onChange={(e) => setSchoolOrigin(e.target.value)}
                  placeholder="Contoh: SMAN 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nama Ayah / Ibu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  WA Orang Tua / Wali
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="08xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                {submitting ? "Menyimpan..." : "Simpan Siswa"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
