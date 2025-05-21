const mongoose = require('mongoose');
const schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const ROLES = {
    SALES_STAFF: 'Nhân viên bán hàng',
    WAREHOUSE_STAFF: 'Nhân viên kho',
    ADMIN: 'Quản trị viên'
};

const userSchema = new schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    avatar: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    active: {
        type: Number,
        default: 0
    },
    lock: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.SALES_STAFF
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
}
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

// Thêm method để kiểm tra quyền
userSchema.methods.isSalesStaff = function() {
    return this.role === ROLES.SALES_STAFF;
}

userSchema.methods.isWarehouseStaff = function() {
    return this.role === ROLES.WAREHOUSE_STAFF;
}

userSchema.methods.isAdmin = function() {
    return this.role === ROLES.ADMIN;
}



module.exports = {
    User: mongoose.model('User', userSchema),
    ROLES: ROLES
};
