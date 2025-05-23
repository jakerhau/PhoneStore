const Supplier = require('../../models/Supplier');
const Batch = require('../../models/Batch');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

exports.index = async (req, res, next) => {
    try {
        const { name, phone, email } = req.query;
        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (phone) {
            filter.phone = { $regex: phone, $options: 'i' };
        }
        if (email) {
            filter.email = { $regex: email, $options: 'i' };
        }

        const suppliers = await Supplier.find(filter);
        res.render('suppliers/index', {
            suppliers: multipleMongooseToObject(suppliers),
            name,
            phone,
            email
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi tải danh sách nhà cung cấp');
        res.redirect('/');
    }
}
//Hiện trang thêm nhà cung cấp mới
exports.viewAdd = async (req, res, next) => {
    res.render('suppliers/add');
}

//Hiện trang edit nhà cung cấp
///suppliers/edit/6828a2aef9dc73a7dd6b4735
exports.viewEdit = async (req, res, next) => {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    res.render('suppliers/edit', { supplier: mongooseToObject(supplier) });
}


exports.add = async (req, res, next) => {
    try {
        const { name, phone, email, status } = req.body;

        // Validate phone number
        if(phone.length !== 10 || !phone.startsWith('0')) {
            req.flash('error', 'Số điện thoại không hợp lệ');
            return res.redirect('/admin/suppliers/add');
        }

        // Check if supplier with same phone or email exists
        const existingSupplier = await Supplier.findOne({ 
            $or: [{ phone }, { email }] 
        });
        
        if (existingSupplier) {
            req.flash('error', 'Nhà cung cấp với số điện thoại hoặc email này đã tồn tại');
            return res.redirect('/admin/suppliers/add');
        }

        if (status === 'active') {
            isActive = true;
        } else {
            isActive = false;
        }

        const supplier = new Supplier({ name, phone, email });
        await supplier.save();
        req.flash('success', 'Thêm nhà cung cấp thành công');
        res.redirect('/admin/suppliers');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi thêm nhà cung cấp');
        res.redirect('/admin/suppliers/add');
    }
}

exports.stopSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findById(id);
        
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect('/admin/suppliers');
        }

        // Check if supplier has any active batches
        const activeBatches = await Batch.find({ 
            supplier: id,
            status: 'active'
        });

        if (activeBatches.length > 0) {
            req.flash('error', 'Không thể ngừng hoạt động nhà cung cấp đang có lô hàng đang hoạt động');
            return res.redirect('/admin/suppliers');
        }

        supplier.isActive = false;
        await supplier.save();
        req.flash('success', 'Đã ngừng hoạt động nhà cung cấp thành công');
        res.redirect('/admin/suppliers');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi ngừng hoạt động nhà cung cấp');
        res.redirect('/admin/suppliers');
    }
}

exports.activeSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findById(id);
        
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect('/admin/suppliers');
        }

        supplier.isActive = true;
        await supplier.save();
        req.flash('success', 'Đã kích hoạt nhà cung cấp thành công');
        res.redirect('/admin/suppliers');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi kích hoạt nhà cung cấp');
        res.redirect('/admin/suppliers');
    }
}

exports.view = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findById(id);
        
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect('/admin/suppliers');
        }

        const batches = await Batch.find({ supplier: id })
            .sort({ importDate: -1 }); 

        res.render('suppliers/view', { 
            supplier: mongooseToObject(supplier), 
            batches: multipleMongooseToObject(batches) 
        });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi xem chi tiết nhà cung cấp');
        res.redirect('/admin/suppliers');
    }
}

exports.edit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, email, status } = req.body;

        // Validate phone number
        if(phone.length !== 10 || !phone.startsWith('0')) {
            req.flash('error', 'Số điện thoại không hợp lệ');
            return res.redirect(`/admin/suppliers/edit/${id}`);
        }

        const supplier = await Supplier.findById(id);
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect('/admin/suppliers');
        }

        if (status === 'active') {
            isActive = true;
        } else {
            isActive = false;
        }

        // Check if new phone/email conflicts with other suppliers
        const existingSupplier = await Supplier.findOne({
            $or: [{ phone }, { email }],
            _id: { $ne: id }
        });

        if (existingSupplier) {
            req.flash('error', 'Số điện thoại hoặc email đã được sử dụng bởi nhà cung cấp khác');
            return res.redirect(`/admin/suppliers/edit/${id}`);
        }

        supplier.name = name;
        supplier.phone = phone;
        supplier.email = email;
        supplier.isActive = isActive;
        await supplier.save();
        
        req.flash('success', 'Cập nhật nhà cung cấp thành công');
        res.redirect('/admin/suppliers');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật nhà cung cấp');
        res.redirect(`/admin/suppliers/edit/${id}`);
    }
}
