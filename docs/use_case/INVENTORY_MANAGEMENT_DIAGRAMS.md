# Sơ Đồ và Biểu Đồ Quản Lý Tồn Kho

## 1. Giới Thiệu

Tài liệu này cung cấp các sơ đồ trực quan để hiểu rõ hơn về quy trình và nghiệp vụ quản lý tồn kho trong hệ thống nhà hàng.

---

## 2. Sơ Đồ Use Case

### 2.1 Tổng Quan Use Case Quản Lý Tồn Kho

```mermaid
graph TB
    subgraph "Actors"
        Manager[Quản lý kho]
        Staff[Nhân viên kho]
        Chef[Đầu bếp]
        Admin[Quản lý nhà hàng]
        Buyer[Nhân viên mua hàng]
    end
    
    subgraph "Quản lý nguyên liệu"
        UC1[Tạo nguyên liệu]
        UC2[Xem danh sách nguyên liệu]
        UC3[Cập nhật nguyên liệu]
        UC4[Vô hiệu hóa nguyên liệu]
    end
    
    subgraph "Quản lý nhà cung cấp"
        UC5[Thêm nhà cung cấp]
        UC6[Cập nhật nhà cung cấp]
        UC7[Xem lịch sử đơn hàng]
    end
    
    subgraph "Quản lý đơn đặt hàng"
        UC8[Tạo đơn đặt hàng]
        UC9[Xác nhận gửi đơn]
        UC10[Nhận hàng và nhập kho]
        UC11[Hủy đơn hàng]
    end
    
    subgraph "Giao dịch kho"
        UC12[Nhập kho thủ công]
        UC13[Xuất kho]
        UC14[Điều chỉnh tồn kho]
        UC15[Ghi nhận hao hụt]
        UC16[Xem lịch sử giao dịch]
    end
    
    subgraph "Lô hàng và hạn sử dụng"
        UC17[Theo dõi lô hàng]
        UC18[Kiểm tra hàng hết hạn]
        UC19[Cảnh báo sắp hết hạn]
    end
    
    subgraph "Công thức"
        UC20[Thiết lập công thức]
        UC21[Tính chi phí món ăn]
        UC22[Kiểm tra khả dụng món]
    end
    
    subgraph "Báo cáo"
        UC23[Báo cáo tồn kho]
        UC24[Báo cáo nhập-xuất-tồn]
        UC25[Báo cáo hao hụt]
        UC26[Báo cáo hiệu suất]
    end
    
    Manager --> UC1
    Manager --> UC3
    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC8
    Manager --> UC9
    Manager --> UC10
    Manager --> UC14
    
    Staff --> UC2
    Staff --> UC12
    Staff --> UC13
    Staff --> UC15
    Staff --> UC16
    Staff --> UC17
    
    Chef --> UC2
    Chef --> UC20
    Chef --> UC21
    Chef --> UC22
    
    Admin --> UC2
    Admin --> UC7
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    
    Buyer --> UC8
    Buyer --> UC9
    Buyer --> UC11
```

---

## 3. Sơ Đồ Luồng Nghiệp Vụ (Business Process Flow)

### 3.1 Quy Trình Tạo và Quản Lý Nguyên Liệu

```mermaid
flowchart TD
    Start([Bắt đầu]) --> CheckPerm{Có quyền<br>quản lý kho?}
    CheckPerm -->|Không| Deny[Từ chối truy cập]
    CheckPerm -->|Có| Access[Truy cập Quản lý nguyên liệu]
    
    Access --> Action{Chọn<br>hành động}
    
    Action -->|Tạo mới| CreateForm[Hiển thị form tạo]
    CreateForm --> InputData[Nhập thông tin:<br>- Mã, tên, đơn vị<br>- Danh mục<br>- Tồn kho tối thiểu]
    InputData --> ValidateCreate{Dữ liệu<br>hợp lệ?}
    ValidateCreate -->|Không| ErrorCreate[Hiển thị lỗi]
    ErrorCreate --> InputData
    ValidateCreate -->|Có| CheckCode{Mã đã<br>tồn tại?}
    CheckCode -->|Có| ErrorCode[Lỗi: Mã đã được sử dụng]
    ErrorCode --> InputData
    CheckCode -->|Không| SaveCreate[Lưu nguyên liệu]
    SaveCreate --> LogCreate[Ghi log]
    LogCreate --> SuccessCreate[Thông báo thành công]
    
    Action -->|Xem danh sách| LoadList[Load danh sách nguyên liệu]
    LoadList --> ShowList[Hiển thị bảng với:<br>- Mã, tên<br>- Tồn kho<br>- Trạng thái]
    ShowList --> FilterSort{Lọc/<br>Sắp xếp?}
    FilterSort -->|Có| ApplyFilter[Áp dụng bộ lọc]
    ApplyFilter --> ShowList
    FilterSort -->|Không| SelectItem{Chọn<br>nguyên liệu?}
    
    Action -->|Cập nhật| SelectUpdate[Chọn nguyên liệu cần sửa]
    SelectUpdate --> ShowUpdateForm[Hiển thị form với dữ liệu hiện tại]
    ShowUpdateForm --> EditData[Chỉnh sửa thông tin]
    EditData --> ValidateUpdate{Dữ liệu<br>hợp lệ?}
    ValidateUpdate -->|Không| ErrorUpdate[Hiển thị lỗi]
    ErrorUpdate --> EditData
    ValidateUpdate -->|Có| SaveUpdate[Lưu thay đổi]
    SaveUpdate --> LogUpdate[Ghi log thay đổi]
    LogUpdate --> SuccessUpdate[Thông báo thành công]
    
    Action -->|Vô hiệu hóa| SelectDeactivate[Chọn nguyên liệu]
    SelectDeactivate --> ConfirmDeactivate{Xác nhận<br>vô hiệu hóa?}
    ConfirmDeactivate -->|Không| Access
    ConfirmDeactivate -->|Có| SetInactive[Cập nhật isActive = false]
    SetInactive --> LogDeactivate[Ghi log]
    LogDeactivate --> SuccessDeactivate[Thông báo thành công]
    
    SelectItem -->|Có| ViewDetail[Xem chi tiết]
    SelectItem -->|Không| End([Kết thúc])
    ViewDetail --> End
    SuccessCreate --> End
    SuccessUpdate --> End
    SuccessDeactivate --> End
    Deny --> End
```

