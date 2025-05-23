document.addEventListener('DOMContentLoaded', function() {
    const sortSelect = document.querySelector('select:first-of-type');
    const filterSelect = document.querySelector('select:last-of-type');
    const productsGrid = document.querySelector('.grid');

    function updateProducts() {
        const sort = sortSelect.value;
        const filter = filterSelect.value;
        
        // Hiển thị loading state
        productsGrid.innerHTML = '<div class="col-span-full text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>';

        // Gửi request AJAX
        fetch(`/products?sort=${sort}&filter=${filter}`, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.products.length === 0) {
                productsGrid.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center">
                        <img src="https://cdn2.cellphones.com.vn/x,webp/media/wysiwyg/Search-Empty.png" 
                            alt="Không tìm thấy sản phẩm" class="w-1/3 h-1/3">
                        <h1 class="text-2xl font-bold text-gray-800 text-center my-12">
                            Không có sản phẩm bạn đang tìm
                        </h1>
                    </div>
                `;
                return;
            }

            // Render sản phẩm
            productsGrid.innerHTML = data.products.map(product => `
                <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div class="relative aspect-square">
                        <img src="${product.photo}" alt="Product" class="w-full h-full object-cover object-center">
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
                        <p class="text-gray-600 mt-2"></p>
                        <div class="mt-4">
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-2xl font-bold text-indigo-600">${product.retail_price.toLocaleString('vi-VN')}đ</span>
                                ${product.quantity ? 
                                    '<span class="text-green-500">Còn hàng</span>' : 
                                    '<span class="text-red-500">Hết hàng</span>'}
                            </div>
                            <button onclick="openPreorderModal('${product._id}')"
                                class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                Đặt trước
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Có lỗi xảy ra, vui lòng thử lại sau</p>
                </div>
            `;
        });
    }

    // Thêm event listeners cho các select
    sortSelect.addEventListener('change', updateProducts);
    filterSelect.addEventListener('change', updateProducts);
}); 

function openPreorderModal(productId, productName) {
    document.getElementById('preorderModal').classList.remove('hidden');
    document.getElementById('preorderProductId').value = productId;
    document.querySelector('input[name="productName"]').value = productName;
} 