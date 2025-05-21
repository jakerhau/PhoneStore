// lấy kết quả từ server trả về gắn vào p

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#pointsForm');
    const phoneInput = document.querySelector('#phone');
    const resultDiv = document.querySelector('#result');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Xóa kết quả cũ
        resultDiv.innerHTML = '';
        
        const phone = phoneInput.value;
        
        // Kiểm tra định dạng số điện thoại
        if (!/^[0-9]{10}$/.test(phone)) {
            resultDiv.innerHTML = `
                <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p class="text-center">Vui lòng nhập đúng định dạng số điện thoại (10 số)</p>
                </div>
            `;
            return;
        }

        fetch('/points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `
                    <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <p class="text-center">${data.error}</p>
                        ${data.error === 'Không tìm thấy số điện thoại trong hệ thống' ? 
                        '<p class="text-center mt-2">Vui lòng liên hệ nhân viên cửa hàng để được hỗ trợ</p>' : ''}
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <p class="text-center">Số điểm tích lũy của bạn: ${data.points}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultDiv.innerHTML = `
                <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p class="text-center">Có lỗi xảy ra, vui lòng thử lại sau</p>
                </div>
            `;
        });
    });
});