---

### 3.2 Quy Trình Tạo và Xử Lý Đơn Đặt Hàng

```mermaid
flowchart TD
    Start([Bắt đầu]) --> SelectSupplier[Chọn nhà cung cấp]
    SelectSupplier --> CreatePO[Tạo đơn đặt hàng mới]
    CreatePO --> InputInfo[Nhập thông tin:<br>- Ngày dự kiến nhận<br>- Ghi chú]
    
    InputInfo --> AddItems[Thêm nguyên liệu]
    AddItems --> SelectIngredient[Chọn nguyên liệu]
    SelectIngredient --> InputQuantity[Nhập số lượng và đơn giá]
    InputQuantity --> CalcSubtotal[Tính thành tiền]
    CalcSubtotal --> MoreItems{Thêm<br>nguyên liệu khác?}
    MoreItems -->|Có| SelectIngredient
    MoreItems -->|Không| CalcTotal[Tính tổng:<br>- Subtotal<br>- Tax (10%)<br>- Total Amount]
    
    CalcTotal --> Preview[Xem trước đơn hàng]
    Preview --> ValidatePO{Dữ liệu<br>hợp lệ?}
    ValidatePO -->|Không| Error[Hiển thị lỗi]
    Error --> AddItems
    ValidatePO -->|Có| SaveDraft[Lưu đơn<br>Status: pending]
    
    SaveDraft --> Action{Chọn<br>hành động}
    Action -->|Gửi đơn| ConfirmSend{Xác nhận<br>gửi?}
    ConfirmSend -->|Không| SaveDraft
    ConfirmSend -->|Có| SendOrder[Cập nhật Status: ordered<br>Ghi nhận thời gian gửi]
    SendOrder --> NotifySupplier[Thông báo nhà cung cấp<br>Email/Print]
    NotifySupplier --> WaitReceive[Chờ nhận hàng]
    
    Action -->|Hủy đơn| ConfirmCancel{Xác nhận<br>hủy?}
    ConfirmCancel -->|Không| SaveDraft
    ConfirmCancel -->|Có| InputReason[Nhập lý do hủy]
    InputReason --> CancelOrder[Cập nhật Status: cancelled]
    CancelOrder --> LogCancel[Ghi log]
    LogCancel --> End([Kết thúc])
    
    WaitReceive --> ReceiveGoods[Nhận hàng]
    ReceiveGoods --> CheckQuality[Kiểm tra chất lượng]
    CheckQuality --> InputReceived[Nhập số lượng thực tế nhận]
    InputReceived --> HasExpiry{Nguyên liệu<br>có hạn SD?}
    
    HasExpiry -->|Có| InputBatch[Nhập thông tin lô:<br>- Số lô<br>- Hạn sử dụng<br>- Đơn giá]
    InputBatch --> CreateBatch[Tạo IngredientBatch]
    
    HasExpiry -->|Không| CreateTransaction[Tạo StockTransaction<br>Type: in]
    CreateBatch --> CreateTransaction
    
    CreateTransaction --> UpdateStock[Cập nhật currentStock<br>+= quantity received]
    UpdateStock --> UpdateUnitCost[Cập nhật unitCost<br>trung bình]
    UpdateUnitCost --> CheckComplete{Nhận đủ<br>hàng?}
    
    CheckComplete -->|Có| SetReceived[Status: received<br>Ghi nhận receivedDate]
    CheckComplete -->|Không| NoteShortage[Ghi chú số lượng thiếu]
    NoteShortage --> SetReceived
    
    SetReceived --> PrintReceipt[In phiếu nhập kho]
    PrintReceipt --> CheckStockAlert{Kiểm tra<br>cảnh báo}
    CheckStockAlert --> CheckLowStock{Tồn kho<br>thấp?}
    CheckLowStock -->|Không| End
    CheckLowStock -->|Có| ResolveAlert[Đánh dấu cảnh báo<br>đã xử lý]
    ResolveAlert --> End
```

---

### 3.3 Quy Trình Xuất Kho Tự Động Khi Đơn Hàng

