'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Upload, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadApi } from '@/services/upload.service';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SettingsImageUploadProps {
    value?: string | null;
    onChange: (path: string | null) => void;
    label: string;
    description?: string;
    aspectRatio?: 'square' | 'video' | 'wide';
    maxSize?: number; // in MB
    disabled?: boolean;
}

export function SettingsImageUpload({
    value,
    onChange,
    label,
    description,
    aspectRatio = 'video',
    maxSize = 5,
    disabled = false,
}: SettingsImageUploadProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Build full URL for display from relative path stored in DB
    const imageUrl = getImageUrl(value);

    const aspectClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        wide: 'aspect-[21/9]',
    };

    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return t('settings.form.invalidImageType', { 
                defaultValue: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' 
            });
        }

        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return t('settings.form.imageTooLarge', { 
                defaultValue: `File size exceeds ${maxSize}MB limit.`,
                maxSize 
            });
        }

        return null;
    };

    const handleUpload = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Store old value to delete if upload succeeds
            const oldImagePath = value;

            const result = await uploadApi.uploadSingle(file, 'settings');
            
            // Update form with new image path FIRST
            onChange(result.path);
            
            // Delete old image in background (don't block on this)
            if (oldImagePath) {
                uploadApi.deleteFile(oldImagePath).catch((err) => {
                    console.warn('Failed to delete old image:', err);
                    // Don't show error to user - file might already be deleted or be external
                });
            }
        } catch (err) {
            setError(
                err instanceof Error 
                    ? err.message 
                    : t('settings.form.uploadFailed', { defaultValue: 'Failed to upload image' })
            );
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
        // Reset input value to allow re-uploading the same file
        e.target.value = '';
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (disabled || uploading) return;

            const file = e.dataTransfer.files?.[0];
            if (file) {
                handleUpload(file);
            }
        },
        [disabled, uploading]
    );

    const handleRemove = async () => {
        if (value) {
            try {
                // Delete file using relative path
                await uploadApi.deleteFile(value);
            } catch {
                // Ignore delete errors - file might already be deleted or be an external URL
            }
        }
        onChange(null);
        setError(null);
    };

    const inputId = `image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="space-y-3">
            <div>
                <Label className="text-sm font-medium">{label}</Label>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </div>

            {imageUrl ? (
                <div className={cn(
                    "relative w-full max-w-md overflow-hidden rounded-lg border bg-muted",
                    aspectClasses[aspectRatio]
                )}>
                    <Image
                        src={imageUrl}
                        alt={label}
                        fill
                        className={cn(
                            aspectRatio === 'square' ? 'object-contain' : 'object-cover'
                        )}
                        sizes="(max-width: 768px) 100vw, 400px"
                        onError={(e) => {
                            // Show fallback for broken images
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={() => document.getElementById(inputId)?.click()}
                                disabled={disabled || uploading}
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleRemove}
                                disabled={disabled || uploading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={disabled || uploading}
                        className="hidden"
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors max-w-md",
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                        (disabled || uploading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                        if (!disabled && !uploading) {
                            document.getElementById(inputId)?.click();
                        }
                    }}
                >
                    <input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={disabled || uploading}
                        className="hidden"
                    />

                    <div className="space-y-3">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                                <p className="text-sm font-medium">
                                    {t('settings.form.uploading', { defaultValue: 'Uploading...' })}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {t('settings.form.dropOrClick', { 
                                            defaultValue: 'Drop image here or click to upload' 
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('settings.form.imageFormats', { 
                                            defaultValue: `JPG, PNG or WebP (max ${maxSize}MB)`,
                                            maxSize 
                                        })}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
