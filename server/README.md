# Restaurant Management System - Backend API

Modern backend API for Restaurant Management System built with **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**.

## 🚀 Features

- ✅ **TypeScript** - Type-safe code with full TypeScript support
- ✅ **Clean Architecture** - Separation of concerns with Controllers, Services, and Repositories
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **JWT Authentication** - Secure authentication with access & refresh tokens
- ✅ **Role-Based Access Control** - Fine-grained permissions system
- ✅ **Real-time Updates** - Socket.IO for live notifications
- ✅ **Data Validation** - Zod schema validation
- ✅ **Error Handling** - Centralized error handling
- ✅ **API Documentation** - Swagger/OpenAPI documentation
- ✅ **Security** - Helmet, CORS, Rate limiting
- ✅ **Logging** - Winston logger with file rotation

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Prisma client setup
│   │   ├── index.ts           # Environment config
│   │   └── logger.ts          # Winston logger
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── order.controller.ts
│   │   └── bill.controller.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   └── bill.service.ts
│   ├── repositories/          # Data access layer
│   │   ├── account.repository.ts
│   │   ├── order.repository.ts
│   │   └── bill.repository.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts            # JWT authentication
│   │   ├── validation.ts      # Request validation
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── order.routes.ts
│   │   └── index.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── validators/            # Zod schemas
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── auth.ts
│   │   ├── errors.ts
│   │   ├── response.ts
│   │   └── socket.ts
│   ├── app.ts                 # Express app setup
│   └── index.ts               # Server entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Winston
- **Dev Tools**: ts-node-dev, ESLint, Prettier

## 📦 Installation

1. **Clone the repository**
```bash
cd server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db?schema=public"
JWT_SECRET=your-super-secret-key
PORT=5000
```

4. **Run database migrations**
```bash
pnpm prisma:migrate
```

5. **Generate Prisma Client**
```bash
pnpm prisma:generate
```

6. **(Optional) Seed database**
```bash
pnpm prisma:seed
```

## 🚀 Running the Application

### Development Mode
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

### Other Commands
```bash
pnpm lint          # Run ESLint
pnpm format        # Format code with Prettier
pnpm prisma:studio # Open Prisma Studio
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register (Admin only)
- `POST /api/v1/auth/staff` - Create staff
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id` - Update order
- `PATCH /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/items` - Add items to order
- `POST /api/v1/orders/:id/cancel` - Cancel order
- `DELETE /api/v1/orders/:id` - Delete order

### Bills
- `POST /api/v1/bills` - Create bill
- `GET /api/v1/bills/:id` - Get bill by ID
- `POST /api/v1/bills/:id/payment` - Process payment
- `GET /api/v1/bills/revenue` - Get revenue statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## 👥 User Roles

- **Admin** - Full system access
- **Manager** - Manage operations, view reports
- **Waiter** - Take orders, manage tables
- **Chef** - View and update kitchen orders
- **Bartender** - Manage bar orders
- **Cashier** - Process payments

## 🔌 WebSocket Events

### Client → Server
- `join:table` - Join table room
- `leave:table` - Leave table room
- `join:kitchen` - Join kitchen room
- `leave:kitchen` - Leave kitchen room

### Server → Client
- `order:new` - New order created
- `order:status` - Order status updated
- `kitchen:order:update` - Kitchen order updated
- `bill:created` - New bill created
- `payment:received` - Payment received
- `table:status` - Table status updated

## 🐛 Error Handling

The API uses centralized error handling with custom error classes:
- `BadRequestError` - 400
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `ValidationError` - 422
- `InternalServerError` - 500

## � API Documentation

The API documentation is available via **Swagger UI** at:

```
http://localhost:5000/api-docs
```

### Authentication

To test protected endpoints in Swagger UI:

1. Login using the `/auth/login` endpoint
2. Copy the `accessToken` from the response
3. Click the **"Authorize"** button in Swagger UI
4. Enter `Bearer <your-access-token>` in the value field
5. Click **"Authorize"**

## �📝 License

MIT

## 👨‍💻 Author

Your Name