```mermaid
flowchart TD
    Start([Đơn hàng được tạo]) --> LoadOrder[Load thông tin đơn hàng]
    LoadOrder --> GetItems[Lấy danh sách món ăn]
    GetItems --> CheckRecipe{Món có<br>công thức?}
    
    CheckRecipe -->|Không| ManualHandle[Xử lý thủ công]
    ManualHandle --> End([Kết thúc])
    
    CheckRecipe -->|Có| LoadRecipe[Load công thức món ăn]
    LoadRecipe --> CalcNeeded[Tính tổng nguyên liệu cần:<br>quantity × số phần]
    CalcNeeded --> GroupIngredients[Gộp nguyên liệu<br>giống nhau]
    
    GroupIngredients --> ForEachIngredient[Với mỗi nguyên liệu]
    ForEachIngredient --> CheckStock{currentStock<br>>= quantity?}
    
    CheckStock -->|Không| NotEnough[Đánh dấu món<br>không khả dụng]
    NotEnough --> NotifyStaff[Thông báo nhân viên]
    NotifyStaff --> SuggestAlternative[Gợi ý món thay thế]
    SuggestAlternative --> End
    
    CheckStock -->|Có| OrderConfirmed{Đơn hàng<br>confirmed?}
    OrderConfirmed -->|Không| MoreIngredients{Còn nguyên<br>liệu khác?}
    OrderConfirmed -->|Có| StatusPreparing{Status =<br>preparing?}
    
    StatusPreparing -->|Không| MoreIngredients
    StatusPreparing -->|Có| DeductStock[Trừ tồn kho]
    
    DeductStock --> FindBatches[Tìm các lô hàng<br>còn tồn]
    FindBatches --> SortBatches[Sắp xếp theo<br>receivedDate ASC]
    SortBatches --> DeductFIFO[Trừ theo FIFO:<br>Lô cũ nhất trước]
    DeductFIFO --> UpdateBatch[Cập nhật<br>remainingQuantity]
    UpdateBatch --> CreateStockTx[Tạo StockTransaction<br>Type: out]
    
    CreateStockTx --> UpdateCurrentStock[Cập nhật currentStock<br>-= quantity]
    UpdateCurrentStock --> CheckLowStock{currentStock <<br>minimumStock?}
    
    CheckLowStock -->|Có| CreateAlert[Tạo StockAlert<br>Type: low_stock]
    CreateAlert --> NotifyManager[Thông báo quản lý kho]
    NotifyManager --> MoreIngredients
    
    CheckLowStock -->|Không| MoreIngredients
    
    MoreIngredients -->|Có| ForEachIngredient
    MoreIngredients -->|Không| Complete[Hoàn tất xuất kho]
    Complete --> LogSuccess[Ghi log thành công]
    LogSuccess --> End
```

---

### 3.4 Quy Trình Cảnh Báo Tồn Kho và Xử Lý

```mermaid
flowchart TD
    Start([Cron Job hàng ngày]) --> CheckTime{Đến giờ<br>chạy job?}
    CheckTime -->|Không| Wait[Chờ]
    Wait --> CheckTime
    CheckTime -->|Có| StartJob[Bắt đầu kiểm tra]
    
    StartJob --> LoadIngredients[Load tất cả nguyên liệu<br>đang hoạt động]
    LoadIngredients --> ForEachIng[Với mỗi nguyên liệu]
    
    ForEachIng --> CheckLowStock{currentStock <<br>minimumStock?}
    CheckLowStock -->|Có| CheckExistingAlert{Đã có<br>cảnh báo?}
    CheckExistingAlert -->|Có| NextCheck1
    CheckExistingAlert -->|Không| CreateLowAlert[Tạo StockAlert<br>Type: low_stock]
    CreateLowAlert --> CalcSuggest[Tính số lượng<br>cần đặt]
    CalcSuggest --> FindSupplier[Tìm nhà cung cấp<br>ưu tiên]
    FindSupplier --> NotifyLow[Gửi thông báo:<br>- Quản lý kho<br>- Nhân viên mua hàng]
    NotifyLow --> NextCheck1[Tiếp tục kiểm tra]
    
    CheckLowStock -->|Không| NextCheck1
    NextCheck1 --> LoadBatches[Load các lô hàng<br>của nguyên liệu]
    LoadBatches --> ForEachBatch[Với mỗi lô]
    
    ForEachBatch --> CheckExpired{Đã<br>hết hạn?}
    CheckExpired -->|Có| CreateExpiredAlert[Tạo StockAlert<br>Type: expired]
    CreateExpiredAlert --> NotifyExpired[Thông báo khẩn cấp]
    NotifyExpired --> NextBatch
    
    CheckExpired -->|Không| CheckExpiringSoon{Sắp hết hạn?<br>< 7 ngày}
    CheckExpiringSoon -->|Có| CheckExpiringAlert{Đã có<br>cảnh báo?}
    CheckExpiringAlert -->|Có| NextBatch
    CheckExpiringAlert -->|Không| CreateExpiringAlert[Tạo StockAlert<br>Type: expiring_soon]
    CreateExpiringAlert --> NotifyExpiring[Gửi thông báo]
    NotifyExpiring --> NextBatch
    
    CheckExpiringSoon -->|Không| NextBatch[Lô tiếp theo]
    NextBatch --> MoreBatches{Còn lô<br>khác?}
    MoreBatches -->|Có| ForEachBatch
    MoreBatches -->|Không| NextIngredient
    
    NextIngredient --> MoreIngredients{Còn nguyên<br>liệu khác?}
    MoreIngredients -->|Có| ForEachIng
    MoreIngredients -->|Không| GenerateReport[Tạo báo cáo tổng hợp]
    
    GenerateReport --> SendDailySummary[Gửi email tóm tắt<br>cho quản lý]
    SendDailySummary --> UpdateDashboard[Cập nhật dashboard<br>cảnh báo]
    UpdateDashboard --> End([Kết thúc job])
    
    subgraph "Xử lý cảnh báo bởi người dùng"
        UserView[Xem danh sách cảnh báo]
        UserView --> SelectAlert[Chọn cảnh báo]
        SelectAlert --> ReviewAlert[Xem chi tiết]
        ReviewAlert --> DecideAction{Chọn<br>hành động}
        
        DecideAction -->|Tạo đơn hàng| CreatePO[Tạo đơn đặt hàng]
        DecideAction -->|Điều chỉnh tối thiểu| AdjustMin[Cập nhật minimumStock]
        DecideAction -->|Xử lý hết hạn| ProcessExpired[Ghi nhận hao hụt]
        DecideAction -->|Khác| OtherAction[Hành động khác]
        
        CreatePO --> ResolveAlert[Đánh dấu đã xử lý]
        AdjustMin --> ResolveAlert
        ProcessExpired --> ResolveAlert
        OtherAction --> ResolveAlert
        
        ResolveAlert --> LogResolution[Ghi log xử lý:<br>- Người xử lý<br>- Hành động<br>- Thời gian]
        LogResolution --> DoneAlert([Hoàn tất])
    end
```

