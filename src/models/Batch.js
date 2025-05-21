const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchCode: {type: String, required: true},
    importDate: {type: Date, required: true},
    supplier: {type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true},
    note: {type: String, required: true},
});

module.exports = mongoose.model('Batch', batchSchema);
