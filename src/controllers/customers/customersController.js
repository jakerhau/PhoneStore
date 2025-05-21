const Customer = require('../../models/Customer');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { currencyFormat } = require('../../util/function');

class CustomersController{
    index(req, res, next) {
        const { full_name, phone_number } = req.query;
        let searchQuery = {};
        if (full_name) {
            searchQuery.name = { $regex: full_name, $options: 'i' }; 
        }
        if (phone_number) {
            searchQuery.phone_number = { $regex: phone_number, $options: 'i' };
        }
        Customer.find(searchQuery)
        .then(customers => {
            Promise.all([ customers, Transaction.find({})
            ]) 
            .then(([customers, transactions]) => {
                const customerStats = customers.map(customer => {
                    const customerTransactions = transactions.filter(
                        transaction => transaction.customer_id.toString() === customer._id.toString()
                    );

                    const orderCount = customerTransactions.length;
                    const totalRevenue = customerTransactions.reduce((acc, transaction) => acc + transaction.total_amount, 0);
                    const totalProfit = customerTransactions.reduce((acc, transaction) => 
                        acc + (transaction.total_amount - transaction.total_import_price), 0
                    );

                    return {
                        ...customer.toObject(),
                        orderCount,
                        totalRevenue: currencyFormat(totalRevenue),
                        totalProfit: currencyFormat(totalProfit)
                    };
                });

                res.render('customers/index', { 
                    customers: customerStats, 
                    fullname: full_name || '',
                    phone: phone_number || '' 
                });
            })
            .catch(next);
        })
        .catch(next);
    }

    
    show(req, res, next) {
        const customerId = req.query.id; 
        Customer.findById(customerId)
            .then(customer => {
                if (!customer) {
                    return res.status(404).send('Customer not found');
                }
                return Transaction.find({ customer_id: customerId })
                    .populate('sale_id', 'name')  
                    .populate('customer_id', 'name') 
                    .then(transactions => {
                        const transactionData = transactions.map(transaction => {
                            const purchaseDate = new Date(transaction.purchase_date);
                            const formattedPurchaseDate = `${String(purchaseDate.getDate()).padStart(2, '0')}/${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${purchaseDate.getFullYear()}`;

                            return {
                                ...transaction.toObject(),
                                _id: transaction._id,
                                order_code: transaction.order_code,
                                total_import_price: currencyFormat(transaction.total_import_price),
                                total_amount: currencyFormat(transaction.total_amount),
                                paid_amount: currencyFormat(transaction.paid_amount),
                                refund_amount: currencyFormat(transaction.paid_amount - transaction.total_amount),
                                profit: currencyFormat(transaction.total_amount - transaction.total_import_price),
                                sale_name: transaction.sale_id ? transaction.sale_id.name : "Chưa xác định", 
                                customer_name: transaction.customer_id ? transaction.customer_id.name : "Chưa xác định",
                                purchase_date: formattedPurchaseDate
                            };
                        });
    
                        const orderCount = transactions.length;
                        const totalOrderAmount = currencyFormat(
                            transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0)
                        );
    
                        const customerData = {
                            ...customer.toObject(),
                            name: customer.name,
                            phone_number: customer.phone_number,
                            address: customer.address,
                        };
    
                        res.render('customers/show', {
                            customer: customerData,
                            transactions: transactionData,
                            orderCount,
                            totalOrderAmount
                        });
                    });
            })
            .catch(next);
    }
    
}

module.exports = new CustomersController();