---

### 3.5 Quy Trình Kiểm Kê và Điều Chỉnh Tồn Kho

```mermaid
flowchart TD
    Start([Bắt đầu kiểm kê]) --> Plan[Lập kế hoạch kiểm kê]
    Plan --> Schedule[Xác định thời gian]
    Schedule --> AssignStaff[Phân công nhân sự]
    AssignStaff --> PrintList[In danh sách nguyên liệu]
    
    PrintList --> CountPhysical[Đếm thực tế từng nguyên liệu]
    CountPhysical --> RecordSheet[Ghi vào phiếu kiểm kê]
    RecordSheet --> CheckExpiry[Kiểm tra hạn sử dụng]
    CheckExpiry --> CheckQuality[Kiểm tra chất lượng]
    
    CheckQuality --> MoreItems{Còn nguyên<br>liệu khác?}
    MoreItems -->|Có| CountPhysical
    MoreItems -->|Không| InputSystem[Nhập số liệu vào hệ thống]
    
    InputSystem --> Compare[So sánh với tồn kho hệ thống]
    Compare --> ForEachItem[Với mỗi nguyên liệu]
    ForEachItem --> CalcDiff[Tính chênh lệch:<br>actual - system]
    
    CalcDiff --> HasDiff{Có<br>chênh lệch?}
    HasDiff -->|Không| NextItem
    HasDiff -->|Có| InvestigateReason[Điều tra nguyên nhân]
    
    InvestigateReason --> ReasonFound{Tìm ra<br>nguyên nhân?}
    ReasonFound -->|Có| DocumentReason[Ghi nhận nguyên nhân]
    ReasonFound -->|Không| MarkUnknown[Đánh dấu chưa rõ]
    
    DocumentReason --> NeedAdjust{Cần điều<br>chỉnh?}
    MarkUnknown --> NeedAdjust
    
    NeedAdjust -->|Có| CreateAdjustment[Tạo giao dịch điều chỉnh]
    CreateAdjustment --> SelectType{Chênh lệch<br>dương/âm?}
    
    SelectType -->|Dương| AdjustIn[Type: adjustment<br>Quantity: + diff]
    SelectType -->|Âm| AdjustOut[Type: adjustment<br>Quantity: - diff]
    
    AdjustIn --> UpdateStock[Cập nhật currentStock]
    AdjustOut --> UpdateStock
    
    UpdateStock --> LogAdjust[Ghi log chi tiết:<br>- Người thực hiện<br>- Lý do<br>- Số lượng]
    LogAdjust --> NextItem
    
    NeedAdjust -->|Không| NextItem[Nguyên liệu tiếp theo]
    NextItem --> MoreToCheck{Còn nguyên<br>liệu khác?}
    MoreToCheck -->|Có| ForEachItem
    MoreToCheck -->|Không| ProcessExpired[Xử lý hàng hết hạn]
    
    ProcessExpired --> ForEachExpired[Với mỗi hàng hết hạn]
    ForEachExpired --> CreateWaste[Tạo giao dịch hao hụt<br>Type: waste]
    CreateWaste --> DeductExpired[Trừ tồn kho]
    DeductExpired --> MoreExpired{Còn hàng<br>hết hạn khác?}
    MoreExpired -->|Có| ForEachExpired
    MoreExpired -->|Không| GenerateReport[Tạo báo cáo kiểm kê]
    
    GenerateReport --> CalcAccuracy[Tính độ chính xác:<br>accuracy %]
    CalcAccuracy --> CalcLoss[Tính giá trị hao hụt]
    CalcLoss --> Recommendations[Đề xuất cải tiến]
    Recommendations --> ApproveReport{Phê duyệt<br>báo cáo?}
    
    ApproveReport -->|Không| ReviseReport[Xem xét lại]
    ReviseReport --> GenerateReport
    ApproveReport -->|Có| FinalizeReport[Hoàn tất báo cáo]
    FinalizeReport --> SendToManagement[Gửi báo cáo<br>cho ban quản lý]
    SendToManagement --> ArchiveReport[Lưu trữ hồ sơ]
    ArchiveReport --> End([Kết thúc])
```

---

## 4. Sơ Đồ Sequence (Trình Tự)

### 4.1 Sequence: Tạo Đơn Đặt Hàng

```mermaid
sequenceDiagram
    actor User as Quản lý kho
    participant UI as Giao diện
    participant API as API Server
    participant PO as PurchaseOrderService
    participant Repo as Repository
    participant DB as Database
    participant Email as Email Service
    
    User->>UI: Nhấn "Tạo đơn đặt hàng"
    UI->>API: POST /api/purchase-orders
    API->>PO: createPurchaseOrder(data)
    
    PO->>Repo: validateSupplier(supplierId)
    Repo->>DB: SELECT * FROM suppliers WHERE id=?
    DB-->>Repo: Supplier data
    Repo-->>PO: Valid
    
    PO->>Repo: validateIngredients(items)
    Repo->>DB: SELECT * FROM ingredients WHERE id IN (?)
    DB-->>Repo: Ingredients data
    Repo-->>PO: Valid
    
    PO->>PO: calculateTotals(items)
    Note over PO: subtotal = Σ(quantity × unitPrice)<br>taxAmount = subtotal × 0.1<br>totalAmount = subtotal + taxAmount
    
    PO->>Repo: createPurchaseOrder(orderData)
    Repo->>DB: INSERT INTO purchase_orders
    DB-->>Repo: purchaseOrderId
    
    PO->>Repo: createPurchaseOrderItems(items)
    Repo->>DB: INSERT INTO purchase_order_items
    DB-->>Repo: Success
    
    Repo-->>PO: Purchase Order created
    PO-->>API: Success response
    API-->>UI: 201 Created
    UI-->>User: Hiển thị thông báo thành công
    
    alt Gửi đơn cho nhà cung cấp
        User->>UI: Nhấn "Xác nhận gửi"
        UI->>API: PATCH /api/purchase-orders/:id/send
        API->>PO: sendPurchaseOrder(orderId)
        PO->>Repo: updateStatus(orderId, "ordered")
        Repo->>DB: UPDATE purchase_orders SET status='ordered'
        DB-->>Repo: Success
        
        PO->>Email: sendToSupplier(orderDetails)
        Email-->>PO: Email sent
        PO-->>API: Success
        API-->>UI: 200 OK
        UI-->>User: "Đơn hàng đã được gửi"
    end
```

