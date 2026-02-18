import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Person } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import * as api from '@/services/api';

interface PersonFormProps {
    person: Person | null;
    onSave: (person: Person) => void;
    onCancel: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({ person, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Person>(
        person || {
            id: Date.now().toString(),
            firstName: '',
            lastName: '',
            birthDate: '',
            deathDate: undefined,
            gender: 'other',
            photo: '',
            bio: '',
            occupation: '',
            location: '',
            spouseId: undefined,
            parentIds: [],
            childrenIds: [],
        }
    );

    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let photoUrl = formData.photo;

            if (selectedFile) {
                photoUrl = await api.uploadPhoto(selectedFile);
            }

            onSave({ ...formData, photo: photoUrl });
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Gagal mengupload foto. Silakan coba lagi.');
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Depan</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Belakang</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <select
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Foto Profil</label>
                    <ImageUpload
                        currentImage={formData.photo}
                        onImageSelected={file => setSelectedFile(file)}
                        onImageRemoved={() => {
                            setSelectedFile(null);
                            setFormData({ ...formData, photo: '' });
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                        type="date"
                        value={formData.birthDate}
                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Wafat</label>
                    <input
                        type="date"
                        value={formData.deathDate || ''}
                        onChange={e => setFormData({ ...formData, deathDate: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pekerjaan</label>
                <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Biografi</label>
                <textarea
                    value={formData.bio || ''}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isUploading ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
};
