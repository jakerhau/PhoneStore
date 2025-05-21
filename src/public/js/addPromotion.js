// Kiểm tra ngày bắt đầu không được thấp hơn ngày hiện tại
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const discountTypeInput = document.getElementById('discountType');
    const discountValueInput = document.getElementById('discountValue');

    // Set min date for both inputs to today
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    // Validate dates
    function validateDates() {
        if (!startDateInput.value || !endDateInput.value) {
            toastr.error('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc');
            return false;
        }

        // So sánh trực tiếp chuỗi ngày tháng
        if (startDateInput.value > endDateInput.value) {
            toastr.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
            return false;
        }

        // Kiểm tra ngày bắt đầu không được thấp hơn ngày hiện tại
        if (startDateInput.value < today) {
            toastr.error('Ngày bắt đầu không được thấp hơn ngày hiện tại');
            return false;
        }

        return true;
    }

    // Validate discount value
    function validateDiscountValue() {
        if (!discountValueInput.value) {
            alert('Vui lòng nhập giá trị mã giảm giá');
            return false;
        }

        const value = parseFloat(discountValueInput.value);
        if (isNaN(value)) {
            alert('Giá trị mã giảm giá phải là số');
            return false;
        }

        if (discountTypeInput.value === 'percentage') {
            if (value < 0 || value > 100) {
                alert('Giá trị phần trăm phải từ 0 đến 100');
                return false;
            }
            // Format to 2 decimal places for percentage
            discountValueInput.value = value.toFixed(2);
        } else {
            if (value <= 0) {
                alert('Giá trị mã giảm giá phải lớn hơn 0');
                return false;
            }
            // Format to whole number for fixed amount
            discountValueInput.value = Math.round(value);
        }
        return true;
    }

    // Add event listener for discount type change
    discountTypeInput.addEventListener('change', function() {
        if (this.value === 'percentage') {
            discountValueInput.placeholder = 'Nhập phần trăm (0-100)';
            discountValueInput.max = '100';
            discountValueInput.min = '0';
            discountValueInput.step = '0.01';
        } else {
            discountValueInput.placeholder = 'Nhập giá trị mã giảm giá';
            discountValueInput.removeAttribute('max');
            discountValueInput.removeAttribute('min');
            discountValueInput.step = '1';
        }
        // Clear current value when changing type
        discountValueInput.value = '';
    });

    // Add input validation for percentage
    discountValueInput.addEventListener('input', function() {
        if (discountTypeInput.value === 'percentage') {
            const value = parseFloat(this.value);
            if (!isNaN(value) && value > 100) {
                this.value = '100';
            }
        }
    });

    // Form submit validation
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission

        if (!validateDates()) {
            return;
        }

        if (!validateDiscountValue()) {
            return;
        }

        // If all validations pass, submit the form
        this.submit();
    });
});
