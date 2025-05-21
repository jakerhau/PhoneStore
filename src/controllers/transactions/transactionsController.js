const Transaction = require('../../models/Transaction');
const Customer = require('../../models/Customer');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Promotion = require('../../models/Promotion');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { currencyFormat } = require('../../util/function');

class TransactionsController{
    
    index(req, res, next) {
        const { salePersonName, customerName, orderCode } = req.query;
        let searchQuery = {};

        if (orderCode) {
            searchQuery.orderCode = { $regex: orderCode, $options: 'i' }; 
        }

        Transaction.find(searchQuery)
            .populate('customer_id', 'name') 
            .populate('sale_id', 'name') 
            .then(transactions => {
                const filteredTransactions = transactions.filter(transaction => {
                    const saleNameMatches = salePersonName ? transaction.sale_id.name.toLowerCase().includes(salePersonName.toLowerCase()) : true;
                    const customerNameMatches = customerName ? transaction.customer_id.name.toLowerCase().includes(customerName.toLowerCase()) : true;
                    return saleNameMatches && customerNameMatches;
                });

                const totals = filteredTransactions.reduce((acc, transaction) => {
                    acc.totalRevenue += transaction.total_amount;
                    acc.totalPaid += transaction.paid_amount;
                    acc.totalRefund += (transaction.paid_amount - transaction.total_amount);
                    acc.totalProfit += (transaction.total_amount - transaction.total_import_price);
                    return acc;
                }, {
                    totalRevenue: 0,
                    totalPaid: 0,
                    totalRefund: 0,
                    totalProfit: 0
                });

                const transactionsWithDetails = filteredTransactions.map(transaction => {
                    const purchaseDate = new Date(transaction.purchase_date);
                    const formattedPurchaseDate = `${String(purchaseDate.getDate()).padStart(2, '0')}/${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${purchaseDate.getFullYear()}`;

                    return {
                        ...transaction.toObject(),
                        total_import_price: currencyFormat(transaction.total_import_price),
                        total_amount: currencyFormat(transaction.total_amount),
                        paid_amount: currencyFormat(transaction.paid_amount),
                        refund_amount: currencyFormat(transaction.paid_amount - transaction.total_amount),
                        profit: currencyFormat(transaction.total_amount - transaction.total_import_price),
                        customer_name: transaction.customer_id ? transaction.customer_id.name : 'Khách hàng không xác định',
                        sale_name: transaction.sale_id ? transaction.sale_id.name : 'Nhân viên không xác định',
                        formatted_purchase_date: formattedPurchaseDate
                    };
                });

                res.render('transactions/index', { 
                    transactions: transactionsWithDetails,
                    orderCount: filteredTransactions.length,
                    totalRevenue: currencyFormat(totals.totalRevenue),
                    totalPaid: currencyFormat(totals.totalPaid),
                    totalRefund: currencyFormat(totals.totalRefund),
                    totalProfit: currencyFormat(totals.totalProfit),
                    orderCode,
                    customerName,
                    salePersonName
                });
            })
            .catch(next);
        }

    show(req, res, next) {
        const transactionId = req.query.id;
        Promise.all([
            Transaction.findById(transactionId),
            Customer.findById(transactionId.customer_id),
            Promotion.find({})
        ])
            .then(([transaction, customer, promotions]) => {
                if (!transaction) {
                    return res.status(404).send('Transaction not found');
                }
                return Customer.findById(transaction.customer_id)
                    .then(customer => {
                        if (!customer) {
                            return res.status(404).send('Customer not found');
                        }

                        const details = transaction.details;
                        const productList = details.map(detail => ({
                                product_barcode: detail.product_barcode,
                                quantity: detail.quantity,
                                retail_price: detail.retail_price,
                                import_price: detail.import_price,
                        }));

                        return Product.find({ barcode: { $in: productList.map(item => item.product_barcode) } })
                            .then(products => {
                                const productListWithDetails = details.map(detail => {
                                    const product = products.find(p => p.barcode === detail.product_barcode) || {};
                                    return {
                                        name: product.name || 'Sản phẩm không xác định',
                                        price: currencyFormat(detail.retail_price),
                                        quantity: detail.quantity,
                                        imageUrl: product.photo || '',
                                        product_barcode: product.barcode,
                                    };
                                });
                                const purchaseDate = new Date(transaction.purchase_date);
                                const formattedPurchaseDate = `${String(purchaseDate.getDate()).padStart(2, '0')}/${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${purchaseDate.getFullYear()}`;
                                
                                const transactionData = {
                                    ...transaction.toObject(),
                                    purchaseDate: formattedPurchaseDate,
                                    total_import_price: currencyFormat(transaction.total_import_price),
                                    total_amount: currencyFormat(transaction.total_amount),
                                    paid_amount: currencyFormat(transaction.paid_amount),
                                    refund_amount: currencyFormat(transaction.paid_amount - transaction.total_amount),
                                    profit: currencyFormat(transaction.total_amount - transaction.total_import_price),
                                    products: productListWithDetails,
                                    customer: {
                                        name: customer.name,
                                        email: customer.email,
                                        phone: customer.phone_number,
                                        address: customer.address,
                                    },
                                };

                                res.render('transactions/show', { 
                                    transaction: transactionData, 
                                    products: productListWithDetails,
                                });
                            });
                    });
            })
            .catch(next);
    }

