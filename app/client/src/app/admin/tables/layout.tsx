import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Table Management | Restaurant Management',
    description: 'Manage restaurant tables, view floor plans, and monitor table status in real-time.',
    keywords: ['tables', 'floor plan', 'restaurant management', 'seating'],
};

export default function TablesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
