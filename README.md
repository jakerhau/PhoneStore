# Hệ Thống Quản Lý Cửa Hàng Điện Thoại

Hệ thống quản lý cửa hàng điện thoại là một ứng dụng web được xây dựng bằng Node.js, Express và MongoDB, giúp quản lý toàn bộ hoạt động của cửa hàng điện thoại từ quản lý sản phẩm, đơn hàng, khách hàng đến báo cáo doanh thu.

## Tính Năng Chính

### Quản Lý Sản Phẩm
- Thêm, sửa, xóa sản phẩm
- Quản lý tồn kho
- Phân loại sản phẩm
- Quản lý hình ảnh sản phẩm

### Quản Lý Đơn Hàng
- Tạo đơn hàng mới
- Xử lý đơn hàng
- Theo dõi trạng thái đơn hàng
- Quản lý thanh toán

### Quản Lý Khách Hàng
- Thông tin khách hàng
- Lịch sử mua hàng
- Đặt trước sản phẩm

### Quản Lý Nhân Viên
- Phân quyền người dùng (Admin, Nhân viên bán hàng, Nhân viên kho)
- Quản lý tài khoản
- Theo dõi hoạt động

### Báo Cáo & Thống Kê
- Báo cáo doanh thu
- Thống kê sản phẩm bán chạy
- Báo cáo tồn kho

## Công Nghệ Sử Dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: Handlebars, Tailwind CSS
- **Authentication**: JWT, Session
- **Other**: Express-session, Connect-flash, Moment.js

## Cài Đặt

1. Clone repository:
```bash
git clone [repository-url]
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env và cấu hình các biến môi trường:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

4. Chạy ứng dụng:
```bash
npm start
```

## Cấu Trúc Thư Mục

```
src/
├── config/         # Cấu hình database và các cài đặt khác
├── controllers/    # Xử lý logic nghiệp vụ
├── middleware/     # Middleware functions
├── models/         # Database models
├── public/         # Static files (CSS, JS, images)
├── routes/         # Route definitions
├── util/          # Utility functions
└── views/         # Handlebars templates
```

## API Endpoints

### Authentication
- POST /auth/login - Đăng nhập
- POST /auth/logout - Đăng xuất
- POST /auth/changepwsale - Đổi mật khẩu

### Products
- GET /admin/products - Danh sách sản phẩm
- POST /admin/product/add - Thêm sản phẩm mới
- PUT /admin/product/edit - Cập nhật sản phẩm
- DELETE /admin/product/delete - Xóa sản phẩm

### Orders
- GET /admin/transactions - Danh sách đơn hàng
- POST /admin/transaction/add - Tạo đơn hàng mới
- PUT /admin/transaction/edit - Cập nhật đơn hàng

## Đóng Góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy Phép

MIT License
