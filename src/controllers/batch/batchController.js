const Batch = require('../../models/Batch');
const Supplier = require('../../models/Supplier');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

exports.add = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect(`/admin/suppliers/${supplierId}`);
        }
        const { batchCode, importDate, note } = req.body;
        
        // Kiểm tra mã lô đã tồn tại chưa
        const existingBatch = await Batch.findOne({ batchCode });
        if (existingBatch) {
            req.flash('error', 'Mã lô đã tồn tại');
            return res.redirect(`/admin/batches/add/${supplierId}`);
        }

        const batch = new Batch({ batchCode, importDate, supplier, note });
        await batch.save();
        req.flash('success', 'Thêm lô hàng thành công');
        res.redirect(`/admin/suppliers/${supplierId}`);
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi thêm lô hàng');
        res.redirect(`/admin/batches/add/${supplierId}`);
    }
}

// hiển thị trang thêm lô hàng tương ứng với nhà cung cấp
exports.viewAdd = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            req.flash('error', 'Không tìm thấy nhà cung cấp');
            return res.redirect(`/admin/suppliers/${supplierId}`);
        }
        res.render('batch/add', { supplier: mongooseToObject(supplier) });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi xem chi tiết lô hàng');
        res.redirect(`/admin/suppliers/${supplierId}`);
    }
}

exports.edit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { batchCode, importDate, supplier, note } = req.body;
        
        // Kiểm tra mã lô mới có trùng với lô khác không
        const existingBatch = await Batch.findOne({ batchCode, _id: { $ne: id } });
        if (existingBatch) {
            req.flash('error', 'Mã lô đã tồn tại');
            return res.redirect(`/batches/edit/${id}`);
        }

        const batch = await Batch.findById(id);
        if (!batch) {
            req.flash('error', 'Không tìm thấy lô hàng');
            return res.redirect('/batches');
        }

        batch.batchCode = batchCode;
        batch.importDate = importDate;
        batch.supplier = supplier;
        batch.note = note;
        await batch.save();
        req.flash('success', 'Cập nhật lô hàng thành công');
        res.redirect('/batches');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật lô hàng');
        res.redirect(`/batches/edit/${id}`);
    }
}

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findById(id);
        
        if (!batch) {
            req.flash('error', 'Không tìm thấy lô hàng');
            return res.redirect('/batches');
        }

        await Batch.findByIdAndDelete(id);
        req.flash('success', 'Xóa lô hàng thành công');
        res.redirect('/batches');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Có lỗi xảy ra khi xóa lô hàng');
        res.redirect('/batches');
    }
}


