const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../../models/User');
const { validationResult } = require('express-validator');

const { JWT_SECRET } = process.env;

// Constants for flash messages
const FLASH_MESSAGES = {
    INCOMPLETE_INFO: 'Vui lòng nhập đầy đủ thông tin',
    USER_NOT_FOUND: 'Tên đăng nhập không tồn tại',
    ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
    INVALID_PASSWORD: 'Mật khẩu không chính xác',
    PASSWORD_MISMATCH: 'Mật khẩu không khớp',
    LOGIN_ERROR: 'Có lỗi xảy ra khi đăng nhập',
    PASSWORD_CHANGE_SUCCESS: 'Đổi mật khẩu thành công',
    PASSWORD_CHANGE_ERROR: 'Có lỗi xảy ra khi đổi mật khẩu'
};

// Helper functions
const redirectWithFlash = (req, res, path, message) => {
    req.flash('message', message);
    return res.redirect(path);
};

const generateToken = (user) => {
    return jwt.sign(
        { saleId: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

exports.login = (req, res) => {
    res.render('auth/login', {
        layout: 'loginLayout',
        message: req.flash('message')
    });
};

exports.validateLogin = async (req, res) => {
    const { username, password_hash } = req.body;

    if (!username || !password_hash) {
        return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.INCOMPLETE_INFO);
    }

    try {
        const user = await User.findOne({ username });
        
        if (!user) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.USER_NOT_FOUND);
        }

        if (user.lock === 1) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.ACCOUNT_LOCKED);
        }

        const isMatch = await bcrypt.compare(password_hash, user.password);
        if (!isMatch) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.INVALID_PASSWORD);
        }

        if (user.active === 0) {
            const userData = {
                ...user.toObject(),
                id: user._id.toString(),
            };
            return res.render('users/changePasswordSale', { user: userData, layout: 'loginLayout' });
        }

        const token = generateToken(user);
        req.session.user = user;
        req.session.token = token;
        res.redirect('/admin/dashboard');

    } catch (err) {
        console.error('Login error:', err);
        return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.LOGIN_ERROR);
    }
};

exports.validate = async (req, res, next) => {
    const { email, expirate } = req.query;
    
    try {
        const user = await User.findOne({ email });
        const now = Date.now();

        if (now > expirate) {
            return redirectWithFlash(req, res, '/auth/login', 'Link xác thực đã hết hạn');
        }

        if (!user) {
            return redirectWithFlash(req, res, '/auth/login', 'Người dùng không tồn tại');
        }

        // Nếu user đã active thì chuyển về trang login
        if (user.active === 1) {
            return redirectWithFlash(req, res, '/auth/login', 'Tài khoản đã được kích hoạt');
        }

        // Kích hoạt tài khoản
        user.active = 1;
        await user.save();
        
        // Chuyển hướng đến trang đặt mật khẩu với thông tin user
        const userData = {
            ...user.toObject(),
            id: user._id.toString(),
        };
        return res.render('users/changePasswordSale', { 
            user: userData, 
            layout: 'loginLayout',
            message: 'Vui lòng đặt mật khẩu cho tài khoản của bạn'
        });
    } catch (err) {
        console.error('Validation error:', err);
        return redirectWithFlash(req, res, '/auth/login', 'Có lỗi xảy ra khi xác thực email');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};

exports.changePassword = async (req, res) => {
    const { id, new_password_hash, confirm_new_password_hash } = req.body;

    try {
        if (!id || !new_password_hash || !confirm_new_password_hash) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.INCOMPLETE_INFO);
        }

        if (new_password_hash !== confirm_new_password_hash) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.PASSWORD_MISMATCH);
        }

        const user = await User.findById(id);
        if (!user) {
            return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.USER_NOT_FOUND);
        }

        user.password = await bcrypt.hash(new_password_hash, 12);
        user.lock = 0;
        user.active = 1;
        await user.save();
        
        req.session.user = user;
        return redirectWithFlash(req, res, '/admin/dashboard', FLASH_MESSAGES.PASSWORD_CHANGE_SUCCESS);

    } catch (err) {
        console.error(err.message);
        return redirectWithFlash(req, res, '/auth/login', FLASH_MESSAGES.PASSWORD_CHANGE_ERROR);
    }
};



