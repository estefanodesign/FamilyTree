import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Info } from 'lucide-react';

export const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show modal on mount
        setIsOpen(true);
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Selamat Datang"
        >
            <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Rumpun Keluarga Cimbu Kanan
                </h3>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800 leading-relaxed text-opacity-90">
                    <p className="mb-2">
                        Aplikasi ini masih dalam tahap pengembangan.
                    </p>
                    <p>
                        Anggota keluarga masih banyak yang belum terdata.
                        Silahkan menambahkan anggota keluarga untuk melengkapinya.
                    </p>
                    <p className="font-medium mt-2">
                        Terima kasih.
                    </p>
                </div>

                <div className="border-t pt-4">
                    <p className="text-xs text-gray-400 font-mono">
                        copyrights@RKCK App ver 0.5
                    </p>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Mulai
                </button>
            </div>
        </Modal>
    );
};