---

### 4.2 Sequence: Nhận Hàng và Nhập Kho

```mermaid
sequenceDiagram
    actor User as Nhân viên kho
    participant UI as Giao diện
    participant API as API Server
    participant PO as PurchaseOrderService
    participant Stock as StockService
    participant Batch as BatchService
    participant Repo as Repository
    participant DB as Database
    participant Alert as AlertService
    
    User->>UI: Mở đơn hàng cần nhận
    UI->>API: GET /api/purchase-orders/:id
    API->>PO: getPurchaseOrder(id)
    PO->>Repo: findById(id)
    Repo->>DB: SELECT with items
    DB-->>Repo: Order data
    Repo-->>PO: Purchase Order
    PO-->>API: Order details
    API-->>UI: 200 OK
    UI-->>User: Hiển thị chi tiết đơn
    
    User->>UI: Nhấn "Nhận hàng"
    UI-->>User: Form nhập số lượng thực tế
    User->>UI: Nhập số lượng và thông tin lô
    UI->>API: POST /api/purchase-orders/:id/receive
    
    API->>PO: receivePurchaseOrder(id, receivedData)
    PO->>DB: BEGIN TRANSACTION
    
    loop Cho mỗi nguyên liệu
        PO->>Batch: createBatch(ingredientId, batchData)
        Batch->>Repo: createIngredientBatch(data)
        Repo->>DB: INSERT INTO ingredient_batches
        DB-->>Repo: batchId
        
        Batch->>Stock: createStockTransaction(data)
        Note over Stock: type = "in"<br>quantity = receivedQuantity
        Stock->>Repo: createTransaction(data)
        Repo->>DB: INSERT INTO stock_transactions
        DB-->>Repo: transactionId
        
        Stock->>Repo: updateIngredientStock(ingredientId)
        Repo->>DB: UPDATE ingredients<br>SET currentStock = currentStock + quantity
        DB-->>Repo: Success
        
        Stock->>Repo: updateUnitCost(ingredientId, newCost)
        Note over Stock: Tính trung bình gia quyền
        Repo->>DB: UPDATE ingredients SET unitCost = ?
        DB-->>Repo: Success
        
        Stock->>Alert: checkLowStock(ingredientId)
        Alert->>DB: SELECT currentStock, minimumStock
        DB-->>Alert: Stock levels
        
        alt Tồn kho đã đủ
            Alert->>DB: UPDATE stock_alerts<br>SET isResolved = true<br>WHERE type = 'low_stock'
            DB-->>Alert: Success
        end
    end
    
    PO->>Repo: updatePurchaseOrderStatus(id, "received")
    Repo->>DB: UPDATE purchase_orders<br>SET status='received', receivedDate=NOW()
    DB-->>Repo: Success
    
    PO->>Repo: updateReceivedQuantities(items)
    Repo->>DB: UPDATE purchase_order_items<br>SET receivedQuantity = ?
    DB-->>Repo: Success
    
    PO->>DB: COMMIT TRANSACTION
    DB-->>PO: Success
    
    PO-->>API: Success response
    API-->>UI: 200 OK
    UI-->>User: "Đã nhận hàng và cập nhật tồn kho"
    
    UI->>UI: In phiếu nhập kho
```

---

### 4.3 Sequence: Xuất Kho Tự Động Khi Đơn Hàng

