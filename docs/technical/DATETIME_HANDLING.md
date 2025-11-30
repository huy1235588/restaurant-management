# DateTime Handling Optimization

## Overview

This document describes the datetime handling improvements made to the Restaurant Management System to ensure consistent timezone handling across the application.

## Problem Statement

The system had several issues with datetime handling:

1. **No Timezone Handling**: All dates were created with `new Date()` which uses the server's local timezone, leading to potential inconsistencies
2. **Inconsistent Date Parsing**: Different patterns used across the codebase
3. **Bug in `combineDateTime`**: Was mixing UTC date with local time
4. **Bug in `seat()` method**: Used `toISOString().substring()` which extracts UTC time instead of local time

## Solution Architecture

### Server-side (NestJS)

#### DateTimeService (`app/server/src/shared/utils/datetime.service.ts`)

A centralized service for all datetime operations with timezone awareness.

```typescript
import { DateTimeService } from '@/shared/utils';

@Injectable()
export class SomeService {
    constructor(private readonly dateTimeService: DateTimeService) {}

    someMethod() {
        // Get current time
        const now = this.dateTimeService.nowUtc();
        
        // Parse date string to Date
        const date = this.dateTimeService.parseLocalDate('2024-12-25');
        
        // Combine date and time
        const dateTime = this.dateTimeService.combineDateTime('2024-12-25', '19:00');
        
        // Create time-only Date for @db.Time fields
        const timeDate = this.dateTimeService.createTimeDate('19:00');
        
        // Extract date/time strings from Date objects
        const dateString = this.dateTimeService.extractDateString(someDate);
        const timeString = this.dateTimeService.extractTimeString(someDate);
        
        // Format for display
        const formatted = this.dateTimeService.formatDateTime(date);
    }
}
```

#### Key Features

| Method | Description |
|--------|-------------|
| `nowUtc()` | Get current time |
| `parseLocalDate(string)` | Parse YYYY-MM-DD to Date |
| `parseLocalTime(string)` | Parse HH:mm or HH:mm:ss to Date |
| `combineDateTime(date, time)` | Combine date and time strings |
| `createTimeDate(time)` | Create Date for @db.Time fields |
| `extractDateString(date)` | Extract YYYY-MM-DD from Date |
| `extractTimeString(date)` | Extract HH:mm from Date |
| `formatDate(date)` | Format to YYYY-MM-DD |
| `formatTime(date)` | Format to HH:mm:ss |
| `formatTimeShort(date)` | Format to HH:mm |
| `formatDateTime(date)` | Format to full datetime string |
| `isFuture(date, time?)` | Check if date/time is in future |
| `isToday(date)` | Check if date is today |
| `addDays(date, days)` | Add days to a date |
| `addMinutes(date, minutes)` | Add minutes to a date |

#### Configuration

Add to `.env`:

```env
TZ=Asia/Ho_Chi_Minh
```

The timezone is configured in `app/server/src/config/configuration.ts`:

```typescript
timezone: process.env['TZ'] || 'Asia/Ho_Chi_Minh',
```

### Client-side (Next.js)

#### Updated Date Utils (`app/client/src/lib/utils/date.ts`)

Enhanced with timezone-aware functions using `date-fns-tz`.

```typescript
import {
    parseReservationDate,
    parseReservationTime,
    formatReservationDate,
    formatReservationTime,
    combineDateAndTime,
    formatWithTimezone,
    formatTimestamp,
    getTodayDate,
    getCurrentTime,
    isFutureDateTime,
    isToday,
    getElapsedSeconds,
    getElapsedMinutes,
    formatDuration,
    APP_TIMEZONE,
} from '@/lib/utils/date';
```

#### Key Functions

| Function | Description |
|----------|-------------|
| `parseReservationDate(string)` | Parse date string to Date |
| `parseReservationTime(string)` | Parse time string to HH:mm:ss |
| `combineDateAndTime(date, time)` | Combine date and time in local timezone |
| `formatWithTimezone(date, format)` | Format with timezone awareness |
| `formatTimestamp(timestamp, format?)` | Format ISO timestamp for display |
| `getTodayDate()` | Get today's date as YYYY-MM-DD |
| `getCurrentTime()` | Get current time as HH:mm |
| `isFutureDateTime(date, time?)` | Check if date/time is in future |
| `isToday(date)` | Check if date is today |
| `getElapsedSeconds(timestamp)` | Calculate elapsed seconds |
| `getElapsedMinutes(timestamp)` | Calculate elapsed minutes |
| `formatDuration(minutes)` | Format duration for display |

### Dependencies

Added to `app/client/package.json`:

```json
"date-fns-tz": "^4.0.0"
```

## Migration Guide

### For Backend Developers

1. **Use DateTimeService instead of raw Date operations**:

```typescript
// ❌ Before
const date = new Date(dateString);
const time = new Date();
time.setHours(hours, minutes, 0, 0);

// ✅ After
const date = this.dateTimeService.parseLocalDate(dateString);
const timeDate = this.dateTimeService.createTimeDate(timeString);
```

2. **Extract date/time strings correctly**:

```typescript
// ❌ Before (extracts UTC time!)
const dateString = date.toISOString().split('T')[0];
const timeString = date.toISOString().substring(11, 16);

// ✅ After (uses local timezone)
const dateString = this.dateTimeService.extractDateString(date);
const timeString = this.dateTimeService.extractTimeString(date);
```

3. **Use combineDateTime for combining date and time**:

```typescript
// ❌ Before (buggy - mixes UTC and local)
const dateObj = new Date(date);
dateObj.setHours(hours, minutes, 0, 0);

// ✅ After
const dateTime = this.dateTimeService.combineDateTime(dateString, timeString);
```

### For Frontend Developers

1. **Use the date utility functions**:

```typescript
// ❌ Before
const d = new Date(`${date}T${time}`);

// ✅ After
const d = combineDateAndTime(date, time);
```

2. **Format timestamps with timezone awareness**:

```typescript
// ❌ Before
format(new Date(timestamp), 'MMM dd, yyyy');

// ✅ After
formatTimestamp(timestamp, 'MMM dd, yyyy');
```

## Best Practices

1. **Always use DateTimeService in backend services** instead of raw `new Date()` operations
2. **Store dates in database as UTC** - Prisma handles this automatically
3. **Convert to local timezone only for display** - use the format methods
4. **Keep timezone configuration consistent** - both server and client use `Asia/Ho_Chi_Minh`
5. **Avoid `toISOString()` for extracting local time** - it returns UTC time

## Files Changed

### Backend

- `app/server/src/shared/utils/datetime.service.ts` - New DateTimeService
- `app/server/src/shared/utils/index.ts` - Export DateTimeService
- `app/server/src/shared/shared.module.ts` - New SharedModule
- `app/server/src/app.module.ts` - Import SharedModule
- `app/server/src/config/configuration.ts` - Add timezone config
- `app/server/src/modules/reservation/helpers/reservation.helper.ts` - Fixed combineDateTime
- `app/server/src/modules/reservation/reservation.service.ts` - Use DateTimeService

### Frontend

- `app/client/src/lib/utils/date.ts` - Enhanced with timezone functions
- `app/client/src/modules/reservations/utils/index.ts` - Fixed combineDateTime
- `app/client/package.json` - Added date-fns-tz

## Testing

After these changes, verify:

1. Reservations display correct local time
2. Date/time comparisons work correctly
3. Time filtering works as expected
4. No timezone-related errors in console
