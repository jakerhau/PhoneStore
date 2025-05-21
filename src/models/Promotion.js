const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromotionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },

    pointsRequired: { type: Number, required: true },
    discountType: { type: String, enum: ['fixed', 'percentage'], required: true },
    discountValue: { type: Number, required: true },

    applicableProducts: { 
        type: Schema.Types.Mixed, 
        required: true,
        validate: {
            validator: function(v) {
                return v === 'all' || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'applicableProducts must be either "all" or a valid ObjectId'
        }
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Promotion', PromotionSchema);
