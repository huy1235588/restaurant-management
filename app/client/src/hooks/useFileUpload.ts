"use client";

import { useState, useCallback } from "react";
import {
    uploadApi,
    UploadedFileInfo,
    UploadFolder,
} from "@/services/upload.service";

interface UseFileUploadOptions {
    onSuccess?: (file: UploadedFileInfo) => void;
    onError?: (error: Error) => void;
}

/**
 * Hook for managing file uploads
 * Handles loading state, error handling, and success callbacks
 */
export function useFileUpload(options?: UseFileUploadOptions) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(
        null
    );

    const upload = useCallback(
        async (
            file: File,
            folder: UploadFolder = "temp"
        ): Promise<UploadedFileInfo | null> => {
            setUploading(true);
            setError(null);

            try {
                const result = await uploadApi.uploadSingle(file, folder);
                setUploadedFile(result);
                options?.onSuccess?.(result);
                return result;
            } catch (err) {
                const error =
                    err instanceof Error ? err : new Error("Upload failed");
                setError(error);
                options?.onError?.(error);
                return null;
            } finally {
                setUploading(false);
            }
        },
        [options]
    );

    const reset = useCallback(() => {
        setUploading(false);
        setError(null);
        setUploadedFile(null);
    }, []);

    return {
        upload,
        uploading,
        error,
        uploadedFile,
        reset,
    };
}

/**
 * Hook for managing multiple file uploads
 */
export function useMultipleFileUpload(options?: UseFileUploadOptions) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);

    const upload = useCallback(
        async (
            files: File[],
            folder: UploadFolder = "temp"
        ): Promise<UploadedFileInfo[] | null> => {
            setUploading(true);
            setError(null);

            try {
                const results = await uploadApi.uploadMultiple(files, folder);
                setUploadedFiles(results);
                results.forEach((file) => options?.onSuccess?.(file));
                return results;
            } catch (err) {
                const error =
                    err instanceof Error ? err : new Error("Upload failed");
                setError(error);
                options?.onError?.(error);
                return null;
            } finally {
                setUploading(false);
            }
        },
        [options]
    );

    const deleteFile = useCallback(async (filePath: string) => {
        try {
            await uploadApi.deleteFile(filePath);
            setUploadedFiles((prev) => prev.filter((f) => f.path !== filePath));
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error("Delete failed");
            setError(error);
            throw error;
        }
    }, []);

    const reset = useCallback(() => {
        setUploading(false);
        setError(null);
        setUploadedFiles([]);
    }, []);

    return {
        upload,
        deleteFile,
        uploading,
        error,
        uploadedFiles,
        reset,
    };
}
