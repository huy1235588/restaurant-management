# Kịch Bản Video Demo - Hệ Thống Quản Lý Nhà Hàng

## 📋 Thông Tin Chung

**Tên dự án:** Restaurant Management System  
**Thời lượng video:** 20-25 phút  
**Đối tượng:** Giảng viên hướng dẫn  
**Mục tiêu:** Trình bày đầy đủ các tính năng và kiến trúc hệ thống

---

## 🎬 Cấu Trúc Video

### Phần 1: Giới Thiệu (2-3 phút)
### Phần 2: Kiến Trúc Hệ Thống (3-4 phút)
### Phần 3: Demo Các Tính Năng (12-15 phút)
### Phần 4: Công Nghệ & Triển Khai (3-4 phút)
### Phần 5: Kết Luận (1 phút)

---

## 📝 Kịch Bản Chi Tiết

---

## PHẦN 3: DEMO CÁC TÍNH NĂNG (12-15 phút)

### Scene 3.1: Đăng Nhập & Phân Quyền (1 phút)

#### Chuẩn bị:
- Mở trình duyệt, truy cập trang login
- Chuẩn bị sẵn tài khoản: admin, manager, waiter, chef

#### Demo:
1. **Login với tài khoản admin**
   - Username: admin
   - Password: (password demo)
   - Hiển thị dashboard admin với đầy đủ menu

2. **Giải thích phân quyền**
   - Admin: Toàn quyền
   - Manager: Quản lý menu, bàn, xem báo cáo
   - Waiter: Tạo order, xem bàn
   - Chef: Xem kitchen display
   - Cashier: Xử lý thanh toán

**Lời thoại gợi ý:**
```
"Đầu tiên là chức năng đăng nhập. Hệ thống hỗ trợ 5 vai trò với 
quyền hạn khác nhau. Em sẽ đăng nhập với tài khoản admin để có 
thể demo toàn bộ tính năng. Sau khi đăng nhập thành công, hệ thống 
hiển thị dashboard với các menu phù hợp với quyền của user."
```

**Hiển thị trên màn hình:**
- Form login
- Dashboard sau khi login
- Menu sidebar với các tính năng

---

### Scene 3.2: Quản Lý Menu (2-3 phút)

#### Demo Flow:
1. **Xem danh sách món ăn**
   - Click vào Menu Management
   - Hiển thị danh sách món với ảnh, giá, danh mục
   - Statistics cards: Tổng món, còn hàng, hết hàng

2. **Tìm kiếm và lọc**
   - Search bar: Tìm món theo tên
   - Filter theo category (Khai vị, Món chính, Tráng miệng, etc.)
   - Filter theo status (Available/Out of stock)
   - Filter theo giá

3. **Thêm món mới**
   - Click "Add New Dish"
   - Điền thông tin:
     - Tên món (VN + EN)
     - Mô tả
     - Giá
     - Category
     - Upload ảnh
     - Spicy level
     - Preparation time
   - Save → Món xuất hiện trong danh sách

4. **Chỉnh sửa món**
   - Click vào món → Edit
   - Thay đổi giá hoặc availability
   - Update → Thay đổi áp dụng ngay

5. **Xóa món (soft delete)**
   - Click Delete
   - Confirm → Món chuyển sang inactive

**Lời thoại gợi ý:**
```
"Tiếp theo là module quản lý menu - trái tim của hệ thống.
[Hiển thị danh sách] Ở đây quản lý có thể xem toàn bộ món ăn với 
thông tin đầy đủ: ảnh, giá, trạng thái.

[Demo search/filter] Hệ thống hỗ trợ tìm kiếm và lọc thông minh. 
Ví dụ em có thể lọc các món khai vị còn hàng trong tầm giá dưới 100k.

[Demo add] Để thêm món mới, click Add New Dish, điền đầy đủ thông tin 
bao gồm cả ảnh và các thuộc tính như độ cay, thời gian chế biến. 
Hệ thống có validation đảm bảo dữ liệu chính xác.

[Demo edit/delete] Chỉnh sửa và xóa món đều rất đơn giản. Khi xóa, 
món sẽ chuyển sang trạng thái inactive thay vì xóa hẳn khỏi database, 
đảm bảo tính toàn vẹn dữ liệu lịch sử."
```

**Hiển thị trên màn hình:**
- Grid view của menu
- Form add/edit món
- Filter và search hoạt động

---

### Scene 3.3: Quản Lý Bàn (3-4 phút)

