import { Router } from 'express';
import { staffController } from '@/features/staff/staff.controller';
import { authenticate } from '@/shared/middlewares/auth';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Get all staff
 *     description: Retrieve a list of all staff members
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
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
 *                   example: Staff retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, manager, waiter, chef, cashier]
 *                       isActive:
 *                         type: boolean
 *                       hireDate:
 *                         type: string
 *                         format: date
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET /api/staff - Get all staff
router.get('/', staffController.getAll.bind(staffController));

/**
 * @swagger
 * /staff/role/{role}:
 *   get:
 *     summary: Get staff by role
 *     description: Retrieve staff members by their role
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, manager, waiter, chef, cashier]
 *         description: Staff role
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
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
 *                   example: Staff retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, manager, waiter, chef, cashier]
 *                       isActive:
 *                         type: boolean
 *                       hireDate:
 *                         type: string
 *                         format: date
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No staff found with this role
 *       500:
 *         description: Internal server error
 */
// GET /api/staff/role/:role - Get staff by role
router.get('/role/:role', staffController.getByRole.bind(staffController));

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get staff by ID
 *     description: Retrieve a specific staff member by their ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
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
 *                   example: Staff retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, waiter, chef, cashier]
 *                     isActive:
 *                       type: boolean
 *                     hireDate:
 *                       type: string
 *                       format: date
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
// GET /api/staff/:id - Get staff by ID
router.get('/:id', staffController.getById.bind(staffController));

/**
 * @swagger
 * /staff/{id}/performance:
 *   get:
 *     summary: Get staff performance
 *     description: Retrieve performance metrics for a specific staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff performance retrieved successfully
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
 *                   example: Staff performance retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     staffId:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     performanceRating:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 5
 *                     period:
 *                       type: string
 *                       description: Time period for the metrics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
// GET /api/staff/:id/performance - Get staff performance
router.get('/:id/performance', staffController.getPerformance.bind(staffController));

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member
 *     description: Create a new staff member account
 *     tags: [Staff]
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
 *               - password
 *               - fullName
 *               - email
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Unique username
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password
 *               fullName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Phone number
 *               role:
 *                 type: string
 *                 enum: [admin, manager, waiter, chef, cashier]
 *                 description: Staff role
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: Hire date
 *           example:
 *             username: "john_doe"
 *             password: "password123"
 *             fullName: "John Doe"
 *             email: "john.doe@example.com"
 *             phone: "0123456789"
 *             role: "waiter"
 *             hireDate: "2025-01-15"
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
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, waiter, chef, cashier]
 *                     isActive:
 *                       type: boolean
 *                     hireDate:
 *                       type: string
 *                       format: date
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input or duplicate username/email
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// POST /api/staff - Create new staff
router.post('/', staffController.create.bind(staffController));

/**
 * @swagger
 * /staff/{id}:
 *   put:
 *     summary: Update a staff member
 *     description: Update an existing staff member's information
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Phone number
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: Hire date
 *           example:
 *             fullName: "John Smith"
 *             email: "john.smith@example.com"
 *             phone: "0987654321"
 *             hireDate: "2025-01-15"
 *     responses:
 *       200:
 *         description: Staff updated successfully
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
 *                   example: Staff updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, waiter, chef, cashier]
 *                     isActive:
 *                       type: boolean
 *                     hireDate:
 *                       type: string
 *                       format: date
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
// PUT /api/staff/:id - Update staff
router.put('/:id', staffController.update.bind(staffController));

/**
 * @swagger
 * /staff/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a staff member
 *     description: Deactivate a staff member's account
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deactivated successfully
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
 *                   example: Staff deactivated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       409:
 *         description: Cannot deactivate admin staff
 *       500:
 *         description: Internal server error
 */
// PATCH /api/staff/:id/deactivate - Deactivate staff
router.patch('/:id/deactivate', staffController.deactivate.bind(staffController));

/**
 * @swagger
 * /staff/{id}/activate:
 *   patch:
 *     summary: Activate a staff member
 *     description: Activate a deactivated staff member's account
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff activated successfully
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
 *                   example: Staff activated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/staff/:id/activate - Activate staff
router.patch('/:id/activate', staffController.activate.bind(staffController));

/**
 * @swagger
 * /staff/{id}/role:
 *   patch:
 *     summary: Update staff role
 *     description: Update the role of a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, waiter, chef, cashier]
 *                 description: New staff role
 *           example:
 *             role: "manager"
 *     responses:
 *       200:
 *         description: Staff role updated successfully
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
 *                   example: Staff role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, waiter, chef, cashier]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid role
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       409:
 *         description: Cannot change admin role or insufficient permissions
 *       500:
 *         description: Internal server error
 */
// PATCH /api/staff/:id/role - Update staff role
router.patch('/:id/role', staffController.updateRole.bind(staffController));

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     description: Permanently delete a staff member's account
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
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
 *                   example: Staff deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff not found
 *       409:
 *         description: Cannot delete admin staff or staff with active orders
 *       500:
 *         description: Internal server error
 */
// DELETE /api/staff/:id - Delete staff
router.delete('/:id', staffController.delete.bind(staffController));

export default router;
