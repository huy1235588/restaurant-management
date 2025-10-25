# Biểu Đồ Quản Lý Hóa Đơn và Thanh Toán

## 1. Biểu Đồ Quy Trình Tổng Thể (Flowchart)

```mermaid
flowchart TD
    A[Khách Yêu Cầu Thanh Toán] --> B[Nhân Viên Mở Đơn Hàng]
    B --> C[Tạo Hóa Đơn]
    C --> D[Tính Toán Tự Động]
    D --> E{Có Giảm Giá?}
    E -->|Có| F[Áp Dụng Mã/Giảm Thủ Công]
    F --> G[Tính Lại Tổng Tiền]
    E -->|Không| G
    G --> H[Hiển Thị Hóa Đơn Cho Khách]
    H --> I{Khách<br/>Đồng Ý?}
    I -->|Không| J[Điều Chỉnh Hóa Đơn]
    J --> G
    I -->|Có| K[Chọn Phương Thức Thanh Toán]
    K --> L{Phương<br/>Thức?}
    L -->|Tiền Mặt| M[Nhập Tiền Khách Đưa]
    M --> N[Tính Tiền Thối]
    L -->|Thẻ| O[Quẹt Thẻ POS]
    L -->|Ví Điện Tử| P[Quét QR Code]
    L -->|Chuyển Khoản| Q[Hiển Thị TK Nhận]
    N --> R[Xử Lý Thanh Toán]
    O --> R
    P --> R
    Q --> R
    R --> S{Thanh Toán<br/>Thành Công?}
    S -->|Không| T[Thông Báo Lỗi]
    T --> K
    S -->|Có| U[Cập Nhật Trạng Thái]
    U --> V[In Hóa Đơn]
    V --> W[Đưa Hóa Đơn Cho Khách]
    W --> X[Giải Phóng Bàn]
    X --> Y[Ghi Log & Báo Cáo]
    Y --> Z[Hoàn Tất]
```

---

## 2. Biểu Đồ Quản Lý Thanh Toán (Sequence Diagram)

```mermaid
sequenceDiagram
    actor Customer as Khách Hàng
    actor Waiter as Nhân Viên
    participant UI as Giao Diện
    participant API as Backend API
    participant DB as Database
    participant Payment as Payment Gateway
    participant Printer as Máy In

    Customer ->> Waiter: Yêu cầu thanh toán
    Waiter ->> UI: Mở đơn hàng
    UI ->> API: GET /orders/:id
    API ->> DB: Lấy thông tin đơn
    DB -->> API: Chi tiết đơn hàng
    API -->> UI: Dữ liệu đơn hàng
    
    Waiter ->> UI: Tạo hóa đơn
    UI ->> API: POST /bills
    API ->> DB: Tạo hóa đơn
    API ->> API: Tính toán (subtotal, tax, service)
    DB -->> API: Bill ID
    API -->> UI: Thông tin hóa đơn
    
    UI -->> Waiter: Hiển thị hóa đơn
    Waiter -->> Customer: Xác nhận hóa đơn
    
    opt Áp Dụng Giảm Giá
        Waiter ->> UI: Nhập mã giảm giá
        UI ->> API: POST /bills/:id/discount
        API ->> DB: Kiểm tra mã
        DB -->> API: Mã hợp lệ
        API ->> API: Tính lại tổng tiền
        API ->> DB: Cập nhật hóa đơn
        API -->> UI: Tổng tiền mới
    end
    
    Customer ->> Waiter: Chọn phương thức
    
    alt Thanh Toán Tiền Mặt
        Waiter ->> UI: Chọn tiền mặt
        Waiter ->> UI: Nhập số tiền khách đưa
        UI ->> API: POST /bills/:id/pay
        API ->> DB: Cập nhật thanh toán
        DB -->> API: Thành công
    else Thanh Toán Thẻ/Ví
        Waiter ->> UI: Chọn thẻ/ví
        UI ->> Payment: Xử lý giao dịch
        Payment -->> UI: Kết quả thanh toán
        UI ->> API: POST /bills/:id/pay
        API ->> DB: Cập nhật thanh toán
        DB -->> API: Thành công
    end
    
    API -->> UI: Thanh toán hoàn tất
    UI ->> Printer: In hóa đơn
    Printer -->> Waiter: Hóa đơn in xong
    Waiter -->> Customer: Đưa hóa đơn
    
    API ->> DB: Cập nhật trạng thái đơn & bàn
    API ->> DB: Ghi log giao dịch
```

