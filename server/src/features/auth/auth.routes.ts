import { Router } from 'express';
import authController from '@/features/auth/auth.controller';
import { validate } from '@/shared/middlewares/validation';
import { loginSchema, registerSchema } from '@/features/auth/validators';
import { authenticate, authorize } from '@/shared/middlewares/auth';

const router: Router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive access token and refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: Username or email
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password
 *                 example: "password123"
 *           examples:
 *             admin:
 *               summary: Admin login
 *               value:
 *                 username: "admin"
 *                 password: "admin123"
 *             staff:
 *               summary: Staff login
 *               value:
 *                 username: "waiter01"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                     user:
 *                       type: object
 *                       properties:
 *                         accountId:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         staff:
 *                           type: object
 *                           properties:
 *                             staffId:
 *                               type: integer
 *                             fullName:
 *                               type: string
 *                             role:
 *                               type: string
 *                               enum: [admin, manager, waiter, chef, bartender, cashier]
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login.bind(authController));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     description: Get information about the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User info retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: integer
 *                       example: 1
 *                     staffId:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: admin
 *                     email:
 *                       type: string
 *                       example: admin@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "0123456789"
 *                     fullName:
 *                       type: string
 *                       example: Admin User
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, waiter, chef, bartender, cashier]
 *                       example: admin
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-14T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token received during login
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: New refresh token (optional)
 *       400:
 *         description: Bad request - Refresh token is required
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new account (Admin only)
 *     description: Create a new user account without staff information (Admin access required)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Unique username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Phone number (10-11 digits)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Account password
 *           example:
 *             username: "newuser"
 *             email: "user@example.com"
 *             phoneNumber: "0123456789"
 *             password: "securePassword123"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input or username/email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
    '/register',
    authenticate,
    authorize('admin'),
    validate(registerSchema),
    authController.register.bind(authController)
);

/**
 * @swagger
 * /auth/staff:
 *   post:
 *     summary: Create new staff member (Admin/Manager only)
 *     description: Create a new staff account with complete information and role assignment
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Unique username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Phone number (10-11 digits)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Account password
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 description: Full name of the staff
 *               address:
 *                 type: string
 *                 description: Staff address (optional)
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *                 description: Date of birth (optional)
 *               hireDate:
 *                 type: string
 *                 format: date-time
 *                 description: Hire date (optional, defaults to today)
 *               salary:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly salary (optional)
 *               role:
 *                 type: string
 *                 enum: [admin, manager, waiter, chef, bartender, cashier]
 *                 description: Staff role
 *           examples:
 *             waiter:
 *               summary: Create waiter
 *               value:
 *                 username: "waiter01"
 *                 email: "waiter01@restaurant.com"
 *                 phoneNumber: "0123456789"
 *                 password: "password123"
 *                 fullName: "Nguyen Van A"
 *                 address: "123 Main St, Hanoi"
 *                 salary: 8000000
 *                 role: "waiter"
 *             chef:
 *               summary: Create chef
 *               value:
 *                 username: "chef01"
 *                 email: "chef01@restaurant.com"
 *                 phoneNumber: "0987654321"
 *                 password: "password123"
 *                 fullName: "Tran Thi B"
 *                 salary: 15000000
 *                 role: "chef"
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Staff created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: integer
 *                     staffId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input or username/email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager access required
 */
router.post(
    '/staff',
    authenticate,
    authorize('admin', 'manager'),
    validate(registerSchema),
    authController.createStaff.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the currently authenticated user and invalidate tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Revoke all refresh tokens for the current user across all devices
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out from all devices
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

export default router;
