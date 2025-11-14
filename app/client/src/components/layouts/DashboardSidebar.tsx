'use client';

import { useTranslation } from 'react-i18next';
import { LucideIcon, ChevronDown, Sparkles, X } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarTrigger
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    permission?: string;
    roles?: string[];
    badge?: string | number;
    items?: NavItem[];
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

interface DashboardSidebarProps {
    navItems?: NavItem[];
    navGroups?: NavGroup[];
    appName?: string;
}

export function DashboardSidebar({ navItems = [], navGroups, appName }: DashboardSidebarProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Auto-expand groups containing active items
    useEffect(() => {
        const newOpenGroups: Record<string, boolean> = {};

        const checkItemActive = (item: NavItem): boolean => {
            if (pathname === item.href || pathname.startsWith(item.href + '/')) {
                return true;
            }
            if (item.items) {
                return item.items.some(subItem =>
                    pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                );
            }
            return false;
        };

        navGroups?.forEach(group => {
            group.items.forEach(item => {
                if (item.items && checkItemActive(item)) {
                    newOpenGroups[item.title] = true;
                }
            });
        });

        setOpenGroups(prev => ({ ...prev, ...newOpenGroups }));
    }, [pathname, navGroups]);

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const renderNavItem = (item: NavItem, isSubItem = false) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        const hasSubItems = item.items && item.items.length > 0;
        const isOpen = openGroups[item.title] ?? false;

        if (hasSubItems) {
            // Check if any sub-item is active
            const hasActiveSubItem = item.items?.some(
                subItem => pathname === subItem.href || pathname.startsWith(subItem.href + '/')
            );

            return (
                <Collapsible
                    key={item.href}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(item.title)}
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                isActive={isActive || hasActiveSubItem}
                                tooltip={item.title}
                                className={cn(
                                    'w-full justify-between group/item',
                                    'hover:bg-sidebar-accent transition-all duration-200',
                                    (isActive || hasActiveSubItem) &&
                                    'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn(
                                        "h-4 w-4 shrink-0 transition-transform duration-200",
                                        (isActive || hasActiveSubItem) && "scale-110"
                                    )} />
                                    <span className="truncate">{item.title}</span>
                                    {item.badge && (
                                        <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium shadow-sm">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out',
                                        isOpen && 'rotate-180'
                                    )}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                            <SidebarMenuSub className="ml-0 pl-0 border-l-2 border-sidebar-border/50">
                                {item.items?.map((subItem) => {
                                    const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                                    const SubIcon = subItem.icon;

                                    return (
                                        <SidebarMenuSubItem key={subItem.href}>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={isSubActive}
                                                className={cn(
                                                    'ml-3 transition-all duration-200',
                                                    'hover:bg-sidebar-accent/80 hover:translate-x-1',
                                                    isSubActive &&
                                                    'bg-sidebar-accent/70 text-sidebar-accent-foreground font-semibold shadow-sm translate-x-1'
                                                )}
                                            >
                                                <Link href={subItem.href} className="flex items-center gap-3 w-full">
                                                    <SubIcon className={cn(
                                                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                                                        isSubActive && "scale-110"
                                                    )} />
                                                    <span className="truncate flex-1">{subItem.title}</span>
                                                    {subItem.badge && (
                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium shadow-sm">
                                                            {subItem.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

        const Component = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
        const Wrapper = isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

        return (
            <Wrapper key={item.href}>
                <Component
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                        'transition-all duration-200 group/item',
                        'hover:bg-sidebar-accent hover:translate-x-0.5',
                        isActive &&
                        'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm translate-x-0.5'
                    )}
                >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                        <Icon className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isActive && "scale-110"
                        )} />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium shadow-sm">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                </Component>
            </Wrapper>
        );
    };

    return (
        <Sidebar collapsible="offcanvas" className="border-r">
            {/* Header with Logo - Pixel-perfect alignment with TopBar logo */}
            <SidebarHeader className="h-16 flex flex-row items-center justify-between border-b border-sidebar-border bg-linear-to-b from-sidebar to-sidebar/95 px-4">
                <SidebarTrigger className="-ml-1 hover:bg-accent transition-colors duration-200" />

                {/* Logo positioned to align with TopBar: toggle(28px) + gap(12px) + margin(4px) = 44px from left */}
                <div className="flex items-center gap-2">
                    <Image
                        src="/images/logo/logo.png"
                        alt="Restaurant Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <span className="font-bold text-lg">
                        {appName || t('common.appName') || 'Restaurant'}
                    </span>
                </div>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="py-2">
                {/* Render grouped navigation if provided */}
                {navGroups && navGroups.length > 0 ? (
                    navGroups.map((group, index) => (
                        <SidebarGroup key={group.title} className={cn('px-2 py-0', index > 0 && 'mt-1')}>
                            <SidebarGroupLabel className="px-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60 mb-1">
                                {group.title}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-0.5">
                                    {group.items.map((item) => renderNavItem(item))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                ) : (
                    /* Render flat navigation */
                    <SidebarGroup className="px-2">
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-0.5">
                                {navItems.map((item) => renderNavItem(item))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-sidebar-border bg-linear-to-t from-sidebar to-sidebar/95 mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="sm"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
                            tooltip={{
                                children: (
                                    <div className="text-xs p-1">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <Sparkles className="h-3 w-3" />
                                            Restaurant Management
                                        </p>
                                        <p className="mt-1 text-muted-foreground">Version 1.0.0</p>
                                        <p className="mt-0.5 text-muted-foreground">© 2024 All rights reserved</p>
                                    </div>
                                ),
                            }}
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-muted to-muted/80 text-muted-foreground shadow-sm">
                                <span className="text-xs font-bold">RM</span>
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="text-xs font-semibold text-sidebar-foreground/80">
                                    Restaurant System
                                </span>
                                <span className="text-xs text-muted-foreground/80">
                                    v1.0.0 • © 2024
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
