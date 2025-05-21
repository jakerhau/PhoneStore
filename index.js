const express = require('express');
const exphbs = require('express-handlebars');
const db = require('./src/config/db');
const path = require('path');
const app = express();
const port = 3000;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');

app.use(session({
    secret: process.env.SESSION_SECRET || 'nodejs',
    resave: true,
    saveUninitialized: true
  }));
app.use(flash());

app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    res.locals.success = req.flash('success'); // Gửi thông báo thành công tới view
    res.locals.error = req.flash('error'); // Gửi thông báo lỗi tới view
    next();
});


app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'node_modules/toastr/build'))); // Thêm đường dẫn đến thư viện Toastr

const { currencyFormat } = require('./src/util/function.js');
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials'),
    helpers: {
        not: function(a, b) {
            return a != b;
        },
        currencyFormat: currencyFormat,
        formatDate: function(date) {
            return moment(date).format('DD/MM/YYYY');
        },
        eq: function (a, b) {
            return a === b;
        },
        count: function (a) {
            return a + 1;
        },
        dif: function (a, b) {
            return a != b;
        },
        json: function(context) {
            return JSON.stringify(context); // Chuyển đối tượng thành JSON string
        },
        eqo: function (a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        or: function(a, b) {
            return a || b;
        }
    },
});


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));

// import routes
const usersRoutes = require('./src/routes/usersRoutes');
const userRoutes = require('./src/routes/userRoutes');
const customersRoutes = require('./src/routes/customersRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const productsRoutes = require('./src/routes/productsRoutes');
const productRoutes = require('./src/routes/productRoutes');
const reportsRoutes = require('./src/routes/reportsRoutes');
const transactionsRoutes = require('./src/routes/transactionsRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const customerPageRoutes = require('./src/routes/customerPageRoutes');
const preorderRoutes = require('./src/routes/preorderRoutes');
const authRoutes = require('./src/routes/authRoutes');
const promotionRoutes = require('./src/routes/promotionRoutes');
const batchRoutes = require('./src/routes/batchRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const { loggedIn, isAuth, isAdmin } = require('./src/middleware/auth.js');
const { handlebars } = require('hbs');
const { login } = require('./src/controllers/auth/authController.js');

// Routes cho khách hàng (public)
app.get('/', (req, res) => {
    res.render('customer/home', {
        layout: 'customerLayout',
        user: req.session.user || null
    });
});


// Auth routes (public)
app.use('/auth', authRoutes);

// Customer routes (public)
app.use('/', customerPageRoutes);

// Admin routes (protected)
app.use('/admin', loggedIn);

// Admin dashboard route
app.get('/admin/dashboard', (req, res) => {
    res.render('index', {
        layout: 'layout',
        user: req.session.user
    });
});

// Redirect /admin to dashboard
app.get('/admin', (req, res) => {
    res.redirect('/admin/dashboard');
});

// Other admin routes
app.use('/admin/users', usersRoutes);
app.use('/admin/user', userRoutes);
app.use('/admin/customers', customersRoutes);
app.use('/admin/customer', customerRoutes);
app.use('/admin/products', productsRoutes);
app.use('/admin/product', productRoutes);
app.use('/admin/transactions', transactionsRoutes);
app.use('/admin/transaction', transactionRoutes);
app.use('/admin/reports', reportsRoutes);
app.use('/admin/preorder', preorderRoutes);
app.use('/admin/promotions', promotionRoutes);
app.use('/admin/batches', batchRoutes);
app.use('/admin/suppliers', supplierRoutes);
// 404 handler
app.use((req, res, next) => {
    console.log(`404 Error - Route Not Found: ${req.originalUrl}`);
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    console.log(error.message);
    res.render('error', {
        layout: 'loginLayout',
        message: error.message,
        status: error.status
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}/`);
});