---

## 3. Biểu Đồ Trạng Thái Hóa Đơn (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Pending: Tạo hóa đơn
    
    Pending --> Paid: Thanh toán đầy đủ
    Pending --> PartiallyPaid: Thanh toán một phần
    Pending --> Cancelled: Hủy hóa đơn
    
    PartiallyPaid --> Paid: Thanh toán phần còn lại
    PartiallyPaid --> Cancelled: Hủy
    
    Paid --> Refunded: Hoàn tiền toàn bộ
    Paid --> PartiallyRefunded: Hoàn tiền một phần
    
    PartiallyRefunded --> Refunded: Hoàn phần còn lại
    
    Paid --> Split: Chia hóa đơn
    Split --> [*]
    
    Refunded --> [*]
    Cancelled --> [*]
    
    note right of Pending
        Chờ thanh toán
        Tổng tiền đã xác định
    end note
    
    note right of Paid
        Đã thanh toán đầy đủ
        Có thể hoàn tiền
    end note
    
    note right of PartiallyPaid
        Đã thanh toán một phần
        Còn nợ
    end note
```

---

## 4. Biểu Đồ Cấu Trúc Dữ Liệu (Entity Relationship)

```mermaid
erDiagram
    BILL ||--|| ORDER : "generated from"
    BILL ||--o{ BILL_ITEM : contains
    BILL ||--o{ PAYMENT : "has"
    BILL }o--|| RESTAURANT_TABLE : "for"
    BILL }o--o| STAFF : "handled by"
    
    BILL_ITEM }o--|| MENU_ITEM : references
    
    BILL {
        int billId PK
        string billNumber UK
        int orderId FK UK
        int tableId FK
        int staffId FK
        decimal subtotal
        decimal taxAmount
        decimal taxRate
        decimal discountAmount
        decimal serviceCharge
        decimal totalAmount
        decimal paidAmount
        decimal changeAmount
        string paymentStatus
        string paymentMethod
        string notes
        timestamp createdAt
        timestamp paidAt
        timestamp updatedAt
    }
    
    BILL_ITEM {
        int billItemId PK
        int billId FK
        int itemId FK
        string itemName
        int quantity
        decimal unitPrice
        decimal subtotal
        decimal discount
        decimal total
        timestamp createdAt
    }
    
    PAYMENT {
        int paymentId PK
        int billId FK
        string paymentMethod
        decimal amount
        string transactionId
        string cardNumber
        string cardHolderName
        string status
        string notes
        timestamp paymentDate
        timestamp createdAt
    }
    
    ORDER {
        int orderId PK
        string orderNumber UK
    }
    
    RESTAURANT_TABLE {
        int tableId PK
        string tableNumber UK
    }
    
    STAFF {
        int staffId PK
        string fullName
    }
    
    MENU_ITEM {
        int itemId PK
        string name
        decimal price
    }
```

---

## 5. Biểu Đồ Tính Toán Hóa Đơn (Activity Diagram)

```mermaid
graph LR
    A["📋 Lấy Danh Sách Món"] --> B["💰 Tính Subtotal"]
    B --> C["Σ(Quantity × Price)"]
    C --> D["➕ Phí Dịch Vụ"]
    D --> E{"Loại Phí?"}
    E -->|"%"| F["Subtotal × Rate%"]
    E -->|"Fixed"| G["+ Fixed Amount"]
    F --> H["💵 Subtotal + Service"]
    G --> H
    H --> I["➕ Thuế VAT"]
    I --> J["× Tax Rate%"]
    J --> K["💸 Tổng Trước Giảm"]
    K --> L{"Có<br/>Giảm Giá?"}
    L -->|Có| M["➖ Giảm Giá"]
    M --> N{"Loại?"}
    N -->|"%"| O["Total × Discount%"]
    N -->|"Fixed"| P["- Discount Amount"]
    L -->|Không| Q["🎯 Tổng Cộng"]
    O --> Q
    P --> Q
    Q --> R["✅ Total Amount"]