#### Demo Flow:
1. **Xem danh sách bàn (List View)**
   - Hiển thị tất cả bàn với thông tin:
     - Số bàn
     - Số chỗ ngồi
     - Trạng thái (Available/Occupied/Reserved)
     - Vị trí (tầng, vùng)
   - Filter theo floor, status, capacity

2. **Visual Floor Plan Editor** (Tính năng độc đáo)
   - Click "Visual Editor"
   - Hiển thị sơ đồ mặt bằng nhà hàng
   
   **Editor Tools:**
   - Select Tool (V): Chọn và di chuyển bàn
   - Pan Tool (H): Di chuyển canvas
   - Add Table: Thêm bàn mới vào sơ đồ
   - Grid Tool: Hiển thị lưới căn chỉnh
   - Zoom controls: Phóng to/thu nhỏ

3. **Demo editing:**
   - **Thêm bàn mới:**
     - Click Add Table
     - Kéo thả vào vị trí mong muốn
     - Điều chỉnh kích thước
     - Set properties (số bàn, capacity, shape)
   
   - **Di chuyển bàn:**
     - Chọn bàn
     - Kéo thả sang vị trí khác
     - Auto-snap to grid (nếu bật)
   
   - **Thay đổi kích thước:**
     - Chọn bàn → Resize handles xuất hiện
     - Kéo handles để thay đổi kích thước
   
   - **Delete bàn:**
     - Chọn bàn → Press Delete key hoặc click Delete button

4. **Multi-floor management:**
   - Switch giữa các tầng (Floor 1, Floor 2, VIP)
   - Mỗi tầng có layout riêng
   - Demo chuyển tầng và xem layout khác nhau

5. **Save layout:**
   - Click Save button
   - Confirm → Layout được lưu vào database
   - Thông báo thành công

**Lời thoại gợi ý:**
```
"Module quản lý bàn là một trong những điểm mạnh của hệ thống.

[List View] Ở chế độ danh sách, ta có thể xem tất cả bàn với 
trạng thái real-time: bàn nào đang trống, đang có khách, hay đã được đặt.

[Visual Editor] Nhưng đặc biệt hơn là Visual Floor Plan Editor. 
Đây là công cụ cho phép thiết kế sơ đồ mặt bằng trực quan, 
giống như các phần mềm CAD.

[Demo tools] Hệ thống cung cấp đầy đủ công cụ: Select để chọn và 
di chuyển bàn, Pan để duyệt canvas, Grid để căn chỉnh chính xác.

[Demo add table] Em sẽ demo thêm một bàn mới. Click Add Table, 
kéo thả vào vị trí mong muốn, điều chỉnh kích thước và set thuộc tính.

[Demo move/resize] Di chuyển và thay đổi kích thước rất đơn giản 
bằng drag and drop, với auto-snap để căn chỉnh gọn gàng.

[Multi-floor] Hệ thống hỗ trợ nhiều tầng. Mỗi tầng có layout riêng biệt. 
Ta có thể chuyển đổi giữa các tầng để xem và chỉnh sửa.

[Save] Tất cả thay đổi chỉ được lưu khi click Save, đảm bảo an toàn 
khi thử nghiệm layout."
```

**Hiển thị trên màn hình:**
- List view của bàn
- Visual editor với canvas đầy đủ
- Demo từng thao tác: add, move, resize, delete
- Switch giữa các tầng
- Save và confirm message

---

### Scene 3.4: Đặt Chỗ (Reservation) (2 phút)

#### Demo Flow:
1. **Xem danh sách đặt chỗ**
   - Click Reservations
   - Hiển thị list reservations với:
     - Tên khách
     - Số người
     - Thời gian
     - Bàn đã assign
     - Trạng thái (Pending/Confirmed/Completed/Cancelled)
   - Filter theo ngày, status

2. **Tạo reservation mới**
   - Click "New Reservation"
   - Form:
     - Thông tin khách (Tên, SĐT, Email)
     - Số người
     - Ngày & giờ
     - Ghi chú đặc biệt
   - Select bàn phù hợp (dựa trên capacity & availability)
   - Submit → Tạo thành công

3. **Quản lý reservation**
   - Confirm reservation: Pending → Confirmed
   - Assign table: Gán bàn cụ thể
   - Complete: Khách đã đến và ngồi
   - Cancel: Hủy nếu cần

4. **View reservation detail**
   - Click vào một reservation
   - Xem thông tin chi tiết
   - Timeline: Created → Confirmed → Completed

