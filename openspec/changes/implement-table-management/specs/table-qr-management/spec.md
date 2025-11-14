# Specification Delta: Table QR Code Management

## ADDED Requirements

### Requirement: QR-001 - QR Code Generation
**Priority**: P1 (High)  
**Category**: Feature  
**Owner**: Backend + Frontend Team

The system SHALL automatically generate unique QR codes for each table that link to the table's ordering page.

#### Scenario: QR code auto-generated on table creation
**Given** the user creates a new table "T-25"  
**When** the table is saved to the database  
**Then** the backend SHALL automatically generate a QR code with format:
```
https://restaurant.com/order?table=T-25&token={unique_token}
```
**And** the QR code image SHALL be generated as a data URL or saved to cloud storage  
**And** the QR code value SHALL be stored in the `qrCode` field  
**And** the QR code SHALL be unique across all tables  
**And** the frontend SHALL display the QR code in the table details

#### Scenario: QR code regeneration
**Given** a table "T-10" has an existing QR code  
**And** the user clicks "Regenerate QR Code" button  
**When** the action is confirmed  
**Then** the backend SHALL:
  - Generate a new unique token
  - Create a new QR code with the new token
  - Update the `qrCode` field in database
  - Invalidate the old QR code (mark as revoked)
**And** the frontend SHALL display the new QR code  
**And** show warning "Previous QR code is no longer valid"

#### Scenario: QR code generation failure
**Given** the user creates a new table  
**When** QR code generation fails (network error, service unavailable)  
**Then** the table SHALL still be created successfully  
**And** the `qrCode` field SHALL be NULL  
**And** a warning message SHALL display "Table created, but QR code generation failed"  
**And** the user SHALL be able to manually trigger QR generation later

**QR Code Format**:
```typescript
interface QRCodeData {
  url: string;           // Full URL to ordering page
  tableId: number;       // Internal table ID
  tableNumber: string;   // Display table number
  token: string;         // Unique security token (UUID)
  expiresAt?: string;    // Optional expiration (for temporary tables)
  restaurantId: string;  // Restaurant identifier (for multi-tenant)
}

// Example QR content
{
  "url": "https://restaurant.com/order",
  "tableId": 25,
  "tableNumber": "T-25",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "restaurantId": "rest_001"
}
```

**Acceptance Criteria**:
- ✅ QR codes are auto-generated for all new tables
- ✅ QR code URLs are unique and cannot be guessed
- ✅ QR codes scan successfully on all major mobile devices
- ✅ QR code generation completes within 2 seconds
- ✅ Failed generation doesn't block table creation
- ✅ QR codes can be regenerated on demand

---

### Requirement: QR-002 - QR Code Display and Download
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide a UI for viewing, downloading, and printing QR codes.

#### Scenario: User views QR code in table details
**Given** the user clicks on table "T-10"  
**And** the table has a generated QR code  
**When** the table details panel opens  
**Then** the QR code SHALL be displayed as an image (300x300px)  
**And** the display SHALL include:
  - QR code image
  - Table number label "T-10"
  - Instructions "Scan to order from this table"
  - Download button
  - Print button
  - Regenerate button (for authorized users)

#### Scenario: User opens QR code dialog
**Given** the user is viewing the table list or floor plan  
**When** the user clicks "View QR Code" action on table "T-10"  
**Then** a modal dialog SHALL open showing:
  - Large QR code image (400x400px)
  - Table information (number, name, capacity, floor, section)
  - QR code URL (copyable)
  - Action buttons: [Download PNG] [Download SVG] [Print] [Close]

#### Scenario: User downloads QR code as PNG
**Given** the QR code dialog is open for table "T-10"  
**When** the user clicks "Download PNG"  
**Then** the system SHALL:
  - Generate a high-quality PNG image (600x600px, 300 DPI)
  - Include table number as text below QR code
  - Include restaurant logo (if configured)
  - Trigger browser download with filename "QR_T-10_2025-11-09.png"
**And** show success toast "QR code downloaded"

#### Scenario: User downloads QR code as SVG
**Given** the QR code dialog is open  
**When** the user clicks "Download SVG"  
**Then** the system SHALL:
  - Generate vector SVG format for high-quality printing
  - Include table number and instructions
  - Trigger download with filename "QR_T-10.svg"

