const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
    {
        customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        order_code: { type: String, required: true, unique: true },
        sale_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        total_import_price: { type: Number, required: true },
        total_amount: { type: Number, required: true }, // Giá gốc
        final_amount: { type: Number, required: true }, // Giá sau mã giảm giá
        change_amount: { type: Number, required: true },
        paid_amount: { type: Number, required: true },
        promotion_id: { type: Schema.Types.ObjectId, ref: 'Promotion' },
        promotion_details: {
            name: { type: String },
            discountType: { type: String, enum: ['fixed', 'percentage'] },
            discountValue: { type: Number }
        },
        purchase_date: { type: Date, default: Date.now },
        details: [
            {
                product_barcode: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                import_price: { type: Number, required: true, min: 0 },
                retail_price: { type: Number, required: true, min: 0 },
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Transaction', TransactionSchema);