**Lời thoại gợi ý:**
```
"Module đặt chỗ giúp quản lý tất cả reservation của khách hàng.

[List view] Danh sách hiển thị tất cả đặt chỗ với thông tin đầy đủ 
và trạng thái real-time. Ta có thể filter theo ngày để xem các 
reservation trong một khoảng thời gian cụ thể.

[Create new] Để tạo reservation mới, điền thông tin khách hàng, 
số người, thời gian mong muốn. Hệ thống sẽ suggest các bàn phù hợp 
dựa trên capacity và availability.

[Manage] Sau khi tạo, quản lý có thể confirm, assign bàn cụ thể, 
hoặc hủy nếu khách không đến. Khi khách đến nhà hàng, ta mark 
reservation là Completed và bàn tự động chuyển sang Occupied."
```

**Hiển thị trên màn hình:**
- Reservation list với nhiều trạng thái
- Form tạo reservation mới
- Luồng confirm → assign → complete

---

### Scene 3.5: Tạo Order & Quản Lý Order (2-3 phút)

#### Demo Flow:
1. **Tạo order mới (Vai trò: Waiter)**
   - Từ Table Management, click vào bàn Available
   - Chọn "Create Order"
   - Hiển thị menu để chọn món
   - Chọn món:
     - Click vào món → Add to order
     - Điều chỉnh quantity
     - Ghi chú đặc biệt (ví dụ: "Không hành", "Ít cay")
   - Review order:
     - List món đã chọn
     - Quantity mỗi món
     - Tổng tiền
   - Submit Order

2. **Order được gửi đến Kitchen**
   - Hiển thị WebSocket real-time update
   - Kitchen Display System nhận order ngay lập tức

3. **Xem danh sách orders**
   - Click Orders
   - List tất cả orders với:
     - Order ID
     - Table number
     - Waiter
     - Status (Pending/Preparing/Ready/Served/Completed)
     - Total amount
   - Filter theo status, date, waiter

4. **Xem chi tiết order**
   - Click vào order
   - Xem tất cả items trong order
   - Trạng thái từng món
   - Timeline: Created → Preparing → Ready → Served

**Lời thoại gợi ý:**
```
"Bây giờ là quy trình tạo và quản lý đơn hàng.

[Create order] Nhân viên phục vụ chọn bàn, click Create Order, 
chọn món từ menu. Giao diện được thiết kế tối ưu cho tốc độ: 
chọn nhanh, điều chỉnh số lượng, thêm ghi chú đặc biệt nếu cần.

[Submit] Sau khi review, submit order. Ngay lập tức, order được 
gửi đến Kitchen Display System qua WebSocket.

[Order list] Module Orders cho phép xem tất cả đơn hàng với trạng thái 
real-time. Quản lý có thể theo dõi order nào đang chờ, đang chế biến, 
hay đã sẵn sàng phục vụ.

[Detail] Click vào order để xem chi tiết từng món, ai là người tạo order, 
bàn nào, và timeline đầy đủ."
```

**Hiển thị trên màn hình:**
- Flow tạo order từ table
- Menu selection với cart
- Order submission
- Real-time update
- Order list và detail

---

### Scene 3.6: Kitchen Display System (KDS) (1-2 phút)

#### Demo Flow:
1. **Truy cập KDS (Vai trò: Chef)**
   - Login với tài khoản chef
   - Click Kitchen hoặc truy cập KDS screen

2. **Hiển thị orders cần chế biến**
   - Kanban board layout với các cột:
     - **Pending**: Order mới nhận
     - **Preparing**: Đang chế biến
     - **Ready**: Sẵn sàng phục vụ
   
3. **Xử lý order:**
   - **Accept order**: Pending → Preparing
     - Click "Start Preparing"
     - Thời gian bắt đầu được ghi lại
   
   - **Mark ready**: Preparing → Ready
     - Click "Mark Ready"
     - Notification gửi đến waiter
   
   - **View order details:**
     - Table number
     - Items với quantity và special notes
     - Preparation time của mỗi món
     - Priority (ưu tiên món có prep time lâu)

4. **Real-time updates:**
   - Khi có order mới → Hiển thị ngay trong Pending
   - Sound notification (optional)
   - Badge count cập nhật

