'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface ImageUploadFieldProps {
    value?: string | null;
    onChange?: (url: string | null) => void;
    onFileSelect?: (file: File | null) => void;
    folder?: string;
    label?: string;
    maxSize?: number; // in MB
    disabled?: boolean;
}

export function ImageUploadField({
    value,
    onChange,
    onFileSelect,
    folder = 'menu',
    label = 'Image',
    maxSize = 5,
    disabled = false,
}: ImageUploadFieldProps) {
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const validateFile = (file: File): string | null => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return 'Invalid file type. Only JPG, PNG, and WebP images are allowed.';
        }

        // Check file size
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxSize}MB limit.`;
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        onFileSelect?.(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
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

            if (disabled) return;

            const file = e.dataTransfer.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [disabled]
    );

    const handleRemove = () => {
        onChange?.(null);
        onFileSelect?.(null);
        setError(null);
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            {value ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                        src={getImageUrl(value) || ''}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                        if (!disabled) {
                            document.getElementById('image-upload')?.click();
                        }
                    }}
                >
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={disabled}
                        className="hidden"
                    />

                    <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Drop image here or click to upload
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG or WebP (max {maxSize}MB)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