```

---

## 6. Biểu Đồ Xử Lý Thanh Toán Tiền Mặt (Flow)

```mermaid
flowchart TD
    A["💵 Chọn Thanh Toán Tiền Mặt"] --> B["📊 Hiển Thị Tổng Tiền"]
    B --> C["✏️ Nhập Tiền Khách Đưa"]
    C --> D{"Tiền Đủ?"}
    D -->|Không| E["⚠️ Thông Báo Thiếu"]
    E --> F["�� Số Tiền Thiếu: X VND"]
    F --> C
    D -->|Có| G["🧮 Tính Tiền Thối"]
    G --> H["Change = Received - Total"]
    H --> I["📋 Hiển Thị Tiền Thối"]
    I --> J["✅ Xác Nhận Thanh Toán"]
    J --> K["💾 Lưu Giao Dịch"]
    K --> L["📝 Payment Method: Cash"]
    L --> M["💵 Paid Amount = Total"]
    M --> N["💸 Change Amount = X"]
    N --> O["🔄 Cập Nhật Trạng Thái"]
    O --> P["✓ Payment Status: Paid"]
    P --> Q["🖨️ In Hóa Đơn"]
    Q --> R["✅ Hoàn Tất"]
    
    style D fill:#fff3cd
    style E fill:#ffcdd2
    style R fill:#c8e6c9
```

---

## 7. Biểu Đồ Chia Hóa Đơn (Decision Tree)

```mermaid
graph TD
    A["🍽️ Yêu Cầu Chia Hóa Đơn"] --> B{Cách Chia?}
    
    B -->|Chia Đều| C["👥 Nhập Số Người"]
    C --> D["➗ Total ÷ N"]
    D --> E["📋 Tạo N Hóa Đơn"]
    E --> F["💰 Mỗi HĐ = Total/N"]
    F --> Z["✅ Hoàn Tất"]
    
    B -->|Chia Theo Món| G["📝 Hiển Thị Danh Sách Món"]
    G --> H["🔢 Nhập Số Hóa Đơn"]
    H --> I["1️⃣ Chọn Món Cho HĐ 1"]
    I --> J["💵 Tính Tổng HĐ 1"]
    J --> K["2️⃣ Chọn Món Cho HĐ 2"]
    K --> L["💵 Tính Tổng HĐ 2"]
    L --> M["➕ Phân Bổ Phí & Thuế"]
    M --> N{"Phân Bổ<br/>Theo?"}
    N -->|Tỷ Lệ| O["📊 Theo Tỷ Lệ Tổng Tiền"]
    N -->|Đều| P["➗ Chia Đều"]
    O --> Q["✅ Tạo Các HĐ Mới"]
    P --> Q
    
    B -->|Thủ Công| R["✏️ Nhập Số Tiền Từng HĐ"]
    R --> S{"Tổng Đúng?"}
    S -->|Không| T["⚠️ Tổng Không Khớp"]
    T --> R
    S -->|Có| Q
    
    Q --> U["🔒 Đánh Dấu HĐ Gốc 'Đã Chia'"]
    U --> V["🔗 Liên Kết HĐ Mới Với Gốc"]
    V --> Z
    
    style T fill:#ffcdd2
```

---

## 8. Biểu Đồ Xử Lý Hoàn Tiền (Swimlanes)

```mermaid
graph TB
    subgraph Customer["👤 Khách Hàng"]
        C1["Yêu Cầu Hoàn Tiền"]
        C2["Nhận Tiền Hoàn"]
    end
    
    subgraph Waiter["👨‍💼 Nhân Viên"]
        W1["Tiếp Nhận Yêu Cầu"]
        W2["Nhập Lý Do"]
        W3["Yêu Cầu Xác Nhận QL"]
    end
    
    subgraph Manager["💼 Quản Lý"]
        M1["Xem Yêu Cầu"]
        M2["Kiểm Tra Lý Do"]
        M3{"Chấp Nhận?"}
        M4["Xác Nhận"]
        M5["Từ Chối"]
    end
    
    subgraph System["⚙️ Hệ Thống"]
        S1["Kiểm Tra HĐ"]
        S2["Xử Lý Hoàn Tiền"]
        S3["Cập Nhật Trạng Thái"]
        S4["Ghi Log"]
        S5["Thông Báo Lỗi"]
    end
    
    C1 --> W1
    W1 --> W2
    W2 --> W3
    W3 --> M1
    M1 --> M2
    M2 --> M3
    M3 -->|Có| M4
    M3 -->|Không| M5
    M4 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> C2
    M5 --> S5
    S5 --> W1