**Lời thoại gợi ý:**
```
"Kitchen Display System là công cụ quan trọng cho bếp.

[KDS overview] Giao diện hiển thị tất cả order cần chế biến theo dạng 
Kanban board, rất trực quan. Mỗi order hiển thị bàn số mấy, món gì, 
số lượng, và ghi chú đặc biệt.

[Process order] Chef click Start Preparing để bắt đầu làm món, 
hệ thống ghi nhận thời gian. Khi món xong, click Mark Ready, 
và notification được gửi ngay đến waiter để mang món ra.

[Real-time] Tất cả diễn ra real-time. Khi waiter tạo order mới, 
order xuất hiện ngay trong KDS mà không cần refresh. 
Điều này giúp bếp luôn cập nhật và phục vụ nhanh chóng."
```

**Hiển thị trên màn hình:**
- KDS Kanban board
- Order cards với đầy đủ thông tin
- Demo accept và mark ready
- Real-time notification khi có order mới

---

### Scene 3.7: Thanh Toán & Hóa Đơn (1-2 phút)

#### Demo Flow:
1. **Tạo hóa đơn từ order**
   - Khi order Completed, click "Create Bill"
   - Hệ thống tự động tạo bill với:
     - Tất cả items từ order
     - Subtotal
     - Tax (VAT 10%)
     - Service charge (nếu có)
     - Total amount

2. **Xem chi tiết bill**
   - Bill information:
     - Bill ID
     - Table number
     - Order ID
     - Items với price
     - Total calculation
   - Customer info (nếu có)
   - Date & time

3. **Xử lý thanh toán**
   - Chọn payment method:
     - Cash
     - Card
     - E-wallet (Momo, ZaloPay)
     - Bank Transfer
   - Nhập số tiền khách đưa
   - Tính tiền thừa (nếu cash)
   - Process payment

4. **In hóa đơn**
   - Click Print
   - Preview hóa đơn (PDF format)
   - In hoặc download

5. **Quản lý bills**
   - Xem list tất cả bills
   - Filter theo:
     - Date range
     - Payment status (Paid/Unpaid)
     - Payment method
   - Export reports

**Lời thoại gợi ý:**
```
"Sau khi khách dùng xong, đến bước thanh toán.

[Create bill] Từ order đã complete, cashier tạo bill. Hệ thống 
tự động tính toán subtotal, thuế VAT 10%, và tổng cộng.

[Payment] Cashier chọn phương thức thanh toán: tiền mặt, thẻ, 
hoặc ví điện tử. Với tiền mặt, hệ thống tự động tính tiền thừa.

[Print] Sau khi thanh toán, in hóa đơn cho khách hàng. 
Bill được lưu vào hệ thống để đối soát và báo cáo.

[Management] Module Bills cho phép quản lý xem lại tất cả hóa đơn, 
filter theo ngày, phương thức thanh toán, và export báo cáo tài chính."
```

**Hiển thị trên màn hình:**
- Bill creation từ order
- Bill detail với tính toán đầy đủ
- Payment processing
- Print preview
- Bills list với filter

---

### Scene 3.8: Báo Cáo & Thống Kê (1 phút)

#### Demo Flow:
1. **Dashboard overview**
   - Truy cập Reports/Dashboard
   - Hiển thị các metrics chính:
     - **Revenue:** Doanh thu hôm nay/tuần/tháng
     - **Orders:** Số lượng orders
     - **Popular dishes:** Món bán chạy nhất
     - **Table utilization:** Tỷ lệ sử dụng bàn

2. **Charts & Graphs:**
   - Revenue chart (Line chart theo time)
   - Orders by status (Pie chart)
   - Top selling items (Bar chart)
   - Revenue by category (Doughnut chart)

3. **Detailed reports:**
   - Sales report: Chi tiết từng bill
   - Staff performance: Hiệu suất nhân viên
   - Inventory report: Tình hình tồn kho
   - Customer analytics: Phân tích khách hàng

4. **Export reports:**
   - Date range selector
   - Export to Excel/PDF
   - Email report (optional)

**Lời thoại gợi ý:**
```
"Module báo cáo giúp quản lý nắm bắt tình hình kinh doanh.

[Dashboard] Dashboard hiển thị overview với các chỉ số quan trọng: 
doanh thu, số lượng order, món bán chạy, tỷ lệ sử dụng bàn.

[Charts] Các biểu đồ trực quan giúp phân tích xu hướng. 
Ví dụ, revenue chart cho thấy doanh thu tăng giảm theo thời gian, 
giúp dự đoán và lên kế hoạch kinh doanh.

[Export] Tất cả reports có thể export ra Excel hoặc PDF 
để lưu trữ và trình bày."
```

