const Promotion = require('../../models/Promotion');
const Product = require('../../models/Product');
const { multipleMongooseToObject } = require('../../util/mongoose');
const Customer = require('../../models/Customer');

class PromotionController {
    // [GET] /promotions
    index(req, res, next) {
        const { name, status, startDate, endDate } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        }
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) {
                filter.startDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.startDate.$lte = new Date(endDate);
            }
        }

        Promotion.find(filter)
            .then(promotions => {
                const plainPromotions = multipleMongooseToObject(promotions);
                
                // For each promotion, if applicableProducts is not 'all', populate the product
                const populatedPromotions = plainPromotions.map(promotion => {
                    if (promotion.applicableProducts !== 'all') {
                        return Product.findById(promotion.applicableProducts)
                            .then(product => {
                                promotion.applicableProducts = product ? { name: product.name } : null;
                                return promotion;
                            });
                    }
                    return Promise.resolve(promotion);
                });

                return Promise.all(populatedPromotions);
            })
            .then(populatedPromotions => {
                res.render('promotions/index', {
                    layout: 'layout',
                    promotions: populatedPromotions,
                    name,
                    status,
                    startDate,
                    endDate
                });
            })
            .catch(next);
    }

    // [GET] /promotions/add
    add(req, res, next) {
        Product.find({})
            .then(products => res.render('promotions/add', { 
                layout: 'layout',
                title: 'Add New Promotion',
                products: multipleMongooseToObject(products)
            }))
            .catch(next);
    }

    // [POST] /promotions
    store(req, res, next) {
        const { name, pointsRequired, discountType, discountValue, startDate, endDate, status, description, applicableProducts } = req.body;
        if (startDate > endDate) {
            req.flash('error', 'Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return res.redirect('/admin/promotions/add');
        }
        const promotion = new Promotion({ 
            name, 
            pointsRequired, 
            discountType, 
            discountValue, 
            startDate, 
            endDate,
            status,
            description,
            applicableProducts
        });
        
        promotion.save()
            .then(() => res.redirect('/admin/promotions'))
            .catch(next);
    }

    // [DELETE] /promotions/:id
    delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            req.flash('error', 'Không có id');
            return res.redirect('/admin/promotions');
        }

        Promotion.findByIdAndDelete(id)
            .then(() => {
                req.flash('success', 'Xóa mã giảm giá thành công');
                res.redirect('/admin/promotions');
            })
            .catch(error => {
                req.flash('error', 'Lỗi khi xóa mã giảm giá');
                res.redirect('/admin/promotions');
            });
    }

    // [GET] /promotions/edit?id=
    edit(req, res, next) {
        Promotion.findById(req.query.id)
            .then(promotion => res.render('promotions/edit', {
                layout: 'layout',
                promotion: singleMongooseToObject(promotion)
            }))
            .catch(next);
    }

    // [PUT] /promotions/:id
    update(req, res, next) {
        Promotion.findByIdAndUpdate(req.params.id, req.body)
            .then(() => res.redirect('/promotions'))
            .catch(next);
    }
    
}

module.exports = new PromotionController();