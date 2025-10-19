'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Bell, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const { setLanguage } = useSettingsStore();

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

    const handleSaveProfile = () => {
        // TODO: Call API to update profile
        console.log('Save profile:', { fullName, email, phoneNumber });
    };

    const handleChangeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setLanguage(lng as 'en' | 'vi');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('settings.title') || 'Settings'}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('settings.subtitle') || 'Manage your account settings and preferences'}
                </p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t('settings.profile') || 'Profile Information'}
                    </CardTitle>
                    <CardDescription>
                        Update your personal information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={user?.username || ''}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Username cannot be changed
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                            value={user?.role || ''}
                            disabled
                            className="bg-muted capitalize"
                        />
                    </div>

                    <Button onClick={handleSaveProfile}>
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {t('settings.security') || 'Security'}
                    </CardTitle>
                    <CardDescription>
                        Change your password
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <Button variant="outline">
                        Change Password
                    </Button>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t('settings.appearance') || 'Appearance & Language'}
                    </CardTitle>
                    <CardDescription>
                        Customize how the app looks and feels
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <span className="text-sm text-muted-foreground">
                                Toggle between light and dark mode
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Language</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={i18n.language === 'en' ? 'default' : 'outline'}
                                onClick={() => handleChangeLanguage('en')}
                            >
                                🇬🇧 English
                            </Button>
                            <Button
                                variant={i18n.language === 'vi' ? 'default' : 'outline'}
                                onClick={() => handleChangeLanguage('vi')}
                            >
                                🇻🇳 Tiếng Việt
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t('settings.notifications') || 'Notifications'}
                    </CardTitle>
                    <CardDescription>
                        Manage notification preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">New Orders</p>
                            <p className="text-sm text-muted-foreground">
                                Get notified when new orders arrive
                            </p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Order Status Updates</p>
                            <p className="text-sm text-muted-foreground">
                                Get notified when order status changes
                            </p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Table Requests</p>
                            <p className="text-sm text-muted-foreground">
                                Get notified when customers request service
                            </p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