#### Scenario: User prints QR code
**Given** the QR code dialog is open  
**When** the user clicks "Print"  
**Then** the system SHALL:
  - Open browser print dialog
  - Display print-optimized page with:
    - Large QR code (centered)
    - Table number (bold, 24pt font)
    - Instructions "Scan to order"
    - Restaurant logo and name
  - Use white background and black QR code for best contrast

**Acceptance Criteria**:
- ✅ QR codes display clearly at all sizes
- ✅ Downloaded images are high-quality and scannable
- ✅ SVG format is true vector (scalable)
- ✅ Print layout is optimized for A4/Letter paper
- ✅ All formats include table identification
- ✅ Download/print actions work on all major browsers

---

### Requirement: QR-003 - Bulk QR Code Generation
**Priority**: P2 (Medium)  
**Category**: Feature  
**Owner**: Frontend + Backend Team

The system SHALL support bulk generation and download of QR codes for multiple tables.

#### Scenario: User generates QR codes for all tables
**Given** the user has permission `tables.generateQR`  
**And** 50 tables exist in the restaurant  
**When** the user clicks "Bulk Actions" → "Generate All QR Codes"  
**Then** the system SHALL:
  - Show confirmation dialog "Generate QR codes for 50 tables?"
  - Display progress indicator "Generating QR codes... 15/50"
  - Generate QR codes for all tables without codes
  - Regenerate codes for tables with existing codes (if option selected)
  - Complete within 30 seconds
**And** show summary "Generated 50 QR codes successfully"

#### Scenario: User downloads all QR codes as ZIP
**Given** all tables have generated QR codes  
**When** the user clicks "Download All QR Codes" button  
**Then** the system SHALL:
  - Prepare ZIP file containing PNG images for all active tables
  - Name files as "T-01.png", "T-02.png", etc.
  - Include folder structure by floor: "Floor 1/", "Floor 2/", etc.
  - Show download progress "Preparing download... 80%"
  - Trigger ZIP download with filename "Restaurant_QR_Codes_2025-11-09.zip"
**And** the ZIP SHALL be < 50MB in size

#### Scenario: User prints QR code sheet
**Given** the user selects 10 tables from the list  
**When** the user clicks "Print Selected QR Codes"  
**Then** the system SHALL:
  - Open print dialog with layout showing 6 QR codes per page
  - Each QR code SHALL include:
    - Table number (large, clear)
    - QR code image (3x3 inches)
    - Instructions
    - Cut lines for easy separation
  - Format for standard A4/Letter paper

**Acceptance Criteria**:
- ✅ Bulk generation handles 100+ tables without timeout
- ✅ Progress indicator shows accurate progress
- ✅ ZIP download works on all major browsers
- ✅ Folder structure in ZIP is logical and organized
- ✅ Print sheet layout is optimized for cutting and laminating
- ✅ Failed generations are reported with table numbers

---

### Requirement: QR-004 - QR Code Validation and Security
**Priority**: P1 (High)  
**Category**: Security  
**Owner**: Backend Team

The system SHALL validate QR codes and prevent unauthorized access.

#### Scenario: Customer scans valid QR code
**Given** a QR code for table "T-15" is displayed on the table  
**When** a customer scans the QR code with their mobile device  
**Then** the system SHALL:
  - Validate the token in the QR code URL
  - Check if the table exists and is active
  - Check if the QR code has not been revoked
  - Check if the QR code has not expired (if expiration set)
**And** redirect the customer to the ordering page `/order?table=T-15&token={valid_token}`  
**And** display the table number and menu

#### Scenario: Customer scans invalid QR code
**Given** a QR code has been regenerated (old code revoked)  
**Or** the QR code token has been tampered with  
**When** a customer scans the invalid QR code  
**Then** the system SHALL:
  - Detect invalid or revoked token
  - Return 403 Forbidden
  - Display error page "Invalid QR code. Please ask staff for assistance."
  - Log the failed attempt (security monitoring)

#### Scenario: Customer scans expired QR code
**Given** a QR code was set to expire after 30 days  
**And** 31 days have passed  
**When** a customer scans the QR code  
**Then** the system SHALL:
  - Detect expiration
  - Display warning "QR code expired. Please ask staff for a new one."
  - Notify restaurant staff via admin panel

