# Hệ Thống Quản Lý Cửa Hàng Điện Thoại

Hệ thống quản lý cửa hàng điện thoại là một ứng dụng web được xây dựng bằng Node.js, Express và MongoDB, giúp quản lý toàn bộ hoạt động của cửa hàng điện thoại từ quản lý sản phẩm, đơn hàng, khách hàng đến báo cáo doanh thu.

## ✨ Tính Năng Chính

### 🔐 Hệ Thống Xác Thực & Phân Quyền
- Đăng nhập/đăng xuất an toàn với session và JWT
- Phân quyền người dùng:
  - **Quản trị viên (Admin)**: Toàn quyền truy cập
  - **Nhân viên bán hàng**: Quản lý đơn hàng, khách hàng
  - **Nhân viên kho**: Quản lý tồn kho, nhập hàng
- Đổi mật khẩu và quản lý tài khoản

### 📱 Quản Lý Sản Phẩm
- Thêm, sửa, xóa sản phẩm với mã vạch duy nhất
- Quản lý thông tin: tên, giá nhập, giá bán, danh mục
- Upload và quản lý hình ảnh sản phẩm
- Theo dõi tồn kho và số lượng đã bán
- Quản lý lô hàng (batches) và nhà cung cấp

### 🛒 Quản Lý Đơn Hàng & Giao Dịch
- Tạo đơn hàng mới với mã đơn hàng tự động
- Tính toán tự động: tổng tiền, tiền thừa, thuế
- Áp dụng mã giảm giá và khuyến mãi
- Theo dõi chi tiết từng sản phẩm trong đơn hàng
- Lưu trữ thông tin nhân viên bán hàng

### 👥 Quản Lý Khách Hàng
- Thông tin khách hàng chi tiết
- Lịch sử mua hàng và giao dịch
- Hệ thống đặt trước sản phẩm (preorder)
- Chat trực tuyến với khách hàng

### 💬 Chat Thời Gian Thực
- Chat 1-1 giữa khách hàng và admin
- Hiển thị trạng thái "đang gõ"
- Lưu trữ lịch sử tin nhắn
- Giao diện riêng cho khách hàng và admin

### 🎯 Khuyến Mãi & Giảm Giá
- Tạo và quản lý mã khuyến mãi
- Hỗ trợ giảm giá theo phần trăm hoặc số tiền cố định
- Áp dụng tự động trong quá trình thanh toán

### 📊 Báo Cáo & Thống Kê
- Dashboard tổng quan với các chỉ số chính
- Báo cáo doanh thu theo thời gian
- Thống kê sản phẩm bán chạy
- Báo cáo tồn kho và nhập xuất

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js & Express.js**: Server framework
- **MongoDB & Mongoose**: Database và ODM
- **Socket.IO**: Real-time communication
- **Express Session**: Session management
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing

### Frontend
- **Handlebars**: Template engine
- **Tailwind CSS**: UI framework
- **Vanilla JavaScript**: Client-side logic

### Other Tools
- **Multer**: File upload handling
- **Method Override**: HTTP method support
- **Connect Flash**: Flash messages
- **Moment.js**: Date formatting
- **Express Validator**: Input validation
- **Nodemailer**: Email functionality
- **UUID**: Unique ID generation

## 📁 Cấu Trúc Dự Án

