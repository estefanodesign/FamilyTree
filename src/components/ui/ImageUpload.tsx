import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageCropper } from '@/components/ui/ImageCropper';

interface ImageUploadProps {
    currentImage?: string;
    onImageSelected: (file: File) => void;
    onImageRemoved?: () => void;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImage,
    onImageSelected,
    onImageRemoved,
    className
}) => {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [cropperSrc, setCropperSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            startCropping(file);
        }
    };

    const startCropping = (file: File) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropperSrc(reader.result?.toString() || null);
        });
        reader.readAsDataURL(file);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropComplete = async (croppedFile: File) => {
        setCropperSrc(null); // Close cropper
        await processFile(croppedFile);
    };

    const handleCropCancel = () => {
        setCropperSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processFile = (file: File) => {
        // Create local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Pass file to parent
        onImageSelected(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            startCropping(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onImageRemoved?.();
    };

    return (
        <div className={className}>
            <div
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all overflow-hidden
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${preview ? 'h-48' : 'h-32'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Ganti Foto
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-700">
                                Klik atau drag foto ke sini
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF (Max. 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {cropperSrc && (
                <ImageCropper
                    imageSrc={cropperSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
};
