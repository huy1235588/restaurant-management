'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Upload, X, Crop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ImageUploadCropperProps {
    onImageSelect: (imageFile: File, preview: string) => void;
    currentImage?: string;
    label?: string;
}

interface CroppedAreaPixels {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function ImageUploadCropper({ onImageSelect, currentImage, label = 'Upload Image' }: ImageUploadCropperProps) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalImage(e.target?.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
    });

    const handleCropConfirm = async () => {
        if (!originalImage || !croppedAreaPixels) return;

        try {
            const canvas = document.createElement('canvas');
            const image = new Image();
            image.src = originalImage;

            image.onload = () => {
                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(
                        image,
                        croppedAreaPixels.x,
                        croppedAreaPixels.y,
                        croppedAreaPixels.width,
                        croppedAreaPixels.height,
                        0,
                        0,
                        croppedAreaPixels.width,
                        croppedAreaPixels.height
                    );

                    // Convert canvas to blob and then to file
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const croppedImageFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                            const previewUrl = canvas.toDataURL('image/jpeg');
                            setPreview(previewUrl);
                            onImageSelect(croppedImageFile, previewUrl);
                            setShowCropper(false);
                        }
                    }, 'image/jpeg', 0.95);
                }
            };
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setOriginalImage(null);
    };

    return (
        <div className="space-y-4">
            {/* Preview Image */}
            {preview && (
                <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    <img src={preview} alt="Preview" className="w-full h-auto object-cover" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload Area */}
            {!preview && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragActive
                            ? 'border-blue-500'
                            : 'border-gray-300 hover:border-gray-400 '
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="font-medium">
                        {isDragActive ? t('imageUpload.dropHere') : t('imageUpload.dragAndDrop')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{t('imageUpload.supportedFormats')}</p>
                </div>
            )}

            {/* Crop Dialog */}
            <Dialog open={showCropper} onOpenChange={setShowCropper}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('imageUpload.cropImage')}</DialogTitle>
                        <DialogDescription>
                            {t('imageUpload.cropDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                        {originalImage && (
                            <Cropper
                                image={originalImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    {/* Zoom Slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('imageUpload.zoom')}</label>
                        <Slider
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0])}
                            min={1}
                            max={3}
                            step={0.1}
                            className="w-full"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCropper(false);
                                setOriginalImage(null);
                            }}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="button" onClick={handleCropConfirm} className="gap-2">
                            <Crop size={16} />
                            {t('imageUpload.cropAndSave')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