**Security Measures**:
```typescript
interface QRCodeSecurity {
  // Unique token (UUID v4)
  token: string;
  
  // Creation timestamp
  createdAt: Date;
  
  // Optional expiration
  expiresAt?: Date;
  
  // Revocation status
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  
  // Usage tracking
  scanCount: number;
  lastScannedAt?: Date;
  
  // Rate limiting (prevent spam scanning)
  scansPerHour: number;
  maxScansPerHour: 100;
}
```

**Acceptance Criteria**:
- ✅ Only valid, non-revoked QR codes grant access
- ✅ Expired QR codes show helpful error messages
- ✅ Tampered QR codes are detected and blocked
- ✅ Failed scans are logged for security analysis
- ✅ Rate limiting prevents QR code abuse (max 100 scans/hour per code)
- ✅ HTTPS is enforced for all QR code URLs

---

### Requirement: QR-005 - QR Code Analytics
**Priority**: P2 (Medium)  
**Category**: Feature  
**Owner**: Backend + Frontend Team

The system SHALL track QR code usage and provide analytics.

#### Scenario: View QR code scan statistics
**Given** the user has permission `tables.viewAnalytics`  
**And** the user opens table "T-10" details  
**When** the "QR Analytics" section loads  
**Then** the system SHALL display:
  - Total scans: 248
  - Scans this week: 42
  - Last scanned: "2 hours ago"
  - Peak scan time: "7:00 PM - 8:00 PM"
  - Most common device: "iPhone (68%)"
  - Conversion rate: "85% (scans that resulted in orders)"

#### Scenario: View restaurant-wide QR analytics
**Given** the user navigates to Analytics dashboard  
**When** the "QR Code Performance" section loads  
**Then** the system SHALL display:
  - Total QR scans across all tables (chart by day/week/month)
  - Top 10 most scanned tables
  - Average scans per table
  - QR code effectiveness (scan-to-order conversion)
  - Geographic data (if available)
  - Device breakdown (iOS vs Android)

#### Scenario: Export QR analytics report
**Given** the user is viewing QR analytics  
**When** the user clicks "Export Report"  
**Then** the system SHALL generate CSV file with columns:
  - Table Number
  - Total Scans
  - Unique Scans
  - Conversion Rate
  - Last Scan Date
  - Average Orders per Scan

**Acceptance Criteria**:
- ✅ Scan tracking is accurate and real-time
- ✅ Analytics load within 2 seconds
- ✅ Charts are interactive and filterable (date range)
- ✅ Export includes all relevant metrics
- ✅ Privacy-compliant (no PII stored)

---

### Requirement: QR-006 - QR Code Customization
**Priority**: P2 (Medium)  
**Category**: Feature  
**Owner**: Frontend + Backend Team

The system SHALL allow customization of QR code appearance.

