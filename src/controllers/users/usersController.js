const { User } = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const { check } = require('express-validator');
const { sendMail } = require('../../config/mailer');
const bcrypt = require('bcrypt');
const { currencyFormat } = require('../../util/function');

class UsersController {
    // [GET] /users - Lấy danh sách người dùng
    index(req, res, next) {
        const { full_name } = req.query;
        let searchQuery = {};
        if (full_name) {
            searchQuery.name = { $regex: full_name, $options: 'i' };
        }
        User.find(searchQuery)
            .then(users => res.render('users/index', {message: req.flash('message'), users: multipleMongooseToObject(users), full_name: full_name || '' }))
            .catch(next);
    };

    // [GET] /users/create - Hiển thị form tạo người dùng
    create = (req, res) => {
        res.render('users/create', { message: req.flash('message') });
    };

    // [POST] /users/store - Xử lý tạo người dùng mới
    store = async (req, res) => {
        const { email, full_name } = req.body;
        check(email).normalizeEmail({ gmail_remove_dots: false });
        check(full_name).trim().escape();
        check(email).isEmail();

        if (email === '' || full_name === '') {
            req.flash('message', {error: 'Vui lòng nhập đầy đủ thông tin'});
            return res.redirect('/admin/users/create');
        } else if (check(email) === false) {
            req.flash('message', {error: 'Email không hợp lệ'});
            return res.redirect('/admin/users/create');
        } else if (!/^[\p{L}\s]+$/u.test(full_name)) {
            req.flash('message', {error: 'Tên không hợp lệ'});
            return res.redirect('/admin/users/create');
        }

        const expirate = Date.now() + 60000;
        const user = new User({
            email,
            name: full_name,
            username: email.split('@')[0],
            active: 0,
            lock: 1,
            password: bcrypt.hashSync(email.split('@')[0], 12),
        });
        try {
            await user.save();
            await sendMail(email, expirate);
            req.flash('message', {success: 'Tạo tài khoản thành công'});
            return res.redirect('/admin/users');
        } catch (err) {
            req.flash('message', {error: 'Tạo tài khoản thất bại'});
            return res.redirect('/admin/users/create');
        }
    };

    

    // [GET] /users/:id - Hiển thị chi tiết người dùng
    show = (req, res, next) => {
        const userId = req.query.id;
        User.findById(userId)
            .then(user => {
                if (!user) {
                    return res.status(404).send('User not found');
                }
                return Transaction.find({ sale_id: userId })
                    .then(transactions => {
                        // Tính toán tổng số đơn hàng, doanh thu và lợi nhuận
                        const orderCount = transactions.length;

                        // Tính tổng doanh thu
                        const totalRevenue = transactions.reduce((sum, transaction) => {
                            return sum + transaction.total_amount;
                        }, 0);

                        // Tính tổng lợi nhuận
                        const totalProfit = transactions.reduce((sum, transaction) => {
                            return sum + (transaction.total_amount - transaction.total_import_price);
                        }, 0);

                        // Chuyển user thành object để sử dụng trong view
                        const userObject = mongooseToObject(user);

                        // Gửi tất cả dữ liệu cần thiết đến view
                        res.render('users/show', {
                            message : req.flash('message'),
                            showUser: userObject,
                            orderCount: orderCount,
                            totalRevenue: currencyFormat(totalRevenue),
                            totalProfit: currencyFormat(totalProfit),
                        });
                    });
            })
            .catch(next);
    };

    // [GET] /users/profile - Hiển thị trang cá nhân
    profile = (req, res) => {
        const user = req.session.user;
        res.render('users/profile', { user, message: req.flash('message') });
    };

    // changePassword = (req, res) => {
    //     const user = req.session.user;
    //     res.render('users/changePassword', { user });
    // };

    // [GET] /users/edit-profile - Hiển thị form chỉnh sửa trang cá nhân
    editprofile = (req, res) => {
        const user = req.session.user;
        res.render('users/edit-profile', { user, message: req.flash('message') });
    };