```mermaid
sequenceDiagram
    actor Waiter as Nhân viên phục vụ
    participant UI as Giao diện
    participant API as API Server
    participant Order as OrderService
    participant Recipe as RecipeService
    participant Stock as StockService
    participant Batch as BatchService
    participant Alert as AlertService
    participant DB as Database
    participant WS as WebSocket
    
    Waiter->>UI: Tạo đơn hàng
    UI->>API: POST /api/orders
    API->>Order: createOrder(orderData)
    Order->>DB: INSERT INTO orders
    DB-->>Order: orderId
    Order-->>API: Order created (status: pending)
    API-->>UI: 201 Created
    
    Waiter->>UI: Xác nhận đơn hàng
    UI->>API: PATCH /api/orders/:id/confirm
    API->>Order: confirmOrder(orderId)
    
    Order->>Recipe: checkAvailability(orderItems)
    
    loop Cho mỗi món ăn
        Recipe->>DB: SELECT recipes WHERE itemId = ?
        DB-->>Recipe: Recipe ingredients
        
        loop Cho mỗi nguyên liệu
            Recipe->>DB: SELECT currentStock FROM ingredients
            DB-->>Recipe: Stock level
            Recipe->>Recipe: Check: currentStock >= needed?
        end
    end
    
    alt Không đủ nguyên liệu
        Recipe-->>Order: Insufficient stock
        Order-->>API: Error 400
        API-->>UI: "Không đủ nguyên liệu"
        UI-->>Waiter: Hiển thị lỗi
    else Đủ nguyên liệu
        Order->>DB: UPDATE orders SET status='confirmed'
        DB-->>Order: Success
        
        Waiter->>UI: Chuyển sang bếp
        UI->>API: PATCH /api/orders/:id/preparing
        API->>Order: startPreparing(orderId)
        Order->>DB: UPDATE orders SET status='preparing'
        
        Order->>Stock: deductIngredientsForOrder(orderId)
        Stock->>Recipe: getIngredientsNeeded(orderItems)
        Recipe->>DB: SELECT recipes
        DB-->>Recipe: Ingredients list
        Recipe-->>Stock: Aggregated ingredients
        
        Stock->>DB: BEGIN TRANSACTION
        
        loop Cho mỗi nguyên liệu
            Stock->>Batch: deductFromBatches(ingredientId, quantity)
            Batch->>DB: SELECT * FROM ingredient_batches<br>WHERE remainingQuantity > 0<br>ORDER BY receivedDate ASC
            DB-->>Batch: Batches (FIFO)
            
            loop Trừ dần từng lô
                Batch->>DB: UPDATE ingredient_batches<br>SET remainingQuantity -= ?
                DB-->>Batch: Success
            end
            
            Stock->>DB: INSERT INTO stock_transactions<br>type='out', referenceType='order'
            DB-->>Stock: transactionId
            
            Stock->>DB: UPDATE ingredients<br>SET currentStock -= quantity
            DB-->>Stock: Success
            
            Stock->>Alert: checkAfterDeduction(ingredientId)
            Alert->>DB: SELECT currentStock, minimumStock
            DB-->>Alert: Stock levels
            
            alt Tồn kho thấp
                Alert->>DB: INSERT INTO stock_alerts<br>type='low_stock'
                DB-->>Alert: alertId
                Alert->>WS: notifyManagers(alertData)
                WS-->>UI: Real-time notification
            end
        end
        
        Stock->>DB: COMMIT TRANSACTION
        DB-->>Stock: Success
        
        Stock-->>Order: Deduction complete
        Order-->>API: Success
        API-->>UI: 200 OK
        UI-->>Waiter: "Đơn hàng đã gửi bếp"
    end
```

---

## 5. Sơ Đồ Cấu Trúc Database (ERD Focus)

### 5.1 ERD - Quan Hệ Các Bảng Inventory

```mermaid
erDiagram
    INGREDIENT_CATEGORIES ||--o{ INGREDIENTS : "belongs_to"
    INGREDIENTS ||--o{ RECIPES : "used_in"
    MENU_ITEMS ||--o{ RECIPES : "has"
    INGREDIENTS ||--o{ STOCK_TRANSACTIONS : "has"
    INGREDIENTS ||--o{ INGREDIENT_BATCHES : "has"
    INGREDIENTS ||--o{ STOCK_ALERTS : "triggers"
    INGREDIENTS ||--o{ PURCHASE_ORDER_ITEMS : "ordered"
    
    SUPPLIERS ||--o{ PURCHASE_ORDERS : "supplies"
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : "contains"
    PURCHASE_ORDERS ||--o{ INGREDIENT_BATCHES : "creates"
    
    STAFF ||--o{ PURCHASE_ORDERS : "creates"
    STAFF ||--o{ STOCK_TRANSACTIONS : "performs"
    STAFF ||--o{ STOCK_ALERTS : "resolves"
    
    INGREDIENT_CATEGORIES {
        int categoryId PK
        string categoryName
        text description
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    INGREDIENTS {
        int ingredientId PK
        string ingredientCode UK
        string ingredientName
        string unit
        int categoryId FK
        decimal minimumStock
        decimal currentStock
        decimal unitCost
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    RECIPES {
        int recipeId PK
        int itemId FK
        int ingredientId FK
        decimal quantity
        string unit
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
    
    SUPPLIERS {
        int supplierId PK
        string supplierCode UK
        string supplierName
        string contactPerson
        string phoneNumber
        string email
        text address
        string taxCode
        string paymentTerms
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    PURCHASE_ORDERS {
        int purchaseOrderId PK
        string orderNumber UK
        int supplierId FK
        int staffId FK
        timestamp orderDate
        date expectedDate
        date receivedDate
        enum status
        decimal subtotal
        decimal taxAmount
        decimal totalAmount
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
    
    PURCHASE_ORDER_ITEMS {
        int itemId PK
        int purchaseOrderId FK
        int ingredientId FK
        decimal quantity
        string unit
        decimal unitPrice
        decimal subtotal
        decimal receivedQuantity
        timestamp createdAt
    }
    
    STOCK_TRANSACTIONS {
        int transactionId PK
        int ingredientId FK
        enum transactionType
        decimal quantity
        string unit
        string referenceType
        int referenceId
        int staffId FK
        text notes
        timestamp transactionDate
        timestamp createdAt
    }
    
    INGREDIENT_BATCHES {
        int batchId PK
        int ingredientId FK
        int purchaseOrderId FK
        string batchNumber
        decimal quantity
        decimal remainingQuantity
        string unit
        decimal unitCost
        date expiryDate
        date receivedDate
        timestamp createdAt
        timestamp updatedAt
    }
    
    STOCK_ALERTS {
        int alertId PK
        int ingredientId FK
        enum alertType
        text message
        boolean isResolved
        timestamp resolvedAt
        int resolvedBy FK
        timestamp createdAt
    }
```

---

## 6. Sơ Đồ Trạng Thái (State Diagram)

### 6.1 Trạng Thái Đơn Đặt Hàng

```mermaid
stateDiagram-v2
    [*] --> pending: Tạo đơn mới
    
    pending --> ordered: Xác nhận gửi
    pending --> cancelled: Hủy đơn
    
    ordered --> received: Nhận đầy đủ hàng
    ordered --> partial_received: Nhận một phần
    ordered --> cancelled: Hủy đơn
    
    partial_received --> received: Nhận đủ phần còn lại
    partial_received --> cancelled: Hủy phần còn lại
    
    received --> [*]
    cancelled --> [*]
    
    note right of pending
        Đơn đang soạn thảo
        Có thể chỉnh sửa
    end note
    
    note right of ordered
        Đã gửi nhà cung cấp
        Không thể chỉnh sửa
    end note
    
    note right of received
        Đã hoàn thành
        Tồn kho đã cập nhật
    end note
```

