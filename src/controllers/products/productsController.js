const Product =  require('../../models/Product');
const Transaction = require('../../models/Transaction');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { currencyFormat, generateBarcode } = require('../../util/function');

class ProductsController{
    index(req, res, next) {
        // console.log('User Role:', res.locals.user.role);
        const { name, barcode } = req.query;
        const role = req.session.user.role;
        let searchQuery = {};
        if (name) {
            searchQuery.name = { $regex: name, $options: 'i' };
        }
        if (barcode) {
            searchQuery.barcode = { $regex: barcode, $options: 'i' };
        }
    
        Promise.all([Product.find(searchQuery), Transaction.find()])
            .then(([products, transactions]) => {
                const soldQuantities = {};
    
                transactions.forEach(transaction => {
                    transaction.details.forEach(detail => {
                        const barcode = detail.product_barcode;
                        soldQuantities[barcode] = (soldQuantities[barcode] || 0) + parseInt(detail.quantity, 10);
                    });
                });
    
                const updatePromises = products.map(product => {
                    const soldQuantity = soldQuantities[product.barcode] || 0;
    
                    return Product.findByIdAndUpdate(
                        product._id,
                        { sold_quantity: soldQuantity }, // cập nhật sold_quantity trong database
                        { new: true } // trả về document đã cập nhật
                    ).then(updatedProduct => {
                        const formattedProduct = updatedProduct.toObject();
                        formattedProduct.import_price = currencyFormat(formattedProduct.import_price);
                        formattedProduct.retail_price = currencyFormat(formattedProduct.retail_price);
                        formattedProduct.created_at = formattedProduct.created_at ? `${String(formattedProduct.created_at.getDate()).padStart(2, '0')}/${String(formattedProduct.created_at.getMonth() + 1).padStart(2, '0')}/${formattedProduct.created_at.getFullYear()}` : 'N/A';
                        return formattedProduct;
                    });
                });
    
                return Promise.all(updatePromises).then(updatedProducts => {
                    res.render('products/index', {
                        products: updatedProducts,
                        query: { name, barcode },
                        role: role
                    });
                });
            })
            .catch(next);
    }
    
    show(req, res, next) {
        const productBarcode = req.query.barcode;
        Product.findOne({ barcode: productBarcode })
            .then(product => {
                if (!product) {
                    return res.status(404).send('Product not found');
                }
                const formattedProduct = mongooseToObject(product);
                formattedProduct.import_price = currencyFormat(formattedProduct.import_price);
                formattedProduct.retail_price = currencyFormat(formattedProduct.retail_price);
                formattedProduct.created_at = formattedProduct.created_at ? `${String(formattedProduct.created_at.getDate()).padStart(2, '0')}/${String(formattedProduct.created_at.getMonth() + 1).padStart(2, '0')}/${formattedProduct.created_at.getFullYear()}` : 'N/A';
                res.render('products/show', { product: formattedProduct });
            })
            .catch(next);
    }
    
    
    edit(req, res, next) {
        const barcode = req.query.barcode; 
        if (!barcode) {
            return res.status(400).send('Barcode is required');
        }
    
        Product.findOne({ barcode: barcode })
            .then(product => {
                if (!product) {
                    return res.status(404).send('Product not found');
                }
                res.render('products/edit', { product: mongooseToObject(product) });
            })
            .catch(next);
    }
    

    update(req, res, next) {
        const { barcode, name, import_price, retail_price, category, photo, quantity } = req.body;
        if (!barcode || !name || !import_price || !retail_price || !category || !quantity) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
        return res.redirect(`/admin/product/edit?barcode=${barcode}`);
    }
    Product.findOne({ barcode: barcode })
        .then((product) => {
            if (!product) {
                return res.status(404).send('Product not found');
            }
            product.name = name || product.name;
            product.import_price = import_price || product.import_price;
            product.retail_price = retail_price || product.retail_price;
            product.category = category || product.category;
            product.photo = photo || product.photo;
            product.quantity = quantity || product.quantity;
            return product.save();
        })
        .then((updatedProduct) => {
            req.flash('success', 'Cập nhật sản phẩm thành công!');
            res.redirect(`/admin/product?barcode=${updatedProduct.barcode}`);
        })
        .catch(next); 
    }

    add(req, res, next) {
        Product.find({})
            .then(products => res.render('products/add', { products: multipleMongooseToObject(products) }))
            .catch(next);
    }

    delete(req, res, next) {
        // console.log('req.body:', req.body);
        const { barcode } = req.body;
        if (!barcode) {
            return res.status(400).send('Barcode is required');
        }
        Product.findOneAndDelete({ barcode })
            .then(() => {
                req.flash('success', 'Xóa sản phẩm thành công!');
                res.redirect('/admin/products');
            })
            .catch(err => {
                // console.error('Error deleting product:', err);
                res.status(500).send('Có lỗi xảy ra khi xóa sản phẩm.');
            });
    }
    
    store(req, res, next) {
        const { name, import_price, retail_price, category, photo, quantity } = req.body;
        if (!name || !import_price || !retail_price || !category || !quantity) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/admin/products/add'); 
        }
        const barcode = generateBarcode();
        const newProduct = new Product({
            barcode,
            name,
            import_price,
            retail_price,
            category,
            photo,
            quantity,
            sold_quantity: 0
        });
        newProduct.save()
            .then(() => {
                req.flash('success', 'Thêm sản phẩm thành công!');
                res.redirect('/admin/products'); 
            })
            .catch(err => {
                console.error('Error adding product:', err);
                req.flash('error', 'Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.');
                res.redirect('/admin/products/add'); 
            });
    }    
     
}

module.exports = new ProductsController();