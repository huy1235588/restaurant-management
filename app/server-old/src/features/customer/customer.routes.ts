import { Router } from 'express';
import { authenticate, authorize } from '@/shared/middlewares/auth';
import { validate } from '@/shared/middlewares/validation';
import { customerController } from '@/features/customer/customer.controller';
import {
    createCustomerSchema,
    updateCustomerSchema,
    mergeCustomerSchema,
    autocompleteCustomerSchema,
    listCustomersQuerySchema,
    customerIdParamSchema,
    customerHistoryQuerySchema,
} from '@/features/customer/validators';

const router: Router = Router();

router.use(authenticate);

router.get(
    '/',
    authorize('admin', 'manager', 'waiter'),
    validate(listCustomersQuerySchema, 'query'),
    customerController.list.bind(customerController)
);
router.get(
    '/autocomplete',
    authorize('admin', 'manager', 'waiter'),
    validate(autocompleteCustomerSchema, 'query'),
    customerController.autocomplete.bind(customerController)
);
router.get(
    '/:id/history',
    authorize('admin', 'manager', 'waiter'),
    validate(customerIdParamSchema, 'params'),
    validate(customerHistoryQuerySchema, 'query'),
    customerController.history.bind(customerController)
);
router.get(
    '/:id',
    authorize('admin', 'manager', 'waiter'),
    validate(customerIdParamSchema, 'params'),
    customerController.getById.bind(customerController)
);
router.post('/', authorize('manager', 'admin', 'waiter'), validate(createCustomerSchema), customerController.create.bind(customerController));
router.patch(
    '/:id',
    authorize('manager', 'admin'),
    validate(customerIdParamSchema, 'params'),
    validate(updateCustomerSchema),
    customerController.update.bind(customerController)
);
router.post(
    '/:id/merge',
    authorize('manager', 'admin'),
    validate(customerIdParamSchema, 'params'),
    validate(mergeCustomerSchema),
    customerController.merge.bind(customerController)
);

export default router;
