import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ActivityLog } from '@/types/family';
import { fetchLogs } from '@/services/api';
import { Loader2, History, UserPlus, UserMinus, UserCog, FileText } from 'lucide-react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const data = await fetchLogs();
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'DELETE': return <UserMinus className="w-5 h-5 text-red-500" />;
            case 'UPDATE': return <UserCog className="w-5 h-5 text-blue-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'CREATE': return 'Menambahkan';
            case 'DELETE': return 'Menghapus';
            case 'UPDATE': return 'Mengubah';
            default: return action;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Riwayat Perubahan"
            className="max-w-xl"
        >
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada riwayat perubahan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <div className="mt-1">
                                    {getIcon(log.action)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-gray-900">
                                            {getActionLabel(log.action)} <span className="font-bold">{log.personName}</span>
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(log.createdAt).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                        {log.details}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
