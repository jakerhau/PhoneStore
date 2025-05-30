const Product = require('../../models/Product');
const { multipleMongooseToObject } = require('../../util/mongoose');
const Preorder = require('../../models/preorder');
const Customer = require('../../models/Customer');
const Chat = require('../../models/Chat');
const { v4: uuidv4 } = require('uuid');

class CustomerPageController {
    // [GET] / - Trang chủ khách hàng
    index(req, res, next) {
        Product.find({ quantity: { $gt: 0 } })
            .then(products => {
                res.render('customer/home', {
                    layout: 'customerLayout',
                    products: multipleMongooseToObject(products)
                });
            })
            .catch(next);
    }

    // [GET] /products - Trang sản phẩm
    products(req, res, next) {
        const { brand, price, sort, search} = req.query;
        let query = { quantity: { $gt: 0 } };

        // Filter by brand
        if (brand) {
            query.brand = brand;
        }

        // Filter by price range
        if (price) {
            const [min, max] = price.split('-').map(Number);
            query.retail_price = {};
            if (min) query.retail_price.$gte = min * 1000000;
            if (max) query.retail_price.$lte = max * 1000000;
        }

        // Search by name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortObj = {};
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    sortObj = { retail_price: 1 };
                    break;
                case 'price-desc':
                    sortObj = { retail_price: -1 };
                    break;
                case 'name-asc':
                    sortObj = { name: 1 };
                    break;
                default:
                    sortObj = { created_at: -1 }; // newest
            }
        } else {
            sortObj = { created_at: -1 }; // default sort by newest
        }

        Product.find(query)
            .sort(sortObj)
            .then(products => {
                // Kiểm tra nếu request là AJAX
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.json({
                        products: multipleMongooseToObject(products)
                    });
                }

                // Render view nếu là request thông thường
                res.render('customer/products', {
                    layout: 'customerLayout',
                    products: multipleMongooseToObject(products),
                    filters: { brand, price, sort, search }
                });
            })
            .catch(next);
    }

    // [GET] /contact - Trang liên hệ
    contact(req, res) {
        res.render('customer/contact', {
            layout: 'customerLayout'
        });
    }

    points(req, res) {
        res.render('customer/points', {
            layout: 'customerLayout'
        });
    }

    // [POST] /points - Tra cứu tích điểm return json points
    searchPoints(req, res, next) {
        const { phone } = req.body;

        // Kiểm tra định dạng số điện thoại
        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                error: 'Vui lòng nhập đúng định dạng số điện thoại (10 số)'
            });
        }

        Customer.findOne({ phone_number: phone })
            .then(customer => {
                if (!customer) {
                    return res.status(404).json({
                        error: 'Không tìm thấy số điện thoại trong hệ thống'
                    });
                }
                res.json({
                    points: customer.points || 0
                });
            })
            .catch(error => {
                console.error('Error checking points:', error);
                res.status(500).json({
                    error: 'Có lỗi xảy ra, vui lòng thử lại sau'
                });
            });
    }

    // [POST] /products/preorder - Đặt trước sản phẩm
    preorder(req, res, next) {
        const { productId, quantity } = req.body;

        console.log(req.body);

        // Validate productId
        if (!productId || typeof productId !== 'string' || productId.trim() === '') {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        Product.findById(productId)
            .then(product => {
                if (!product) {
                    return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
                }

                if (product.quantity < quantity) {
                    return res.status(400).json({ success: false, message: 'Sản phẩm không đủ số lượng' });
                }

                const preorder = new Preorder({
                    productId,
                    quantity,
                    customerName: req.body.customerName,
                    email: req.body.email,
                    phone: req.body.phone,
                    note: req.body.note
                });

                return preorder.save()
                    .then(savedPreorder => {
                        res.status(201).json({ success: true, message: 'Đặt trước thành công', data: savedPreorder });
                    })
                    .catch(error => {
                        res.status(500).json({ success: false, message: 'Lỗi khi đặt trước', error: error.message });
                    });

            })
            .catch(next);

    }

    async chat(req, res, next) {
        try {
            // Kiểm tra xem đã có session chat trong cookie chưa
            let sessionId = req.cookies?.chatSessionId;
            let chat = null;
            
            if (sessionId) {
                // Tìm chat hiện tại
                chat = await Chat.findOne({ sessionId });
            }
            
            if (!chat) {
                // Tạo session mới nếu chưa có
                sessionId = uuidv4();
                chat = await Chat.create({
                    sessionId,
                    customer: {
                        name: 'Anonymous',
                        email: '',
                        phone: ''
                    }
                });
                
                // Lưu sessionId vào cookie
                res.cookie('chatSessionId', sessionId, { 
                    maxAge: 24 * 60 * 60 * 1000, // 24 giờ
                    httpOnly: false // Cho phép JavaScript đọc
                });
                
                // Thông báo tới admin về chat mới qua Socket.IO
                const io = req.app.get('io');
                if (io) {
                    io.emit('new-customer', {
                        sessionId: chat.sessionId,
                        customer: chat.customer,
                        createdAt: chat.createdAt
                    });
                }
            }
            
            res.render('customer/chat', {
                layout: 'customerLayout',
                sessionId: sessionId,
                user: req.session.user || null
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CustomerPageController(); 