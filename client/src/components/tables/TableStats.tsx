import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TableStatsProps {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
}

export function TableStats({ total, available, occupied, reserved }: TableStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{available}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{occupied}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{reserved}</div>
                </CardContent>
            </Card>
        </div>
    );
}
