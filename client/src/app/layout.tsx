import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Restaurant Management System",
    description: "Modern restaurant management application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`antialiased`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

