import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
// These are customer-facing pages (landing, menu, reservation, about, contact)
const publicRoutes = [
    '/',              // Landing page
    '/menu',          // Public menu view
    '/reservation',   // Online reservation
    '/about',         // About restaurant
    '/contact',       // Contact page
    '/login',         // Staff login
    '/register',      // Staff registration (if enabled)
    '/health',        // Health check
];

// Admin routes require authentication (staff only)
const adminRoutes = ['/admin'];

// Define role-based route access for admin section
const roleRoutes: Record<string, string[]> = {
    admin: ['*'], // Admin has access to all routes
    manager: ['/admin/dashboard', '/admin/orders', '/admin/menu', '/admin/tables', '/admin/reservations', '/admin/bills', '/admin/staff', '/admin/reports', '/admin/kitchen', '/admin/categories'],
    waiter: ['/admin/dashboard', '/admin/orders', '/admin/menu', '/admin/tables', '/admin/reservations'],
    chef: ['/admin/kitchen', '/admin/orders', '/admin/menu'],
    cashier: ['/admin/dashboard', '/admin/orders', '/admin/bills'],
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes (customer-facing pages)
    if (publicRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route + '/')))) {
        return NextResponse.next();
    }

    // Check if accessing admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute) {
        // Check if user is authenticated via cookie
        const accessToken = request.cookies.get('accessToken');
        const refreshToken = request.cookies.get('refreshToken');

        // Allow if either access token or refresh token exists
        if (!accessToken && !refreshToken) {
            // Not authenticated, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // User has valid session (cookie exists) or accessing non-protected route
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        // Exclude image/public asset paths so image optimization and static assets
        // are not intercepted by the auth/proxy middleware. Requests from
        // Next.js image optimizer fetch the original image at e.g. /images/...;
        // if we intercept those without cookies the optimizer may receive a
        // redirect or HTML and fail with "received null". Adding 'images'
        // to the exclusions prevents this.
        '/((?!api|_next/static|_next/image|favicon.ico|public|images).*)',
    ],
};