#### Scenario: User customizes QR code style
**Given** the user has permission `tables.customizeQR`  
**And** the user opens QR code settings  
**When** the user selects customization options:
  - Color: Brand color (#FF6B6B)
  - Logo: Restaurant logo in center
  - Shape: Rounded dots
  - Size: Large (600x600px)
**And** clicks "Apply"  
**Then** the system SHALL:
  - Regenerate QR codes with new styling
  - Preview the updated QR code
  - Test scanability with new styling
  - Save preferences for future generations
**And** all new QR codes SHALL use the custom styling

#### Scenario: QR code fails scanability test
**Given** the user applies heavy customization (very light color, large logo)  
**When** the system tests scanability  
**Then** the system SHALL:
  - Detect poor scan rate (< 80% success)
  - Show warning "QR code may be difficult to scan with these settings"
  - Suggest adjustments (darker color, smaller logo)
  - Allow user to proceed or revert

**Customization Options**:
```typescript
interface QRCodeCustomization {
  // Colors
  foregroundColor: string;  // QR code color (default: black)
  backgroundColor: string;  // Background color (default: white)
  
  // Logo/Branding
  logoUrl?: string;         // Center logo image
  logoSize: 'small' | 'medium' | 'large'; // Max 20% of QR size
  
  // Style
  dotStyle: 'square' | 'rounded' | 'dots';
  eyeStyle: 'square' | 'rounded' | 'frame';
  
  // Error Correction Level
  errorCorrection: 'L' | 'M' | 'Q' | 'H'; // Higher = more robust
  
  // Frame/Border
  includeFrame: boolean;
  frameText?: string;       // e.g., "Scan to Order"
  frameColor?: string;
}
```

**Acceptance Criteria**:
- ✅ Customization preserves QR code scanability
- ✅ Preview shows exactly how QR will look when printed
- ✅ Scanability test validates QR codes before saving
- ✅ Customization applies to all future QR codes
- ✅ Default settings are optimized for scanability

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

---

## Dependencies

- **QR Code Library**: `qrcode` (Node.js) or `qrcode.react` (React)
- **Image Processing**: `sharp` or `canvas` for server-side image generation
- **Cloud Storage** (optional): Cloudinary or AWS S3 for QR code image hosting
- **Spec**: `table-crud` for table creation that triggers QR generation
- **Spec**: `table-visualization` for displaying QR codes in UI

---

## Technical Implementation

### QR Code Generation (Backend)

```typescript
import QRCode from 'qrcode';
import sharp from 'sharp';

export const generateTableQRCode = async (table: Table) => {
  const qrData = {
    url: `${process.env.APP_URL}/order`,
    tableId: table.tableId,
    tableNumber: table.tableNumber,
    token: generateUniqueToken(),
    restaurantId: process.env.RESTAURANT_ID,
  };
  
  // Generate QR code as data URL
  const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
    errorCorrectionLevel: 'H',
    width: 600,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  
  // Optionally upload to cloud storage
  const qrImageUrl = await uploadToCloudinary(qrDataURL);
  
  // Save to database
  await prisma.restaurantTable.update({
    where: { tableId: table.tableId },
    data: { qrCode: qrData.token, qrImageUrl },
  });
  
  return { token: qrData.token, imageUrl: qrImageUrl };
};
```

### QR Code Display (Frontend)

```typescript
import { QRCodeSVG } from 'qrcode.react';

export const TableQRCode = ({ table }: { table: Table }) => {
  const qrData = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/order`,
    tableId: table.tableId,
    tableNumber: table.tableNumber,
    token: table.qrCode,
  };
  
  return (
    <div className="qr-code-container">
      <QRCodeSVG
        value={JSON.stringify(qrData)}
        size={300}
        level="H"
        includeMargin={true}
      />
      <p className="table-label">{table.tableNumber}</p>
      <p className="instructions">Scan to order</p>
    </div>
  );
};
```

### QR Code Validation (Backend)

```typescript
export const validateQRCode = async (token: string) => {
  const table = await prisma.restaurantTable.findFirst({
    where: { qrCode: token, isActive: true },
  });
  
  if (!table) {
    throw new Error('Invalid or revoked QR code');
  }
  
  // Check expiration (if implemented)
  if (table.qrExpiresAt && new Date() > table.qrExpiresAt) {
    throw new Error('QR code expired');
  }
  
  // Track scan
  await prisma.qrCodeScan.create({
    data: {
      tableId: table.tableId,
      scannedAt: new Date(),
      userAgent: req.headers['user-agent'],
    },
  });
  
  return table;
};
```

---

## Security Considerations

1. **Token Security**: Use UUID v4 for unpredictable tokens
2. **HTTPS Only**: Enforce HTTPS for all QR code URLs
3. **Token Revocation**: Support revoking old QR codes
4. **Rate Limiting**: Prevent scanning abuse (max 100 scans/hour per code)
5. **Input Validation**: Validate QR data on scan to prevent injection
6. **Audit Logging**: Log all QR code generations and scans

---

## Business Rules

1. QR codes are generated automatically for all new tables
2. QR codes can be regenerated by authorized users only
3. Old QR codes are revoked when regenerated
4. QR codes never contain sensitive data (only tokens)
5. QR code URLs are permanent (don't expire by default)
6. Customization must not compromise scanability
7. Analytics data is retained for 12 months

---

## Future Enhancements

- **Dynamic QR Codes**: QR content changes based on time/promotions
- **Multi-language QR**: Detect customer language on scan
- **QR Code Expiration**: Auto-expire QR codes after X days
- **NFC Tags**: Support NFC tags in addition to QR codes
- **AR QR Codes**: Augmented reality experience on scan
- **QR Code A/B Testing**: Test different QR designs for effectiveness
