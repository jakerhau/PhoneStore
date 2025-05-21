const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, maxLength: 600 },
        phone_number: { type: String, maxLength: 10 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        points: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Customer', CustomerSchema);