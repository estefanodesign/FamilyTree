import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Move, ZoomIn, Trash2, Users } from 'lucide-react';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Panduan Penggunaan"
            className="max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20"
        >
            <div className="space-y-8">
                {/* Introduction */}
                <div>
                    <p className="text-gray-600 leading-relaxed">
                        Selamat datang di Aplikasi Silsilah Keluarga. Berikut adalah panduan singkat cara menggunakan aplikasi ini.
                    </p>
                </div>

                {/* Adding Members */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                            <Plus className="w-5 h-5" />
                        </div>
                        Menambah Anggota Keluarga
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-medium text-gray-900 mb-2">Tambah Anak/Orang Tua</h4>
                            <p className="text-sm text-gray-600">
                                Klik tombol <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-xs font-medium mx-1">+</span> pada kartu anggota keluarga untuk menambah relasi (anak, orang tua, pasangan).
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-medium text-gray-900 mb-2">Relasi Pasangan</h4>
                            <p className="text-sm text-gray-600">
                                Saat menambahkan pasangan, sistem akan otomatis menghubungkan mereka dalam satu kartu keluarga.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Editing & Deleting */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                            <Edit2 className="w-5 h-5" />
                        </div>
                        Edit & Hapus Data
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-gray-100 rounded text-gray-500">
                                <Edit2 className="w-4 h-4" />
                            </div>
                            <span>
                                <strong>Edit:</strong> Klik langsung pada kartu anggota keluarga untuk mengubah data foto, nama, tanggal lahir, dan informasi lainnya.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-red-100 rounded text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <span>
                                <strong>Hapus:</strong> Gunakan tombol hapus di dalam form edit untuk menghapus anggota keluarga. <em className="text-red-500 text-sm">(Hati-hati: Menghapus data tidak dapat dibatalkan)</em>
                            </span>
                        </li>
                    </ul>
                </section>

                {/* Navigation */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                            <Move className="w-5 h-5" />
                        </div>
                        Navigasi Kanvas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <Move className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <span className="block font-medium text-gray-900 text-sm">Geser (Pan)</span>
                                <span className="text-xs text-gray-500">Klik & tahan area kosong, lalu geser mouse.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <ZoomIn className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <span className="block font-medium text-gray-900 text-sm">Zoom</span>
                                <span className="text-xs text-gray-500">Gunakan scroll mouse atau tombol zoom di bawah layar.</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips */}
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-4 items-start">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-900 text-sm mb-1">Tips Mengatur Tata Letak</h4>
                        <p className="text-indigo-700 text-sm leading-relaxed">
                            Aplikasi otomatis mengatur tata letak pohon keluarga. Anak-anak akan diurutkan dari kiri ke kanan berdasarkan tahun kelahiran (tertua di kiri).
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
