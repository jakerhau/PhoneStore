$(function() {
    $('#timeRange').daterangepicker({
        opens: 'left',
        locale: {
            format: 'DD/MM/YYYY'
        }
    });
});

function handleSelection(selectedField) {
    // Lấy tất cả các trường đầu vào
    const fields = {
        saleDate: document.getElementById('saleDate'),
        saleMonth: document.getElementById('saleMonth'),
        startDate: document.getElementById('startDate'),
        endDate: document.getElementById('endDate')
    };

    // Đặt tất cả các trường đầu vào vào trạng thái mặc định (không bị disabled)
    for (let key in fields) {
        fields[key].readOnly = false;
    }

    // Nếu trường đã được chọn, vô hiệu hóa tất cả các trường còn lại
    if (selectedField === 'saleDate' && fields.saleDate.value) {
        fields.saleMonth.readOnly = true;
        fields.startDate.readOnly = true;
        fields.endDate.readOnly = true;
    } else if (selectedField === 'saleMonth' && fields.saleMonth.value) {
        fields.saleDate.readOnly = true;
        fields.startDate.readOnly = true;
        fields.endDate.readOnly = true;
    } else if (selectedField === 'timeRange' && (fields.startDate.value || fields.endDate.value)) {
        fields.saleDate.readOnly = true;
        fields.saleMonth.readOnly = true;
    }

    // Kiểm tra nếu tất cả các trường đều rỗng thì bật lại tất cả các trường
    if (!fields.saleDate.value && !fields.saleMonth.value && !fields.startDate.value && !fields.endDate.value) {
        for (let key in fields) {
            fields[key].readOnly = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.button-primary-ghost-sm').forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            // const form = document.getElementById('filterForm');
            // form.submit();
            // Lấy giá trị từ form input
            const saleDate = document.getElementById('saleDate')?.value || '';
            const saleMonth = document.getElementById('saleMonth')?.value || '';
            const startDate = document.getElementById('startDate')?.value || '';
            const endDate = document.getElementById('endDate')?.value || '';

            // Xây dựng URL chứa các tham số từ form input
            let url = '/admin/reports/show?';
            if (saleDate) url += `saleDate=${encodeURIComponent(saleDate)}&`;
            if (saleMonth) url += `saleMonth=${encodeURIComponent(saleMonth)}&`;
            if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
            if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;

            // Xóa ký tự '&' cuối nếu có
            url = url.endsWith('&') ? url.slice(0, -1) : url;

            // Gỡ lỗi: In ra URL đã xây dựng
            console.log('Redirecting to URL:', url);

            // Chuyển hướng đến URL đã xây dựng
            if (url !== '/admin/reports/show?') {
                window.location.href = url;
            } else {
                alert('Hãy chọn ít nhất một giá trị để xem chi tiết.');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const saleDate = '{{selectedDate.saleDate}}';
    const saleMonth = '{{selectedDate.saleMonth}}';
    const startDate = '{{selectedDate.startDate}}';
    const endDate = '{{selectedDate.endDate}}';

    if (saleDate) document.getElementById('saleDate').value = saleDate;
    if (saleMonth) document.getElementById('saleMonth').value = saleMonth;
    if (startDate) document.getElementById('startDate').value = startDate;
    if (endDate) document.getElementById('endDate').value = endDate;
});

document.addEventListener('DOMContentLoaded', function () {
    // Lấy URL hiện tại
    const urlParams = new URLSearchParams(window.location.search);

    // Lấy các giá trị từ URL
    const saleDate = urlParams.get('saleDate');
    const saleMonth = urlParams.get('saleMonth');
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');

    // Điền lại các giá trị vào form input
    if (saleDate) {
        document.getElementById('saleDate').value = saleDate;
    }
    if (saleMonth) {
        document.getElementById('saleMonth').value = saleMonth;
    }
    if (startDate) {
        document.getElementById('startDate').value = startDate;
    }
    if (endDate) {
        document.getElementById('endDate').value = endDate;
    }
});