    // [GET] /users/edit - Hiển thị form chỉnh sửa người dùng
    edit = (req, res, next) => {
        const userId = req.query.id;
        User.findById(userId)
            .then(user => res.render('users/edit', { 
                editUser: mongooseToObject(user),
                message: req.flash('message') 
            }))
            .catch(next);
    };

    // [POST] /users/update - Cập nhật thông tin người dùng
    update = (req, res, next) => {
        const { id, is_active, role } = req.body;
        const updatedData = {
            active: is_active
        };

        // Chỉ cập nhật role nếu có trong request và không phải là admin
        if (role) {
            const currentUser = User.findById(id);
            if (currentUser && currentUser.role !== 'Quản trị viên') {
                updatedData.role = role;
            }
        }

        User.findByIdAndUpdate(id, updatedData, { new: true })
            .then(updatedUser => {
                if (!updatedUser) {
                    req.flash('message', {error: 'Người dùng không tồn tại'});
                }
                req.flash('message', {success: 'Cập nhật thông tin người dùng thành công'});
                res.redirect(`/admin/user?id=${updatedUser._id}`);
            })
            .catch(next);
    };

    
    // [POST] /users/resend - gửi lại email xác thực
    resend = async (req, res) => {
        const userId = req.body.user_id;
        //                                                                                                                                                       
        User.findById(userId)
            .then(async user => {
                if (!user) {
                    req.flash('message', {error: 'Người dùng không tồn tại'});
                }
                const expirate = Date.now() + 60000;
                try {
                    await sendMail(user.email, expirate);
                    req.flash('message', {success: 'Gửi lại email xác thực thành công'});
                    return res.redirect(`/admin/users`);
                } catch (err) {
                    req.flash('message', {error: 'Gửi lại email xác thực thất bại'});
                    return res.redirect(`/admin/users`);
                }
            })
            .catch(err => {
                return res.status(500).send('Resend email failed');
            });
    };
    // [POST] /users/updateMe
    updateImage = async (req, res) => {
        try {
            const user = req.session.user;
            const { avatar } = req.body;
            
            if (!avatar) {
                req.flash('message', {error: 'Vui lòng nhập URL ảnh đại diện'});
                return res.redirect('/admin/user/profile');
            }

            const dbUser = await User.findOne({ _id: user._id });
            if (!dbUser) {
                req.flash('message', {error: 'Người dùng không tồn tại'});
                return res.redirect('/admin/user/profile');
            }

            dbUser.avatar = avatar;
            await dbUser.save();
            req.session.user.avatar = dbUser.avatar;
            req.flash('message', {success: 'Cập nhật ảnh đại diện thành công'});
            return res.redirect('/admin/user/profile');
        } catch (err) {
            console.error(err);
            req.flash('message', {error: 'Cập nhật ảnh đại diện thất bại'});
            return res.redirect('/admin/user/profile');
        }
    };
    editPassword = (req, res) => {
        res.render('users/changePassword' , { message: req.flash('message') });
    };
    changePassword = async (req, res) => {
        const user = req.session.user;
        const { password_hash, new_password_hash, confirm_new_password_hash } = req.body;
        if (new_password_hash != confirm_new_password_hash) {
            req.flash('message', {error: 'Mật khẩu không khớp'});
            return res.redirect('/admin/user/changepassword');
        }
        try {
            const dbUser = await User.findOne({ _id: user._id });
            if (!dbUser) {
                req.flash('message', {error: 'Người dùng không tồn tại'});
                return res.redirect('/admin/user/changepassword');
            }
            const isMatch = await bcrypt.compare(password_hash, dbUser.password);
            if (!isMatch) {
                req.flash('message', {error: 'Mật khẩu cũ không chính xác'});
                return res.redirect('/admin/user/changepassword');
            }
            dbUser.password = bcrypt.hashSync(new_password_hash, 12);
            await dbUser.save();
            req.flash('message', {success: 'Đổi mật khẩu thành công'});
            return res.redirect('/admin/user/profile');
        } catch (err) {
            console.error(err);
            req.flash('message', {error: 'Đổi mật khẩu thất bại'});
            return res.redirect('/admin/user/changepassword');
        }
    } 

}

module.exports = new UsersController();