```
├── index.js                 # Entry point
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── src/
    ├── config/
    │   └── db.js           # Database configuration
    ├── controllers/        # Business logic
    │   ├── auth/           # Authentication
    │   ├── products/       # Product management
    │   ├── transactions/   # Order management
    │   ├── customers/      # Customer management
    │   ├── users/          # User management
    │   ├── reports/        # Reports & analytics
    │   ├── promotion/      # Promotions
    │   ├── batch/          # Batch management
    │   ├── supplier/       # Supplier management
    │   └── chatController.js
    ├── middleware/
    │   └── auth.js         # Authentication middleware
    ├── models/             # Database schemas
    │   ├── User.js         # User model
    │   ├── Product.js      # Product model
    │   ├── Transaction.js  # Transaction model
    │   ├── Customer.js     # Customer model
    │   ├── Promotion.js    # Promotion model
    │   ├── Batch.js        # Batch model
    │   ├── Supplier.js     # Supplier model
    │   ├── preorder.js     # Preorder model
    │   ├── Chat.js         # Chat model
    │   └── Message.js      # Message model
    ├── routes/             # API routes
    ├── util/
    │   ├── function.js     # Utility functions
    │   └── socketio.js     # Socket.IO configuration
    ├── views/              # Handlebars templates
    │   ├── layouts/        # Layout templates
    │   ├── partials/       # Partial templates
    │   ├── customer/       # Customer-facing pages
    │   └── [modules]/      # Admin pages
    └── public/             # Static assets
        ├── css/            # Styles
        ├── js/             # JavaScript
        └── images/         # Images
```

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js (v14 hoặc cao hơn)
- MongoDB
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Clone repository:**
```bash
git clone <repository-url>
cd final-project-temp
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình môi trường:**
Tạo file `.env` trong thư mục gốc:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

4. **Khởi động MongoDB:**
Đảm bảo MongoDB đang chạy trên hệ thống

5. **Build CSS (Terminal riêng):**
```bash
npm run build:css
```

6. **Chạy ứng dụng:**
```bash
# Development mode
npm run watch

# Hoặc production mode
npm start
```

7. **Truy cập ứng dụng:**
- Admin: `http://localhost:3000/admin`
- Customer: `http://localhost:3000`

## 🔑 API Endpoints

### Authentication
```
POST /auth/login          # Đăng nhập
POST /auth/logout         # Đăng xuất
POST /auth/changepwsale   # Đổi mật khẩu
```

### Products
```
GET  /admin/products      # Danh sách sản phẩm
POST /admin/product/add   # Thêm sản phẩm
PUT  /admin/product/edit  # Cập nhật sản phẩm
DELETE /admin/product/delete # Xóa sản phẩm
```

### Transactions
```
GET  /admin/transactions     # Danh sách giao dịch
POST /admin/transaction/add  # Tạo giao dịch mới
PUT  /admin/transaction/edit # Cập nhật giao dịch
```

### Customers
```
GET  /admin/customers        # Danh sách khách hàng
POST /admin/customer/add     # Thêm khách hàng
PUT  /admin/customer/edit    # Cập nhật khách hàng
```

### Other Modules
```
/admin/users        # Quản lý người dùng
/admin/reports      # Báo cáo
/admin/preorder     # Đặt trước
/admin/promotions   # Khuyến mãi
/admin/batches      # Lô hàng
/admin/suppliers    # Nhà cung cấp
```

## 💡 Tính Năng Nổi Bật

- **Real-time Chat**: Hỗ trợ khách hàng trực tuyến với Socket.IO
- **Responsive Design**: Giao diện tương thích mọi thiết bị
- **Role-based Access**: Phân quyền chi tiết theo vai trò
- **Advanced Search**: Tìm kiếm sản phẩm theo nhiều tiêu chí
- **PDF Reports**: Xuất báo cáo PDF với PDFMake
- **File Upload**: Upload hình ảnh sản phẩm với Multer
- **Data Validation**: Kiểm tra dữ liệu với Express Validator

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Products
- GET /admin/products - Danh sách sản phẩm
- POST /admin/product/add - Thêm sản phẩm mới
- PUT /admin/product/edit - Cập nhật sản phẩm
- DELETE /admin/product/delete - Xóa sản phẩm

### Orders
- GET /admin/transactions - Danh sách đơn hàng
- POST /admin/transaction/add - Tạo đơn hàng mới
- PUT /admin/transaction/edit - Cập nhật đơn hàng

## 👥 Tác Giả

- **Nhóm 15** - Đại học Tôn Đức Thắng

## 📞 Hỗ Trợ

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