**Hiển thị trên màn hình:**
- Dashboard với metrics và charts
- Detailed report pages
- Export functionality

---

## PHẦN 4: CÔNG NGHỆ & TRIỂN KHAI (3-4 phút)

### Scene 4.1: Chi Tiết Công Nghệ (2 phút)

#### Nội dung:
1. **Frontend Architecture:**
   - Next.js 16 với App Router
   - React Server Components
   - Zustand cho state management
   - React Query cho data fetching
   - TailwindCSS + shadcn/ui
   - TypeScript strict mode

2. **Backend Architecture:**
   - NestJS với modular structure
   - Prisma ORM với migration system
   - JWT authentication
   - Guards & Decorators cho authorization
   - DTO validation với class-validator
   - Exception filters

3. **Database Design:**
   - PostgreSQL 16
   - Optimized indexes
   - Foreign keys với proper cascading
   - Soft deletes
   - Audit trails (createdAt, updatedAt)

4. **Real-time Communication:**
   - Socket.io cho WebSocket
   - Event-driven architecture
   - Room-based messaging
   - Reconnection handling

5. **Security:**
   - bcrypt cho password hashing (12 rounds)
   - HttpOnly cookies cho tokens
   - CORS configuration
   - Rate limiting
   - Input validation & sanitization
   - SQL injection prevention (ORM)

**Lời thoại gợi ý:**
```
"Về mặt kỹ thuật, dự án áp dụng các best practices hiện đại:

[Frontend] Frontend sử dụng Next.js 16 với App Router, tận dụng 
React Server Components để tối ưu performance. State management 
dùng Zustand, nhẹ và đơn giản. UI components từ shadcn/ui đảm bảo 
tính nhất quán và accessibility.

[Backend] Backend với NestJS theo kiến trúc modular, dễ bảo trì 
và mở rộng. Prisma ORM giúp quản lý database schema và migration 
an toàn. Authentication dùng JWT, authorization với Guards và RBAC.

[Database] PostgreSQL được thiết kế cẩn thận với indexes tối ưu, 
foreign keys đảm bảo referential integrity, và soft delete để 
bảo toàn dữ liệu lịch sử.

[Real-time] Socket.io cung cấp real-time updates giữa các module. 
Kiến trúc event-driven giúp các bộ phận phối hợp chặt chẽ.

[Security] Bảo mật được quan tâm đặc biệt: password hash với bcrypt, 
JWT trong HttpOnly cookie, input validation đầy vào, CORS config 
nghiêm ngặt, và ORM ngăn SQL injection."
```

**Hiển thị trên màn hình:**
- Code snippets minh họa (nếu có thời gian)
- Sơ đồ architecture
- Security measures diagram

---

### Scene 4.2: Deployment & DevOps (1-2 phút)

#### Nội dung:
1. **Containerization:**
   - Docker containers cho client, server, database
   - Docker Compose cho local development
   - Multi-stage builds để tối ưu image size
   - Environment-based configuration

2. **Deployment Options:**
   
   **Option A: Vercel + Railway (Demo/Development)**
   - Frontend: Vercel
   - Backend: Railway
   - Database: Railway PostgreSQL
   - Cost: Free tier / ~$5/month
   - Deployment time: 20-30 minutes
   
   **Option B: DigitalOcean VPS (Production)**
   - VPS với Docker Compose
   - Caddy/Nginx reverse proxy với auto HTTPS
   - GitHub Actions CI/CD
   - Automated backups
   - Cost: Free với GitHub Education Pack ($200 credit)

3. **CI/CD Pipeline:**
   - GitHub Actions workflow
   - Automated testing
   - Automated deployment
   - Health checks

4. **Monitoring & Logging:**
   - Application logs
   - Error tracking
   - Performance monitoring
   - Database backups

**Lời thoại gợi ý:**
```
"Hệ thống được thiết kế để dễ dàng deploy và maintain.

[Docker] Toàn bộ ứng dụng được containerize với Docker, đảm bảo 
môi trường nhất quán từ development đến production.

[Deployment] Em cung cấp 2 tùy chọn deploy:
- Option A dùng Vercel và Railway, hoàn toàn free hoặc rất rẻ, 
  phù hợp để demo và test.
- Option B dùng DigitalOcean VPS, miễn phí với GitHub Education Pack, 
  phù hợp cho production với toàn quyền kiểm soát.

[CI/CD] GitHub Actions tự động chạy test và deploy khi có code mới, 
giảm thiểu lỗi và tăng tốc độ phát triển.

[Documentation] Em đã viết tài liệu triển khai chi tiết bằng tiếng Việt, 
với scripts tự động hóa setup và backup, giúp bất kỳ ai cũng có thể 
deploy hệ thống dễ dàng."
```