    add(req, res, next) {
        Promise.all([
            Transaction.find({}),
            Product.find({}),
            Promotion.find({ status: 'active' })
        ])
            .then(([transactions, products, promotions]) => {
                res.locals.promotions = promotions;
                        res.render('transactions/add', {
                            transactions: multipleMongooseToObject(transactions),
                    products: multipleMongooseToObject(products),
                    promotions: multipleMongooseToObject(promotions)
                        });
            })
            .catch(next); 
    }

    checkCustomer(req, res, next) {
        const phoneNumber = req.body.customerPhone;
        Customer.findOne({ phone_number: phoneNumber })
            .then((customer) => {
                if (customer) {
                    res.json({
                        status: 200,
                        customer: {
                            name: customer.name,
                            address: customer.address,
                        },
                    });
                } else {
                    res.json({
                        status: 404,
                    });
                }
            })
            .catch((error) => {
                res.status(500).json({ message: "Lỗi kiểm tra thông tin khách hàng." });
            });
    }
    
    create(req, res, next) {
        const { 
            customerPhone, 
            customerName, 
            customerAddress, 
            details, 
            paidAmount, 
            promotionId, 
            discountedPrice,
            originalPrice,
            changeAmount,
            promotionDetails 
        } = req.body;

        if (!customerPhone || !customerName || !details || !paidAmount) {
            return res.status(400).json({
                error: 'Thiếu thông tin bắt buộc',
                message: 'Vui lòng kiểm tra lại thông tin khách hàng và sản phẩm'
            });
        }

        if (!Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                error: 'Thông tin sản phẩm không hợp lệ',
                message: 'Vui lòng chọn ít nhất một sản phẩm'
            });
        }

        const saleId = req.session.user._id;

        // Kiểm tra số lượng tồn kho của tất cả sản phẩm
        const productBarcodes = details.map(detail => detail.product_barcode);
        
        Product.find({ barcode: { $in: productBarcodes } })
            .then(products => {
                // Kiểm tra từng sản phẩm
                for (const detail of details) {
                    const product = products.find(p => p.barcode === detail.product_barcode);
                    if (!product) {
                        return res.status(400).json({
                            error: 'Sản phẩm không tồn tại',
                            message: `Sản phẩm với mã ${detail.product_barcode} không tồn tại`
                        });
                    }
                    if (product.quantity < detail.quantity) {
                        return res.status(400).json({
                            error: 'Số lượng không đủ',
                            message: `Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`
                        });
                    }
                }

                // Nếu tất cả sản phẩm đều có đủ số lượng, tiếp tục tạo giao dịch
                return Customer.findOneAndUpdate(
                    { phone_number: customerPhone },
                    { name: customerName, address: customerAddress },
                    { new: true, upsert: true }
                );
            })
            .then(customer => {
                const totalImportPrice = details.reduce((acc, item) => acc + (item.import_price * item.quantity), 0);
                const orderCode = Math.floor(10000000000 + Math.random() * 90000000000).toString();
                const purchaseDate = new Date();

                const transaction = new Transaction({
                    customer_id: customer._id,
                    sale_id: saleId,
                    details,
                    total_import_price: totalImportPrice,
                    total_amount: originalPrice,
                    final_amount: discountedPrice,
                    paid_amount: paidAmount,
                    change_amount: changeAmount,
                    purchase_date: purchaseDate,
                    order_code: orderCode,
                    promotion_id: promotionId || null,
                    promotion_details: promotionDetails || null
                });

                return transaction.save();
            })
            .then(transaction => {
                // Cập nhật số lượng sản phẩm
                const updatePromises = details.map(detail => {
                    return Product.findOneAndUpdate(
                        { barcode: detail.product_barcode },
                        { 
                            $inc: { 
                                quantity: -detail.quantity,
                                sold_quantity: detail.quantity
                            }
                        }
                    );
                });

                return Promise.all([transaction, ...updatePromises]);
            })
            .then(([transaction]) => {
                res.status(201).json({ 
                    success: true, 
                    transaction,
                    message: 'Tạo đơn hàng thành công'
                });
            })
            .catch(err => {
                if (err.code === 11000) {
                    return res.status(400).json({
                        error: 'Lỗi tạo đơn hàng',
                        message: 'Mã đơn hàng bị trùng, vui lòng thử lại'
                    });
                }
                res.status(500).json({ 
                    error: 'Có lỗi xảy ra khi tạo đơn hàng',
                    message: err.message 
                });
            });
    }
    
    getPromotions(req, res, next) {
        Promotion.find({ 
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        })
            .then(promotions => {
                if (!promotions) {
                    return res.json({ promotions: [] });
    }
                res.json({ 
                    promotions: multipleMongooseToObject(promotions),
                    message: 'Lấy danh sách mã giảm giá thành công'
                });
            })
            .catch(error => {
                res.status(500).json({ 
                    error: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                    message: error.message 
                });
            });
    }
}

module.exports = new TransactionsController();