---

### 6.2 Trạng Thái Cảnh Báo Tồn Kho

```mermaid
stateDiagram-v2
    [*] --> active: Phát hiện vấn đề
    
    active --> in_progress: Bắt đầu xử lý
    active --> dismissed: Bỏ qua (không cần xử lý)
    
    in_progress --> resolved: Xử lý xong
    in_progress --> active: Quay lại (chưa giải quyết được)
    
    resolved --> [*]
    dismissed --> [*]
    
    note right of active
        Types:
        - low_stock
        - expiring_soon
        - expired
    end note
    
    note right of in_progress
        Hành động đang thực hiện:
        - Tạo đơn đặt hàng
        - Điều chỉnh tồn kho
        - Xử lý hao hụt
    end note
    
    note right of resolved
        Đã xử lý:
        - Ghi nhận người xử lý
        - Ghi nhận hành động
        - Ghi nhận thời gian
    end note
```

---

## 7. Sơ Đồ Hoạt Động (Activity Diagram)

### 7.1 Activity: Quản Lý Hạn Sử Dụng

```mermaid
flowchart TD
    Start([Hệ thống khởi động]) --> ScheduleJob[Đặt lịch job hàng ngày]
    ScheduleJob --> WaitTrigger[Chờ đến giờ chạy<br>6:00 AM mỗi ngày]
    
    WaitTrigger --> StartJob[Bắt đầu job]
    StartJob --> LoadBatches[Load tất cả lô hàng<br>còn tồn]
    
    LoadBatches --> CheckExpiry{Kiểm tra<br>hạn sử dụng}
    
    CheckExpiry -->|Hết hạn| Expired[Đã hết hạn]
    CheckExpiry -->|< 7 ngày| ExpiringSoon[Sắp hết hạn]
    CheckExpiry -->|> 7 ngày| OK[Còn tốt]
    
    Expired --> CreateExpiredAlert[Tạo cảnh báo<br>Type: expired]
    CreateExpiredAlert --> NotifyUrgent[Thông báo khẩn cấp]
    NotifyUrgent --> MarkForRemoval[Đánh dấu cần xử lý]
    
    ExpiringSoon --> CheckExistingAlert{Đã có<br>cảnh báo?}
    CheckExistingAlert -->|Có| UpdateAlert[Cập nhật cảnh báo]
    CheckExistingAlert -->|Không| CreateExpiringAlert[Tạo cảnh báo<br>Type: expiring_soon]
    CreateExpiringAlert --> NotifyWarning[Gửi cảnh báo]
    UpdateAlert --> NotifyWarning
    NotifyWarning --> SuggestAction[Gợi ý hành động]
    
    OK --> NextBatch
    MarkForRemoval --> NextBatch
    SuggestAction --> NextBatch[Lô tiếp theo]
    
    NextBatch --> MoreBatches{Còn lô<br>khác?}
    MoreBatches -->|Có| CheckExpiry
    MoreBatches -->|Không| GenerateSummary[Tạo báo cáo tóm tắt]
    
    GenerateSummary --> SendReport[Gửi báo cáo<br>cho quản lý]
    SendReport --> UpdateDashboard[Cập nhật dashboard]
    UpdateDashboard --> JobComplete[Hoàn thành job]
    JobComplete --> WaitTrigger
```

---

## 8. Sơ Đồ Triển Khai (Deployment Diagram)

### 8.1 Architecture Overview - Inventory Module

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway"
        Nginx[Nginx Reverse Proxy]
    end
    
    subgraph "Application Layer"
        API[Express API Server]
        WS[WebSocket Server]
        
        subgraph "Services"
            IngredientSvc[IngredientService]
            StockSvc[StockService]
            POSvc[PurchaseOrderService]
            AlertSvc[AlertService]
            RecipeSvc[RecipeService]
        end
        
        subgraph "Repositories"
            IngredientRepo[IngredientRepository]
            StockRepo[StockRepository]
            PORepo[PurchaseOrderRepository]
        end
    end
    
    subgraph "Background Jobs"
        Cron[Cron Jobs]
        AlertJob[Alert Checker]
        ExpiryJob[Expiry Checker]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
    end
    
    subgraph "External Services"
        Email[Email Service]
        SMS[SMS Gateway]
    end
    
    Web --> Nginx
    Mobile --> Nginx
    Nginx --> API
    Nginx --> WS
    
    API --> IngredientSvc
    API --> StockSvc
    API --> POSvc
    API --> RecipeSvc
    
    IngredientSvc --> IngredientRepo
    StockSvc --> StockRepo
    POSvc --> PORepo
    
    IngredientRepo --> DB
    StockRepo --> DB
    PORepo --> DB
    
    IngredientSvc --> Redis
    StockSvc --> Redis
    
    AlertSvc --> WS
    AlertSvc --> Email
    AlertSvc --> SMS
    
    Cron --> AlertJob
    Cron --> ExpiryJob
    AlertJob --> AlertSvc
    ExpiryJob --> AlertSvc
    
    AlertJob --> DB
    ExpiryJob --> DB