**Hiển thị trên màn hình:**
- Docker Compose file structure
- Deployment architecture diagram
- GitHub Actions workflow
- Deployment documentation

---

## PHẦN 5: KẾT LUẬN (1 phút)

### Scene 5.1: Tổng Kết

#### Nội dung:
1. **Đã hoàn thành:**
   - ✅ 7 modules chính với đầy đủ tính năng
   - ✅ Visual Floor Plan Editor (tính năng độc đáo)
   - ✅ Real-time updates với WebSocket
   - ✅ Responsive design (Mobile/Tablet/Desktop)
   - ✅ Role-based access control
   - ✅ Comprehensive documentation (tiếng Việt)
   - ✅ Deployment-ready với Docker

2. **Kết quả đạt được:**
   - Giải quyết các vấn đề quản lý nhà hàng hiện đại
   - Tăng hiệu quả làm việc giữa các bộ phận
   - Cải thiện trải nghiệm khách hàng
   - Cung cấp dữ liệu để ra quyết định kinh doanh

3. **Điểm mạnh của dự án:**
   - Tech stack hiện đại và mạnh mẽ
   - UX/UI được thiết kế kỹ lưỡng
   - Code structure clean và maintainable
   - Extensive testing và documentation
   - Production-ready deployment

4. **Hướng phát triển:**
   - Mobile app (React Native)
   - AI cho menu recommendations
   - Inventory management automation
   - Customer loyalty program
   - Integration với các platform giao đồ ăn

**Lời thoại gợi ý:**
```
"Tóm lại, em đã xây dựng một hệ thống quản lý nhà hàng toàn diện, 
bao phủ toàn bộ quy trình từ đặt bàn, order, chế biến, đến thanh toán 
và báo cáo.

Điểm mạnh của dự án là:
- Áp dụng công nghệ hiện đại và best practices
- Visual Floor Plan Editor là tính năng độc đáo và hữu ích
- Real-time updates tạo trải nghiệm mượt mà
- Tài liệu đầy đủ, dễ maintain và mở rộng
- Sẵn sàng deploy và đưa vào sử dụng thực tế

Hệ thống không chỉ giải quyết vấn đề quản lý hiện tại mà còn có 
khả năng mở rộng trong tương lai với nhiều tính năng mới.

Em xin cảm ơn thầy/cô đã dành thời gian xem demo của em. 
Em sẵn sàng trả lời các câu hỏi của thầy/cô ạ."
```

**Hiển thị trên màn hình:**
- Slide tổng kết với các bullet points
- Screenshot tổng hợp các tính năng chính
- Thank you slide với contact info

---

## 📌 CHECKLIST TRƯỚC KHI QUAY

### 1. Chuẩn Bị Dữ Liệu Demo
- [ ] Database có dữ liệu mẫu đầy đủ:
  - [ ] 5+ users với các role khác nhau
  - [ ] 20+ món ăn với ảnh đẹp, đầy đủ category
  - [ ] 10+ bàn với layout đã thiết kế sẵn (multi-floor)
  - [ ] 5+ reservations với các trạng thái khác nhau
  - [ ] 3+ orders hoàn chỉnh (Pending, Preparing, Ready)
  - [ ] 5+ bills đã thanh toán
- [ ] Ảnh món ăn chất lượng cao
- [ ] Layout bàn được thiết kế gọn gàng, professional

### 2. Chuẩn Bị Môi Trường
- [ ] Server đang chạy ổn định (localhost hoặc deployed)
- [ ] Database connected
- [ ] WebSocket hoạt động
- [ ] Browser đã clear cache, cookies
- [ ] Không có tabs/windows khác gây mất tập trung
- [ ] Screen resolution phù hợp để record (1920x1080 recommended)

### 3. Tài Khoản Demo
- [ ] Admin: username/password ghi chú rõ
- [ ] Manager: username/password
- [ ] Waiter: username/password
- [ ] Chef: username/password
- [ ] Tất cả accounts đã được test login thành công

### 4. Slides & Materials
- [ ] Slide giới thiệu (PPTX/Google Slides)
- [ ] ERD diagram (file ảnh chất lượng cao)
- [ ] Architecture diagrams
- [ ] Thank you slide với contact info

