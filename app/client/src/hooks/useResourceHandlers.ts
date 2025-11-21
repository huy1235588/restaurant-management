import { useCallback } from "react";
import { toast } from "sonner";
import { uploadApi, UploadFolder } from "@/services/upload.service";

export interface UseResourceHandlersProps {
    uploadFolder: UploadFolder;
    onCreate?: (data: any) => Promise<void>;
    onUpdate?: (id: number, data: any) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
    successMessages?: {
        create?: string;
        update?: string;
        delete?: string;
    };
}

export function useResourceHandlers({
    uploadFolder,
    onCreate,
    onUpdate,
    onDelete,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    successMessages = {},
}: UseResourceHandlersProps) {
    const createMsg = successMessages.create ?? "Created successfully";
    const updateMsg = successMessages.update ?? "Updated successfully";
    const deleteMsg = successMessages.delete ?? "Deleted successfully";

    const handleCreate = useCallback(
        async (data: any, imageFile?: File | null) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(
                        imageFile,
                        uploadFolder
                    );
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;
                }

                await onCreate?.({
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success(createMsg);
                onCreateSuccess?.();
            } catch (error: any) {
                toast.error(error?.message || "Failed to create");
                throw error;
            }
        },
        [uploadFolder, onCreate, onCreateSuccess, createMsg]
    );

    const handleUpdate = useCallback(
        async (
            id: number,
            currentResource: any,
            data: any,
            imageFile?: File | null
        ) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(
                        imageFile,
                        uploadFolder
                    );
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;

                    if (currentResource?.imagePath) {
                        try {
                            await uploadApi.deleteFile(
                                currentResource.imagePath
                            );
                        } catch (deleteError) {
                            console.warn(
                                "Failed to delete old image:",
                                deleteError
                            );
                        }
                    }
                }

                await onUpdate?.(id, {
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success(updateMsg);
                onUpdateSuccess?.();
            } catch (error: any) {
                toast.error(error?.message || "Failed to update");
                throw error;
            }
        },
        [uploadFolder, onUpdate, onUpdateSuccess, updateMsg]
    );

    const handleDelete = useCallback(
        async (id: number, resource: any) => {
            try {
                if (resource?.imagePath) {
                    try {
                        await uploadApi.deleteFile(resource.imagePath);
                    } catch (deleteError) {
                        console.warn("Failed to delete image:", deleteError);
                    }
                }

                await onDelete?.(id);
                toast.success(deleteMsg);
                onDeleteSuccess?.();
            } catch (error: any) {
                toast.error(error?.message || "Failed to delete");
                throw error;
            }
        },
        [onDelete, onDeleteSuccess, deleteMsg]
    );

    return {
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
