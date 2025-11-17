# Customer API - Frontend Integration Guide

## Overview

This document provides comprehensive documentation for integrating the Customer Management API into the frontend application. The API enables managing customer profiles, tracking reservation history, and handling customer data.

## Base Configuration

### API Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### Authentication
All customer endpoints require authentication. Include the JWT token in the Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Authorization
Customer endpoints require specific roles:
- **Read operations**: `admin`, `manager`, `waiter`
- **Create operations**: `admin`, `manager`, `waiter`
- **Update/Merge operations**: `admin`, `manager`

---

## API Endpoints

### 1. Get All Customers (Paginated)

Retrieve a paginated list of customers with filtering options.

**Endpoint:** `GET /api/customers`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max: 100) |
| `search` | string | No | - | Search by name, phone, or email |
| `isVip` | boolean | No | - | Filter by VIP status (true/false) |
| `phoneNumber` | string | No | - | Filter by phone number |
| `email` | string | No | - | Filter by email address |

**Response:**
```typescript
{
  success: true,
  message: "Customers retrieved successfully",
  data: {
    items: [
      {
        customerId: number,
        name: string,
        phoneNumber: string,
        email?: string,
        birthday?: string,
        isVip: boolean,
        preferences?: object,
        notes?: string,
        createdAt: string,
        updatedAt: string,
        _count?: {
          reservations: number
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
const getCustomers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isVip?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.isVip !== undefined) {
    queryParams.append('isVip', params.isVip.toString());
  }

  const response = await fetch(`${API_BASE_URL}/customers?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

### 2. Get Customer by ID

Retrieve detailed information about a specific customer including recent reservations.

**Endpoint:** `GET /api/customers/:id`

**Path Parameters:**
- `id` (number, required): Customer ID

**Response:**
```typescript
{
  success: true,
  message: "Customer retrieved successfully",
  data: {
    customerId: number,
    name: string,
    phoneNumber: string,
    email?: string,
    birthday?: string,
    isVip: boolean,
    preferences?: object,
    notes?: string,
    createdAt: string,
    updatedAt: string,
    reservations: [
      {
        reservationId: number,
        reservationCode: string,
        reservationDate: string,
        reservationTime: string,
        headCount: number,
        status: string,
        table: {
          tableId: number,
          tableNumber: string,
          floor: number
        }
      }
    ]
  }
}
```

**Example Usage:**
```typescript
const getCustomerById = async (customerId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/customers/${customerId}`,
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

### 3. Create Customer

Create a new customer profile.

**Endpoint:** `POST /api/customers`

**Request Body:**
```typescript
{
  name: string,                    // Required: Customer name (1-100 chars)
  phoneNumber: string,             // Required: Phone number (10-15 digits)
  email?: string,                  // Optional: Valid email address
  birthday?: string,               // Optional: ISO date (YYYY-MM-DD)
  isVip?: boolean,                 // Optional: VIP status (default: false)
  preferences?: object,            // Optional: Customer preferences (JSON)
  notes?: string                   // Optional: Internal notes (max 500 chars)
}
```

**Validation Rules:**
- `name`: 1-100 characters
- `phoneNumber`: Must match pattern `^\+?\d{10,15}$`
- `email`: Valid email format
- `birthday`: ISO date format (YYYY-MM-DD)
- `notes`: Maximum 500 characters

**Response:**
```typescript
{
  success: true,
  message: "Customer created successfully",
  data: {
    customerId: number,
    name: string,
    phoneNumber: string,
    email?: string,
    birthday?: string,
    isVip: boolean,
    preferences?: object,
    notes?: string,
    createdAt: string,
    updatedAt: string
  }
}
```

**Error Responses:**
- `400`: Validation error
- `409`: Customer with phone or email already exists

**Example Usage:**
```typescript
const createCustomer = async (data: CreateCustomerDto) => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      birthday: data.birthday,
      isVip: data.isVip,
      preferences: data.preferences,
      notes: data.notes
    })
  });
  
  return response.json();
};
```

---

### 4. Update Customer

Update customer information. All fields are optional.

**Endpoint:** `PATCH /api/customers/:id`

**Path Parameters:**
- `id` (number, required): Customer ID to update

**Request Body:** Same as Create Customer (all fields optional)

**Authorization:** Requires `admin` or `manager` role