### 5. Kỹ Thuật Quay Video
- [ ] Microphone test (âm thanh rõ ràng, không ồn)
- [ ] Recording software setup (OBS Studio/Camtasia/QuickTime)
- [ ] Screen resolution 1920x1080
- [ ] Frame rate: 30fps or 60fps
- [ ] Webcam (nếu dùng): vị trí và lighting tốt
- [ ] Desktop clean, không có thông báo làm phiền

### 6. Script & Timing
- [ ] Đọc script nhiều lần để thuộc nội dung
- [ ] Practice demo để thao tác mượt mà
- [ ] Time từng phần để đảm bảo không quá dài
- [ ] Chuẩn bị trả lời các câu hỏi có thể có

### 7. Backup Plan
- [ ] Có plan B nếu network/server issue
- [ ] Screen recordings sẵn cho các phần quan trọng (nếu cần)
- [ ] Slides PDF backup
- [ ] List các points chính nếu quên

---

## 🎥 TIPS QUAY VIDEO CHUYÊN NGHIỆP

### 1. Âm Thanh
- Nói rõ ràng, tốc độ vừa phải
- Tránh "ờ", "à", "uhm" quá nhiều
- Giọng điệu tự tin, không đọc máy móc
- Pause giữa các phần để dễ edit

### 2. Thao Tác Trên Màn Hình
- Di chuyển chuột chậm, mượt mà
- Click rõ ràng, tránh click nhầm
- Scroll từ từ để người xem kịp đọc
- Highlight hoặc zoom vào phần quan trọng

### 3. Cấu Trúc
- Mỗi phần có intro ngắn
- Transition mượt mà giữa các phần
- Tóm tắt nhanh sau mỗi phần lớn
- Kết thúc với clear call-to-action (Q&A)

### 4. Visual
- Sử dụng con trỏ chuột lớn, dễ thấy
- Tránh windows/tabs quá nhiều
- Font size đủ lớn để đọc rõ
- Color scheme professional

### 5. Editing (Post-production)
- Cut các phần dài, lặp lại
- Thêm text annotations cho key points
- Background music nhẹ nhàng (optional)
- Intro/Outro professional
- Add timestamps trong description

---

## 📄 VIDEO DESCRIPTION TEMPLATE

```
🍽️ HỆ THỐNG QUẢN LÝ NHÀ HÀNG - VIDEO DEMO

Dự án tốt nghiệp: Hệ Thống Quản Lý Nhà Hàng Toàn Diện
Sinh viên: [Tên của bạn]
Giảng viên hướng dẫn: [Tên giảng viên]

⏱️ TIMESTAMPS:
00:00 - Giới thiệu
02:00 - Kiến trúc hệ thống
06:00 - Demo tính năng
  06:30 - Đăng nhập & Phân quyền
  07:30 - Quản lý Menu
  10:30 - Quản lý Bàn & Visual Floor Plan Editor
  14:30 - Đặt chỗ (Reservation)
  16:30 - Tạo & Quản lý Order
  19:00 - Kitchen Display System
  20:30 - Thanh toán & Hóa đơn
  22:00 - Báo cáo & Thống kê
23:00 - Công nghệ & Triển khai
26:00 - Kết luận

🔧 CÔNG NGHỆ:
- Frontend: Next.js 16 + React 19 + TypeScript + TailwindCSS
- Backend: NestJS + TypeScript + Prisma ORM
- Database: PostgreSQL 16
- Real-time: Socket.io WebSocket
- Deployment: Docker + DigitalOcean/Vercel + Railway

✨ TÍNH NĂNG CHÍNH:
✅ Quản lý Menu với tìm kiếm & lọc thông minh
✅ Visual Floor Plan Editor (Drag & Drop)
✅ Hệ thống đặt chỗ trực tuyến
✅ Quản lý đơn hàng real-time
✅ Kitchen Display System
✅ Thanh toán & hóa đơn
✅ Báo cáo & phân tích doanh thu
✅ Role-based Access Control

📚 TÀI LIỆU:
- GitHub: [Link repository]
- Documentation: [Link docs]
- Deployment Guide: [Link]

📧 LIÊN HỆ:
Email: [Email của bạn]
Phone: [SĐT của bạn]

#RestaurantManagement #WebDevelopment #NextJS #NestJS #GraduationProject
```

---

## 🎯 CÂU HỎI DỰ KIẾN & CÁCH TRẢ LỜI

