const Customer = require('../../models/Customer');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { currencyFormat } = require('../../util/function');

class ReportsController{
    async index(req, res, next) {
        try {
            const { saleDate, saleMonth, startDate, endDate } = req.query;
            let transactions = [];
            let transactionCount = 0;
            let totalRevenue = 0;
            let hasDateSelection = !!saleDate || !! saleMonth || (!!startDate && !!endDate);
            let totalProfit = 0;
            let totalProducts = 0;
            let totalPaidAmount = 0;

            if (saleDate) {
                const startOfDay = new Date(saleDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(saleDate);
                endOfDay.setHours(23, 59, 59, 999);

                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                });
            } else if (saleMonth) {
                const startOfMonth = new Date(saleMonth);
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                const endOfMonth = new Date(saleMonth);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                endOfMonth.setDate(0);
                endOfMonth.setHours(23, 59, 59, 999);

                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth,
                    },
                });
            } else if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: start,
                        $lte: end,
                    },
                });
            }
                transactionCount = transactions.length;
                totalRevenue = transactions.reduce((acc, transaction) => acc + transaction.total_amount, 0);
                totalPaidAmount = transactions.reduce((acc, transaction) => acc + transaction.paid_amount, 0);
                totalProfit = transactions.reduce((acc, transaction) => acc + (transaction.total_amount - transaction.total_import_price), 0);

                totalProducts = transactions.reduce((acc, transaction) => {
                    return acc + transaction.details.reduce((prodAcc, product) => prodAcc + product.quantity, 0);
                }, 0);
            
            if (transactionCount === 0 && hasDateSelection) {
                res.render('reports/index', {
                    message: 'Không có giao dịch nào trong ngày được chọn.',
                    hasDateSelection,
                    // selectedDate: saleDate || saleMonth || `${startDate} - ${endDate}`,
                    selectedDate: (saleDate ? new Date(saleDate).toLocaleDateString('vi-VN') : '') || (saleMonth ? new Date(saleMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : '') || `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`,
                });
            }
            res.render('reports/index', {
                transactionCount: transactionCount,
                totalRevenue: currencyFormat(totalRevenue),
                totalProfit: currencyFormat(totalProfit),
                totalPaidAmount: currencyFormat(totalPaidAmount),
                totalProducts,
                hasDateSelection,
                // selectedDate: saleDate || saleMonth || `${startDate} - ${endDate}`,
                selectedDate: (saleDate ? new Date(saleDate).toLocaleDateString('vi-VN') : '') || (saleMonth ? new Date(saleMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : '') || `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`,
            });
        } catch (error) {
            console.error('Error fetching transactions for reports:', error);
            next(error);
        }
    }

    async show(req, res, next) {
        try {
            const { saleDate, saleMonth, startDate, endDate } = req.query;
    
            let transactions = [];
            let transactionCount = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalProducts = 0;
    
            // Tìm kiếm các giao dịch theo ngày, tháng, hoặc khoảng thời gian
            if (saleDate) {
                const startOfDay = new Date(saleDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(saleDate);
                endOfDay.setHours(23, 59, 59, 999);
    
                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                }).populate('customer_id', 'name') 
                  .populate('sale_id', 'name'); 
            } else if (saleMonth) {
                const startOfMonth = new Date(saleMonth);
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                const endOfMonth = new Date(saleMonth);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                endOfMonth.setDate(0);
                endOfMonth.setHours(23, 59, 59, 999);
    
                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth,
                    },
                }).populate('customer_id', 'name') 
                  .populate('sale_id', 'name'); 
            } else if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
    
                transactions = await Transaction.find({
                    purchase_date: {
                        $gte: start,
                        $lte: end,
                    },
                }).populate('customer_id', 'name') 
                  .populate('sale_id', 'name'); 
            }
    
            transactionCount = transactions.length;
            totalRevenue = transactions.reduce((acc, transaction) => acc + transaction.total_amount, 0);
            totalProfit = transactions.reduce((acc, transaction) => acc + (transaction.total_amount - transaction.total_import_price), 0);
            totalProducts = transactions.reduce((acc, transaction) => {
                return acc + transaction.details.reduce((prodAcc, product) => prodAcc + product.quantity, 0);
            }, 0);
    
            transactions = transactions.map(transaction => {
                const total_import_price = transaction.total_import_price;
                const total_amount = transaction.total_amount;
                const paid_amount = transaction.paid_amount;
                const change_amount = paid_amount - total_amount;
                const profit = total_amount - total_import_price;
                const purchaseDate = new Date(transaction.purchase_date);
                const formattedPurchaseDate = `${String(purchaseDate.getDate()).padStart(2, '0')}/${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${purchaseDate.getFullYear()}`;
                
                return {
                    ...transaction.toObject(),
                    customer_name: transaction.customer_id?.name || 'N/A', 
                    sale_name: transaction.sale_id?.name || 'N/A', 
                    total_import_price: currencyFormat(total_import_price),
                    total_amount: currencyFormat(total_amount),
                    paid_amount: currencyFormat(paid_amount),
                    change_amount: currencyFormat(change_amount),
                    purchaseDate: formattedPurchaseDate,
                    profit: currencyFormat(profit),
                };
            });
    
            res.render('reports/show', {
                transactionCount: transactionCount,
                totalRevenue: currencyFormat(totalRevenue),
                totalProfit: currencyFormat(totalProfit),
                totalProducts,
                selectedDate: {
                    saleDate: saleDate || '',
                    saleMonth: saleMonth || '',
                    startDate: startDate || '',
                    endDate: endDate || ''
                },
                transactions,
            });
        } catch (error) {
            console.error('Error fetching transactions for reports:', error);
            next(error);
        }
    }
    
    
}

module.exports = new ReportsController();