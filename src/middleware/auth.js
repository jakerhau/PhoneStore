const { User, ROLES } = require('../models/User');
const bcrypt = require("bcrypt");

exports.loggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
        res.redirect('/auth/login');
    }
};

exports.isAuth = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/admin/dashboard');
    } else {
        next();
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === ROLES.ADMIN) {
        next();
    } else {
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        res.redirect('/admin/dashboard');
    }
};

exports.isWarehouseStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === ROLES.WAREHOUSE_STAFF) {
        next();
    } else {
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        res.redirect('/admin/dashboard');
    }
};

exports.isSalesStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === ROLES.SALES_STAFF) {
        next();
    } else {
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        res.redirect('/admin/dashboard');
    }
};

exports.ensureFirstLogin = (req, res, next) => {
    const user = req.body.username;
    if (!user) {
        req.flash('message', 'Vui lòng nhập tên đăng nhập');
        return res.redirect('/auth/login');
    }
    User.findOne({ username: user })
        .then(user => {
            if (user.lock == 1 && user.active == 0) {
                return res.status(403).send('Vui lòng đăng nhập bằng cách nhấp vào liên kết trong email của bạn');
            }
            console.log(user);
            if (bcrypt.compareSync(user.username, user.password) && user.lock == 0 && user.active == 0) {
                const userData = {
                    ...user.toObject(),
                    id: user._id.toString(),
                };
                return res.render('users/changePasswordSale', {user: userData, layout: 'loginLayout' });
            } else {
                next();
            }
        })
        .catch(err => {
            req.flash('message', 'Tên đăng nhập không tồn tại');
            res.redirect('/auth/login');
        });
}