```

---

## 9. Sơ Đồ Luồng Dữ Liệu (Data Flow)

### 9.1 Data Flow: Từ Đặt Hàng Đến Cập Nhật Tồn Kho

```mermaid
flowchart LR
    subgraph "Input"
        User[Quản lý kho]
        Supplier[Nhà cung cấp]
    end
    
    subgraph "Process"
        CreatePO[Tạo đơn<br>đặt hàng]
        SendPO[Gửi đơn]
        ReceiveGoods[Nhận hàng]
        CreateBatch[Tạo lô hàng]
        CreateTx[Tạo giao dịch<br>nhập kho]
        UpdateStock[Cập nhật<br>tồn kho]
        CheckAlert[Kiểm tra<br>cảnh báo]
    end
    
    subgraph "Data Store"
        PODB[(Purchase Orders)]
        BatchDB[(Ingredient Batches)]
        TxDB[(Stock Transactions)]
        IngDB[(Ingredients)]
        AlertDB[(Stock Alerts)]
    end
    
    subgraph "Output"
        Report[Phiếu nhập kho]
        Notification[Thông báo]
        Dashboard[Dashboard]
    end
    
    User -->|Thông tin đơn hàng| CreatePO
    CreatePO -->|Lưu| PODB
    PODB -->|Đọc| SendPO
    SendPO -->|Email/Print| Supplier
    
    Supplier -.->|Giao hàng| ReceiveGoods
    User -->|Xác nhận nhận| ReceiveGoods
    ReceiveGoods -->|Thông tin lô| CreateBatch
    CreateBatch -->|Lưu| BatchDB
    
    ReceiveGoods -->|Số lượng nhập| CreateTx
    CreateTx -->|Lưu| TxDB
    TxDB -->|Tổng hợp| UpdateStock
    UpdateStock -->|Cập nhật| IngDB
    
    IngDB -->|currentStock| CheckAlert
    CheckAlert -->|Nếu resolved| AlertDB
    AlertDB -->|Đọc| Notification
    
    ReceiveGoods -->|In| Report
    AlertDB -->|Hiển thị| Dashboard
    IngDB -->|Hiển thị| Dashboard
```

---

## 10. Biểu Đồ Thống Kê và Dashboard

### 10.1 Dashboard KPIs - Inventory Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 Tổng Giá Trị Tồn Kho          🔴 Cảnh Báo Cần Xử Lý       │
│     1,250,000,000 VNĐ                   12 cảnh báo           │
│                                                                 │
│  📊 Vòng Quay Kho                 ⏰ Hàng Sắp Hết Hạn         │
│     8.5 lần/năm                         5 lô hàng             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Top 5 Nguyên Liệu Giá Trị Cao:                               │
│  ┌──────────────────────────┬─────────────┬──────────────┐   │
│  │ Nguyên liệu              │ Tồn kho     │ Giá trị      │   │
│  ├──────────────────────────┼─────────────┼──────────────┤   │
│  │ 🥩 Thịt bò Úc           │ 250 kg      │ 75,000,000   │   │
│  │ 🦞 Tôm hùm              │ 50 kg       │ 45,000,000   │   │
│  │ 🐟 Cá hồi Na Uy         │ 80 kg       │ 32,000,000   │   │
│  │ 🧈 Bơ Pháp              │ 100 kg      │ 15,000,000   │   │
│  │ 🍄 Nấm truffle          │ 5 kg        │ 12,500,000   │   │
│  └──────────────────────────┴─────────────┴──────────────┘   │
│                                                                 │
│  Cảnh Báo Tồn Kho Thấp:                                       │
│  ┌──────────────────────────┬─────────────┬──────────────┐   │
│  │ Nguyên liệu              │ Hiện tại    │ Tối thiểu    │   │
│  ├──────────────────────────┼─────────────┼──────────────┤   │
│  │ 🌾 Gạo                   │ 20 kg       │ 50 kg        │   │
│  │ 🧅 Hành tây              │ 5 kg        │ 10 kg        │   │
│  │ 🥕 Cà rốt                │ 8 kg        │ 15 kg        │   │
│  │ 🧄 Tỏi                   │ 3 kg        │ 5 kg         │   │
│  │ 🫑 Ớt chuông             │ 4 kg        │ 8 kg         │   │
│  └──────────────────────────┴─────────────┴──────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Biểu Đồ Nhập-Xuất-Tồn (30 ngày):                             │
│                                                                 │
│  Giá trị                                                        │
│  (triệu)                                                        │
│   150├─────────────────────────────────────────────          │
│      │         ╱╲                  ╱╲                          │
│   100├────────╱──╲────────────────╱──╲────────────          │
│      │       ╱    ╲              ╱    ╲                        │
│    50├──────╱──────╲────────────╱──────╲──────────          │
│      │     ╱        ╲          ╱        ╲                      │
│     0└─────────────────────────────────────────────          │
│       1    7    14    21    28   (ngày)                        │
│       ─── Nhập    ─── Xuất    ─── Tồn                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Kết Luận

Các sơ đồ trong tài liệu này cung cấp cái nhìn trực quan về:

1. **Use Case Diagrams**: Ai làm gì trong hệ thống
2. **Business Process Flows**: Quy trình nghiệp vụ chi tiết
3. **Sequence Diagrams**: Tương tác giữa các thành phần
4. **ERD**: Cấu trúc dữ liệu và quan hệ
5. **State Diagrams**: Vòng đời của các đối tượng
6. **Activity Diagrams**: Luồng hoạt động tự động
7. **Deployment Diagrams**: Kiến trúc hệ thống
8. **Data Flow Diagrams**: Luồng dữ liệu

Các sơ đồ này giúp:
- ✅ Hiểu rõ quy trình nghiệp vụ
- ✅ Phát triển và bảo trì hệ thống dễ dàng
- ✅ Đào tạo nhân viên mới
- ✅ Trao đổi với stakeholders
- ✅ Tài liệu hóa kiến thức

---

**Lưu ý**: Các sơ đồ sử dụng cú pháp Mermaid, có thể render trực tiếp trên:
- GitHub
- GitLab
- Markdown editors hỗ trợ Mermaid
- VS Code với extension Mermaid
