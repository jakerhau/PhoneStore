const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const productSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    import_price: {
        type: Number,
        required: true
    },
    retail_price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    photo: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    },
    quantity: {
        type: Number,
        required: true
    },
    sold_quantity: {
        type: Number,
        required: true
    },
});
module.exports = mongoose.model('Product', productSchema);