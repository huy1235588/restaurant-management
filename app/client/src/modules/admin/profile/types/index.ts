// Profile data returned from API
export interface ProfileData {
    accountId: number;
    staffId: number;
    username: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    address?: string | null;
    dateOfBirth?: string | null;
    hireDate?: string | null;
    role: string;
    isActive: boolean;
    lastLogin?: string | null;
}

// Update profile request data
export interface UpdateProfileData {
    email?: string;
    phoneNumber?: string;
    fullName?: string;
    address?: string;
}

// Change password request data
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

// Change password form data (includes confirmPassword for frontend validation)
export interface ChangePasswordFormData extends ChangePasswordData {
    confirmPassword: string;
}
