const Preorder = require('../../models/preorder');
const Product = require('../../models/Product');
const {mongooseToObject, multipleMongooseToObject} = require('../../util/mongoose');

// Hàm helper để chuyển đổi status sang tiếng Việt
const getStatusInVietnamese = (status) => {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',

    };
    return statusMap[status] || status;
};

// Tạo đơn đặt trước mới
exports.createPreorder = async (req, res) => {
    try {
        const { productId, customerName, email, phone, shippingAddress, quantity } = req.body;
        
        const preorder = new Preorder({
            productId,
            customerName,
            email,
            phone,
            shippingAddress,
            quantity
        });

        await preorder.save();
        
        console.log("Success");

        res.status(201).json({
            success: true,
            message: 'Đặt trước thành công!',
            data: preorder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đặt trước',
            error: error.message
        });
    }
};


exports.getPreorders = async (req, res) => {
    try {
        const { name, phone, status } = req.query;
        let query = {};

        // Xây dựng query dựa trên các tham số tìm kiếm
        if (name) {
            query.customerName = { $regex: name, $options: 'i' };
        }
        if (phone) {
            query.phone = { $regex: phone, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const preorders = await Preorder.find(query)
            .populate('productId', 'name')
            .sort({ createdAt: -1 });
            
        // Chuyển đổi status sang tiếng Việt
        const preordersWithVietnameseStatus = preorders.map(preorder => {
            const preorderObj = preorder.toObject();
            preorderObj.status = getStatusInVietnamese(preorderObj.status);
            return preorderObj;
        });
            
        res.render('preorder/index', { 
            preorders: preordersWithVietnameseStatus,
            filters: { name, phone, status }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi hiển thị danh sách đơn đặt trước',
            error: error.message
        });
    }
};

// Cập nhật trạng thái đơn đặt trước
exports.updatePreorderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const preorder = await Preorder.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!preorder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn đặt trước'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: preorder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật trạng thái',
            error: error.message
        });
    }
}; 

exports.updateStatus = async (req, res) => {
    try {
        const { id, action } = req.body;
        
        if (!id || !action) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        const status = action === 'confirm' ? 'confirmed' : 'pending';
        
        const preorder = await Preorder.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!preorder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn đặt trước'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: {
                status: getStatusInVietnamese(preorder.status)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật trạng thái',
            error: error.message
        });
    }
};


