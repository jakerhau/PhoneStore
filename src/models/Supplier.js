const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    // Tên nhà cung cấp, mã lô, thời gian nhập, phone, email;
    name: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    isActive: {type: Boolean, default: true},
});

module.exports = mongoose.model('Supplier', supplierSchema);
