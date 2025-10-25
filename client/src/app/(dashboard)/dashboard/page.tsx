'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    Clock,
    ChefHat,
    Receipt,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { orderApi } from '@/services/order.service';
import { billApi } from '@/services/bill.service';
import { tableApi } from '@/services/table.service';
import { reservationApi } from '@/services/reservation.service';
import { Order, Bill, Table, Reservation } from '@/types';

interface DashboardStats {
    todayRevenue: number;
    todayOrders: number;
    activeOrders: number;
    availableTables: number;
    occupiedTables: number;
    todayReservations: number;
    pendingOrders: number;
    completedOrders: number;
    revenueChange: number;
    ordersChange: number;
}

interface RecentActivity {
    orders: Order[];
    bills: Bill[];
    reservations: Reservation[];
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch data in parallel
            const [orders, bills, tables, reservations] = await Promise.all([
                orderApi.getAll({ limit: 100 }),
                billApi.getAll({ limit: 100 }),
                tableApi.getAll(),
                reservationApi.getAll({ limit: 100 }),
            ]);

            // Calculate today's data
            const todayOrders = orders.data.filter(
                (order) => order.orderTime.startsWith(today)
            );
            const todayBills = bills.data.filter(
                (bill) => bill.billDate.startsWith(today)
            );
            const todayReservations = reservations.data.filter(
                (reservation) => reservation.reservationDate === today
            );

            // Calculate statistics
            const todayRevenue = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            const activeOrders = orders.data.filter(
                (order) => ['pending', 'confirmed', 'preparing'].includes(order.status)
            ).length;
            const availableTables = tables.data.filter((table) => table.status === 'available').length;
            const occupiedTables = tables.data.filter((table) => table.status === 'occupied').length;

            // Calculate changes (mock data - you can implement real comparison)
            const revenueChange = 15.3; // Mock percentage change
            const ordersChange = 8.5; // Mock percentage change

            setStats({
                todayRevenue,
                todayOrders: todayOrders.length,
                activeOrders,
                availableTables,
                occupiedTables,
                todayReservations: todayReservations.length,
                pendingOrders: orders.data.filter((o) => o.status === 'pending').length,
                completedOrders: orders.data.filter((o) => o.status === 'served').length,
                revenueChange,
                ordersChange,
            });

            setRecentActivity({
                orders: orders.data.slice(0, 5),
                bills: bills.data.slice(0, 5),
                reservations: reservations.data.slice(0, 5),
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            confirmed: 'default',
            preparing: 'secondary',
            ready: 'default',
            served: 'default',
            cancelled: 'destructive',
            paid: 'default',
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('dashboard.title') || 'Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                    {t('dashboard.subtitle') || 'Welcome back! Here\'s what\'s happening today.'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.stats.revenue') || 'Today\'s Revenue'}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats?.todayRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {stats && stats.revenueChange > 0 ? (
                                <>
                                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-500">+{stats.revenueChange}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-500">{stats?.revenueChange}%</span>
                                </>
                            )}
                            <span className="ml-1">from yesterday</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Orders Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.stats.orders') || 'Today\'s Orders'}
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {stats && stats.ordersChange > 0 ? (
                                <>
                                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-500">+{stats.ordersChange}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-500">{stats?.ordersChange}%</span>
                                </>
                            )}
                            <span className="ml-1">from yesterday</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Active Orders Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.stats.activeOrders') || 'Active Orders'}
                        </CardTitle>
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeOrders || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.pendingOrders || 0} pending • {stats?.completedOrders || 0} completed
                        </p>
                    </CardContent>
                </Card>

                {/* Tables Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.stats.tables') || 'Tables Status'}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.occupiedTables || 0}/{(stats?.occupiedTables || 0) + (stats?.availableTables || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.availableTables || 0} available tables
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Recent Activity */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                    <TabsTrigger value="bills">Recent Bills</TabsTrigger>
                    <TabsTrigger value="reservations">Reservations</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Statistics</CardTitle>
                                <CardDescription>Today's performance summary</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Receipt className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Total Orders</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats?.todayOrders || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Active Orders</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats?.activeOrders || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Reservations</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats?.todayReservations || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Revenue</span>
                                    </div>
                                    <span className="text-sm font-bold">
                                        {formatCurrency(stats?.todayRevenue || 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table Occupancy */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Table Occupancy</CardTitle>
                                <CardDescription>Current table status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Occupied</span>
                                        <span className="font-bold">{stats?.occupiedTables || 0}</span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{
                                                width: `${((stats?.occupiedTables || 0) / ((stats?.occupiedTables || 0) + (stats?.availableTables || 1))) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Available</span>
                                        <span className="font-bold">{stats?.availableTables || 0}</span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{
                                                width: `${((stats?.availableTables || 0) / ((stats?.occupiedTables || 0) + (stats?.availableTables || 1))) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Recent Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Latest orders from customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity?.orders.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Order #{order.orderId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.table?.tableName || order.orderType} • {formatTime(order.orderTime)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm font-bold">
                                                {formatCurrency(order.finalAmount)}
                                            </span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                                {(!recentActivity?.orders || recentActivity.orders.length === 0) && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No recent orders
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recent Bills Tab */}
                <TabsContent value="bills" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bills</CardTitle>
                            <CardDescription>Latest payment transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity?.bills.map((bill) => (
                                    <div
                                        key={bill.billId}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {bill.billNumber}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(bill.billDate).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm font-bold">
                                                {formatCurrency(bill.totalAmount)}
                                            </span>
                                            {getStatusBadge(bill.paymentStatus)}
                                        </div>
                                    </div>
                                ))}
                                {(!recentActivity?.bills || recentActivity.bills.length === 0) && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No recent bills
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reservations Tab */}
                <TabsContent value="reservations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Reservations</CardTitle>
                            <CardDescription>Upcoming reservations for today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity?.reservations.map((reservation) => (
                                    <div
                                        key={reservation.reservationId}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {reservation.customerName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {reservation.customerPhone} • Party of {reservation.partySize}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(reservation.reservationDate).toLocaleDateString('vi-VN')} at {reservation.reservationTime}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {getStatusBadge(reservation.status)}
                                        </div>
                                    </div>
                                ))}
                                {(!recentActivity?.reservations || recentActivity.reservations.length === 0) && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No reservations for today
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