```

---

## 9. Biểu Đồ Phân Quyền (Permission Matrix)

```mermaid
graph TB
    A["Phân Quyền Hóa Đơn & Thanh Toán"] --> B["👥 Vai Trò"]
    
    B --> C["👤 Khách Hàng"]
    B --> D["👨‍💼 Nhân Viên Phục Vụ"]
    B --> E["💰 Thu Ngân"]
    B --> F["💼 Quản Lý"]
    B --> G["📊 Kế Toán"]
    B --> H["🔐 Admin"]

    C --> C1["✓ Xem hóa đơn của mình"]
    C --> C2["✗ Tất cả thao tác khác"]

    D --> D1["✓ Tạo hóa đơn"]
    D --> D2["✓ Xem hóa đơn"]
    D --> D3["✓ Áp dụng GG < 10%"]
    D --> D4["✓ In hóa đơn"]
    D --> D5["✓ Thanh toán"]
    D --> D6["✗ Hoàn tiền"]

    E --> E1["✓ Tạo hóa đơn"]
    E --> E2["✓ Xem hóa đơn"]
    E --> E3["✓ Áp dụng giảm giá"]
    E --> E4["✓ In hóa đơn"]
    E --> E5["✓ Thanh toán"]
    E --> E6["✓ Chia hóa đơn"]
    E --> E7["✗ Hoàn tiền (cần QL)"]

    F --> F1["✓ Tất cả quyền"]
    F --> F2["✓ Hoàn tiền"]
    F --> F3["✓ Xem báo cáo"]
    F --> F4["✓ Xác nhận GG lớn"]

    G --> G1["✓ Xem hóa đơn"]
    G --> G2["✓ Xem báo cáo"]
    G --> G3["✓ In hóa đơn"]
    G --> G4["✗ Tạo/Sửa/Thanh toán"]

    H --> H1["✓ Tất cả quyền"]
    H --> H2["✓ Cấu hình hệ thống"]
```

---

## 10. Biểu Đồ Thống Kê Thanh Toán (Pie Chart)

```mermaid
pie title Phân Bổ Phương Thức Thanh Toán Tháng 10
    "Tiền mặt" : 450
    "Thẻ tín dụng" : 320
    "Ví điện tử (MoMo)" : 180
    "Ví điện tử (ZaloPay)" : 120
    "Chuyển khoản" : 80
```

---

## 11. Biểu Đồ Timeline Thanh Toán

```mermaid
timeline
    title Vòng Đời Hóa Đơn
    
    section Tạo Hóa Đơn
        Đơn hàng hoàn tất : Tất cả món đã phục vụ
        Tạo hóa đơn : Tự động từ đơn hàng
        Tính toán : 2 giây
    
    section Xác Nhận
        Kiểm tra : Nhân viên xem lại
        Áp dụng GG : Nếu có
        Hiển thị khách : Xác nhận số tiền
    
    section Thanh Toán
        Chọn phương thức : 10 giây
        Xử lý giao dịch : 5-30 giây
        Xác nhận : Ngay lập tức
    
    section Hoàn Tất
        In hóa đơn : 5 giây
        Cập nhật trạng thái : Ngay lập tức
        Ghi log : Ngay lập tức