**Response:**
```typescript
{
  success: true,
  message: "Customer updated successfully",
  data: {
    // Updated customer object
  }
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Customer not found
- `409`: Phone or email already in use by another customer

**Example Usage:**
```typescript
const updateCustomer = async (
  customerId: number,
  data: Partial<CreateCustomerDto>
) => {
  const response = await fetch(
    `${API_BASE_URL}/customers/${customerId}`,
    {
      method: 'PATCH',
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

### 5. Get Customer Reservation History

Retrieve full reservation history for a customer.

**Endpoint:** `GET /api/customers/:id/history`

**Path Parameters:**
- `id` (number, required): Customer ID

**Query Parameters:**
- `limit` (number, optional): Maximum number of reservations (default: 50, max: 200)

**Response:**
```typescript
{
  success: true,
  message: "Reservation history retrieved successfully",
  data: [
    {
      reservationId: number,
      reservationCode: string,
      customerName: string,
      phoneNumber: string,
      reservationDate: string,
      reservationTime: string,
      headCount: number,
      status: string,
      specialRequest?: string,
      depositAmount?: number,
      notes?: string,
      createdAt: string,
      updatedAt: string,
      table: {
        tableId: number,
        tableNumber: string,
        capacity: number,
        floor: number
      }
    }
  ]
}
```

**Example Usage:**
```typescript
const getCustomerHistory = async (customerId: number, limit?: number) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/customers/${customerId}/history?${queryParams}`,
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

### 6. Customer Autocomplete/Search

Fast search for customers by name, phone, or email. Useful for autocomplete inputs.

**Endpoint:** `GET /api/customers/autocomplete`

**Query Parameters:**
- `term` (string, required): Search term (minimum 1 character)
- `limit` (number, optional): Maximum results (default: 10, max: 50)

**Response:**
```typescript
{
  success: true,
  message: "Customer search results",
  data: [
    {
      customerId: number,
      name: string,
      phoneNumber: string,
      email?: string,
      isVip: boolean
    }
  ]
}
```

**Example Usage:**
```typescript
const searchCustomers = async (term: string, limit?: number) => {
  const queryParams = new URLSearchParams({ term });
  if (limit) queryParams.append('limit', limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/customers/autocomplete?${queryParams}`,
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

### 7. Merge Duplicate Customers

Merge two customer records into one. All reservations from the duplicate customer will be transferred to the primary customer.

**Endpoint:** `POST /api/customers/:id/merge`

**Path Parameters:**
- `id` (number, required): Primary customer ID (the one to keep)

**Request Body:**
```typescript
{
  duplicateCustomerId: number  // Required: Customer ID to merge and delete
}
```

**Authorization:** Requires `admin` or `manager` role

**Response:**
```typescript
{
  success: true,
  message: "Customers merged successfully",
  data: {
    // Primary customer object with merged data
    customerId: number,
    name: string,
    phoneNumber: string,
    email?: string,
    notes?: string,  // Combined notes from both customers
    preferences?: object,
    isVip: boolean,  // True if either was VIP
    // ... other fields
  }
}
```

**Merge Logic:**
- All reservations transferred to primary customer
- Notes are combined with separator
- Email and phone prefer primary, fallback to duplicate
- VIP status: true if either customer is VIP
- Preferences: primary takes precedence
- Duplicate customer is deleted after merge

**Error Responses:**
- `400`: Cannot merge same customer or validation error
- `404`: One or both customers not found

**Example Usage:**
```typescript
const mergeCustomers = async (
  primaryCustomerId: number,
  duplicateCustomerId: number
) => {
  const response = await fetch(
    `${API_BASE_URL}/customers/${primaryCustomerId}/merge`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ duplicateCustomerId })
    }
  );
  
  return response.json();
};
```

---

## TypeScript Types

```typescript
// Customer Object
export interface Customer {
  customerId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  birthday?: string;
  isVip: boolean;
  preferences?: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reservations?: Reservation[];
  _count?: {
    reservations: number;
  };
}

// Create Customer DTO
export interface CreateCustomerDto {
  name: string;
  phoneNumber: string;
  email?: string;
  birthday?: string;
  isVip?: boolean;
  preferences?: Record<string, any>;
  notes?: string;
}

// Update Customer DTO
export type UpdateCustomerDto = Partial<CreateCustomerDto>;

// Customer Preferences Example
export interface CustomerPreferences {
  dietaryRestrictions?: string[];
  favoriteTable?: number;
  preferredSeating?: 'window' | 'booth' | 'bar' | 'patio';
  specialOccasions?: {
    type: string;
    date: string;
  }[];
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

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

### useCustomers Hook
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useCustomers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isVip?: boolean;
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isVip !== undefined) {
        queryParams.append('isVip', params.isVip.toString());
      }

      const response = await fetch(
        `${API_BASE_URL}/customers?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const result = await response.json();
      setCustomers(result.data.items);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [params?.page, params?.limit, params?.search, params?.isVip]);

  return {
    customers,
    pagination,
    loading,
    error,
    refetch: fetchCustomers
  };
};
```

### useCustomerActions Hook
```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useCustomerActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createCustomer = async (data: CreateCustomerDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
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

  const updateCustomer = async (
    customerId: number,
    data: UpdateCustomerDto
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${customerId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update customer');
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

  const mergeCustomers = async (
    primaryId: number,
    duplicateId: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${primaryId}/merge`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ duplicateCustomerId: duplicateId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to merge customers');
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
    createCustomer,
    updateCustomer,
    mergeCustomers,
    loading,
    error
  };
};
```

### useCustomerSearch Hook (for Autocomplete)
```typescript
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { debounce } from 'lodash';

export const useCustomerSearch = (debounceMs: number = 300) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const searchCustomers = async (term: string) => {
    if (!term || term.length < 1) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/autocomplete?term=${encodeURIComponent(term)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(searchCustomers, debounceMs),
    [token]
  );

  return {
    customers,
    loading,
    search: debouncedSearch,
    clearResults: () => setCustomers([])
  };
};
```

---

## Component Examples

### Customer Autocomplete Component
```typescript
import { useState } from 'react';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';

interface CustomerAutocompleteProps {
  onSelect: (customer: Customer) => void;
  placeholder?: string;
}

export const CustomerAutocomplete: React.FC<CustomerAutocompleteProps> = ({
  onSelect,
  placeholder = 'Search customers...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { customers, loading, search, clearResults } = useCustomerSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(true);
    search(value);
  };

  const handleSelect = (customer: Customer) => {
    setInputValue(customer.name);
    setShowResults(false);
    clearResults();
    onSelect(customer);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {showResults && customers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {customers.map((customer) => (
            <button
              key={customer.customerId}
              onClick={() => handleSelect(customer)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-600">{customer.phoneNumber}</div>
              </div>
              {customer.isVip && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  VIP
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Customer Details Card
```typescript
import { useEffect, useState } from 'react';

interface CustomerDetailsCardProps {
  customerId: number;
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customerId
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/customers/${customerId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const result = await response.json();
        setCustomer(result.data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{customer.name}</h2>
        {customer.isVip && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            VIP Customer
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-gray-600">Phone:</span>
          <span className="ml-2 font-medium">{customer.phoneNumber}</span>
        </div>
        
        {customer.email && (
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{customer.email}</span>
          </div>
        )}

        {customer.birthday && (
          <div>
            <span className="text-gray-600">Birthday:</span>
            <span className="ml-2 font-medium">
              {new Date(customer.birthday).toLocaleDateString()}
            </span>
          </div>
        )}

        {customer.notes && (
          <div>
            <span className="text-gray-600">Notes:</span>
            <p className="mt-1 text-sm">{customer.notes}</p>
          </div>
        )}
      </div>

      {customer.reservations && customer.reservations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recent Reservations</h3>
          <div className="space-y-2">
            {customer.reservations.map((reservation) => (
              <div
                key={reservation.reservationId}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{reservation.reservationCode}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(reservation.reservationDate).toLocaleDateString()} at{' '}
                      {reservation.reservationTime}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

### Common Error Scenarios

1. **Duplicate Customer (409)**
```typescript
try {
  await createCustomer(data);
} catch (error) {
  if (error.response?.status === 409) {
    toast.error('A customer with this phone number or email already exists');
    // Optionally offer to view or merge the existing customer
  }
}
```

2. **Validation Errors (400)**
```typescript
try {
  await createCustomer(data);
} catch (error) {
  if (error.response?.status === 400) {
    const errors = error.response.data.errors;
    errors.forEach(err => {
      // Display field-specific errors
      setFieldError(err.field, err.message);
    });
  }
}
```

3. **Customer Not Found (404)**
```typescript
try {
  await getCustomerById(customerId);
} catch (error) {
  if (error.response?.status === 404) {
    toast.error('Customer not found');
    router.push('/customers');
  }
}
```

---

## Best Practices

1. **Search Optimization**
   - Use debouncing for autocomplete searches (300-500ms)
   - Limit autocomplete results to 10-20 items
   - Clear results when input is empty

2. **Data Validation**
   - Validate phone numbers and emails on the frontend
   - Show real-time validation feedback
   - Format phone numbers consistently

3. **Customer Merge**
   - Always show confirmation dialog before merging
   - Display what data will be kept/combined
   - Provide undo option if possible

4. **VIP Customers**
   - Clearly indicate VIP status throughout the UI
   - Consider special handling for VIP reservations
   - Track VIP-specific preferences

5. **Preferences Management**
   - Structure preferences as typed objects
   - Provide UI for common preferences
   - Allow free-form notes for unusual requests

6. **Privacy & Security**
   - Only display customer data to authorized roles
   - Mask sensitive information when appropriate
   - Implement proper logging for data access

7. **Performance**
   - Cache customer data locally when appropriate
   - Implement infinite scroll for large customer lists
   - Use pagination for better performance

---

## Additional Resources

- [Reservation API Documentation](./RESERVATION_API_FRONTEND.md)
- [Backend API Swagger Documentation](http://localhost:3001/api-docs)
- [Customer Business Use Cases](./BUSINESS_USE_CASES.md)

---

## Migration Notes

### From Legacy System
If migrating from a legacy customer management system:

1. **Import Customers in Bulk**
   - Prepare CSV with required fields: name, phoneNumber
   - Optional fields: email, birthday, isVip, notes
   - Use batch import endpoint (contact backend team)

2. **Handle Duplicates**
   - Run duplicate detection by phone/email
   - Use merge endpoint to consolidate records
   - Keep audit trail of merges

3. **Preferences Migration**
   - Map legacy preference fields to new structure
   - Preserve special notes and requirements
   - Update customer communication preferences