### 1. "Tại sao chọn Next.js thay vì React thuần?"
**Trả lời:**
"Em chọn Next.js vì:
- Server-Side Rendering (SSR) giúp tối ưu SEO và performance
- App Router mới với React Server Components giảm bundle size
- Built-in routing và API routes tiện lợi
- Image Optimization tự động
- Production-ready với nhiều tối ưu sẵn có"

### 2. "WebSocket có bị lỗi khi scale không?"
**Trả lời:**
"Em đã xử lý vấn đề này:
- Socket.io có built-in adapter cho scale horizontal
- Có thể dùng Redis adapter khi deploy nhiều server instances
- Reconnection logic đảm bảo client tự động kết nối lại
- Fallback về HTTP polling nếu WebSocket không available"

### 3. "Database có handle concurrent access tốt không?"
**Trả lời:**
"PostgreSQL có transaction isolation levels mạnh mẽ. Em áp dụng:
- Prisma transactions cho các operations phức tạp
- Optimistic locking cho việc update concurrent
- Indexes được thiết kế cẩn thận để tránh deadlock
- Connection pooling để quản lý connections hiệu quả"

### 4. "Visual Floor Plan Editor có touch support cho tablet không?"
**Trả lời:**
"Có ạ. Em sử dụng event handlers hỗ trợ cả mouse và touch:
- Touch events cho drag & drop trên tablet
- Gesture support cho pinch-to-zoom
- Responsive design cho màn hình nhỏ
- Đã test trên iPad và Android tablet"

### 5. "Bảo mật API như thế nào?"
**Trả lời:**
"Nhiều lớp bảo mật:
- JWT trong HttpOnly cookie chống XSS
- CORS config strict chỉ cho phép origins được phép
- Rate limiting ngăn brute force
- Input validation với DTO và class-validator
- Prisma ORM ngăn SQL injection
- Guards và Decorators cho authorization chi tiết từng endpoint"

### 6. "Có test coverage không?"
**Trả lời:**
"Em có viết tests:
- Unit tests cho business logic quan trọng
- Integration tests cho API endpoints
- E2E tests cho các user flows chính
- Coverage khoảng [X]% cho core modules
[Nếu chưa có nhiều test, trả lời thật: 'Em đang trong quá trình bổ sung tests đầy đủ hơn']"

### 7. "Deployment handle high traffic thế nào?"
**Trả lời:**
"Strategy cho scaling:
- Docker containers dễ scale horizontal
- Load balancer (Caddy/Nginx) phân phối traffic
- Database connection pooling
- Caching strategy với Redis (planned)
- CDN cho static assets
- Horizontal scaling bằng cách thêm containers"

### 8. "Chi phí vận hành thế nào?"
**Trả lời:**
"Option A (Vercel + Railway): Free hoặc ~$5/tháng cho small traffic
Option B (DigitalOcean): $24/tháng cho VPS 2GB RAM, nhưng free với 
GitHub Education Pack ($200 credit = 8 tháng). Đã tối ưu để chạy tốt 
trên VPS 1GB RAM (~$12/tháng)."

---

## 📂 TỔ CHỨC FILE DEMO

```
demo-assets/
├── slides/
│   ├── intro.pptx
│   ├── architecture.pptx
│   └── conclusion.pptx
├── diagrams/
│   ├── ERD.png
│   ├── architecture.png
│   └── workflow.png
├── screenshots/
│   ├── menu-management.png
│   ├── floor-plan-editor.png
│   ├── kds.png
│   └── dashboard.png
├── video/
│   ├── raw-recording.mp4
│   ├── edited-final.mp4
│   └── thumbnail.png
└── scripts/
    ├── demo-script.md (file này)
    └── qa-preparation.md
```

---

## ✅ FINAL CHECKLIST

**24 giờ trước khi quay:**
- [ ] Test toàn bộ hệ thống lần cuối
- [ ] Prepare slides
- [ ] Rehearse ít nhất 3 lần
- [ ] Time mỗi phần

**1 giờ trước khi quay:**
- [ ] Restart computer
- [ ] Close all unnecessary apps
- [ ] Test microphone
- [ ] Test screen recording
- [ ] Có nước uống sẵn

**Ngay trước khi record:**
- [ ] Turn off notifications (Do Not Disturb mode)
- [ ] Close Slack, Discord, email
- [ ] Put phone on silent
- [ ] Take a deep breath, thư giãn
- [ ] Start recording!

---

**Chúc bạn quay video thành công! 🎥🍀**

*"Practice makes perfect. Rehearse nhiều lần để tự tin và mượt mà nhất!"*