```

---

## 12. Biểu Đồ Kiến Trúc Hệ Thống (Component)

```mermaid
graph TB
    subgraph Client["📱 Frontend"]
        UI["🎨 Bill UI"]
        Payment UI["💳 Payment UI"]
        Print["🖨️ Print Manager"]
    end

    subgraph API["🔌 Backend"]
        BillAPI["📋 Bill Service"]
        PaymentAPI["💰 Payment Service"]
        DiscountAPI["🎁 Discount Service"]
        TaxAPI["📊 Tax Calculator"]
    end

    subgraph Data["💾 Database"]
        BillDB["💼 Bill Data"]
        PaymentDB["💳 Payment Data"]
        TransactionLog["📝 Transaction Log"]
    end

    subgraph External["🌐 External"]
        POS["💳 POS Terminal"]
        EWallet["📱 E-wallet Gateway"]
        Bank["🏦 Bank API"]
        ThermalPrinter["🖨️ Thermal Printer"]
    end

    UI --> BillAPI
    PaymentUI --> PaymentAPI
    Print --> ThermalPrinter
    
    BillAPI --> DiscountAPI
    BillAPI --> TaxAPI
    BillAPI --> BillDB
    
    PaymentAPI --> PaymentDB
    PaymentAPI --> TransactionLog
    PaymentAPI --> POS
    PaymentAPI --> EWallet
    PaymentAPI --> Bank
    
    style Client fill:#e3f2fd
    style API fill:#f3e5f5
    style Data fill:#e8f5e9
    style External fill:#fff3e0
```

---

## 13. Biểu Đồ Xử Lý Lỗi Thanh Toán

```mermaid
graph TD
    A["💳 Xử Lý Thanh Toán"] --> B{Kết Quả?}
    
    B -->|Thành Công| C["✅ Cập Nhật HĐ"]
    C --> D["📝 Ghi Log"]
    D --> E["🖨️ In Hóa Đơn"]
    E --> Z["✔️ Hoàn Tất"]
    
    B -->|Thất Bại| F{Loại Lỗi?}
    
    F -->|Không Đủ Tiền| G["⚠️ Thông Báo Thiếu"]
    G --> H["💰 Hiển Thị Số Thiếu"]
    H --> I["🔄 Yêu Cầu Nhập Lại"]
    
    F -->|Thẻ Bị Từ Chối| J["❌ Thẻ Không Hợp Lệ"]
    J --> K["📞 Liên Hệ Ngân Hàng"]
    K --> L["💳 Chọn Phương Thức Khác"]
    
    F -->|Lỗi Kết Nối| M["🔌 Mất Kết Nối"]
    M --> N["🔄 Thử Lại (3 lần)"]
    N --> O{Thành Công?}
    O -->|Có| C
    O -->|Không| P["📝 Thanh Toán Thủ Công"]
    P --> Q["✍️ Ghi Nhận Sau"]
    
    F -->|Lỗi Hệ Thống| R["⚙️ Lỗi Server"]
    R --> S["📧 Thông Báo Admin"]
    S --> T["📝 Ghi Log Lỗi"]
    T --> L
    
    I --> A
    L --> A
    Q --> Z
    
    style G fill:#fff3cd
    style J fill:#ffcdd2
    style M fill:#ffcdd2
    style R fill:#ffcdd2
```

---

## 14. Biểu Đồ Báo Cáo Doanh Thu

```mermaid
graph LR
    A["📊 Yêu Cầu Báo Cáo"] --> B["📅 Chọn Khoảng Thời Gian"]
    B --> C["🔍 Chọn Bộ Lọc"]
    C --> D["⚙️ Hệ Thống Truy Vấn"]
    D --> E["💾 Lấy Dữ Liệu HĐ"]
    E --> F["🧮 Tính Toán"]
    F --> G["📈 Tổng Doanh Thu"]
    F --> H["💳 Theo Phương Thức"]
    F --> I["👨‍💼 Theo Nhân Viên"]
    F --> J["⏰ Theo Ca Làm"]
    G --> K["📊 Tạo Biểu Đồ"]
    H --> K
    I --> K
    J --> K
    K --> L["📄 Xuất Báo Cáo"]
    L --> M{Định Dạng?}
    M -->|PDF| N["📕 File PDF"]
    M -->|Excel| O["📗 File Excel"]
    M -->|CSV| P["📄 File CSV"]
    N --> Q["📧 Gửi Email"]
    O --> Q
    P --> Q
    Q --> R["✅ Hoàn Tất"]
