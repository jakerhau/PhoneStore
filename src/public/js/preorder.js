function openPreorderModal(productId) {
    document.getElementById('preorderProductId').value = productId;
    document.getElementById('preorderModal').classList.remove('hidden');
}


async function handlePreorderSubmit(event) {
    event.preventDefault();
    
    const form = event.target;

    const productId = document.getElementById('preorderProductId').value;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log(data);

    try {
        const response = await fetch('/products/preorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert('Đặt trước thành công!');
            document.getElementById('preorderModal').classList.add('hidden');
            form.reset();
        } else {
            alert('Có lỗi xảy ra: ' + result.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra khi gửi đơn đặt trước');
        console.error('Error:', error);
    }
}

$(document).ready(function() {
    // Xử lý cập nhật trạng thái đơn hàng
    $('.button-primary-ghost-sm').click(function(e) {
        e.preventDefault();
        const button = $(this);
        const id = button.data('id');
        const action = button.data('action');
        
        $.ajax({
            url: '/admin/preorder/update-status',
            type: 'POST',
            data: {
                id: id,
                action: action
            },
            success: function(response) {
                if (response.success) {
                    // Cập nhật trạng thái trong bảng
                    const statusCell = button.closest('div.grid').find('span:nth-child(6)');
                    const newStatus = action === 'confirm' ? 'Đã xác nhận' : 'Chờ xác nhận';
                    statusCell.text(newStatus);
                    
                    // Cập nhật button
                    const newAction = action === 'confirm' ? 'pending' : 'confirm';
                    const newText = action === 'confirm' ? 'Chờ xác nhận' : 'Xác nhận';
                    button.data('action', newAction);
                    button.text(newText);

                    // Hiển thị thông báo thành công
                    showNotification('success', 'Cập nhật trạng thái thành công');
                } else {
                    showNotification('error', 'Có lỗi xảy ra: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                showNotification('error', 'Có lỗi xảy ra khi cập nhật trạng thái');
                console.error(xhr.responseText);
            }
        });
    });

    // Hàm hiển thị thông báo
    function showNotification(type, message) {
        const notification = $('<div>')
            .addClass('notification')
            .addClass(type === 'success' ? 'notification-success' : 'notification-error')
            .text(message);

        $('body').append(notification);

        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            notification.fadeOut(() => {
                notification.remove();
            });
        }, 3000);
    }
});

