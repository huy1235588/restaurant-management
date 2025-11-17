# Reservation API - Frontend Integration Guide

## Overview

This document provides comprehensive documentation for integrating the Reservation Management API into the frontend application. The API enables creating, managing, and tracking restaurant reservations.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### Authentication
All reservation endpoints require authentication. Include the JWT token in the Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## API Endpoints

### 1. Get All Reservations (Paginated)

Retrieve a paginated list of reservations with filtering and sorting options.

**Endpoint:** `GET /api/reservations`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page |
| `status` | string | No | - | Filter by status: `pending`, `confirmed`, `cancelled`, `seated`, `completed`, `no_show` |
| `date` | string | No | - | Filter by specific date (YYYY-MM-DD) |
| `startDate` | string | No | - | Filter from date (YYYY-MM-DD) |
| `endDate` | string | No | - | Filter to date (YYYY-MM-DD) |
| `tableId` | number | No | - | Filter by table ID |
| `search` | string | No | - | Search by customer name, phone, or reservation code |
| `sortBy` | string | No | reservationDate | Field to sort by |
| `sortOrder` | string | No | asc | Sort order: `asc` or `desc` |

**Response:**
```typescript
{
  success: true,
  message: "Reservations retrieved successfully",
  data: {
    items: [
      {
        reservationId: number,
        reservationCode: string,
        customerName: string,
        phoneNumber: string,
        email?: string,
        tableId: number,
        headCount: number,
        reservationDate: string,
        reservationTime: string,
        duration: number,
        status: "pending" | "confirmed" | "cancelled" | "seated" | "completed" | "no_show",
        specialRequest?: string,
        depositAmount?: number,
        notes?: string,
        tags?: string[],
        createdAt: string,
        updatedAt: string,
        confirmedAt?: string,
        seatedAt?: string,
        completedAt?: string,
        cancelledAt?: string,
        cancellationReason?: string,
        table: {
          tableId: number,
          tableNumber: string,
          capacity: number,
          floor: number
        },
        customer?: {
          customerId: number,
          name: string,
          phoneNumber: string,
          isVip: boolean
        }
      }
    ],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

**Example Usage:**
```typescript
const getReservations = async (params?: {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  date?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.date) queryParams.append('date', params.date);

  const response = await fetch(`${API_BASE_URL}/reservations?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

### 2. Get Reservation by ID

Retrieve detailed information about a specific reservation.

**Endpoint:** `GET /api/reservations/:id`

**Path Parameters:**
- `id` (number, required): Reservation ID

**Response:**
```typescript
{
  success: true,
  message: "Reservation retrieved successfully",
  data: {
    // Same structure as single reservation item above
    // Includes additional audit trail
    audits?: [
      {
        action: string,
        changes: object,
        createdAt: string,
        user?: {
          staffId: number,
          name: string
        }
      }
    ],
    orders?: [] // Associated orders if any
  }
}
```

**Example Usage:**
```typescript
const getReservationById = async (reservationId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

### 3. Get Reservation by Code

Retrieve a reservation using its unique reservation code.

**Endpoint:** `GET /api/reservations/code/:code`

**Path Parameters:**
- `code` (string, required): Unique reservation code

**Response:** Same as Get Reservation by ID

**Example Usage:**
```typescript
const getReservationByCode = async (code: string) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/code/${code}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

### 4. Create Reservation

Create a new reservation with automatic customer and table assignment.

**Endpoint:** `POST /api/reservations`

**Request Body:**
```typescript
{
  customerId?: number,              // Optional: existing customer ID
  customerName: string,             // Required: Customer full name (1-100 chars)
  phoneNumber: string,              // Required: Phone number (10-11 digits)
  email?: string,                   // Optional: Valid email address
  tableId?: number,                 // Optional: Specific table (auto-assigned if not provided)
  floor?: number,                   // Optional: Preferred floor for auto-assignment
  preferredTableId?: number,        // Optional: Preferred table for auto-assignment
  reservationDate: string,          // Required: Date in ISO format (YYYY-MM-DD)
  reservationTime: string,          // Required: Time in HH:mm format (24-hour)
  duration?: number,                // Optional: Duration in minutes (default: 120, min: 30, max: 480)
  headCount: number,                // Required: Number of guests (min: 1, max: 50)
  specialRequest?: string,          // Optional: Special requests or requirements
  depositAmount?: number,           // Optional: Deposit amount
  notes?: string,                   // Optional: Internal notes
  tags?: string[]                   // Optional: Tags for categorization
}
```

**Validation Rules:**
- `customerName`: 1-100 characters
- `phoneNumber`: 10-11 digits
- `email`: Valid email format
- `headCount`: 1-50 guests
- `duration`: 30-480 minutes
- `reservationTime`: Must be in HH:mm format
- `reservationDate`: Cannot be in the past, within booking window

**Response:**
```typescript
{
  success: true,
  message: "Reservation created successfully",
  data: {
    // Complete reservation object with generated ID and code
  }
}
```

**Error Responses:**
- `400`: Validation error or invalid data
- `409`: Table not available for selected time
- `404`: Table or customer not found

**Example Usage:**
```typescript
const createReservation = async (data: CreateReservationDto) => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      headCount: data.headCount,
      tableId: data.tableId,
      specialRequest: data.specialRequest,
      notes: data.notes
    })
  });
  
  return response.json();
};
```

---

### 5. Update Reservation

Update an existing reservation. All fields are optional.

**Endpoint:** `PUT /api/reservations/:id`

**Path Parameters:**
- `id` (number, required): Reservation ID to update

**Request Body:** Same as Create Reservation (all fields optional)

**Response:**
```typescript
{
  success: true,
  message: "Reservation updated successfully",
  data: {
    // Updated reservation object
  }
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Reservation not found
- `409`: New table/time not available

**Example Usage:**
```typescript
const updateReservation = async (
  reservationId: number,
  data: Partial<CreateReservationDto>
) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
  
  return response.json();
};
```

---

### 6. Cancel Reservation

Cancel a reservation. Cannot cancel completed reservations.

**Endpoint:** `PATCH /api/reservations/:id/cancel`

**Path Parameters:**
- `id` (number, required): Reservation ID to cancel

**Request Body:**
```typescript
{
  reason?: string  // Optional: Cancellation reason (max 500 chars)
}
```

**Response:**
```typescript
{
  success: true,
  message: "Reservation cancelled successfully",
  data: {
    reservationId: number,
    status: "cancelled",
    cancelledAt: string,
    cancellationReason?: string,
    updatedAt: string
  }
}
```

**Error Responses:**
- `400`: Cannot cancel completed reservation
- `404`: Reservation not found

**Example Usage:**
```typescript
const cancelReservation = async (reservationId: number, reason?: string) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    }
  );
  
  return response.json();
};
```

---

### 7. Confirm Reservation

Confirm a pending reservation.

**Endpoint:** `PATCH /api/reservations/:id/confirm`

**Path Parameters:**
- `id` (number, required): Reservation ID to confirm

**Response:**
```typescript
{
  success: true,
  message: "Reservation confirmed successfully",
  data: {
    reservationId: number,
    status: "confirmed",
    confirmedAt: string,
    updatedAt: string
  }
}
```

**Example Usage:**
```typescript
const confirmReservation = async (reservationId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}/confirm`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

### 8. Mark Reservation as Seated

Mark a reservation as seated when the customer arrives.

**Endpoint:** `PATCH /api/reservations/:id/seated`

**Path Parameters:**
- `id` (number, required): Reservation ID

**Response:**
```typescript
{
  success: true,
  message: "Reservation marked as seated",
  data: {
    reservationId: number,
    status: "seated",
    seatedAt: string,
    updatedAt: string
  }
}
```

**Example Usage:**
```typescript
const markReservationSeated = async (reservationId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/${reservationId}/seated`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

### 9. Check Table Availability

Check available tables for a specific date and time.

**Endpoint:** `GET /api/reservations/check-availability`

**Query Parameters:**
- `date` (string, required): Reservation date and time in ISO format
- `partySize` (number, required): Number of guests (min: 1)
- `duration` (number, optional): Duration in minutes (default: 120)

**Response:**
```typescript
{
  success: true,
  message: "Available tables retrieved successfully",
  data: [
    {
      tableId: number,
      tableNumber: string,
      capacity: number,
      minCapacity: number,
      floor: number,
      location?: string
    }
  ]
}
```

**Example Usage:**
```typescript
const checkAvailability = async (
  date: string,
  partySize: number,
  duration?: number
) => {
  const queryParams = new URLSearchParams({
    date,
    partySize: partySize.toString()
  });
  if (duration) queryParams.append('duration', duration.toString());

  const response = await fetch(
    `${API_BASE_URL}/reservations/check-availability?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

### 10. Get Reservations by Phone

Retrieve all reservations associated with a phone number.

**Endpoint:** `GET /api/reservations/phone/:phone`

**Path Parameters:**
- `phone` (string, required): Customer phone number

**Response:**
```typescript
{
  success: true,
  message: "Reservations retrieved successfully",
  data: [
    // Array of reservation objects
  ]
}
```

**Example Usage:**
```typescript
const getReservationsByPhone = async (phoneNumber: string) => {
  const response = await fetch(
    `${API_BASE_URL}/reservations/phone/${phoneNumber}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

---

## TypeScript Types

```typescript
// Reservation Status
export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'seated' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

// Reservation Object
export interface Reservation {
  reservationId: number;
  reservationCode: string;
  customerId?: number;
  customerName: string;
  phoneNumber: string;
  email?: string;
  tableId: number;
  reservationDate: string;
  reservationTime: string;
  duration: number;
  headCount: number;
  status: ReservationStatus;
  specialRequest?: string;
  depositAmount?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  seatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  table?: {
    tableId: number;
    tableNumber: string;
    capacity: number;
    floor: number;
  };
  customer?: {
    customerId: number;
    name: string;
    phoneNumber: string;
    isVip: boolean;
  };
}

// Create Reservation DTO
export interface CreateReservationDto {
  customerId?: number;
  customerName: string;
  phoneNumber: string;
  email?: string;
  tableId?: number;
  floor?: number;
  preferredTableId?: number;
  reservationDate: string;
  reservationTime: string;
  duration?: number;
  headCount: number;
  specialRequest?: string;
  depositAmount?: number;
  notes?: string;
  tags?: string[];
}

// Update Reservation DTO
export type UpdateReservationDto = Partial<CreateReservationDto>;

// Pagination Response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

---

## React Hook Examples

### useReservations Hook
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useReservations = (params?: {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  date?: string;
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.date) queryParams.append('date', params.date);

      const response = await fetch(
        `${API_BASE_URL}/reservations?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const result = await response.json();
      setReservations(result.data.items);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [params?.page, params?.limit, params?.status, params?.date]);

  return {
    reservations,
    pagination,
    loading,
    error,
    refetch: fetchReservations
  };
};
```

### useReservationActions Hook
```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useReservationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createReservation = async (data: CreateReservationDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (
    reservationId: number,
    data: UpdateReservationDto
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/${reservationId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reservation');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: number, reason?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/${reservationId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel reservation');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmReservation = async (reservationId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/${reservationId}/confirm`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to confirm reservation');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReservation,
    updateReservation,
    cancelReservation,
    confirmReservation,
    loading,
    error
  };
};
```

---

## Error Handling

### Error Response Format
```typescript
{
  success: false,
  message: "Error message",
  errors?: [
    {
      field: "fieldName",
      message: "Validation error message"
    }
  ]
}
```

### Common Error Codes
- `400`: Bad Request - Validation errors or invalid data
- `401`: Unauthorized - Missing or invalid authentication token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Resource conflict (e.g., table not available)
- `500`: Internal Server Error - Server-side error

### Example Error Handling
```typescript
try {
  const reservation = await createReservation(data);
  // Handle success
} catch (error) {
  if (error.response?.status === 409) {
    toast.error('Table is not available for the selected time');
  } else if (error.response?.status === 400) {
    // Handle validation errors
    const errors = error.response.data.errors;
    errors.forEach(err => {
      toast.error(`${err.field}: ${err.message}`);
    });
  } else {
    toast.error('Failed to create reservation');
  }
}
```

---

## Best Practices

1. **Always validate data on the frontend** before sending to the API
2. **Handle loading states** to provide user feedback
3. **Implement proper error handling** with user-friendly messages
4. **Use debouncing** for search and autocomplete features
5. **Cache reservation data** when appropriate to reduce API calls
6. **Implement optimistic updates** for better UX
7. **Show confirmation dialogs** before canceling or deleting
8. **Refresh data** after mutations (create, update, delete)
9. **Use proper TypeScript types** for type safety
10. **Implement retry logic** for failed requests

---

## Additional Resources

- [Reservation Management Features Documentation](./RESERVATION_MANAGEMENT_FEATURES.md)
- [Backend API Swagger Documentation](http://localhost:3001/api-docs)
- [Customer API Documentation](./CUSTOMER_API_FRONTEND.md)