```

---

## 15. Biểu Đồ Use Case Đầy Đủ

```mermaid
graph TB
    subgraph System["🏪 Quản Lý Hóa Đơn & Thanh Toán"]
        UC1["Tạo Hóa Đơn"]
        UC2["Xem Hóa Đơn"]
        UC3["Áp Dụng Giảm Giá"]
        UC4["In Hóa Đơn"]
        UC5["Thanh Toán Tiền Mặt"]
        UC6["Thanh Toán Thẻ"]
        UC7["Thanh Toán Ví Điện Tử"]
        UC8["Thanh Toán Một Phần"]
        UC9["Chia Hóa Đơn"]
        UC10["Hoàn Tiền"]
        UC11["Xem Báo Cáo"]
    end

    A["👤 Khách Hàng"] -->|Xem| UC2

    B["👨‍💼 Nhân Viên Phục Vụ"] -->|Sử Dụng| UC1
    B -->|Sử Dụng| UC2
    B -->|Sử Dụng| UC3
    B -->|Sử Dụng| UC4
    B -->|Sử Dụng| UC5
    B -->|Sử Dụng| UC6
    B -->|Sử Dụng| UC7

    C["💰 Thu Ngân"] -->|Sử Dụng| UC1
    C -->|Sử Dụng| UC2
    C -->|Sử Dụng| UC3
    C -->|Sử Dụng| UC4
    C -->|Sử Dụng| UC5
    C -->|Sử Dụng| UC6
    C -->|Sử Dụng| UC7
    C -->|Sử Dụng| UC8
    C -->|Sử Dụng| UC9

    D["💼 Quản Lý"] -->|Sử Dụng| UC1
    D -->|Sử Dụng| UC2
    D -->|Sử Dụng| UC3
    D -->|Sử Dụng| UC4
    D -->|Sử Dụng| UC5
    D -->|Sử Dụng| UC6
    D -->|Sử Dụng| UC7
    D -->|Sử Dụng| UC8
    D -->|Sử Dụng| UC9
    D -->|Sử Dụng| UC10
    D -->|Sử Dụng| UC11

    E["📊 Kế Toán"] -->|Sử Dụng| UC2
    E -->|Sử Dụng| UC4
    E -->|Sử Dụng| UC11

    F["🔐 Admin"] -->|Sử Dụng| UC1
    F -->|Sử Dụng| UC10
    F -->|Sử Dụng| UC11

    style System fill:#e3f2fd
```

---

## 16. Biểu Đồ Dòng Dữ Liệu Real-time

```mermaid
graph LR
    A["👨‍💼 Nhân Viên<br/>Tạo HĐ"] -->|HTTP POST| B["🔌 Bill API"]
    B -->|Calculate| C["🧮 Tax Calculator"]
    B -->|Check| D["🎁 Discount Service"]
    B -->|Save| E["💾 Database"]
    
    E -->|Trigger| F["📡 WebSocket"]
    F -->|Notify| G["💼 Manager Dashboard"]
    F -->|Update| H["📊 Report System"]
    
    A -->|Payment| I["💳 Payment API"]
    I -->|Process| J{Gateway?}
    J -->|Card| K["💳 POS Terminal"]
    J -->|E-wallet| L["�� MoMo/ZaloPay"]
    J -->|Bank| M["🏦 Bank API"]
    
    K -->|Result| I
    L -->|Result| I
    M -->|Result| I
    
    I -->|Update| E
    I -->|Log| N["📝 Transaction Log"]
    I -->|Notify| F
    
    style A fill:#e3f2fd
    style I fill:#f3e5f5
    style E fill:#e8f5e9
```

---

## Ghi Chú

Các biểu đồ này được tạo bằng **Mermaid** và có thể được:

-   Chỉnh sửa trực tiếp trong markdown
-   Xuất thành hình ảnh PNG/SVG
-   Nhúng vào tài liệu web hoặc wiki
-   Tích hợp vào các công cụ quản lý dự án

**Để sử dụng Mermaid:**

1. GitHub hỗ trợ mermaid trực tiếp trong markdown
2. GitLab cũng hỗ trợ mermaid native
3. Các công cụ khác có thể cần plugin (Notion, Confluence, v.v.)
4. Online editor: https://mermaid.live

**Ứng dụng thực tế:**

-   Đào tạo nhân viên về quy trình thanh toán
-   Tài liệu hướng dẫn sử dụng hệ thống
-   Phân tích và tối ưu quy trình thanh toán
-   Phát triển và bảo trì hệ thống
-   Giao tiếp với stakeholders về luồng thanh toán
