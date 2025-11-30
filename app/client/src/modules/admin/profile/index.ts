// Views
export { ProfileView } from './views/ProfileView';

// Components
export { ProfileInfoCard } from './components/ProfileInfoCard';
export { EditProfileDialog } from './components/EditProfileDialog';
export { ChangePasswordDialog } from './components/ChangePasswordDialog';

// Hooks
export { useProfile, useUpdateProfile, useChangePassword } from './hooks/useProfile';

// Services
export { profileApi } from './services/profile.service';

// Types
export type {
    ProfileData,
    UpdateProfileData,
    ChangePasswordData,
    ChangePasswordFormData,
} from './types';

// Validation
export {
    updateProfileSchema,
    changePasswordSchema,
    type UpdateProfileFormValues,
    type ChangePasswordFormValues,
} from './utils/validation';
