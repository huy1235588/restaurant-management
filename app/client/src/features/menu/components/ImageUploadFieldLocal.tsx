'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle } from 'lucide-react';

interface ImageUploadFieldLocalProps {
    value?: string | null;
    file?: File | null;
    onChange: (file: File | null, previewUrl: string | null) => void;
    folder?: string;
    label?: string;
    maxSize?: number; // in MB
    disabled?: boolean;
}

export function ImageUploadFieldLocal({
    value,
    file,
    onChange,
    folder = 'menu',
    label = 'Image',
    maxSize = 5,
    disabled = false,
}: ImageUploadFieldLocalProps) {
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

        // Create local preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const previewUrl = reader.result as string;
            onChange(file, previewUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
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

            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
                handleFileSelect(droppedFile);
            }
        },
        [disabled]
    );

    const handleRemove = () => {
        onChange(null, null);
        setError(null);
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            {value ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                        src={value}
                        alt="Selected image"
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
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={disabled}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                dragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-primary/50'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <div>
                                <p className="text-sm font-medium">
                                    Drop image here or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG or WebP (max {maxSize}MB)
                                </p>
                            </div>
                        </div>
                    </label>
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
